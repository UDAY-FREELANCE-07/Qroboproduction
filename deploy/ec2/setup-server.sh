#!/usr/bin/env bash
# QROBO one-time server setup for a fresh Ubuntu 24.04 EC2 instance.
#
#   sudo bash setup-server.sh <domain> <admin-email>
#   e.g. sudo bash setup-server.sh qrobo.in chirrauday02@gmail.com
#
# Installs Node.js 24, PostgreSQL 17 (listening on localhost only), nginx and certbot; creates the
# `qrobo` system user, the database, two database roles with random passwords, the runtime env
# files under /etc/qrobo, systemd units, daily backups and a read-only GitHub deploy key.
# Safe to re-run: existing database roles, passwords and env files are kept.
set -euo pipefail

DOMAIN="${1:?usage: setup-server.sh <domain> <admin-email>}"
ADMIN_EMAIL="${2:?usage: setup-server.sh <domain> <admin-email>}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ $EUID -eq 0 ]] || { echo "run with sudo" >&2; exit 1; }
[[ "$DOMAIN" =~ ^[a-z0-9.-]+$ ]] || { echo "invalid domain" >&2; exit 1; }
[[ "$ADMIN_EMAIL" =~ ^[^[:space:]@]+@[^[:space:]@]+$ ]] || { echo "invalid admin email" >&2; exit 1; }
. /etc/os-release
[[ "$ID" == ubuntu ]] || { echo "this script supports Ubuntu only" >&2; exit 1; }

export DEBIAN_FRONTEND=noninteractive
log() { printf '\n==> %s\n' "$*"; }

log "System packages"
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg git nginx certbot python3-certbot-nginx ufw openssl unattended-upgrades

log "Swap (2 GB) so 'next build' does not run out of memory on small instances"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

log "Node.js 24 LTS"
if ! command -v node >/dev/null || [[ "$(node -v)" != v24.* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi
node -v

log "PostgreSQL 17 (PGDG repository)"
if ! command -v /usr/lib/postgresql/17/bin/postgres >/dev/null; then
  install -d /usr/share/postgresql-common/pgdg
  curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc
  echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt ${VERSION_CODENAME}-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update -y
  apt-get install -y postgresql-17
fi
PGCONF=/etc/postgresql/17/main/postgresql.conf
# Never reachable from the network: loopback only.
sed -i -E "s/^#?listen_addresses\s*=.*/listen_addresses = 'localhost'/" "$PGCONF"
systemctl enable --now postgresql
systemctl restart postgresql

log "App user and directories"
id qrobo >/dev/null 2>&1 || useradd --system --create-home --home-dir /srv/qrobo --shell /bin/bash qrobo
install -d -o qrobo -g qrobo -m 0750 /srv/qrobo /srv/qrobo/releases
install -d -o root -g qrobo -m 0750 /etc/qrobo
install -d -o postgres -g postgres -m 0700 /var/backups/qrobo

log "Database and roles"
if [[ ! -f /etc/qrobo/migrate.env ]]; then
  APP_PW="$(openssl rand -hex 24)"
  MIG_PW="$(openssl rand -hex 24)"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -q -v app_pw="$APP_PW" -v mig_pw="$MIG_PW" <<'SQL'
SELECT 'CREATE DATABASE qrobo' WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'qrobo')\gexec
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'qrobo_migrator') THEN CREATE ROLE qrobo_migrator LOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'qrobo_app') THEN CREATE ROLE qrobo_app LOGIN; END IF;
END $$;
ALTER ROLE qrobo_migrator PASSWORD :'mig_pw';
ALTER ROLE qrobo_app PASSWORD :'app_pw';
ALTER ROLE qrobo_app SET statement_timeout = '15s';
ALTER ROLE qrobo_app SET idle_in_transaction_session_timeout = '30s';
\c qrobo
REVOKE ALL ON DATABASE qrobo FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE qrobo TO qrobo_migrator;
GRANT CONNECT ON DATABASE qrobo TO qrobo_app;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
ALTER SCHEMA public OWNER TO qrobo_migrator;
GRANT USAGE ON SCHEMA public TO qrobo_app;
ALTER DEFAULT PRIVILEGES FOR ROLE qrobo_migrator IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO qrobo_app;
ALTER DEFAULT PRIVILEGES FOR ROLE qrobo_migrator IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO qrobo_app;
ALTER DEFAULT PRIVILEGES FOR ROLE qrobo_migrator IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO qrobo_app;
SQL

  umask 077
  cat > /etc/qrobo/migrate.env <<EOF
MIGRATION_DATABASE_URL=postgresql://qrobo_migrator:${MIG_PW}@127.0.0.1:5432/qrobo
DATABASE_SSL=disable
EOF
  chown root:root /etc/qrobo/migrate.env && chmod 0600 /etc/qrobo/migrate.env

  cat > /etc/qrobo/app.env <<EOF
# QROBO runtime configuration (root:qrobo 0640). Edit, then: sudo systemctl restart qrobo
NODE_ENV=production
DATA_SOURCE=postgres
PORT=3000
HOSTNAME=127.0.0.1
DATABASE_URL=postgresql://qrobo_app:${APP_PW}@127.0.0.1:5432/qrobo
# Same machine (loopback): traffic never leaves the server, so TLS is not needed.
DATABASE_SSL=disable
DATABASE_POOL_MAX=10
APP_URL=https://${DOMAIN}
APP_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}
ADMIN_EMAILS=${ADMIN_EMAIL}
# Email: "log" prints emails to the journal only. For Gmail set smtp + an App Password.
EMAIL_PROVIDER=log
EMAIL_FROM="Qrobo <${ADMIN_EMAIL}>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=${ADMIN_EMAIL}
SMTP_PASS=
EOF
  chown root:qrobo /etc/qrobo/app.env && chmod 0640 /etc/qrobo/app.env
  umask 022
  unset APP_PW MIG_PW
else
  echo "keeping existing /etc/qrobo/*.env and database passwords"
fi

log "systemd units, nginx site, backup script"
install -m 0644 "$HERE/qrobo.service" /etc/systemd/system/qrobo.service
install -m 0644 "$HERE/qrobo-email-flush.service" /etc/systemd/system/qrobo-email-flush.service
install -m 0644 "$HERE/qrobo-email-flush.timer" /etc/systemd/system/qrobo-email-flush.timer
install -m 0644 "$HERE/qrobo-backup.service" /etc/systemd/system/qrobo-backup.service
install -m 0644 "$HERE/qrobo-backup.timer" /etc/systemd/system/qrobo-backup.timer
install -m 0755 "$HERE/backup.sh" /usr/local/bin/qrobo-backup
sed "s/__DOMAIN__/${DOMAIN}/g" "$HERE/nginx-qrobo.conf" > /etc/nginx/sites-available/qrobo
ln -sfn /etc/nginx/sites-available/qrobo /etc/nginx/sites-enabled/qrobo
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
systemctl daemon-reload
systemctl enable qrobo.service qrobo-email-flush.timer qrobo-backup.timer
systemctl start qrobo-backup.timer

log "Firewall (SSH + HTTP/HTTPS only; PostgreSQL is never exposed)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

log "Automatic security updates"
dpkg-reconfigure -f noninteractive unattended-upgrades

log "GitHub deploy key (read-only) for the private repository"
install -d -o qrobo -g qrobo -m 0700 /srv/qrobo/.ssh
if [[ ! -f /srv/qrobo/.ssh/id_ed25519 ]]; then
  # Reuse the bootstrap key created by the login user (docs/ec2-self-hosted.md step 3), if any.
  BOOT_HOME="$(getent passwd "${SUDO_USER:-root}" | cut -d: -f6)"
  if [[ -f "$BOOT_HOME/.ssh/qrobo_deploy" ]]; then
    install -o qrobo -g qrobo -m 0600 "$BOOT_HOME/.ssh/qrobo_deploy" /srv/qrobo/.ssh/id_ed25519
    install -o qrobo -g qrobo -m 0644 "$BOOT_HOME/.ssh/qrobo_deploy.pub" /srv/qrobo/.ssh/id_ed25519.pub
  else
    sudo -u qrobo ssh-keygen -q -t ed25519 -N '' -C "qrobo-ec2-deploy" -f /srv/qrobo/.ssh/id_ed25519
  fi
fi
sudo -u qrobo sh -c 'ssh-keyscan -t ed25519 github.com > /srv/qrobo/.ssh/known_hosts 2>/dev/null'

cat <<EOF

============================================================
Setup complete.

GitHub deploy key (must be added in GitHub -> Qroboproduction -> Settings -> Deploy keys,
"Allow write access" UNCHECKED; already done if you followed the guide):
$(cat /srv/qrobo/.ssh/id_ed25519.pub)

Next: first deploy with the demo catalog
   sudo bash $HERE/deploy.sh --seed
============================================================
EOF
