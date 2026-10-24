# Deploy QROBO on one EC2 instance (app + PostgreSQL on the same server)

Cheaper alternative to `docs/aws-deployment.md` (RDS). One Ubuntu 24.04 EC2 instance runs nginx,
the Next.js app (systemd) and PostgreSQL 17, which listens on `localhost` only. Scripts live in
`deploy/ec2/`. Nothing here is created automatically in AWS; you click through the console.

```
Internet ──80/443──▶ nginx ──▶ 127.0.0.1:3000 Next.js (user qrobo, /srv/qrobo/current)
                                     │ 127.0.0.1:5432 (no TLS needed: loopback only)
                                     ▼
                               PostgreSQL 17 (database qrobo, roles qrobo_app / qrobo_migrator)
```

You own: OS updates (unattended-upgrades is enabled), backups (daily `pg_dump`, copy them off the
server), disk space, and restore drills. If the instance dies, the site and database are down together.

## 1. Launch the instance (AWS console)
* Region: Asia Pacific (Mumbai) `ap-south-1` or (Hyderabad) `ap-south-2`.
* AMI: **Ubuntu Server 24.04 LTS**, architecture x86_64 (or arm64 with `t4g`).
* Type: `t3.small` (2 GB RAM) minimum. `t3.micro` (1 GB) is too small for `next build`.
* Key pair: create one (`.pem`) and keep it private. Never commit it.
* Storage: 20 GB gp3, encrypted.
* Security group inbound: SSH 22 from **My IP** only, HTTP 80 and HTTPS 443 from anywhere.
  Do **not** open 5432 or 3000.
* Advanced: Metadata version **V2 only**.
* After launch: **Elastic IP** → Allocate → Associate with the instance (the IP must not change).

## 2. Connect
EC2 console → instance → **Connect** → EC2 Instance Connect, or from Windows PowerShell:
```powershell
ssh -i C:\path\to\qrobo-key.pem ubuntu@<ELASTIC_IP>
```

## 3. Bootstrap: deploy key + clone (private repo)
```bash
sudo apt-get update && sudo apt-get install -y git
ssh-keygen -t ed25519 -N '' -C qrobo-ec2 -f ~/.ssh/qrobo_deploy
cat ~/.ssh/qrobo_deploy.pub
```
GitHub → `UDAY-FREELANCE-07/Qroboproduction` → Settings → Deploy keys → Add deploy key → paste the
line, **leave "Allow write access" unchecked** → Add. Then:
```bash
GIT_SSH_COMMAND="ssh -i ~/.ssh/qrobo_deploy -o StrictHostKeyChecking=accept-new" \
  git clone git@github.com:UDAY-FREELANCE-07/Qroboproduction.git ~/qrobo-setup
```

## 4. Server setup (once, ~5-10 min)
```bash
sudo bash ~/qrobo-setup/deploy/ec2/setup-server.sh qrobo.in chirrauday02@gmail.com
```
Creates the `qrobo` user, PostgreSQL 17 + database + roles with random passwords,
`/etc/qrobo/app.env` (runtime, root:qrobo 0640) and `/etc/qrobo/migrate.env` (root only), nginx,
firewall (22/80/443), 2 GB swap, systemd units, daily backup timer, and moves the deploy key to
`/srv/qrobo/.ssh`. Re-running it keeps existing passwords and env files.

## 5. First deploy (~5 min)
```bash
sudo bash ~/qrobo-setup/deploy/ec2/deploy.sh --seed
```
(Later deploys use `/srv/qrobo/repo/deploy/ec2/deploy.sh`; `~/qrobo-setup` can then be deleted.)
Clones into `/srv/qrobo/repo`, builds `/srv/qrobo/releases/<commit>` with `DATA_SOURCE=postgres`,
backs up the DB, runs migrations and the demo catalog seed, switches `/srv/qrobo/current`, restarts,
and checks `/api/health`. On a failed health check it switches back to the previous release.

Test by IP: `http://<ELASTIC_IP>/` and `http://<ELASTIC_IP>/api/health`
(expect `{"status":"ok","dataSource":"postgres","database":"ok"}`).
Login does not work over plain HTTP in production (secure session cookie), that is expected until step 7.

## 6. DNS (Hostinger → Domains → qrobo.in → DNS / Nameservers)
* Lower TTL to 300 a day before if possible.
* `A` record `@` → `<ELASTIC_IP>` (replace the current value).
* `www`: keep the `CNAME` to `qrobo.in`, or an `A` record → `<ELASTIC_IP>`.
* Check from your PC: `Resolve-DnsName qrobo.in` shows the Elastic IP.

## 7. HTTPS (after DNS points to the server)
```bash
sudo certbot --nginx -d qrobo.in -d www.qrobo.in --redirect -m chirrauday02@gmail.com --agree-tos --no-eff-email
sudo systemctl list-timers | grep certbot     # auto-renewal
```
Optional HSTS once HTTPS works: add `add_header Strict-Transport-Security "max-age=31536000" always;`
to the `listen 443` server block in `/etc/nginx/sites-available/qrobo`, then `sudo nginx -t && sudo systemctl reload nginx`.

## 8. Admin account
Register `chirrauday02@gmail.com` on `https://qrobo.in/register`. With `EMAIL_PROVIDER=log` the
verification link is in the log:
```bash
sudo journalctl -u qrobo --since "10 min ago" | grep -i verify-email
```
Opening it verifies the address and promotes it to admin (`ADMIN_EMAILS`). Alternative:
```bash
cd /srv/qrobo/current/frontend && sudo -u qrobo npx tsx --env-file=/etc/qrobo/app.env scripts/db/bootstrap-admin.ts chirrauday02@gmail.com --name "Uday"
```

## 9. Real email (Gmail)
Google Account → Security → 2-Step Verification → App passwords → create one. Then
`sudo nano /etc/qrobo/app.env`: `EMAIL_PROVIDER=smtp`, `SMTP_PASS=<16 characters, no spaces>`,
save, `sudo systemctl restart qrobo`. Queued emails are retried every 5 minutes (`qrobo-email-flush.timer`).

## 10. Updating the site
Push to `main` from your PC, then on the server:
```bash
sudo bash /srv/qrobo/repo/deploy/ec2/deploy.sh
sudo bash /srv/qrobo/repo/deploy/ec2/deploy.sh --rollback   # previous release (schema changes are not undone)
```

## 11. Backups and restore
* Daily at 02:30 IST and before each deploy: `/var/backups/qrobo/qrobo-<UTC>.dump`, 14 days kept.
* Copy off the server regularly (S3 bucket via an instance IAM role, or download with `scp`), and
  enable EBS snapshots (EC2 → Lifecycle Manager → daily snapshot policy).
* Restore (replaces the data; stop the app first):
  ```bash
  sudo systemctl stop qrobo
  sudo -u postgres pg_restore --clean --if-exists --no-owner --role=qrobo_migrator -d qrobo /var/backups/qrobo/<file>.dump
  sudo systemctl start qrobo
  ```

## 12. Moving local data to the server (optional)
The seed already loads the same catalog as local. Only if you changed data locally:
```powershell
& "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres -p 5433 -h localhost --format=custom --no-owner -f qrobo-local.dump qrobo
scp -i C:\path\to\qrobo-key.pem qrobo-local.dump ubuntu@<ELASTIC_IP>:/tmp/
```
Then restore it as in step 11 with `/tmp/qrobo-local.dump` and delete the file afterwards. The dump
contains user accounts and password hashes; never commit or share it.

## Useful commands
```bash
sudo systemctl status qrobo            # app
sudo journalctl -u qrobo -f            # live logs
sudo systemctl status postgresql nginx
df -h /                                # disk space
ls -lh /var/backups/qrobo
```
