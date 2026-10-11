#!/usr/bin/env bash
# mikinovation リポジトリで、packages/claude-skills/skills/<名前> にあるスキルを
# .claude/skills のシンボリックリンクと Nix の skills 一覧に登録する。
# 登録済みなら何もしない。
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 <skill-name>" >&2
  exit 2
fi
name=$1

root=$(git rev-parse --show-toplevel)
skill_dir="$root/packages/claude-skills/skills/$name"
nix_file="$root/packages/dotfiles/nix/programs/claude-code/default.nix"

if [ ! -f "$skill_dir/SKILL.md" ]; then
  echo "error: $skill_dir/SKILL.md がない" >&2
  exit 1
fi

link="$root/.claude/skills/$name"
if [ ! -e "$link" ]; then
  ln -s "../../packages/claude-skills/skills/$name" "$link"
  echo "linked: .claude/skills/$name"
fi

entry="      \"$name\" = ../../../../claude-skills/skills/$name;"
if grep -qF "\"$name\" = " "$nix_file"; then
  exit 0
fi

# skills = { ... }; の中で、キーが名前の順になる位置に1行足す
tmp=$(mktemp)
awk -v name="$name" -v entry="$entry" '
  /^    skills = \{$/ { in_block = 1; print; next }
  in_block && /^    \};$/ {
    if (!done) { print entry; done = 1 }
    in_block = 0; print; next
  }
  in_block && !done {
    if (match($0, /"[^"]+"/)) {
      key = substr($0, RSTART + 1, RLENGTH - 2)
      if (key > name) { print entry; done = 1 }
    }
  }
  { print }
  END { if (!done) exit 1 }
' "$nix_file" >"$tmp" || {
  rm -f "$tmp"
  echo "error: $nix_file に skills = { ... }; が見つからない" >&2
  exit 1
}
mv "$tmp" "$nix_file"
echo "registered: $name in ${nix_file#"$root"/}"
