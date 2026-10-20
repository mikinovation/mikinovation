---
version: alpha
name: Docs Hub Dark
description: ドキュメントハブの、暗い配色を固定したテーマ。文書の長文を読む用途に合わせる。
---

# Docs Hub のデザイン

このファイルは docs-hub の見た目の正本である。値を変えるときは、このファイルと `src/app/globals.css` の両方を直す。各トークンとコンポーネントには、いつ使うかを必ず書く。使う場面が書かれていない値は、使ってよい値ではない。

節の構成と YAML のトークンは [DESIGN.md Format](https://github.com/google-labs-code/design.md)（alpha）に合わせている。見出しは仕様の名前のまま英語で置き、説明は日本語で書く。トークン名は `globals.css` の CSS 変数名と同じにしており、仕様が求める `primary` という名前は使っていない。アクセントの役割を担うのは `neon` である。

## Overview

ADR、PRD、設計書、テストケース、計画を読むための場所である。読者は所有者と、URL を共有された協力者で、長い日本語の本文を続けて読む。

暗い配色に固定し、明暗の切り替えは持たない。暗さの中で、読む対象（本文）と、探す対象（一覧、メタ情報、メニュー）を見分けられることを最優先にする。光彩と格子で未来的な印象を作るが、効果は背景、枠線、操作できる要素に限る。本文の上には重ねない。

迷ったときは、装飾を足さずに余白と枠線で区切る。

## Colors

4段の暗い面色、2段の枠線色、3段の文字色、2色のアクセント、3色の状態色で構成する。面色は上に重なるほど明るくする。

| トークン | いつ使うか |
|---|---|
| base-900 | ページの地色。これより暗い面は作らない |
| base-800 | ヘッダーの地色、コードブロックの地色 |
| base-700 | 面（`.panel`）とカード（`.doc-card`）の地色 |
| base-600 | バッジの地色、サイドバー項目の hover、`.kbd` |
| line | 通常の枠線と、表の行の区切り |
| line-bright | 強い枠線。表の見出しの下、バッジの枠、スクロールバー |
| ink | 見出しと、読者が追う主要な文字 |
| ink-dim | 本文、表のセル、サイドバーの項目 |
| ink-faint | ラベル、件数、引用、補助的な文字 |
| neon | アクセント。現在地、hover、見出しの罫、光彩 |
| neon-soft | リンクの文字色と、アクセント色の文字 |
| flux | 第2のアクセント。グラデーションの終端にだけ使う |
| mint | 状態が良いことを示す。ADR の採用 |
| rose | 状態が否であることを示す。ADR の却下 |
| amber | 注意を促す状態。ADR の置き換え |

```yaml
colors:
  base-900: '#04050a'
  base-800: '#080b14'
  base-700: '#0d111d'
  base-600: '#141a2a'
  line: '#1c2335'
  line-bright: '#2a3449'
  ink: '#e8ecfa'
  ink-dim: '#a4aec9'
  ink-faint: '#6d7690'
  neon: '#3ae3ff'
  neon-soft: '#7df0ff'
  flux: '#9d7bff'
  mint: '#4fe0b0'
  rose: '#ff6f91'
  amber: '#ffc46b'
```

`ink-faint` は本文には使わない。`base-900` の上で WCAG AA（4.5:1）に届かない可能性があり、確認していない。使うのは、読み飛ばしてよい補助的な文字だけとする。

アクセントは面を塗る色ではなく、線と文字に載せる色である。`neon` で面を広く塗らない。`flux` は単独では使わず、`neon` から始まるグラデーションの終端にだけ置く。

## Typography

本文は游ゴシック系の既定の和文書体に任せ、`font-sans` のスタックで指定する。機械が決めた値（文書の番号、件数、キー、コード）と、分類を示すラベルには `font-mono` を使う。読者が本文と区別して読み飛ばせるようにするためである。

| トークン | いつ使うか |
|---|---|
| hero-display | トップページの表題。640px 以上では 3rem に上げる |
| doc-h1 | 文書の表題。1ページに1つだけ置く |
| doc-h2 | 文書の章。下に `neon` から始まる罫を敷く |
| doc-h3 | 文書の節 |
| body-md | 本文。行の高さ 1.8 を崩さない |
| body-sm | 表のセル、サイドバーの項目、ヘッダーのブランド |
| label-caps | 分類と見出しの上のラベル。英数字のみで使う |
| badge-mono | バッジの文字。ADR の状態と PRD の段階 |
| table-head | 表の見出し。大文字で字間を広げる |
| code-sm | インラインコードとコードブロック |

```yaml
typography:
  hero-display:
    fontFamily: ui-sans-serif, system-ui, -apple-system, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif
    fontSize: 2.25rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.025em
  doc-h1:
    fontFamily: ui-sans-serif, system-ui, -apple-system, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.01em
  doc-h2:
    fontFamily: ui-sans-serif, system-ui, -apple-system, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif
    fontSize: 1.375rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.01em
  doc-h3:
    fontFamily: ui-sans-serif, system-ui, -apple-system, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: ui-sans-serif, system-ui, -apple-system, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.8
  body-sm:
    fontFamily: ui-sans-serif, system-ui, -apple-system, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.7
  label-caps:
    fontFamily: ui-monospace, 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace
    fontSize: 0.6875rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0.22em
  badge-mono:
    fontFamily: ui-monospace, 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace
    fontSize: 0.6875rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0.08em
  table-head:
    fontFamily: ui-monospace, 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: 0.12em
  code-sm:
    fontFamily: ui-monospace, 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.7
```

`label-caps` と `table-head` は大文字にして使う。日本語を入れると字間が開いて読みにくくなるため、英数字だけを入れる。

## Layout

ヘッダーを上に固定し、その下を左のサイドバーと本文の2列に分ける。幅 1024px 未満ではサイドバーを隠し、本文だけを1列で出す。検索欄は 768px 未満で隠す。

本文の列は `content-max` で止める。1行が長くなると日本語の長文を読み返しにくくなるためである。

| トークン | いつ使うか |
|---|---|
| page-x | ヘッダー、本文、フッターの左右の余白。全列で同じ値にする |
| header-h | 固定ヘッダーの高さ |
| content-max | ヘッダーと本文の列の最大幅 |
| sidebar-w | 左のサイドバーの幅 |
| column-gap | サイドバーと本文の間 |
| section-gap | ページ内の節の間。節の切れ目は余白だけで示す |
| card-y / card-x | カードの内側の余白 |
| panel-y / panel-x | 面の内側の余白。640px 以上では 2.5rem / 2.25rem |
| backdrop-grid | 背景の格子の間隔 |
| scroll-offset | ページ内リンクで飛んだときに、固定ヘッダーの下に見出しを出す量 |

```yaml
spacing:
  page-x: 1.25rem
  header-h: 4rem
  content-max: 80rem
  sidebar-w: 16rem
  column-gap: 2.5rem
  section-gap: 4rem
  card-y: 1.25rem
  card-x: 1.375rem
  panel-y: 2rem
  panel-x: 1.5rem
  backdrop-grid: 72px
  scroll-offset: 6rem
```

## Elevation & Depth

影で高さを作らない。重なりは、面色の段差と 1px の枠線で示す。暗い地色の上では影がほとんど見えないためである。

影を使うのは次の2つの場合だけである。

- 面を地色から浮かせるとき。`shadow-panel` を使う。黒を下に長く落とし、輪郭は枠線に任せる
- 操作できる要素に反応を返すとき。`shadow-glow` を使う。`neon` を広げて、押せることを示す

`shadow-glow` は hover と focus のときだけ出す。静止している要素に光彩を置くと、どこを操作できるのか分からなくなる。

光彩のもう一つの使い方は背景である。`.app-backdrop` が放射のグラデーション3つと 72px の格子を敷き、上から下へ消えていく。これは奥行きを作るためのもので、前面の要素には足さない。

影はトークンの対象外なので、値は `globals.css` の `--shadow-glow` と `--shadow-panel` に置く。

## Shapes

角丸は、要素が大きいほど大きくする。バッジと細い指示線だけを完全な丸にする。

| トークン | いつ使うか |
|---|---|
| xs | `.kbd` のキー |
| sm | インラインコード |
| md | サイドバーの項目、ヘッダーのブランドの印 |
| lg | 検索欄 |
| xl | コードブロック |
| 2xl | 面（`.panel`）とカード（`.doc-card`） |
| full | バッジ、現在地を示す縦線、スクロールバー |

```yaml
rounded:
  xs: 0.3125rem
  sm: 0.375rem
  md: 0.5rem
  lg: 0.625rem
  xl: 0.75rem
  2xl: 0.875rem
  full: 999px
```

枠線は常に 1px とする。太い枠線は使わず、強調するときは `line` を `line-bright` に上げるか、`neon` を混ぜる。幅 2px の線を使うのは、現在地とカードの hover を示す縦線だけである。

## Components

各コンポーネントは、いつ使うかと、状態ごとの変種を持つ。`borderColor` は仕様の標準の属性ではないが、この配色では枠線が面の境界を担うため使う。

| コンポーネント | いつ使うか |
|---|---|
| app-backdrop | 全ページの背景。1ページに1つだけ置く |
| header | 全ページの上端。ブランド、検索欄、外部リンクを並べる |
| panel | 読み物を1つ載せるとき。文書の本文を入れる |
| doc-card | 文書を一覧で並べ、1件を開かせるとき |
| badge | ADR の状態や PRD の段階を、1語で示すとき |
| nav-link | サイドバーと本文の下で、別の文書を選ばせるとき |
| search-field | 検索を始めさせるとき。今は押せないボタンとして置く |
| kbd | キーボードの操作を示すとき |
| label | 節やカードの内容の分類を、本文より小さく示すとき |
| hairline | 節の終わりを、見出しを使わずに区切るとき |
| code-chip | 本文の外でファイル名や識別子を示すとき |
| doc-body | MDX から変換した本文を囲むとき |
| mermaid-figure | 本文の Mermaid の図を囲むとき |

```yaml
components:
  app-backdrop:
    backgroundColor: '{colors.base-900}'
  header:
    backgroundColor: '{colors.base-900}'
    borderColor: '{colors.line}'
    height: '{spacing.header-h}'
  panel:
    backgroundColor: '{colors.base-700}'
    borderColor: '{colors.line}'
    textColor: '{colors.ink-dim}'
    rounded: '{rounded.2xl}'
    padding: '{spacing.panel-x}'
  doc-card:
    backgroundColor: '{colors.base-700}'
    borderColor: '{colors.line}'
    textColor: '{colors.ink}'
    rounded: '{rounded.2xl}'
    padding: '{spacing.card-x}'
  doc-card-hover:
    borderColor: '{colors.neon}'
  badge:
    backgroundColor: '{colors.base-600}'
    borderColor: '{colors.line-bright}'
    textColor: '{colors.ink-dim}'
    typography: '{typography.badge-mono}'
    rounded: '{rounded.full}'
  badge-accepted:
    borderColor: '{colors.mint}'
    textColor: '{colors.mint}'
  badge-rejected:
    borderColor: '{colors.rose}'
    textColor: '{colors.rose}'
  badge-superseded:
    borderColor: '{colors.amber}'
    textColor: '{colors.amber}'
  badge-stage:
    borderColor: '{colors.neon}'
    textColor: '{colors.neon-soft}'
  nav-link:
    textColor: '{colors.ink-dim}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.md}'
  nav-link-hover:
    backgroundColor: '{colors.base-600}'
    textColor: '{colors.ink}'
  nav-link-current:
    backgroundColor: '{colors.neon}'
    textColor: '{colors.ink}'
  search-field:
    backgroundColor: '{colors.base-800}'
    borderColor: '{colors.line}'
    textColor: '{colors.ink-faint}'
    rounded: '{rounded.lg}'
  search-field-hover:
    borderColor: '{colors.neon}'
  kbd:
    backgroundColor: '{colors.base-600}'
    borderColor: '{colors.line-bright}'
    textColor: '{colors.ink-faint}'
    rounded: '{rounded.xs}'
  label:
    textColor: '{colors.ink-faint}'
    typography: '{typography.label-caps}'
  hairline:
    backgroundColor: '{colors.line-bright}'
    height: 1px
  code-chip:
    backgroundColor: '{colors.base-800}'
    borderColor: '{colors.line}'
    textColor: '{colors.neon-soft}'
    typography: '{typography.code-sm}'
    rounded: '{rounded.sm}'
  doc-body:
    textColor: '{colors.ink-dim}'
    typography: '{typography.body-md}'
  mermaid-figure:
    backgroundColor: '{colors.base-800}'
    borderColor: '{colors.line}'
    rounded: '{rounded.xl}'
```

`doc-card-hover`、`nav-link-hover`、`nav-link-current`、`search-field-hover` の `neon` は、そのままの濃さでは使わない。枠線では `line` に、面では地色に混ぜて薄く載せる。混ぜる割合は `globals.css` の `color-mix()` に書く。

`doc-body` の中では、要素ごとに次のように決める。

| 要素 | いつどう見せるか |
|---|---|
| 見出し | `doc-h1` から `doc-h3` を使う。h2 の下にだけ罫を敷く |
| リンク | `neon-soft` に下線を引く。hover で白くし、光彩を足す |
| 引用 | `neon` の縦線を左に置き、文字は `ink-faint` に落とす |
| インラインコード | `code-chip` と同じ見せ方にする |
| コードブロック | `base-800` の面に `xl` の角丸を付け、横に溢れさせる |
| 表 | 見出しは `table-head`、行の区切りは `line`。hover で行に `neon` を薄く敷く |
| 箇条書き | 行頭の記号を `neon` に寄せる |
| 図 | Mermaid の記述を `base-800` の面に描く。描き終わるまでは記述をそのまま見せる |

本文に光彩と格子を重ねない。本文で使う強調は、文字色を `ink` に上げることと、`neon` の下線と縦線だけである。

## Do's and Don'ts

- 読む対象には色を足さず、探す対象（分類、状態、現在地）にだけ色を使う
- 本文の文字は `ink` と `ink-dim` に限り、`ink-faint` は補助的な文字にだけ使う
- 光彩は hover と focus、そして背景にだけ出す。静止した前面の要素には出さない
- `neon` で面を広く塗らない。線と文字、または地色に混ぜて薄く敷く形で使う
- 枠線は 1px に揃える。強調は色を上げて行い、太さを変えない
- `flux` を単独で使わず、`neon` から始まるグラデーションの終端に置く
- `label-caps` と `table-head` には日本語を入れない
- 状態色（mint、rose、amber）を装飾に使わない。状態を示すときだけ使う
- 明暗を切り替える仕組みを足さない。配色は暗い方だけを保守する
- 影で高さを作らない。重なりは面色の段差と枠線で示す
