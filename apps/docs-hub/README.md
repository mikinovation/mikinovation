# Docs Hub

ポートフォリオと、PRD、ADR、設計書を一つにまとめて公開するサイト。
文書の正本は `src/content/` の TSX で、一覧と本文を表示する。

## 開発

```sh
pnpm install
pnpm dev           # http://localhost:3000/mikinovation
pnpm build         # 静的書き出し（out/）
pnpm typecheck
```

## 構成

- パッケージマネージャーは pnpm（`packageManager` フィールドで版を固定）
- Next.js 16（App Router）、React 19、TypeScript
- `output: 'export'` で静的ファイルに書き出す
- 公開先が `https://mikinovation.github.io/mikinovation/` なので `basePath` に `/mikinovation` を設定している
- スタイルは Tailwind CSS 4。トークンと共通クラスは `src/app/globals.css` に置く

### 文書

文書は `src/content/prd/`、`src/content/adr/`、`src/content/design/` に `<4桁の番号>_<タイトル>.tsx` の名前で置く。
本文は Markdown ではなく、`src/components/doc.tsx` と `src/components/figure.tsx` のコンポーネントを組み合わせた TSX で書く。
作成と更新は create-prd、create-adr、create-design-doc などのスキルが担い、保存先はスキル側にも書いてある。

- 各文書は `meta`（タイトル、導入文、属性）と、本文を返す既定の関数を export する
- `src/content/index.ts` は各文書の `meta` と本文を集めた配列で、`scripts/build-content-index.mjs` が `src/content/` を走査して生成する。手で書き足さない
- 一覧とメタ情報は `src/lib/docs.ts` が `src/content/index.ts` から組み立てる。`状態` と `段階` からバッジを決め、バッジと重ならない属性をヘッダーのチップに出す
- ページは `src/app/[kind]/[slug]/page.tsx` が描画する。URL は `/<種類>/<ファイル名>` で、`generateStaticParams` が全件を静的に書き出す
- 本文の節、箇条書き、表、要求、代替案、出典は `src/components/doc.tsx`、図は `src/components/figure.tsx` を使う。書き方は `FIGURES.md` に定める
- 文書どうしの参照は `<DocRef kind="ADR" number="0013" />` と書く。`src/lib/docs.ts` の `docRefHref` が番号から URL を引くため、参照先を改名してもリンクは壊れない
- 外部の URL とサイト内のパスへのリンクは `DocLink` を使う。サイト内のパスは `next/link` になり `basePath` が付く

ファイル名から URL が決まるため、文書を改名すると URL も変わる。

文書を足す、改名する、消したときは索引を作り直す。

```sh
node scripts/build-content-index.mjs
```

日本語の検査（textlint）は Markdown にしか当たらないため、文章を書くときは一時ファイルの Markdown で下書きして japanese-review を通し、本文をコンポーネントに移し替える。下書きはリポジトリに残さない。

### テーマ

暗い配色の未来的なテーマで、明暗の切り替えは持たない。配色、タイポグラフィ、各コンポーネントをいつ使うかは `DESIGN.md` に書いてある。値を変えるときは `DESIGN.md` と `src/app/globals.css` の両方を直す。

- 配色、フォント、影は `@theme` のトークンで定義し、`bg-base-700` や `text-neon` のようなクラスから参照する
- 共通クラス（`.panel`、`.doc-card`、`.badge`、`.nav-link`、`.doc-body`、`.doc-list` など）は `@layer components` に置く
- 検索欄は押せないボタンである

## 公開

`main` への push で `.github/workflows/docs-hub-deploy.yml` が走り、`out/` を GitHub Pages に配信する。
公開先は https://mikinovation.github.io/mikinovation/ 。
手動で流す場合は Actions から `docs-hub Deploy` を実行する。

## 未対応

- 全文検索（PRD 0010 の機能要求2）
- ポートフォリオの内容。PRD 0010 はドキュメントのみを対象としており、ポートフォリオを載せる範囲は未反映
- テストケース（`src/content/test/`）と計画（`src/content/plan/`）の表示。この2種類は `.md` のまま運用するため、一覧に出ない
- PRD 0010 と ADR 0017・0018 は、正本をリポジトリルートの `docs/` の Markdown とし、サイトの生成に VitePress を使うと決めている。現状の構成はどちらとも違うため、置き換えが必要
