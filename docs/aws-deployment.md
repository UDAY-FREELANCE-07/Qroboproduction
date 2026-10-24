# AWS deployment guide: EC2 + Amazon RDS for PostgreSQL

**Nothing in this guide has been provisioned.** Every `<PLACEHOLDER>` must be replaced. Commands use
AWS CLI v2; review costs before creating resources (RDS, EC2, NAT, data transfer, Secrets Manager are billed).

## 1. Target architecture

```
Internet ──443──▶ EC2 (public subnet, Elastic IP)
                   nginx (TLS via Let's Encrypt) ──▶ 127.0.0.1:3000 Next.js (systemd, user qrobo)
                   CloudWatch agent (logs + metrics)
                          │ 5432, TLS verify-full (RDS CA bundle)
                          ▼
                 RDS PostgreSQL (private subnets, Multi-AZ optional, encrypted, not publicly accessible)
```

* Security group `sg-web` (EC2): inbound 443 and 80 (redirect/ACME) from `0.0.0.0/0`; **no SSH from the
  internet** — use SSM Session Manager. Outbound: all (or 443 + 5432 to `sg-db`).
* Security group `sg-db` (RDS): inbound 5432 **only from `sg-web`**. Never `0.0.0.0/0`.
* EC2 instance profile (IAM role) with `AmazonSSMManagedInstanceCore`, `CloudWatchAgentServerPolicy`,
  and read access to the app parameters only (policy below). No AWS access keys on the server.

## 2. Network and security groups

```bash
export AWS_REGION=<REGION>             # e.g. ap-south-1
VPC_ID=<VPC_ID>
PRIVATE_SUBNETS="<PRIVATE_SUBNET_A> <PRIVATE_SUBNET_B>"   # two AZs, no route to an internet gateway

aws ec2 create-security-group --group-name qrobo-web --description "QROBO web" --vpc-id $VPC_ID
aws ec2 create-security-group --group-name qrobo-db  --description "QROBO RDS" --vpc-id $VPC_ID
aws ec2 authorize-security-group-ingress --group-id <SG_WEB_ID> --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id <SG_WEB_ID> --protocol tcp --port 80  --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id <SG_DB_ID>  --protocol tcp --port 5432 --source-group <SG_WEB_ID>

aws rds create-db-subnet-group --db-subnet-group-name qrobo-db-subnets \
  --db-subnet-group-description "QROBO private subnets" --subnet-ids $PRIVATE_SUBNETS
```

## 3. RDS for PostgreSQL

```bash
aws rds create-db-instance \
  --db-instance-identifier qrobo-prod \
  --engine postgres --engine-version <PG_VERSION> \        # 13+ required; use a current supported major
  --db-instance-class <INSTANCE_CLASS> \                   # e.g. db.t4g.small
  --allocated-storage 20 --storage-type gp3 --storage-encrypted \
  --db-name qrobo \
  --master-username qrobo_master --manage-master-user-password \   # master secret kept in Secrets Manager
  --db-subnet-group-name qrobo-db-subnets --vpc-security-group-ids <SG_DB_ID> \
  --no-publicly-accessible \
  --backup-retention-period 7 --preferred-backup-window 20:00-20:30 \
  --deletion-protection --copy-tags-to-snapshot \
  --enable-cloudwatch-logs-exports postgresql \
  --auto-minor-version-upgrade
```

Enforce TLS on the server side with a custom parameter group: `rds.force_ssl = 1`
(default on recent engine versions — verify). Optionally `log_min_duration_statement = 1000`.

### Database roles (least privilege)
From the EC2 instance (via SSM session), using the master secret, run
`backend/postgres/roles.example.sql` after replacing placeholders with generated passwords:
`qrobo_migrator` (schema owner, deploy-time only) and `qrobo_app` (DML only, used by the app).

### RDS certificate verification
```bash
sudo mkdir -p /etc/qrobo
sudo curl -fsSL -o /etc/qrobo/rds-global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
# Verify the chain and hostname BEFORE starting the app:
openssl s_client -starttls postgres -connect <RDS_ENDPOINT>:5432 -servername <RDS_ENDPOINT> \
  -CAfile /etc/qrobo/rds-global-bundle.pem -verify_hostname <RDS_ENDPOINT> </dev/null 2>/dev/null | grep "Verify return code"
# expected: Verify return code: 0 (ok)
```
The app uses `DATABASE_SSL=verify-full` + `DATABASE_SSL_CA_FILE` (chain **and** hostname verified;
`rejectUnauthorized: false` is never used). Re-download the bundle when AWS rotates CAs.

## 4. Secrets (SSM Parameter Store, SecureString)

```bash
P=/qrobo/prod
aws ssm put-parameter --name $P/DATABASE_URL --type SecureString \
  --value 'postgresql://qrobo_app:<APP_PASSWORD>@<RDS_ENDPOINT>:5432/qrobo'
aws ssm put-parameter --name $P/MIGRATION_DATABASE_URL --type SecureString \
  --value 'postgresql://qrobo_migrator:<MIGRATOR_PASSWORD>@<RDS_ENDPOINT>:5432/qrobo'
aws ssm put-parameter --name $P/APP_ORIGINS --type String --value 'https://<DOMAIN>'
# Only when online payments are implemented:
# aws ssm put-parameter --name $P/RAZORPAY_WEBHOOK_SECRET --type SecureString --value '<SECRET>'
```
(Shell history: prefix commands with a space or use `--cli-input-json file://...` and delete the file.)

Instance-role policy (attach to the EC2 role):
```json
{ "Version": "2012-10-17", "Statement": [
  { "Effect": "Allow", "Action": ["ssm:GetParametersByPath", "ssm:GetParameter"],
    "Resource": "arn:aws:ssm:<REGION>:<ACCOUNT_ID>:parameter/qrobo/prod*" },
  { "Effect": "Allow", "Action": "kms:Decrypt", "Resource": "<KMS_KEY_ARN_USED_BY_SSM>" } ] }
```

## 5. EC2 instance

* Amazon Linux 2023 or Ubuntu 22.04/24.04, `t3.small`/`t4g.small` or larger, gp3 root volume
  (encrypted), IMDSv2 required, the IAM role above, `sg-web`, an Elastic IP.

```bash
# as root (via SSM Session Manager)
dnf install -y nginx git jq        # or apt-get on Ubuntu
curl -fsSL https://rpm.nodesource.com/setup_24.x | bash - && dnf install -y nodejs   # Node 24 LTS (Node 20 is EOL; Next 16 needs >= 20.9)
node -v    # verify, then run `npm test` on the instance before the first deploy
useradd --system --create-home --shell /sbin/nologin qrobo
mkdir -p /srv/qrobo && chown qrobo:qrobo /srv/qrobo
```

### Build and install the app
```bash
sudo -u qrobo git clone <REPO_URL> /srv/qrobo/app
cd /srv/qrobo/app/frontend
sudo -u qrobo npm ci
sudo -u qrobo env DATA_SOURCE=postgres npm run build        # DATA_SOURCE is baked into the bundle
```

### Environment file from SSM (root-only, regenerated on each deploy)
```bash
cat >/usr/local/bin/qrobo-env <<'EOF'
#!/bin/sh
set -eu
umask 077
OUT=/etc/qrobo/app.env
{
  echo "NODE_ENV=production"
  echo "DATA_SOURCE=postgres"
  echo "PORT=3000"
  echo "HOSTNAME=127.0.0.1"
  echo "DATABASE_SSL=verify-full"
  echo "DATABASE_SSL_CA_FILE=/etc/qrobo/rds-global-bundle.pem"
  echo "DATABASE_POOL_MAX=10"
  aws ssm get-parameters-by-path --path /qrobo/prod --with-decryption --query 'Parameters[].[Name,Value]' --output text \
    | grep -v MIGRATION_DATABASE_URL | sed -E 's#^/qrobo/prod/([A-Z_]+)\t#\1=#'
} > "$OUT.tmp"
mv "$OUT.tmp" "$OUT"
chown root:qrobo "$OUT"; chmod 0640 "$OUT"
EOF
chmod 0750 /usr/local/bin/qrobo-env && /usr/local/bin/qrobo-env
```
The migration URL is intentionally excluded from the runtime file.

### systemd unit `/etc/systemd/system/qrobo.service`
```ini
[Unit]
Description=QROBO Next.js
After=network-online.target
Wants=network-online.target

[Service]
User=qrobo
WorkingDirectory=/srv/qrobo/app/frontend
EnvironmentFile=/etc/qrobo/app.env
# Refuse to start on invalid/placeholder config or a DATA_SOURCE that differs from the build.
ExecStartPre=/usr/bin/node node_modules/tsx/dist/cli.mjs scripts/check-config.ts --expect postgres
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p 3000 -H 127.0.0.1
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/qrobo/app/frontend/.next
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```
```bash
systemctl daemon-reload && systemctl enable --now qrobo
journalctl -u qrobo -n 50      # expect "[qrobo] data source: postgres"
```

## 6. nginx + HTTPS

`/etc/nginx/conf.d/qrobo.conf`:
```nginx
server {
  listen 80;
  server_name <DOMAIN> www.<DOMAIN>;
  location /.well-known/acme-challenge/ { root /var/www/letsencrypt; }
  location / { return 301 https://$host$request_uri; }
}
server {
  listen 443 ssl http2;
  server_name <DOMAIN> www.<DOMAIN>;
  ssl_certificate     /etc/letsencrypt/live/<DOMAIN>/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/<DOMAIN>/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  client_max_body_size 1m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;          # used by the app's rate limiter
    proxy_set_header X-Forwarded-For $remote_addr;    # overwrite, do not append client-supplied values
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Host $host;
  }
}
```
```bash
dnf install -y certbot python3-certbot-nginx   # or apt-get
certbot --nginx -d <DOMAIN> -d www.<DOMAIN>    # auto-renew via systemd timer
nginx -t && systemctl reload nginx
```

## 7. DNS
Create `A` records for `<DOMAIN>` and `www.<DOMAIN>` pointing to the Elastic IP (Route 53 or your
registrar). Lower the TTL (e.g. 300 s) before cut-over.

## 8. Migrations and seed (each deploy)

```bash
aws rds create-db-snapshot --db-instance-identifier qrobo-prod --db-snapshot-identifier qrobo-pre-deploy-<DATE>
cd /srv/qrobo/app/frontend
umask 077
{ echo "MIGRATION_DATABASE_URL=$(aws ssm get-parameter --name /qrobo/prod/MIGRATION_DATABASE_URL --with-decryption --query Parameter.Value --output text)";
  echo "DATABASE_SSL=verify-full"; echo "DATABASE_SSL_CA_FILE=/etc/qrobo/rds-global-bundle.pem"; } > /tmp/.env.migrate
sudo -u qrobo npx tsx --env-file=/tmp/.env.migrate scripts/db/status.ts
sudo -u qrobo npx tsx --env-file=/tmp/.env.migrate scripts/db/migrate.ts
# First deploy only, and only if the demo catalog is wanted:
# sudo -u qrobo env ALLOW_DEMO_SEED=yes NODE_ENV=production npx tsx --env-file=/tmp/.env.migrate scripts/db/seed.ts
shred -u /tmp/.env.migrate
```
Then promote the first administrator (docs/auth.md).

## 9. Deployment verification
```bash
curl -fsS https://<DOMAIN>/api/health        # {"status":"ok","dataSource":"postgres","database":"ok"}
curl -sI https://<DOMAIN>/ | grep -i -E 'strict-transport|x-content-type'
```
Then manually: home page banners and product images render, shop filters/pagination, product
detail gallery, register → login → add to cart → COD checkout → order appears in Account and in
Admin → Orders, admin edits a product, non-admin gets no admin data.

## 10. Logs and monitoring (CloudWatch)
* Install the CloudWatch agent; ship `journalctl -u qrobo` output (or `/var/log/nginx/*.log`) to log
  groups `/qrobo/app` and `/qrobo/nginx` with a retention period (e.g. 30 days).
* Alarms: RDS `CPUUtilization`, `FreeStorageSpace`, `DatabaseConnections` (> 70 % of
  `max_connections`), `FreeableMemory`; EC2 `StatusCheckFailed`; Route 53 health check or an external
  uptime check on `/api/health` (503 means DB unavailable/misconfigured).
* RDS Performance Insights (optional) for slow queries.

## 11. Backups and restore
* Automated backups (7 days above) give point-in-time recovery; manual snapshots before deploys.
* Restore drill (do it once before launch):
  ```bash
  aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier qrobo-prod \
    --target-db-instance-identifier qrobo-restore-test --restore-time <UTC_TIMESTAMP> \
    --db-subnet-group-name qrobo-db-subnets --vpc-security-group-ids <SG_DB_ID> --no-publicly-accessible
  ```
  Point a staging app at the restored endpoint, verify `/api/health` and data, then delete it.
* Cut-over after a real incident: restore to a new instance, update `/qrobo/prod/DATABASE_URL`, run
  `qrobo-env`, `systemctl restart qrobo`.

## 12. Connection budget
`DATABASE_POOL_MAX` (10) × app processes (1) + migrations (1) + operators (≤3) ≈ 15. Compare with
`SHOW max_connections;` on the chosen instance class and alarm at 70 %. Raise the instance class
(not the pool) if you add more app instances.
