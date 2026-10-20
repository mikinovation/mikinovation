# Docs Hub

ポートフォリオと `docs/` の文書を一つにまとめて公開するサイト。
現時点では Next.js の初期設定と Tailwind CSS のテーマだけを入れた状態で、文書の表示機能はまだない。

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

### テーマ

暗い配色の未来的なテーマで、明暗の切り替えは持たない。

- 配色、フォント、影は `@theme` のトークンで定義し、`bg-base-700` や `text-neon` のようなクラスから参照する
- 共通クラスは `@layer components` に置く
  - `.app-backdrop`: 背景の光彩と格子
  - `.panel` / `.panel-glow`: 枠付きの面
  - `.doc-card`: 文書一覧のカード
  - `.badge` と `.badge-accepted` / `.badge-rejected` / `.badge-superseded` / `.badge-stage`: ADR の状態と PRD の段階
  - `.nav-link`: サイドバーの項目（`aria-current="page"` で現在地を示す）
  - `.search-field`、`.kbd`、`.label`、`.hairline`、`.code-chip`
  - `.doc-body`: Markdown の変換結果に当てる本文の体裁。見出し、表、コード、引用を含む
- `src/app/page.tsx` はテーマの見本を兼ねる。文書一覧、本文、配色を並べている
- サイドバーと検索欄は表示だけで、リンクはページ内の見出しを指す

## 公開

`main` への push で `.github/workflows/docs-hub-deploy.yml` が走り、`out/` を GitHub Pages に配信する。
公開先は https://mikinovation.github.io/mikinovation/ 。
手動で流す場合は Actions から `docs-hub Deploy` を実行する。

## 未対応

- lint とフォーマットの設定
- `docs/` の Markdown の表示、サイドバーと一覧の実データ化、文書参照のリンク化、全文検索、Mermaid
- PRD 0010 はドキュメントのみを対象としており、ポートフォリオを載せる範囲は未反映
- ADR 0017 は VitePress を採用し Next.js を却下しており、ADR 0018 はその VitePress の検索を前提に日本語のトークナイザーを決めている。この構成を続けるなら両方の ADR の置き換えが必要
