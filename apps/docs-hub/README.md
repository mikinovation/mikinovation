# Docs Hub

ポートフォリオと `docs/` の文書を一つにまとめて公開するサイト。
現時点では Next.js の初期設定だけを入れた状態で、文書の表示機能はまだない。

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
- スタイルは `src/app/globals.css` のみ

## 公開

`main` への push で `.github/workflows/docs-hub-deploy.yml` が走り、`out/` を GitHub Pages に配信する。
公開先は https://mikinovation.github.io/mikinovation/ 。
手動で流す場合は Actions から `docs-hub Deploy` を実行する。

## 未対応

- lint とフォーマットの設定
- `docs/` の Markdown の表示、サイドバー、一覧、文書参照のリンク化、全文検索、Mermaid、ダークモードの手動切り替え
- PRD 0010 はドキュメントのみを対象としており、ポートフォリオを載せる範囲は未反映
- ADR 0017 は VitePress を採用し Next.js を却下しており、ADR 0018 はその VitePress の検索を前提に日本語のトークナイザーを決めている。この構成を続けるなら両方の ADR の置き換えが必要
