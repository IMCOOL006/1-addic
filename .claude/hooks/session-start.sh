#!/usr/bin/env bash
# SessionStart hook: installs project dependencies when running in a
# Claude Code cloud session. No-op locally. Detects the stack from the
# files present, so it keeps working as the project grows.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Node.js
if [ -f package.json ]; then
  if [ -f pnpm-lock.yaml ]; then
    corepack enable >/dev/null 2>&1 || true
    pnpm install --frozen-lockfile
  elif [ -f yarn.lock ]; then
    corepack enable >/dev/null 2>&1 || true
    yarn install --frozen-lockfile
  elif [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
fi

# Python
if { [ -f pyproject.toml ] || [ -f requirements.txt ]; } && command -v python3 >/dev/null 2>&1; then
  if [ -f uv.lock ] && command -v uv >/dev/null 2>&1; then
    uv sync
  else
    python3 -m venv .venv
    # Persist the venv for the rest of the session.
    if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
      echo "export VIRTUAL_ENV=\"$PWD/.venv\"" >> "$CLAUDE_ENV_FILE"
      echo "export PATH=\"$PWD/.venv/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
    fi
    .venv/bin/pip install --upgrade pip >/dev/null
    if [ -f requirements.txt ]; then
      .venv/bin/pip install -r requirements.txt
    else
      .venv/bin/pip install -e .
    fi
  fi
fi

exit 0
