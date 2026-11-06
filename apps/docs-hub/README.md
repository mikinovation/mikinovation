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
- サーバーは置かず、`vite.config.ts` の `prerender` で全ページを静的な HTML に書き出す。トップページとサイドバーのリンクをたどって文書のページを見つける
- 公開先が `https://mikinovation.github.io/mikinovation/` なので、Vite の `base` と Router の `basepath` の両方に `/mikinovation` を設定している
- ルーティングは `src/routes/` のファイル名で決まる。`src/routeTree.gen.ts` は dev とビルドが生成する。手で書き足さないが、型検査が参照するためコミットする
- URL が存在しないときの表示は `src/routes/404.tsx` で、`404.html` に書き出して GitHub Pages の 404 として配信する
- スタイルは Tailwind CSS 4。トークンと共通クラスは `src/styles/globals.css` に置く

### 文書

文書は `src/content/prd/`、`src/content/adr/`、`src/content/design/`、`src/content/learn/` に `<4桁の番号>_<タイトル>.tsx` の名前で置く。
本文は Markdown ではなく、`src/components/doc.tsx` と `src/components/figure.tsx` のコンポーネントを組み合わせた TSX で書く。
作成と更新は create-prd、create-adr、create-design-doc などのスキルが担い、保存先はスキル側にも書いてある。学習ノートは、プロダクトで採用したかどうかと関係なく技術の仕組みや考え方を学んだ記録を残す種類で、create-learning-note が担う。

- 各文書は `meta`（タイトル、導入文、リポジトリ、属性）と、本文を返す既定の関数を export する。`meta` には `satisfies DocMeta` を付ける
- 文書は1つのリポジトリに属する。`meta` の `repository` に `src/lib/repositories.ts` の `repositoryIds` にある ID を書き、型検査が未知の ID を弾く。どのリポジトリにも属さない共通の筆者の思想は文書にせず、別の種類として切り出す
- `src/content/index.ts` は各文書の `meta` と本文を集めた配列で、`scripts/build-content-index.mjs` が `src/content/` を走査して生成する。手で書き足さない。種類のディレクトリがないときは0件として扱う
- 一覧とメタ情報は `src/lib/docs.ts` が `src/content/index.ts` から組み立てる。`状態` と `段階` からバッジを決め、バッジと重ならない属性をヘッダーのチップに出す
- 1件も文書がない種類は、トップページ（`src/routes/index.tsx`）とサイドバー（`src/components/site-nav.tsx`）に出さない。種類の定義（`docKinds`）は残す
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

issue は `src/content/issues.yaml` に置き、一覧（`/issues`）に状態ごとに並べる。読み書きするのは AI エージェントで、所有者はこのページから閲覧する。文書の仕組み（`src/content/index.ts`）は通さない。

- 1件は `id`（4桁の連番の文字列）、`title`（短い1行）、`status`（`todo` / `doing` / `done`）の3つだけを持つ。作成日、優先度、関連する文書の番号、対象パッケージは持たせない
- `id` は `done` を含めた既存の最大値 +1 を使い、欠番は埋めない。新しい issue は配列の末尾に足す
- `status` は `doing` が着手しているもの、`todo` が未着手、`done` が完了である。`doing` はそのとき実際に手を付けているものに限り、同時に1件までを目安とする。`done` は PR をマージした時点で付ける
- `done` の issue は消さずに残す。件数が増えて読み込みの負担になった時点で切る
- 形の検査は `src/lib/issues-schema.ts` の zod スキーマが担う。`id` が4桁の数字でない、`id` が重複する、`title` が空か60文字を超える、`status` が3値以外のいずれかに当たると検査に失敗する
- `scripts/issues-plugin.ts` の Vite プラグインが、ビルド時に YAML を読んで zod スキーマに通し、検査を通った値を JavaScript のモジュールへ変換する。検査に失敗すると変換が失敗し、`pnpm build` が落ちる。prerender の最中に投げた例外は記録されるだけでビルドが成功してしまうため、検査を変換の時点に置いている
- 表示側（`src/lib/issues.ts`、`src/routes/issues.tsx`）は zod を読み込まない。`src/types/yaml.d.ts` が YAML のモジュールに `IssueFile` 型を与えるため、型だけを使う。状態の並びは `issueStatusOrder` に持つ。zod の値を表示側から参照すると、クライアントのバンドルに zod が入る
- このサイトは公開されている。顧客名、非公開案件の内容、認証情報に触れる issue は、この仕組みに載せない
- 状態のバッジは既存の色を流用する。`doing` は `stage`、`todo` は `plain`、`done` は `accepted` である

### ポートフォリオ

経歴（`/career`）とリポジトリの紹介（`/repositories`）は文書の仕組みを通さず、ページの TSX にデータを直接書く。

- 正本は `src/routes/career.tsx` と `src/lib/repositories.ts`
- リポジトリの紹介は1件を `Repository` 型の値として並べ、ID、名前、種別、公開年、1〜2文の説明、技術、GitHub の URL を持つ。ID は `repositoryIds` の値で、文書の `repository` から参照される
- `/repositories` はリポジトリごとに節を作り、説明と技術と GitHub の URL を面に出し、その下にそのリポジトリに属する文書のカードを並べる。文書がないリポジトリは、その旨を1行だけ出す
- 文書とリポジトリの紐づけはリポジトリから文書への片方向で、文書のページにリポジトリは出さない。詳しい説明は各リポジトリの README に任せる
- 表示には文書と同じ `src/components/doc.tsx` と `src/components/figure.tsx` のコンポーネントを使う
- ページを足したときは、ヘッダー（`src/components/site-header.tsx`）とサイドバー（`src/components/nav-sections.tsx`）にもリンクを足す

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
- テストケース（`src/content/test/`）と計画（`src/content/plan/`）の表示。この2種類は `.md` のまま運用するため、一覧に出ない
- 文書とリポジトリの紐づけは PRD 0010 と ADR に未反映。要求と決定の記録を足す必要がある
- リポジトリに属さない共通の筆者の思想を置く種類は未実装。該当する文書が出た時点で足す
- 設計書は0件。kintai を作らないと決めたため、その文書（PRD 0007、ADR 0007〜0013、設計書 0001）を削除した。ADR と PRD の番号は欠番のまま詰めない
- PRD 0010 と ADR 0017・0018 は、正本をリポジトリルートの `docs/` の Markdown とし、サイトの生成に VitePress を使うと決めている。現状は `src/content/` の TSX と TanStack Start でどちらとも違うため、決定の記録を置き換える必要がある
