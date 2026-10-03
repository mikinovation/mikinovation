# ADR: kintai をライブラリと CLI の2つのクレートに分け、リポジトリのルートに workspace を置く

`kintai` を、勤怠の業務と freee 連携をまとめたライブラリのクレートと、CLI のクレートに分け、リポジトリのルートに cargo の workspace を置くという決定を記録する。

- 読者: 技術責任者、開発者、将来の保守者
- 状態: 採用
- 決定日: 2026-10-03

`kintai` は、ADR 0007 で Rust で書くと決めた CLI を指す。
freee 連携は、設計書「勤怠表と請求書の作成」のコンポーネントを指す。

## 背景

ADR 0012 で、freee 連携などの部品を、今後の機能と Web API で共有すると決めた。
ADR 0007 では、`packages/kintai` に1つのクレートとして置くと決めた。
このままでは、Web API から部品を使うときに、clap などの CLI の依存も一緒に引き込む。

## 制約

ADR 0007 と ADR 0012 から、選べる案は次の条件を満たす必要がある。

- Web API が、CLI の依存を引き込まずに部品を使える。
- Home Manager で、`kintai` のバイナリを導入できる。

## 決定

リポジトリのルートに、cargo の workspace を置く。
勤怠の業務と freee 連携をまとめたライブラリのクレートを、`packages/kintai` に置く。
CLI のクレートを `apps/kintai-cli` に置き、バイナリの名前は `kintai` とする。
今後の Web API は、`apps/` の下に加える。

ADR 0007 の決定のうち、クレートの置き場だけを、この ADR で置き換える。

## 決定理由

- Web API は、ライブラリのクレートだけに依存すればよい。
- ライブラリを `packages/` に、アプリケーションを `apps/` に置くと、既存の `apps/web` と `packages/dotfiles` の並びにそろう。
- クレートが2つなので、分ける手間と、依存の管理が小さく済む。

## 代替案

次の案は、それぞれの理由で採らない。

- 勤怠の業務、freee 連携、CLI の3つに分ける案: ほかの機能が freee 連携だけを使いたくなった時点で分ければ足りる。
- 1つのクレートにライブラリとバイナリを置く案: Web API が、CLI の依存まで引き込む。
- `packages/kintai` の中に workspace を置く案: ほかの機能や Web API が、`kintai` の中を参照する形になる。

## 結果

- ほかの機能が freee 連携だけを使いたくなったら、freee 連携を別のクレートに分け直す。
- nix の `buildRustPackage` では、workspace の中の CLI のクレートを指定してビルドする。
- リポジトリのルートに、`Cargo.toml` と `Cargo.lock` が置かれる。

## 出典

- docs/adr/0007_use-rust-and-typst-for-kintai-cli.md
- docs/adr/0012_use-tokio-and-reqwest-for-kintai.md
- 所有者へのヒアリング（2026-10-03）
