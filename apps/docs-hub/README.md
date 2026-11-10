# Docs Hub

ポートフォリオと、PRD、ADR、設計書、学習ノートを一つにまとめて公開するサイト。
文書の正本は `src/content/` の TSX で、一覧と本文を表示する。

## 開発

```sh
pnpm install
pnpm dev           # http://localhost:5173/mikinovation
pnpm build         # 静的書き出し（dist/client/）
pnpm typecheck
```

## 構成

- パッケージマネージャーは pnpm（`packageManager` フィールドで版を固定）
- TanStack Start（Vite）、TanStack Router、React 19、TypeScript
- サーバーは置かず、`vite.config.ts` の `prerender` で全ページを静的な HTML に書き出す。トップページのリンクをたどって文書のページを見つける
- 公開先が `https://mikinovation.github.io/mikinovation/` なので、Vite の `base` と Router の `basepath` の両方に `/mikinovation` を設定している
- ルーティングは `src/routes/` のファイル名で決まる。`src/routeTree.gen.ts` は dev とビルドが生成する。手で書き足さないが、型検査が参照するためコミットする
- URL が存在しないときの表示は `src/routes/404.tsx` で、`404.html` に書き出して GitHub Pages の 404 として配信する
- スタイルは Tailwind CSS 4。トークンと共通クラスは `src/styles/globals.css` に置く

### 文書

文書は `src/content/prd/`、`src/content/adr/`、`src/content/design/`、`src/content/learn/` に `<4桁の番号>_<タイトル>.tsx` の名前で置く。
本文は Markdown ではなく、`src/components/doc.tsx` と `src/components/figure.tsx` のコンポーネントを組み合わせた TSX で書く。
作成と更新は create-prd、create-adr、create-design-doc などのスキルが担い、保存先はスキル側にも書いてある。学習ノートは、プロダクトで採用したかどうかと関係なく技術の仕組みや考え方を学んだ記録を残す種類で、create-learning-note が担う。

- 各文書は `meta`（タイトル、導入文、属性、PRD と ADR と設計書ではリポジトリ）と、本文を返す既定の関数を export する
- PRD、ADR、設計書は1つのリポジトリに属する。`meta` の `repository` に `src/lib/repositories.ts` の `repositoryIds` にある ID を書き、`satisfies DocMeta` を付ける。型検査が、未知の ID と書き忘れを弾く
- 学習ノートは技術の仕組みや考え方の記録で、特定のリポジトリに属さない。`repository` を持たず、`satisfies LearnMeta` を付ける。リポジトリの一覧にも出ない
- どのリポジトリにも属さない共通の筆者の思想は、PRD や ADR にせず、別の種類として切り出す
- `src/content/index.ts` は各文書の `meta` と本文を集めた配列で、`scripts/build-content-index.mjs` が `src/content/` を走査して生成する。手で書き足さない。種類のディレクトリがないときは0件として扱う
- 一覧とメタ情報は `src/lib/docs.ts` が `src/content/index.ts` から組み立てる。`状態` と `段階` からバッジを決め、バッジと重ならない属性をヘッダーのチップに出す
- 1件も文書がない種類は、トップページ（`src/routes/index.tsx`）に出さない。種類の定義（`docKinds`）は残す
- ページは `src/routes/$kind.$slug.tsx` が描画する。URL は `/<種類>/<ファイル名>` で、prerender がリンクをたどって全件を静的に書き出す
- 本文の節、箇条書き、表、要求、代替案、出典は `src/components/doc.tsx`、図は `src/components/figure.tsx` を使う。書き方は `FIGURES.md` に定める
- 見直しの一覧（`/review`）は、各文書の `更新日`（ADR は `決定日`）から `src/lib/docs.ts` の `reviewIntervalMonths` か月後を期限として並べる。期限を過ぎたかどうかはビルド時の日付で決まるため、判定は再デプロイで更新される
- 文書どうしの参照は `<DocRef kind="ADR" number="0013" />` と書く。`src/lib/docs.ts` の `docRefHref` が番号から URL を引くため、参照先を改名してもリンクは壊れない
- 外部の URL とサイト内のパスへのリンクは `DocLink` を使う。サイト内のパスは `SiteLink` が Router の `Link` にし、`basepath` と現在地の `aria-current` が付く

ファイル名から URL が決まるため、文書を改名すると URL も変わる。

文書を足す、改名する、消したときは索引を作り直す。

```sh
node scripts/build-content-index.mjs
```

日本語の検査（textlint）は Markdown にしか当たらないため、文章を書くときは一時ファイルの Markdown で下書きして japanese-review を通し、本文をコンポーネントに移し替える。下書きはリポジトリに残さない。

### issue

issue は `src/content/issues.yaml` に置き、一覧（`/issues`）に状態ごとに並べる。読み書きするのは AI エージェントで、所有者はこのページから閲覧し、着手を承認する。文書の仕組み（`src/content/index.ts`）は通さない。扱いの手順は manage-issues スキル（`packages/claude-skills/skills/manage-issues`）に置いてある。

- 1件は `id`（4桁の連番の文字列）、`title`（短い1行）、`status`、`repository` の4つを持つ。作成日、優先度の値、関連する文書の番号は持たせない
- `id` は `done` を含めた既存の最大値 +1 を使い、欠番は埋めない
- `status` は `proposed`（承認待ち）、`todo`（承認済みで未着手）、`doing`（着手している）、`done`（完了）である。AI が足した issue は `proposed` から始め、所有者が `todo` に変えた issue だけ着手できる。`doing` は同時に1件までを目安とし、`done` は PR をマージした時点で付ける
- 優先度は値として持たず、ファイルの並び順で表す。同じ状態の中では上にあるものから先に進める。新しい issue は末尾ではなく、判定した位置に差し込む。判定は、公開しているページの誤りと壊れた表示、記録と実装のずれ、検査の穴、整備と見た目の順に高く見る
- `repository` は `src/lib/repositories.ts` の `repositoryIds` にある ID か `common` である。1つのリポジトリの作業はその ID を書き、複数のリポジトリにまたがる作業と、どのリポジトリにも属さない作業は `common` にする。表示は `common` だけ「共通」に置き換え、ほかは ID をそのまま出す
- `done` の issue は消さずに残す。件数が増えて読み込みの負担になった時点で切る
- 形の検査は `src/lib/issues-schema.ts` の zod スキーマが担う。`id` が4桁の数字でない、`id` が重複する、`title` が空か60文字を超える、`status` が4値以外、`repository` が `repositoryIds` と `common` のどれでもない、のいずれかに当たると検査に失敗する
- `issues-schema.ts` から `repositories.ts` を相対パスで読んでいるのは、Vite の設定を読み込む文脈では `@/` の別名が解決されないためである
- `scripts/issues-plugin.ts` の Vite プラグインが、ビルド時に YAML を読んで zod スキーマに通し、検査を通った値を JavaScript のモジュールへ変換する。検査に失敗すると変換が失敗し、`pnpm build` が落ちる。prerender の最中に投げた例外は記録されるだけでビルドが成功してしまうため、検査を変換の時点に置いている
- 表示側（`src/lib/issues.ts`、`src/routes/issues.index.tsx`）は zod を読み込まない。`src/types/yaml.d.ts` が YAML のモジュールに `IssueFile` 型を与えるため、型だけを使う。状態の並びは `issueStatusOrder` に持つ。zod の値を表示側から参照すると、クライアントのバンドルに zod が入る
- 一覧の承認待ちの行だけチェックボックスを持ち、1件以上選ぶと画面の下にバーが張り付く。バーのボタンが、選んだ issue の承認を頼む1行の文面をクリップボードへコピーする。文面は `src/lib/issue-prompt.ts` が組み、`/manage-issues` の呼び出しと id だけを並べる。状態の遷移の指示は書かず、manage-issues スキルの手順に委ねる
- 選べるのは承認だけである。`doing` は同時1件までの目安があり、`done` は PR のマージの確認が要るため、一覧の選択では進めない
- このページは `useState` と `navigator.clipboard` を使う唯一のページである。クリップボードが拒否された環境では、文面を画面に出して手でコピーしてもらう
- このサイトは公開されている。顧客名、非公開案件の内容、認証情報に触れる issue は、この仕組みに載せない
- 状態のバッジは `doing` が `stage`、`todo` が `plain`、`proposed` が `pending`（amber）、`done` が `accepted` である

### issue の論点

承認済み（`todo` と `doing`）の issue には、着手の前に所有者が決めることを候補と推奨案の形で並べた論点を持たせる。正本は `src/content/grillings/<id>.yaml` で、ファイル名は issue の id と同じにする。論点を書くのは AI のサブエージェントで、所有者は詳細ページ（`/issues/<id>`）から読み、選んだ候補を書き戻させる。扱いの手順は manage-issues スキルに置いてある。

- 1件は `issueId`、`generatedAt`（生成した日）、`questions` を持つ。1問は `id`（`q` と数字）、`title`、`question`、`options`（2〜5個）、`recommendation` を必ず持ち、`rationale`、`followUp`（推奨案を採ったときに次に決めること）、`decision`（所有者が選んだ候補）は任意である
- 1件の問数は6問までとする。それを超える論点が出る issue は、issue 自体が大きすぎる
- 一覧（`/issues`）では、論点がある issue だけ行全体がリンクになる。論点がない issue はリンクを出さない
- 一覧の行には、論点の答えた割合を `決めた問数/全体の問数` の形で出す。`decision` がある問を決めた問として数え、論点がない issue には何も出さない。数は `src/lib/grillings.ts` の `findGrillingProgress` が数える
- 形の検査は `src/lib/grillings-schema.ts` の zod スキーマが担い、`scripts/grillings-plugin.ts` の Vite プラグインがビルド時にディレクトリ内の全ファイルを通す。issue と同じ理由で、検査は変換の時点に置いている
- 表示側（`src/lib/grillings.ts`）は `import.meta.glob` で全ファイルをまとめて読み、`issueId` で引く。zod は読み込まず型だけを使う
- ファイル名と `issueId` のずれ、対応する issue がない孤児ファイルは、manage-issues の検査スクリプトが失敗にする。承認済みなのに論点がない issue は、承認の直後は正常な状態なので一覧に出すだけで失敗にしない
- 見直し一覧（`/review`）には載せない。論点は文書ではなく、issue を消化した時点で役目が終わる
- 公開してよい内容の決まりは issue と同じである。顧客名、非公開案件の内容、認証情報に触れる論点は書かない

### ポートフォリオ

経歴（`/career`）とリポジトリの紹介（`/repositories`）は文書の仕組みを通さず、ページの TSX にデータを直接書く。

- 正本は `src/routes/career.tsx` と `src/lib/repositories.ts`
- リポジトリの紹介は1件を `Repository` 型の値として並べ、ID、名前、種別、公開年、1〜2文の説明、技術、GitHub の URL を持つ。ID は `repositoryIds` の値で、文書の `repository` から参照される
- `/repositories` はリポジトリごとに節を作り、説明と技術と GitHub の URL を面に出し、その下にそのリポジトリに属する文書のカードを並べる。文書がないリポジトリは、その旨を1行だけ出す。学習ノートはリポジトリに属さないため並ばない
- 文書とリポジトリの紐づけはリポジトリから文書への片方向で、文書のページにリポジトリは出さない。詳しい説明は各リポジトリの README に任せる
- 表示には文書と同じ `src/components/doc.tsx` と `src/components/figure.tsx` のコンポーネントを使う
- ページを足したときは、ヘッダー（`src/components/site-header.tsx`）にもリンクを足す

### テーマ

暗い配色の未来的なテーマで、明暗の切り替えは持たない。配色、タイポグラフィ、各コンポーネントをいつ使うかは `DESIGN.md` に書いてある。値を変えるときは `DESIGN.md` と `src/styles/globals.css` の両方を直す。

- 配色、フォント、影は `@theme` のトークンで定義し、`bg-base-700` や `text-neon` のようなクラスから参照する
- 共通クラス（`.panel`、`.doc-card`、`.badge`、`.nav-link`、`.doc-body`、`.doc-list` など）は `@layer components` に置く
- 検索欄は押せないボタンである

## 公開

`main` への push で `.github/workflows/docs-hub-deploy.yml` が走り、`dist/client/` を GitHub Pages に配信する。
公開先は https://mikinovation.github.io/mikinovation/ 。
手動で流す場合は Actions から `docs-hub Deploy` を実行する。

## 未対応

- 全文検索（PRD 0010 の機能要求2）
- ポートフォリオの範囲。PRD 0010 はドキュメントのみを対象としており、経歴とリポジトリの紹介を載せる範囲は未反映
- テストケース（`src/content/test/`）の表示。`.md` のまま運用するため、一覧に出ない
- 文書とリポジトリの紐づけは PRD 0010 と ADR に未反映。要求と決定の記録を足す必要がある
- リポジトリに属さない共通の筆者の思想を置く種類は未実装。該当する文書が出た時点で足す
- 設計書は0件。kintai を作らないと決めたため、その文書（PRD 0007、ADR 0007〜0013、設計書 0001）を削除した。ADR と PRD の番号は欠番のまま詰めない
- PRD 0010 と ADR 0017・0018 は、正本をリポジトリルートの `docs/` の Markdown とし、サイトの生成に VitePress を使うと決めている。現状は `src/content/` の TSX と TanStack Start でどちらとも違うため、決定の記録を置き換える必要がある
