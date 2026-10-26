# Docs Hub

ポートフォリオと、PRD、ADR、設計書を一つにまとめて公開するサイト。
文書の正本は `src/content/` の MDX で、一覧と本文を表示する。

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

文書は `src/content/prd/`、`src/content/adr/`、`src/content/design/` に `<4桁の番号>_<タイトル>.mdx` の名前で置く。
作成と更新は create-prd、create-adr、create-design-doc などのスキルが担い、保存先はスキル側にも書いてある。

- 一覧とメタ情報は `src/lib/docs.ts` が `src/content/` を読んで組み立てる。各文書の冒頭の H1 をタイトル、続く箇条書きを `- キー: 値` の組として読み、`状態` と `段階` からバッジを決める
- 本文は `src/app/[kind]/[slug]/page.tsx` が `@/content/<種類>/<ファイル名>.mdx` を動的に読み込み、MDX として描画する。URL は `/<種類>/<ファイル名>` で、`generateStaticParams` が全件を静的に書き出す
- MDX の拡張は `next.config.ts` で設定する。表には remark-gfm、見出しの `id` には rehype-slug を使う。Turbopack には関数を渡せないため、プラグインは名前の文字列で指定する
- 図は `src/components/figure.tsx` のコンポーネントで HTML と SVG として書く。`src/mdx-components.tsx` に登録してあるため、MDX 側で import は要らない。書き方は `FIGURES.md` に定める
- 文書どうしの参照は `/<種類>/<ファイル名>` へのリンクで書く。`src/mdx-components.tsx` が `a` を `next/link` に差し替え、`basePath` を付ける
- 本文中の「PRD 0007」「ADR 0013」のような文書参照は、`src/lib/remark-doc-links.mjs` が該当する文書へのリンクに変える。存在しない番号は文字のままにする

ファイル名から URL が決まるため、文書を改名すると URL も変わる。

### テーマ

暗い配色の未来的なテーマで、明暗の切り替えは持たない。配色、タイポグラフィ、各コンポーネントをいつ使うかは `DESIGN.md` に書いてある。値を変えるときは `DESIGN.md` と `src/app/globals.css` の両方を直す。

- 配色、フォント、影は `@theme` のトークンで定義し、`bg-base-700` や `text-neon` のようなクラスから参照する
- 共通クラス（`.panel`、`.doc-card`、`.badge`、`.nav-link`、`.doc-body` など）は `@layer components` に置く
- 検索欄は押せないボタンである

## 公開

`main` への push で `.github/workflows/docs-hub-deploy.yml` が走り、`out/` を GitHub Pages に配信する。
公開先は https://mikinovation.github.io/mikinovation/ 。
手動で流す場合は Actions から `docs-hub Deploy` を実行する。

## 未対応

- lint とフォーマットの設定
- 全文検索（PRD 0010 の機能要求2）と、文書参照のリンク化（機能要求3）
- ポートフォリオの内容。PRD 0010 はドキュメントのみを対象としており、ポートフォリオを載せる範囲は未反映
- テストケース（`src/content/test/`）と計画（`src/content/plan/`）の表示。この2種類は `.md` のまま運用するため、一覧に出ない
- PRD 0010 と ADR 0017・0018 は、正本をリポジトリルートの `docs/` の Markdown とし、サイトの生成に VitePress を使うと決めている。現状の構成はどちらとも違うため、置き換えが必要
