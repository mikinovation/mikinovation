#!/usr/bin/env bash
# スキルのディレクトリを機械的に検査する。問題がなければ 0 で終わり、
# あれば問題を1行ずつ出して 1 で終わる。
set -uo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 <skill-dir>" >&2
  exit 2
fi
dir=$(cd "$1" 2>/dev/null && pwd) || {
  echo "NG: $1 がディレクトリではない"
  exit 1
}
dirname=$(basename "$dir")
skill="$dir/SKILL.md"
fail=0
ng() {
  echo "NG: $*"
  fail=1
}

if [ ! -f "$skill" ]; then
  ng "SKILL.md がない"
  exit 1
fi

# frontmatter は1行目の --- から次の --- まで
if [ "$(head -n 1 "$skill")" != "---" ]; then
  ng "1行目が --- ではない（frontmatter がない）"
fi
front=$(awk 'NR == 1 && $0 == "---" { inside = 1; next } inside && $0 == "---" { exit } inside { print }' "$skill")
if ! awk 'NR > 1 && $0 == "---" { found = 1; exit } END { exit !found }' "$skill"; then
  ng "frontmatter の終わりの --- がない"
fi

field() { printf '%s\n' "$front" | sed -n "s/^$1:[[:space:]]*//p" | head -n 1; }
name=$(field name)
description=$(field description)
invocation=$(field disable-model-invocation)

if [ -z "$name" ]; then
  ng "name がない"
elif [ "$name" != "$dirname" ]; then
  ng "name ($name) とディレクトリ名 ($dirname) が一致しない"
fi
if [ -n "$name" ] && ! printf '%s' "$name" | grep -Eq '^[a-z0-9]+(-[a-z0-9]+)*$'; then
  ng "name ($name) が英小文字・数字とハイフンだけでできていない"
fi

if [ -z "$description" ]; then
  ng "description がない"
else
  # 起動する場面と使わない場面の両方を書く決まり（日本語か英語の書き方を受け付ける）
  if ! printf '%s' "$description" | grep -Eq '「[^」]+」.*(で使用|で使う)|[Uu]se (it )?when'; then
    ng "description に起動する場面（「…」などで使用 / Use when …）がない"
  fi
  if ! printf '%s' "$description" | grep -Eq '使わない|[Dd]o not use|[Dd]on.t use|[Nn]ot for'; then
    ng "description に使わない場面（…には使わない / Do not use …）がない"
  fi
fi

if [ -n "$invocation" ] && [ "$invocation" != "true" ] && [ "$invocation" != "false" ]; then
  ng "disable-model-invocation ($invocation) が true でも false でもない"
fi

# 本文から参照している同じディレクトリのファイルが存在するか
while IFS= read -r ref; do
  [ -e "$dir/$ref" ] || ng "SKILL.md が参照する $ref がない"
done < <(grep -oE '\]\([^)#:]+\)' "$skill" | sed -E 's/^\]\(//; s/\)$//' | grep -vE '^/|<' | sort -u)

if [ -d "$dir/scripts" ]; then
  while IFS= read -r script; do
    [ -x "$script" ] || ng "${script#"$dir"/} に実行権限がない"
  done < <(find "$dir/scripts" -type f)
fi

# mikinovation リポジトリの packages/claude-skills/skills にあるスキルは登録まで確かめる
root=$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null || true)
if [ -n "$root" ] && [ "$dir" = "$root/packages/claude-skills/skills/$dirname" ]; then
  link="$root/.claude/skills/$dirname"
  if [ ! -L "$link" ]; then
    ng ".claude/skills/$dirname のシンボリックリンクがない（scripts/register.sh を実行する）"
  elif [ "$(cd "$link" 2>/dev/null && pwd -P)" != "$(cd "$dir" && pwd -P)" ]; then
    ng ".claude/skills/$dirname が $dir を指していない"
  fi
  nix_file="$root/packages/dotfiles/nix/programs/claude-code/default.nix"
  if ! grep -qF "\"$dirname\" = ../../../../claude-skills/skills/$dirname;" "$nix_file"; then
    ng "Nix の skills に $dirname が登録されていない（scripts/register.sh を実行する）"
  fi
  keys=$(awk '/^    skills = \{$/ { b = 1; next } b && /^    \};$/ { exit } b && match($0, /"[^"]+"/) { print substr($0, RSTART + 1, RLENGTH - 2) }' "$nix_file")
  if [ "$keys" != "$(printf '%s\n' "$keys" | LC_ALL=C sort)" ]; then
    ng "Nix の skills が名前の順に並んでいない"
  fi
fi

if [ "$fail" -eq 0 ]; then
  echo "OK: $dirname"
fi
exit "$fail"
