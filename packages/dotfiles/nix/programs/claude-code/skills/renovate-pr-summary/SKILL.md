---
name: renovate-pr-summary
description: Renovate が作成した open な依存更新 PR をすべて調べ、更新されるライブラリやパッケージの新機能、パフォーマンス改善、バグ修正、脆弱性の修正、破壊的変更と、リポジトリ内のプロダクトやツールへの影響を影響度（高・中・低）付きでまとめて、各 PR にコメントするスキル。PR 番号を渡すとその PR だけを扱う。マージするかどうかは開発者が判断するため、マージや承認、マージの可否の判定は行わない。「Renovate の PR をまとめて」「依存更新の内容をコメントして」「renovate pr summary」「/renovate-pr-summary」などで使用。
---

# renovate-pr-summary: Renovate PR の更新内容まとめスキル

Renovate が作成した依存更新の PR を読み、更新されるパッケージごとの変更内容と、リポジトリ内のプロダクトやツールへの影響を調べて、PR にコメントする。目的は、開発者がマージするかどうかを判断する材料をそろえることである。

このスキルは判断材料を集めて示すだけで、判断はしない。PR のマージ、承認（Approve）、変更要求（Request changes）、クローズは行わない。コメントにも「マージしてよい」「マージすべきでない」といった結論は書かない。影響度は、確かめる手間の目安として付けるものであり、マージの可否を表さない。

## 全体の流れ

1. 対象の PR を決める
2. 調査済みの PR を除く
3. PR ごとの調査をサブエージェントに並列で任せる
4. 全件の下書きをまとめて確認する
5. 承認された PR にコメントする

## 手順

### 1. 対象の PR を決める

```bash
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
```

`$ARGUMENTS` に PR 番号か URL があれば、それだけを対象とする。複数あれば、すべてを対象とする。作成者が Renovate（`renovate[bot]` や `app/renovate`）でない PR があれば、続けてよいかを `AskUserQuestion` で確かめる。

`$ARGUMENTS` に PR がなければ、Renovate が作成した open な PR をすべて対象とする。

```bash
gh pr list --author "app/renovate" --state open --limit 100 \
  --json number,title,url,headRefOid,labels
```

0件なら、その旨を伝えて終了する。

`$ARGUMENTS` で言語が指定されていれば（例: `en`, `English`）、その言語でコメントを書く。指定がなければ日本語で書く。確定した値を `LANGUAGE` とする。

### 2. 調査済みの PR を除く

このスキルのコメントには、先頭に `<!-- renovate-pr-summary head=<コミットSHA> -->` の目印を付ける。SHA は調査したときの PR の head である。

対象の PR ごとに目印の付いた既存のコメントを探し、目印の SHA と PR の現在の `headRefOid` を比べる。

```bash
gh api "repos/$REPO/issues/$PR/comments" --paginate \
  --jq '.[] | select(.body | startswith("<!-- renovate-pr-summary")) | {id, body: (.body | split("\n")[0])}' \
  | tail -n 1
```

- 既存のコメントがない: 調査する
- SHA が現在の head と同じ: 調査済みとしてスキップする
- SHA が現在の head と違う: Renovate が更新後の版を上げて push し直したため、調べ直してコメントを書き換える。コメントの `id` を控えておく

スキップした PR は、手順4で番号とタイトルを示す。調査する PR が0件なら、その旨を伝えて終了する。

### 3. PR ごとの調査をサブエージェントに任せる

下書きの置き場所を作る。

```bash
WORK=$(mktemp -d)
```

調査する PR ごとに `Agent` ツールで `general-purpose` のサブエージェントを起動し、並列に調査させる。同時に起動するのは5件までとし、残りは先に起動したものが終わってから起動する。

各サブエージェントへのプロンプトには、次をすべて含める。サブエージェントはこのスキルを読めないため、手順は本文をそのまま貼る。

- 下の「PR ごとの調査手順」節の全文
- `REPO`、PR 番号、PR の現在の `headRefOid`、`LANGUAGE`
- 下書きの出力先 `$WORK/pr-<PR番号>.md`
- PR へのコメント、マージ、承認、ブランチの checkout、ファイルの変更は行わないこと

サブエージェントの結果を集め、失敗したものはその PR 番号と理由を手順4で示す。

### 4. 全件の下書きをまとめて確認する

まず一覧を示す。

| PR | タイトル | 影響度 | 影響するプロダクト・ツール | 脆弱性の修正 | 破壊的変更 | CI |
|------|------|------|------|------|------|------|

影響度が高いものから並べる。続けて、各 PR の下書き全文を示す。手順2でスキップした PR と、手順3で失敗した PR も一覧の下に挙げる。

`AskUserQuestion` で「これらの下書きを PR にコメントしてよいですか」と尋ね、以下を options に渡す。

- `全件コメントする`
- `選んでコメントする` — コメントする PR 番号を自由入力
- `修正する` — 修正する PR 番号と内容を自由入力

`修正する` が選ばれたら、指示に沿って `$WORK/pr-<PR番号>.md` を直し、再度確認する。承認が得られるまで投稿しない。

### 5. 承認された PR にコメントする

承認された PR ごとに、手順2で既存のコメントを見つけた場合はそれを書き換え、なければ新しく投稿する。

```bash
BODY_FILE="$WORK/pr-$PR.md"
if [ -n "$COMMENT_ID" ]; then
  gh api -X PATCH "repos/$REPO/issues/comments/$COMMENT_ID" -F body=@"$BODY_FILE" --jq .html_url
else
  gh pr comment "$PR" --body-file "$BODY_FILE"
fi
```

最後に、コメントした PR と URL、スキップした PR、失敗した PR を報告する。エラーが発生した場合はエラーメッセージを表示し、原因を説明する。

## PR ごとの調査手順

この節は、手順3でサブエージェントに渡す。1つの PR について調べ、コメントの下書きを出力先に書き出し、結果を返す。

### A. PR を読む

```bash
gh pr view "$PR" --repo "$REPO" --json number,title,body,labels,files,headRefOid,baseRefName,url
gh pr diff "$PR" --repo "$REPO"
```

本文と差分から、更新されるパッケージごとに次を控える。本文と差分が食い違う場合は、差分を正とする。

| 項目 | 例 |
|------|------|
| パッケージ名 | `secretlint`, `folke/lazy.nvim`, flake 入力 `nixpkgs` |
| 種類（datasource） | npm, github-tags, git-refs, nix flake 入力 |
| 現行 → 更新後 | `9.0.0` → `10.1.0`、コミットハッシュ同士など |
| 更新の種別 | major / minor / patch / digest / lockFileMaintenance |
| 変更されたファイル | `apps/web/package.json`, `packages/dotfiles/nix/flake.lock` など |
| ソースリポジトリ | `https://github.com/<owner>/<repo>` |

ソースリポジトリは、Renovate の本文の表にあるリンクを使う。なければ npm なら `npm view <pkg> repository.url`、flake 入力なら `flake.lock` の `owner`/`repo` から求める。

lockFileMaintenance や flake の lock 更新では、`flake.lock` や `package-lock.json` の差分から、版が変わった入力と直接依存をすべて拾う。間接依存は、脆弱性の修正に関係するものだけを扱う。

### B. パッケージごとに変更内容を集める

更新前から更新後までの間に含まれる変更をすべて集める。最新のリリースだけを見て済ませない。たとえば `1.2.0` → `1.5.0` なら、`1.3.0`、`1.4.0`、`1.5.0` のリリースノートを読む。

情報源は次の順で使う。上で十分な情報が得られたら、下は省いてよい。

1. Renovate の PR 本文の「Release Notes」節。長い場合は途中で切られているので、切られていたら次の情報源で補う
2. GitHub Releases

   ```bash
   gh api "repos/<owner>/<repo>/releases" --paginate \
     --jq '.[] | {tag_name, name, published_at, html_url, body}'
   ```

3. リポジトリの `CHANGELOG.md`、`CHANGES.md`、`HISTORY.md`、`NEWS.md` など

   ```bash
   gh api "repos/<owner>/<repo>/contents/CHANGELOG.md" --jq .content | base64 -d
   ```

   モノレポでは、パッケージのディレクトリ配下（例: `packages/<name>/CHANGELOG.md`）にあることが多い。
4. コミット比較。タグのない digest 更新（Neovim プラグイン、`lazy.nvim`、flake 入力など）や、リリースノートのないパッケージで使う

   ```bash
   gh api "repos/<owner>/<repo>/compare/<old>...<new>" \
     --jq '{total_commits, commits: [.commits[] | {sha: .sha[0:7], message: (.commit.message | split("\n")[0])}]}'
   ```

   コミット数が多い場合は、`feat`、`fix`、`perf`、`breaking`、`BREAKING CHANGE`、`!:`、`security`、`deprecat` を含むものを優先して読む。

どの情報源でも情報が得られなかったパッケージは、「変更内容を確認できなかった」と書く。推測で補わない。

### C. 脆弱性の修正を調べる

PR のタイトルに `[SECURITY]` があるか、ラベルに `security` がある場合は、Renovate が脆弱性の修正として作った PR である。本文にあるアドバイザリの内容をそのまま使う。

それ以外でも、更新前の版にあり更新後の版にない脆弱性を探す。OSV に更新前と更新後の版を問い合わせ、更新前にだけ出るものを「この更新で修正される脆弱性」、更新後にも出るものを「更新後も残る脆弱性」とする。`osv` の引数は ecosystem（`npm`、`PyPI`、`crates.io`、`Go` など）、パッケージ名、版の順である。

```bash
osv() {
  curl -sS https://api.osv.dev/v1/query \
    -d "$(jq -n --arg e "$1" --arg n "$2" --arg v "$3" '{package: {ecosystem: $e, name: $n}, version: $v}')" \
    | jq -r '.vulns // [] | .[] | .id'
}
comm -23 <(osv npm <pkg> <old> | sort) <(osv npm <pkg> <new> | sort)
osv npm <pkg> <new>
```

GitHub のアドバイザリも併せて確認してよい。

```bash
gh api "/advisories?ecosystem=npm&affects=<pkg>@<old>" \
  --jq '.[] | {ghsa_id, cve_id, severity, summary, html_url, vulnerabilities}'
```

OSV で版を問い合わせられないもの（Neovim プラグイン、flake 入力などのコミット指定）は、B で集めたリリースノートやコミットのうち、`security`、`CVE-`、`GHSA-`、`vulnerability` を含むものだけを扱う。

修正される脆弱性と、更新後の版にも残る脆弱性について、ID（CVE / GHSA）、深刻度、概要、リンクを控える。

### D. プロダクトやツールへの影響を調べる

#### D.1. 影響するプロダクト・ツールを特定する

A で控えた変更されたファイルから、その依存を使うプロダクトやツールを特定する。マニフェスト（`package.json`、`flake.lock`、`Cargo.toml` など）があるディレクトリと、その最寄りの `README.md`、`AGENTS.md`、`CLAUDE.md` から、何のプロダクトやツールかを読み取る。

たとえば mikinovation/mikinovation では次のように対応する。

| 変更されたファイル | プロダクト・ツール |
|------|------|
| `apps/web/` 配下 | Web サイト（Next.js） |
| `packages/dotfiles/package.json` | dotfiles の開発用ツール（secretlint） |
| `packages/dotfiles/nix/flake.lock` | dotfiles で配布する環境全体（home-manager で入れる各プログラム） |
| `packages/dotfiles/nix/programs/<name>/` 配下 | そのプログラム（Neovim、zsh など） |
| `packages/dotfiles/nix/pkgs/<name>.nix` | そのパッケージ（claude-code、difit など） |
| `.github/workflows/` 配下 | CI |

flake 入力の更新では、その入力を参照している `.nix` ファイルを `git grep` で探し、そこで設定しているプログラムを影響先とする。`nixpkgs` の更新では、`home.packages` や `programs.*` で入れているもののうち、版が上がるものを主な影響先とする。

#### D.2. 依存の位置づけを確かめる

影響するプロダクト・ツールごとに、その依存がどう使われるかを控える。

- 実行時に使われる（`dependencies`、配布されるプログラム本体など）か、開発時だけ使われる（`devDependencies`、lint、テスト、ビルドツールなど）か
- プロダクトの利用者に届くか、開発者の手元や CI だけで使われるか

#### D.3. 使用箇所を確かめる

破壊的変更、非推奨化、既定値や動作の変更があったパッケージについて、リポジトリ内での使われ方を調べる。

```bash
git grep -n "<パッケージ名や該当API名・設定項目名・CLIオプション>"
```

変更された API や設定項目、CLI オプションをリポジトリが使っているかを確かめ、使っている箇所をファイルパスと行番号で控える。使っていなければ「該当箇所なし」と控える。確かめられるのは文字列で検索できる範囲だけであり、そう書く。

Node.js などの対応環境の要件が変わった場合は、リポジトリで使っている版（`.nvmrc`、`engines`、`.nix` で指定している版、CI の設定など）が新しい要件を満たすかを確かめる。

#### D.4. 利用者から見える変化をまとめる

B で集めた変更のうち、D.3 で使用箇所に当たったものと、プロダクトやツールの動作が変わるもの（新しい既定値、表示や出力の変化、速度の改善など）を、影響するプロダクト・ツールごとにまとめる。リリースノートにない効果（「速くなるはず」など）は書かない。

#### D.5. CI の結果を確かめる

```bash
gh pr checks "$PR" --repo "$REPO"
```

成功、失敗、実行中のどれかを控える。失敗したチェックは、名前とリンク、どのプロダクト・ツールのチェックかを控える。原因がログから読めれば、その要約も控える。

### E. 変更を分類する

B〜D で集めた変更を、パッケージごとに次の分類に振り分ける。1つの変更は最もよく当てはまる1つの分類にだけ入れる。

| 分類 | 入れるもの |
|------|------|
| 脆弱性の修正 | CVE / GHSA の修正、セキュリティ上の修正 |
| 破壊的変更 | 互換性のない API・設定・動作の変更、対応環境（Node.js など）の要件変更 |
| 非推奨化 | 将来削除される API や設定 |
| 新機能 | 新しい API、オプション、コマンド、対応フォーマットなど |
| パフォーマンス改善 | 速度、メモリ使用量、バンドルサイズなどの改善 |
| バグ修正 | 上記以外の不具合修正 |

ドキュメントのみ、CI のみ、依存のみの更新、内部のリファクタリングは分類せず、件数だけ数える。

各項目は1行で書き、根拠になったリリースノートやコミット、アドバイザリへのリンクを付ける。項目が多いパッケージは、各分類で重要なものを5件程度に絞り、残りは件数とリンクで示す。

### F. 影響度を決める

PR 全体の影響度を、次の基準で上から順に当てはめて決める。最初に当てはまったものを影響度とし、当てはまった理由を控える。

| 影響度 | 基準 |
|------|------|
| 高 | 破壊的変更か非推奨化（削除を含む）が D.3 の使用箇所に当たる。CI が失敗している。更新後の版にも脆弱性が残る。対応環境の新しい要件をリポジトリが満たさない |
| 中 | 実行時に使われる依存の major 更新である。既定値や動作の変更がプロダクトやツールの利用者に届く。破壊的変更はあるが使用箇所は見つからない。変更内容を確認できなかったパッケージがある。CI が実行中である |
| 低 | 上のどれにも当てはまらない（新機能、パフォーマンス改善、バグ修正、脆弱性の修正のみ。または開発時だけ使われる依存の minor・patch 更新） |

脆弱性の修正があることは、影響度を上げる理由にしない。修正の有無は別に示す。

### G. コメントの下書きを作る

`LANGUAGE` で書く。パッケージ名、版、API 名、ID は原文のまま書く。

次の形で書く。項目のない分類と節は見出しごと省く。1行目の目印は、手順2で調査済みかを判定するために使うので、必ず残す。`<HEAD_SHA>` には調査したときの `headRefOid` を入れる。

```markdown
<!-- renovate-pr-summary head=<HEAD_SHA> -->
## 依存更新の内容

影響度: 高 / 中 / 低（<当てはまった基準>）

| パッケージ | 更新 | 種別 | 影響するプロダクト・ツール | 脆弱性の修正 | 破壊的変更 |
|------|------|------|------|------|------|
| `<pkg>` | `<old>` → `<new>` | minor | Web サイト（実行時） | 1件 | なし |

CI: <成功 / 失敗 / 実行中>

### プロダクト・ツールへの影響

#### <プロダクト・ツール名>（実行時 / 開発時）
- 使用箇所に当たる変更: <変更内容>（`path/to/file:12`）
- 利用者から見える変化: <変更内容>（[v2.1.0](<link>)）
- CI: <関係するチェックの結果>

### `<pkg>` `<old>` → `<new>`

#### 脆弱性の修正
- [CVE-XXXX-XXXX](<link>)（High）: <概要>

#### 破壊的変更
- <変更内容>（[v2.0.0](<link>)）

#### 非推奨化
- ...

#### 新機能
- ...

#### パフォーマンス改善
- ...

#### バグ修正
- ...

<details><summary>分類しなかった変更: N件</summary>

ドキュメント、CI、内部リファクタリングなど。<比較リンク>

</details>

### 確認してほしい点
- <使用箇所に当たる破壊的変更や非推奨化>
- <失敗している CI>
- <更新後の版にも残る脆弱性>
- <変更内容を確認できなかったパッケージ>

---
情報源: <リリースノート、CHANGELOG、OSV、GitHub Advisory などのリンク>
影響度は確認の手間の目安です。マージするかどうかは開発者が判断してください。
```

「確認してほしい点」には事実だけを書く。「マージしてよい」「問題なし」といった判定や推奨は書かない。

### H. tanteki でレビューする

`LANGUAGE` が日本語の場合は、下書きを出力先に書き出し、`Skill` ツールで `tanteki` を呼んでレビューさせる。tanteki には次を渡す。

- 対象: 出力先の絶対パス。依頼は既存文書の推敲である
- 文書の種類: PR コメント。検査の `--type` は `flow` とする
- 変えないこと: 1行目の目印、表、見出しの構成、影響度、パッケージ名・版・ID・ファイルパス・リンク
- 原資料: B〜D で集めた情報。原資料にない事実を加えない
- Git 操作と GitHub への投稿は行わない

`Skill` ツールが使えない場合と、`LANGUAGE` が日本語以外の場合は、このレビューを飛ばし、飛ばしたことを結果に書く。

### I. 結果を返す

下書きを出力先に書き出したうえで、次を返す。

```
PR: #<番号> <タイトル>
head: <HEAD_SHA>
影響度: <高 / 中 / 低>（<当てはまった基準>）
影響するプロダクト・ツール: <名前（実行時 / 開発時）>, ...
脆弱性の修正: <件数>
更新後も残る脆弱性: <件数>
破壊的変更: <件数>（使用箇所に当たるもの: <件数>）
CI: <成功 / 失敗 / 実行中>
tanteki: <済 / 飛ばした（理由）>
下書き: <出力先のパス>
```

## このスキルで扱わないこと

- PR のマージ、承認、変更要求、クローズ
- マージの可否の判定や推奨
- PR ブランチの checkout と、手元でのビルドやテストの実行
- 依存の更新そのもの、破壊的変更への対応コードの修正
- Renovate の設定（`renovate.json`）の変更
