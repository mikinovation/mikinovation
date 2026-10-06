#!/bin/bash
# Claude Code on the web と mobile は、プロジェクト設定で有効にしたプラグインを
# 自動ではインストールしないため、セッションの開始時にインストールする
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
settings=.claude/settings.json

# claude plugin のコマンドは settings.json を書き直すため、終了時に元へ戻す
backup=$(mktemp)
cp "$settings" "$backup"
trap 'cp "$backup" "$settings"; rm -f "$backup"' EXIT

jq -r '.extraKnownMarketplaces | to_entries[] | "\(.key) \(.value.source.repo)"' "$settings" |
  while read -r name repo; do
    if claude plugin marketplace list 2>/dev/null | grep -q "$name"; then
      claude plugin marketplace update "$name"
    else
      claude plugin marketplace add "$repo" --scope project
    fi
  done >&2

jq -r '.enabledPlugins | to_entries[] | select(.value) | .key' "$settings" |
  while read -r plugin; do
    claude plugin install "$plugin" --scope project
  done >&2
