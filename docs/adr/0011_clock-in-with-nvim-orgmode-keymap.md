# ADR: 打刻は Neovim のキー操作で行い、CLOCK 行は nvim-orgmode に書かせる

勤怠の打刻を Neovim のキー操作で行い、CLOCK 行は nvim-orgmode に書かせ、`kintai` は Org 形式のファイルを読むだけにするという決定を記録する。

- 読者: 開発者
- 状態: 採用
- 決定日: 2026-10-03

用語は PRD 0007 と同じ意味で使う。
案件、打刻、日ごとの見出しの意味は PRD 0007 による。
`kintai` は、ADR 0007 で Rust で書くと決めた CLI を指す。

## 背景

PRD 0007 の要求1は、1回の操作で、案件の見出しの下に当日の見出しができ、打刻が始まることを求める。
当日の見出しがすでにあれば、その見出しを使う。
この操作を、Neovim の中で行うか、`kintai` で行うかは決まっていない。

## 制約

ADR 0006、ADR 0007、ADR 0010 から、選べる案は次の条件を満たす必要がある。

- Org 形式の解析は、nvim-orgmode が出力する CLOCK 行の書式に依存する。
- Org 形式のファイルを扱う環境は、nvim-orgmode とする。
- Org 形式の側から、案件の設定を指し示す手段が要る。

## 決定

打刻は Neovim のキー操作で行う。
自作の Lua が、案件の見出しの下に当日の見出しを作り、すでにあればその見出しを使って、nvim-orgmode の clock in を呼ぶ。
打刻の終了には、nvim-orgmode の標準の clock out を使う。

`kintai` は Org 形式のファイルを読むだけにし、書き込まない。

## 決定理由

- CLOCK 行を nvim-orgmode が書くため、ADR 0007 が依存する書式とずれない。
- `kintai` に Org 形式を書く処理が要らず、開いているバッファとの書き込みの衝突も起きない。
- ADR 0006 で選んだ、Neovim の中でノートとタスクを扱う流れのまま打刻できる。

## 代替案

次の案は、それぞれの理由で採らない。

- `kintai` のサブコマンドで打刻する案: Org 形式を書く処理が要り、書式のずれと、開いているバッファとの衝突の危険がある。
- Neovim のキー操作と `kintai` のサブコマンドの両方を用意する案: 同じ操作を2か所で保守することになる。

## 結果

- 打刻は Neovim の中でしかできない。
- 打刻の Lua を、Neovim の設定のほかの Lua と同じくテストで守り、保守する。
- 案件の見出しを Lua と `kintai` の両方が見分けられるように、案件の見出しに、案件の設定を指すプロパティを持たせる。

## 出典

- docs/prd/0007_attendance-invoice.md
- docs/adr/0006_use-orgmode-and-org-roam-for-notes-and-tasks.md
- docs/adr/0007_use-rust-and-typst-for-kintai-cli.md
- docs/adr/0010_write-project-settings-in-toml.md
- 所有者へのヒアリング（2026-10-03）
