#!/usr/bin/env bash
# 学習ノートを保存したあとのファイル名の検査、索引生成、検査、本文の折り返しの検査を実行する。
# すべて通れば 0、検査が落ちれば 1、実行場所や引数が違えば 2 で終わる。
set -uo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 <保存した学習ノートの tsx のパス>" >&2
  exit 2
fi

root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "NG: git リポジトリの中で実行する" >&2
  exit 2
}
hub="$root/apps/docs-hub"
if [ ! -d "$hub/src/content/learn" ]; then
  echo "NG: $hub/src/content/learn がない（mikinovation リポジトリで実行する）" >&2
  exit 2
fi

note=$(cd "$(dirname "$1")" 2>/dev/null && pwd)/$(basename "$1") || {
  echo "NG: $1 がない" >&2
  exit 2
}
if [ ! -f "$note" ]; then
  echo "NG: $note がない" >&2
  exit 2
fi
case "$note" in
  "$hub/src/content/learn/"*.tsx) ;;
  *)
    echo "NG: $note が $hub/src/content/learn/ の tsx ではない" >&2
    exit 2
    ;;
esac

cd "$hub" || exit 2

fail=0
ng() {
  echo "NG: $*"
  fail=1
}

numbers=""
for path in src/content/learn/*.tsx; do
  name=$(basename "$path")
  if ! printf '%s' "$name" | grep -Eq '^[0-9]{4}_[a-z0-9]+(-[a-z0-9]+)*\.tsx$'; then
    ng "$name のファイル名が <4桁の番号>_<英小文字とハイフンのタイトル>.tsx ではない"
    continue
  fi
  number=${name%%_*}
  case " $numbers " in
    *" $number "*) ng "番号 $number の学習ノートが2本ある" ;;
    *) numbers="$numbers $number" ;;
  esac
done

if [ "$fail" -ne 0 ]; then
  exit 1
fi

run() {
  echo "--- $*"
  "$@" || ng "$* が失敗した"
}

run node scripts/build-content-index.mjs
run pnpm fmt
run pnpm lint
run pnpm typecheck

wrapped=$(awk '
  { backticks = gsub(/`/, "`") }
  inside { if (backticks % 2 == 1) inside = 0; prev = ""; next }
  backticks % 2 == 1 { inside = 1; prev = ""; next }
  prev ~ /[ぁ-んァ-ヶ一-龥、。]$/ && $0 ~ /^[[:space:]]*[ぁ-んァ-ヶ一-龥]/ { printf "  %d行目と%d行目\n", NR - 1, NR }
  { prev = $0 }
' "$note")
if [ -n "$wrapped" ]; then
  ng "本文の日本語が改行で折り返されている（表示時に半角空白が入る）"
  printf '%s\n' "$wrapped"
fi

if [ "$fail" -ne 0 ]; then
  exit 1
fi
echo "OK: 索引と検査を通した"
