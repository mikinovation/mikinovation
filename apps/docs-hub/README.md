# Docs Hub

ポートフォリオと `docs/` の文書を一つにまとめて公開するサイト。
現時点では Next.js の初期設定だけを入れた状態で、文書の表示機能はまだない。

## 開発

```sh
pnpm install
pnpm dev           # http://localhost:3000
pnpm build         # 静的書き出し（out/）
pnpm typecheck
```

## 構成

- パッケージマネージャーは pnpm（`packageManager` フィールドで版を固定）
- Next.js 16（App Router）、React 19、TypeScript
- `output: 'export'` で静的ファイルに書き出す
- スタイルは `src/app/globals.css` のみ

## 未対応

- lint とフォーマットの設定
- `docs/` の Markdown の表示、サイドバー、一覧、文書参照のリンク化、全文検索、Mermaid、ダークモードの手動切り替え
- GitHub Pages への公開（`basePath` の設定とワークフロー）
- PRD 0010 はドキュメントのみを対象としており、ポートフォリオを載せる範囲は未反映
- ADR 0017 は VitePress を採用し Next.js を却下しているため、この構成を続けるなら ADR の置き換えが必要
