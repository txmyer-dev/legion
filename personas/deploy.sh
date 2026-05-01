#!/bin/bash
# Ekko Essentials — Deploy to GCP1
# Usage: bash deploy.sh [--dry-run]

set -euo pipefail

DRY_RUN="${1:-}"
GCP_HOST="gcp1"
EKKO_DIR="~/ekko"
GLOBAL_CLAUDE="~/.claude/CLAUDE.md"

log() { echo "[ekko-deploy] $1"; }

if [[ "$DRY_RUN" == "--dry-run" ]]; then
    log "DRY RUN — no changes will be made"
    DRY_RUN=true
else
    DRY_RUN=false
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. Deploy Ekko project directory
log "Deploying ekko-project/ -> $GCP_HOST:$EKKO_DIR/"
if [[ "$DRY_RUN" == false ]]; then
    ssh "$GCP_HOST" "mkdir -p $EKKO_DIR"
    scp -r "$SCRIPT_DIR/ekko-project/"* "$GCP_HOST:$EKKO_DIR/"
fi

# 2. Update global CLAUDE.md (neutral, for Paperclip agents)
log "Updating global CLAUDE.md -> $GCP_HOST:$GLOBAL_CLAUDE"
if [[ "$DRY_RUN" == false ]]; then
    # Backup existing
    ssh "$GCP_HOST" "cp $GLOBAL_CLAUDE ${GLOBAL_CLAUDE}.bak 2>/dev/null || true"
    scp "$SCRIPT_DIR/global/CLAUDE.md" "$GCP_HOST:$GLOBAL_CLAUDE"
fi

# 3. Add shell alias
log "Adding 'ekko' alias to ~/.bashrc"
if [[ "$DRY_RUN" == false ]]; then
    ssh "$GCP_HOST" "grep -q 'alias ekko=' ~/.bashrc 2>/dev/null || echo 'alias ekko=\"cd ~/ekko && claude\"' >> ~/.bashrc"
fi

# 4. Verify
log "Verifying deployment..."
if [[ "$DRY_RUN" == false ]]; then
    ssh "$GCP_HOST" "ls -la $EKKO_DIR/CLAUDE.md && echo '---' && ls $EKKO_DIR/identity/ && echo '---' && ls $EKKO_DIR/telos/ | wc -l && echo 'TELOS files deployed'"
fi

log "Done. SSH into GCP1 and run: cd ~/ekko && claude"
