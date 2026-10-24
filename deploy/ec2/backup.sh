#!/usr/bin/env bash
# Daily PostgreSQL backup (custom format, restorable with pg_restore). Keeps 14 days locally.
# Installed as /usr/local/bin/qrobo-backup; run by qrobo-backup.timer and before every deploy.
# Copy the files off the server too (S3 or download), a disk failure takes local backups with it.
set -euo pipefail
DIR=/var/backups/qrobo
KEEP_DAYS=14
STAMP="$(date -u +%Y%m%d-%H%M%S)"
OUT="$DIR/qrobo-$STAMP.dump"
runuser -u postgres -- pg_dump --format=custom --no-owner --file="$OUT.part" qrobo
mv "$OUT.part" "$OUT"
chmod 0600 "$OUT"
find "$DIR" -name 'qrobo-*.dump' -mtime +"$KEEP_DAYS" -delete
echo "backup written: $OUT ($(du -h "$OUT" | cut -f1))"
