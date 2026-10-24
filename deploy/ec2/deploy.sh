#!/usr/bin/env bash
# QROBO deploy: fetch main from GitHub, build a new release, migrate, switch, restart.
#
#   sudo bash deploy.sh            # normal deploy
#   sudo bash deploy.sh --seed     # first deploy: also load the demo catalog (idempotent)
#   sudo bash deploy.sh --rollback # switch back to the previous release (no migrations are undone)
#
# Layout: /srv/qrobo/repo (git clone), /srv/qrobo/releases/<commit>, /srv/qrobo/current -> release.
# The running site keeps serving the old release while the new one builds.
set -euo pipefail

REPO_URL="${QROBO_REPO_URL:-git@github.com:UDAY-FREELANCE-07/Qroboproduction.git}"
BRANCH="${QROBO_BRANCH:-main}"
ROOT=/srv/qrobo
KEEP=3
[[ $EUID -eq 0 ]] || { echo "run with sudo" >&2; exit 1; }
[[ -f /etc/qrobo/app.env && -f /etc/qrobo/migrate.env ]] || { echo "run setup-server.sh first" >&2; exit 1; }
as_qrobo() { runuser -u qrobo -- "$@"; }
log() { printf '\n==> %s\n' "$*"; }

health() {
  for _ in $(seq 1 30); do
    if curl -fsS http://127.0.0.1:3000/api/health 2>/dev/null | grep -q '"database":"ok"'; then return 0; fi
    sleep 2
  done
  return 1
}

if [[ "${1:-}" == "--rollback" ]]; then
  CUR="$(readlink -e "$ROOT/current")"
  PREV="$(ls -1dt "$ROOT"/releases/*/ | sed 's#/$##' | grep -vx "$CUR" | head -n1 || true)"
  [[ -n "$PREV" ]] || { echo "no previous release" >&2; exit 1; }
  ln -sfn "$PREV" "$ROOT/current"
  systemctl restart qrobo
  health && echo "rolled back to $(basename "$PREV")" || { echo "health check failed" >&2; exit 1; }
  exit 0
fi
SEED=no; [[ "${1:-}" == "--seed" ]] && SEED=yes

log "Fetch $BRANCH"
if [[ ! -d "$ROOT/repo/.git" ]]; then
  as_qrobo git clone --branch "$BRANCH" "$REPO_URL" "$ROOT/repo"
fi
as_qrobo git -C "$ROOT/repo" fetch --prune origin
as_qrobo git -C "$ROOT/repo" checkout -q "$BRANCH"
as_qrobo git -C "$ROOT/repo" reset -q --hard "origin/$BRANCH"   # server copy only; never edited by hand
SHA="$(as_qrobo git -C "$ROOT/repo" rev-parse --short=12 HEAD)"
REL="$ROOT/releases/$SHA"
echo "commit $SHA"

if [[ ! -f "$REL/frontend/.next/BUILD_ID" ]]; then
  log "Build release $SHA"
  rm -rf "$REL"
  as_qrobo mkdir -p "$REL"
  as_qrobo sh -c "git -C '$ROOT/repo' archive HEAD | tar -x -C '$REL'"
  as_qrobo sh -c "cd '$REL/frontend' && npm ci --no-audit --no-fund"
  # DATA_SOURCE is baked into the browser bundle at build time.
  as_qrobo sh -c "cd '$REL/frontend' && DATA_SOURCE=postgres NEXT_TELEMETRY_DISABLED=1 npm run build"
else
  echo "release $SHA already built"
fi

log "Database backup before migrating"
/usr/local/bin/qrobo-backup

log "Migrations"
TMP_ENV="$(mktemp /tmp/qrobo-migrate.XXXXXX)"
trap 'shred -u "$TMP_ENV" 2>/dev/null || rm -f "$TMP_ENV"' EXIT
cat /etc/qrobo/migrate.env > "$TMP_ENV"
chown qrobo "$TMP_ENV"; chmod 0600 "$TMP_ENV"
as_qrobo sh -c "cd '$REL/frontend' && npx tsx --env-file='$TMP_ENV' scripts/db/migrate.ts"
if [[ "$SEED" == yes ]]; then
  as_qrobo sh -c "cd '$REL/frontend' && npx tsx --env-file='$TMP_ENV' scripts/db/seed.ts"
fi
as_qrobo sh -c "cd '$REL/frontend' && npx tsx --env-file='$TMP_ENV' scripts/db/status.ts"

log "Switch and restart"
PREV="$(readlink -e "$ROOT/current" 2>/dev/null || true)"   # empty on the first deploy
ln -sfn "$REL" "$ROOT/current"
systemctl restart qrobo
systemctl start qrobo-email-flush.timer
if health; then
  echo "deployed $SHA"
else
  echo "health check FAILED for $SHA" >&2
  journalctl -u qrobo -n 40 --no-pager >&2 || true
  if [[ -n "$PREV" && "$PREV" != "$REL" ]]; then
    ln -sfn "$PREV" "$ROOT/current"; systemctl restart qrobo
    echo "switched back to $(basename "$PREV")" >&2
  fi
  exit 1
fi

log "Cleanup old releases (keeping $KEEP)"
{ ls -1dt "$ROOT"/releases/*/ | sed 's#/$##' | tail -n +$((KEEP + 1)) | grep -vx "$(readlink -f "$ROOT/current")" || true; } | xargs -r rm -rf
echo "done"
