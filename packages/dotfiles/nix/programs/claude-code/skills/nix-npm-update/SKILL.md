---
name: nix-npm-update
description: nix管理下のnpm依存を最新化するスキル。package.jsonの通常依存（secretlint）、buildNpmPackage形式のラッパーパッケージ（vue-language-server, vue-typescript-plugin, difit）、tgz直接展開形式（claude-code）、プリビルドバンドル形式（chrome-devtools-mcp）、GitHubソース形式（tanteki）の5種を扱う。Nix のネットワーク取得を使わずに hash を計算するため、Claude Code on the web でも実行できる。npm依存の最新化や、これらのパッケージの個別更新を頼まれたときに使う。「npm依存を最新化して」「vue-language-serverを更新して」「/nix-npm-update」などで使用。Nix で管理していないプロジェクトの npm 依存の更新には使わない。
---

# nix-npm-update: nix管理下のnpm依存更新スキル

このリポジトリにはnpm依存が5種類の形で存在する。常に全種別を対象として、差分があるものだけ更新する。

## 前提

作業ディレクトリは monorepo の `packages/dotfiles` とする。以降のパスはここからの相対パスで書く。

```bash
cd "$(git rev-parse --show-toplevel)/packages/dotfiles"
SKILL_DIR=<この SKILL.md があるディレクトリの絶対パス>
S=$(mktemp -d)
```

hash の計算には `nix run nixpkgs#prefetch-npm-deps`、`nix flake prefetch`、`gh api` を使わない。Claude Code on the web では `channels.nixos.org`、`cache.nixos.org`、`api.github.com` への接続が遮断されるためである。代わりに `$SKILL_DIR/scripts/` の Node スクリプトを使う。必要なのは Node.js 18 以上、`registry.npmjs.org` への接続、git の clone だけである。

| スクリプト | 用途 | 等価な Nix コマンド |
|------|------|------|
| `npm-deps-hash.mjs <lock>` | buildNpmPackage の npmDepsHash | `prefetch-npm-deps <lock>`（fetcherVersion 1） |
| `github-src-hash.mjs <owner/repo> [ref] [lockのパス]` | fetchFromGitHub の rev、日付（UTC）、hash。lock のパスを渡すと npmDepsHash も出す | `nix flake prefetch github:...` |
| `nar-hash.mjs <path>` | ディレクトリの NAR hash | `nix hash path --sri` |

`npm-deps-hash.mjs` は prefetch-npm-deps と同じ `_cacache` と lockfile の写しを組み立て、その NAR hash を出す。lockfile の原文も hash に含まれるため、依存が無くても lockfile を1文字でも変えれば npmDepsHash は変わる。git 依存と fetcherVersion 2 以上には対応していない。該当するパッケージを追加した場合は Nix が使える環境で `prefetch-npm-deps` を使う。

## 対象の分類

| パッケージ | 種別 | 定義ファイル |
|------|------|------|
| secretlint | A | `package.json`, `pnpm-lock.yaml` |
| vue-language-server | B | `nix/pkgs/vue-language-server.nix` |
| vue-typescript-plugin | B | `nix/pkgs/vue-typescript-plugin.nix` |
| difit | B | `nix/pkgs/difit.nix` |
| claude-code | C | `nix/pkgs/claude-code.nix` |
| chrome-devtools-mcp | D | `nix/pkgs/chrome-devtools-mcp.nix` |
| tanteki | E | `nix/pkgs/tanteki.nix` |

| 種別 | 形式 |
|------|------|
| A. 通常npm | renovateで自動更新済。手動なら `pnpm update` |
| B. buildNpmPackage | tgz fetchUrl + 手書きlock + npmDepsHash |
| C. tgz直接展開 | mainTgz + プラットフォーム別 native tgz（linux-x64 と darwin-arm64） |
| D. プリビルドバンドル | tgz fetchUrl + 空lock + forceEmptyCache + 手書きinstallPhase |
| E. GitHubソース | fetchFromGitHub + 上流同梱lock + npmDepsHash |

npm package名は nix のパッケージ名と一致しないものがある。

| nix のパッケージ名 | npm package名 |
|------|------|
| vue-language-server | `@vue/language-server` |
| vue-typescript-plugin | `@vue/typescript-plugin` |
| difit | `difit`（scope なし） |
| claude-code (main) | `@anthropic-ai/claude-code` |
| claude-code (native) | `@anthropic-ai/claude-code-linux-x64`, `@anthropic-ai/claude-code-darwin-arm64` |

`.nix` の `sha512` は `sha512-` 接頭辞を付けずに書く。`npm view` の `dist.integrity` は接頭辞付きなので外して貼る。

## 手順

### 1. 現行と最新を確認する

差分が無いものはスキップ。

現行版:
- secretlint: `pnpm pkg get devDependencies.secretlint`
- 種別B/C/D: 各 `.nix` の `version` 属性
- tanteki: `nix/pkgs/tanteki.nix` の `src.rev`（npmレジストリではなくGitHubの最新コミットと比較する）

最新版を並列で取得する。`npm view` に複数のフィールドを渡すと、JSON のキーは `"dist.tarball"` のように平坦になる。jq では `.["dist.tarball"]` で取り出す。`.dist.tarball` では `null` になる。

```bash
npm view secretlint version > "$S/sl.txt" &
npm view @vue/language-server version dist.tarball dist.integrity --json > "$S/vls.json" &
npm view @vue/typescript-plugin version dist.tarball dist.integrity --json > "$S/vtp.json" &
npm view difit version dist.tarball dist.integrity --json > "$S/difit.json" &
npm view @anthropic-ai/claude-code version dist.tarball dist.integrity --json > "$S/cc-main.json" &
npm view chrome-devtools-mcp version dist.tarball dist.integrity --json > "$S/cdm.json" &
wait
git ls-remote https://github.com/iwasa-kosui/tanteki.git refs/heads/main
```

### 2. 種別A (secretlint) の更新

renovateが自動更新するため、手動更新はrenovateと競合する可能性がある。実行前に secretlint を含む open PR を確認する。`gh` が使えない環境では GitHub MCP の `list_pull_requests` などで確認する。renovate が止まっている等の正当理由がなければスキップ。`package.json` は固定バージョン記法なので `-E`（`--save-exact`）を維持する。

```bash
pnpm add -E -D secretlint@latest @secretlint/secretlint-rule-preset-recommend@latest
```

### 3. 種別B (buildNpmPackage) の更新

`PKG` と `JSON` を切り替えて vue-language-server / vue-typescript-plugin / difit の各々に同手順を適用する。

#### 3.1. 手順1のJSONから値を取り出す

```bash
PKG=vue-language-server          # または vue-typescript-plugin / difit
JSON="$S/vls.json"               # または $S/vtp.json / $S/difit.json
NEW_VER=$(jq -r '.version' "$JSON")
TGZ_URL=$(jq -r '.["dist.tarball"]' "$JSON")
SHA512=$(jq -r '.["dist.integrity"]' "$JSON" | sed 's/^sha512-//')
```

#### 3.2. package-lock.json を再生成

`nix/pkgs/${PKG}-lock.json` を新バージョンで作り直す。`dontNpmBuild = true;` のため `--ignore-scripts` 必須。

`.nix` の `src` が `runCommand` で package.json を書き換えている場合は、lock を作る前に同じ書き換えを適用する。書き換えないと lock と package.json が食い違い、`npm ci` が失敗する。vue-language-server は devDependencies を削除し、typescript を `^5.9.3` に固定している。書き換えの内容は `.nix` の `node -e` を正とし、変わっていないか毎回確認する。

```bash
WORK=$(mktemp -d)
mkdir -p "$WORK/src"
curl -sL "$TGZ_URL" | tar xz -C "$WORK/src" --strip-components=1
```

vue-language-server の場合だけ、ここで `.nix` と同じ書き換えを行う。

```bash
node -e '
  const fs = require("fs");
  const path = process.argv[1] + "/package.json";
  const p = JSON.parse(fs.readFileSync(path, "utf8"));
  delete p.devDependencies;
  p.dependencies = Object.assign({}, p.dependencies, { typescript: "^5.9.3" });
  fs.writeFileSync(path, JSON.stringify(p, null, 2) + "\n");
' "$WORK/src"
```

```bash
( cd "$WORK/src" && rm -f package-lock.json && npm install --package-lock-only --ignore-scripts )
cp "$WORK/src/package-lock.json" "nix/pkgs/${PKG}-lock.json"
```

lockファイルは手書きで再生成するため、上流の `package-lock.json` 仕様変更に追随する必要がある。生成後に `lockfileVersion` を確認する。

#### 3.3. .nix の version/url/sha512 を更新

`nix/pkgs/${PKG}.nix` の `version` / `url` / `sha512` を 3.1 の値に書き換える。

#### 3.4. npmDepsHash を更新

```bash
node "$SKILL_DIR/scripts/npm-deps-hash.mjs" "nix/pkgs/${PKG}-lock.json"
```

出力された `sha256-...=` を `.nix` の `npmDepsHash` に貼る。

### 4. 種別C (claude-code) の更新

main は手順1で取得済み。native はバージョン依存なので、main の version 確定後に取得する。native は `nix/pkgs/claude-code.nix` の `natives` にあるプラットフォームをすべて更新する。

```bash
NEW_VER=$(jq -r '.version' "$S/cc-main.json")
jq -r '.["dist.integrity"]' "$S/cc-main.json"
npm view "@anthropic-ai/claude-code-linux-x64@$NEW_VER" dist.integrity
npm view "@anthropic-ai/claude-code-darwin-arm64@$NEW_VER" dist.integrity
```

`nix/pkgs/claude-code.nix` の `version`、`mainTgz.sha512`、`natives.<system>.sha512` を書き換える。URL は `version` から組み立てられるので書き換えない。

native パッケージは新バージョンで未公開のことがある。いずれかの `npm view` がエラーになったら、更新を中止してユーザーに報告する。

### 5. 種別D (chrome-devtools-mcp) の更新

chrome-devtools-mcp の配布tgzは `build/` にビルド済みバンドルを同梱し、`dependencies` が空（依存はthird_partyとして内包）。一方 `devDependencies` (eslint等) は残るため、種別Bの手順をそのまま使うと `npm ci` が devDeps を取りに行って失敗する。専用手順が必要。

#### 5.1. 手順1のJSONから値を取り出す

```bash
NEW_VER=$(jq -r '.version' "$S/cdm.json")
TGZ_URL=$(jq -r '.["dist.tarball"]' "$S/cdm.json")
SHA512=$(jq -r '.["dist.integrity"]' "$S/cdm.json" | sed 's/^sha512-//')
```

#### 5.2. lockファイルは空のまま据え置き

`nix/pkgs/chrome-devtools-mcp-lock.json` は依存ゼロの固定lock。`version` フィールドだけ新バージョンに合わせる（`packages[""].version` と top-level `version`）。bin/engines が上流で変わっていないかは `npm view chrome-devtools-mcp@$NEW_VER bin engines dependencies --json` で確認する。

#### 5.3. .nix の version/url/sha512 を更新

`nix/pkgs/chrome-devtools-mcp.nix` の `version` / `url` / `sha512` を 5.1 の値に書き換える。

注意点（種別Bとの差分。上流仕様が変わらない限り据え置きでよい）:
- `forceEmptyCache = true;` — 依存ゼロのため空キャッシュを明示的に許可する。
- src の runCommand 内で、package.json の `devDependencies` / `dependencies` / `scripts` を node で削除する。空lockと整合させるため。
- `installPhase` を手書きしている。デフォルトの npmInstallHook は node_modules 前提で失敗するため、`build/` をコピーして `makeWrapper` で bin を node ラップする。bin のパス（`build/src/bin/chrome-devtools-mcp.js`）が上流で変わっていないか確認する。tgz に含まれるかは `curl -sL "$TGZ_URL" | tar tz` で確かめる。

#### 5.4. npmDepsHash を更新

lock の version を変えたので npmDepsHash も変わる。据え置かない。

```bash
node "$SKILL_DIR/scripts/npm-deps-hash.mjs" nix/pkgs/chrome-devtools-mcp-lock.json
```

### 6. 種別E (tanteki) の更新

tanteki はnpmレジストリではなくGitHubリポジトリを直接取得する。`package-lock.json` は上流の `skills/tanteki` に同梱されているため再生成しない。`src.rev`、`src.hash`、`npmDepsHash` は常に同時に確認する。

#### 6.1. rev、ソースhash、npmDepsHash を取得

```bash
node "$SKILL_DIR/scripts/github-src-hash.mjs" iwasa-kosui/tanteki main skills/tanteki/package-lock.json
```

出力の `rev` が現行の `src.rev` と同じならスキップする。違えば `nix/pkgs/tanteki.nix` の `version`（`0-unstable-<date>`）、`src.rev`、`src.hash`、`npmDepsHash` を出力の値に書き換える。

#### 6.2. postPatch の追随

`postPatch` は `substituteInPlace --replace-fail` で上流の文面を書き換えている。対象は `SKILL.md` と `references/lint.md` の `npm ci` 指示、コマンド例の先頭の `node `、`scripts/lint.mjs` の shebang である。上流で該当文が変わるとビルドが `--replace-fail` で失敗する。新しい rev で置換元の文字列がすべて残っているかを、clone したソースに対して `grep -F` で確認する。消えていれば新しい文面に合わせて置換元の文字列を直す。`installPhase` でコピーするファイルとディレクトリが残っているかも確認する。

```bash
TMP=$(mktemp -d)
git -C "$TMP" init -q
git -C "$TMP" fetch -q --depth 1 https://github.com/iwasa-kosui/tanteki.git <rev>
git -C "$TMP" checkout -q FETCH_HEAD
```

#### 6.3. 動作確認

Nix が使える環境では、ビルド後に store上（read-only）でlintが動くことを確認する。

```bash
TANTEKI=$(nix build --no-link --print-out-paths --impure \
  --expr 'with import <nixpkgs> { }; callPackage ./nix/pkgs/tanteki.nix { }')
"$TANTEKI/scripts/lint.mjs" --type design-doc <適当なMarkdownの絶対パス>
```

`scripts/lint.mjs` は `import.meta.url` と `process.argv[1]` を比較して起動する。symlink 経由で呼ぶと両者が一致せず、検査せずに終了コード0を返す。`~/.claude/skills/tanteki/` 配下ではなく、`readlink -f` で解決した store のパスで実行する。

### 7. ビルド検証

種別B/C/D/E を更新した場合は home-manager のビルドで hash を実評価する:

```bash
nix build --no-link ./nix#checks.x86_64-linux.home-manager-build
```

Claude Code on the web などで Nix のキャッシュや nixpkgs を取得できない場合は、このビルドと 6.3 を実行できない。その場合は次の代替検査を行い、ビルドを実行していないことを報告に明記する。ビルドは push 後に CI（`.github/workflows/dotfiles-ci.yml` の nix-check）で行われる。

```bash
for f in nix/pkgs/*.nix; do nix-instantiate --parse "$f" > /dev/null; done
for f in nix/pkgs/*-lock.json; do jq empty "$f"; done
```

`nix-instantiate` が無い環境では Nix の構文検査も省略し、その旨を報告する。

### 8. Post-Task Verification と報告

`AGENTS.md` の Post-Task Verification を実行する。

```bash
nix run ./nix#lint && nix run ./nix#fmt && nix run ./nix#test
```

`nix run` が nixpkgs を取得できない場合は、このスキルで変更しうるファイルに関係する secretlint だけを直接実行する。fmt と test は Lua が対象で、このスキルの変更とは関係しないため省略してよい。省略したことは報告に明記する。

```bash
npm ci && npx secretlint "**/*"
```

報告フォーマット（差分なしでスキップしたものも明記。コミット・プッシュは明示指示があるまでしない）:

```
更新対象:
  - <pkg名>: <old> -> <new>
  - <pkg名>: skip (no diff)
変更ファイル:
  - <path>
  - ...
ビルド: ok / fail / 未実行（理由）
lint/fmt/test: ok / fail / 一部未実行（理由）
```
