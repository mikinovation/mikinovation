# 本文と図解の規約

`src/content/` の TSX で本文と図を書くときの決まりを定める。PRD、ADR、設計書は原則として図を入れる。

## 本文

本文は Markdown ではなく、`src/components/doc.tsx` のコンポーネントで組む。各文書は `meta` と本文の関数を export する。

```tsx
import { Bullets, DocSection, Item, Prose } from '@/components/doc'

export const meta = {
  title: '端末多重化ツールに herdr を使う',
  lead: 'この決定を記録する。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
  ],
}

export default function Body() {
  return (
    <>
      <DocSection label="Context" title="背景">
        <Prose>現状はこうなっている。</Prose>
        <Bullets>
          <Item label="手数">毎回最後まで打つ必要がある。</Item>
          <Item>履歴をさかのぼる操作が多い。</Item>
        </Bullets>
      </DocSection>
    </>
  )
}
```

| 名前 | 用途 |
|---|---|
| `DocSection` | `##` の節。`label` に英語の短い語、`title` に見出しを渡す |
| `DocSub` / `DocPart` | `###` と `####` の節 |
| `Prose` | 段落 |
| `Bullets` / `Steps` / `Item` | 箇条書きと手順。項目に見出しが付く場合は `Item` の `label` に渡す |
| `Terms` | 用語の定義。`term` と `description` の組を並べる |
| `DocTable` | 表。`head` と `rows` を渡す |
| `Requirements` | 要求と受入条件。番号を付けて縦に並べる |
| `TradeOffs` | 解決案の比較。案ごとに利点と欠点を並べる |
| `Alternatives` | 採らなかった案。案と理由の組を並べる |
| `Sources` | 出典。`href` があればリンクになる |
| `Code` / `Pre` | 文中のコードとコードブロック |
| `DocLink` | 外部の URL とサイト内のパスへのリンク |
| `DocRef` | ほかの文書への参照。`kind` と `number` を渡す |

- 節の `label` は背景 Context、制約 Constraints、決定 Decision、決定理由 Rationale、代替案 Alternatives、結果 Consequences、出典 Sources、課題 Problem、解決策 Solution のように決まっている。
- 箇条書きは1項目を1行に収める必要はないが、項目が5件を超えるなら表か `FigGrid` を検討する。
- 文章の中で `「PRD 0007」` のように書かず、`<DocRef kind="PRD" number="0007" />` を使う。

## 形式

図は HTML と SVG で書く。Mermaid は使わない。
配色とダークモードを本文と揃えられ、レイアウトを自分で決められ、描画をクライアント側で待たないためである。

- 箱の並び、分類、一覧、札、端末の見た目は HTML で書く。日本語が自動で折り返る。
- 流れ、分岐、状態遷移、数直線、画面のモックは SVG で書く。線と矢印を引けるためである。

書くときは `src/components/figure.tsx` のコンポーネントを使い、文書の冒頭で import する。

## 何を図にするか

1枚で1つのことだけを示し、本文と同じ内容を繰り返さない。文章や表で足りる場合は図を入れない。
PRD では次が図にする価値のある対象になる。

- 課題の構造と、現状の流れのどこで問題が起きるか
- 解決案の違い（どの問題まで解くか）
- 要求の全体像（ねらいごとの分類、導入範囲や環境による差）
- 利用者から見た処理の流れ、状態の遷移、止まる条件
- 金額や時間の境界（精算幅のような範囲）

ADR は「決定」の節に1枚入れ、決定した仕組みの構成や流れを示す。次が対象になる。

- 決定した構成要素と、その間の依存や呼び出しの向き
- 何をどこに置くか（配置先、保管場所、クレートやファイルの分割）
- 導入範囲や環境によって変わる部分
- 役割の分担（既製のものに任せる範囲と、自前で持つ範囲）

代替案の比較は表で足りるため、図にしない。

設計書は層ごとに図を入れる。次が対象になる。

- 層1: 全体の構成。登場するコンポーネント、データの置き場、外部のサービスの関係
- 層2: データの流れ。関係者とコンポーネントの間で、何がどの順にやり取りされるか
- 層3: 状態の遷移や、モジュールの分割と依存の向き

## 書き方

図は `Figure` で包み、`caption` に図から読み取ってほしいことを1文で書く。説明文は図の下に表示される。

```jsx
<Figure caption="検出で止まる場合、勤怠表も下書きも作られない。">
  <FigSvg height={250} label="打刻から勤怠表 PDF と下書きに至る流れ">
    <FigNode
      x={0}
      y={34}
      w={150}
      h={76}
      title="日々の打刻"
      lines={['日ごとの見出しに残す']}
    />
    <FigArrow points={[[150, 72], [182, 72]]} />
    <FigNode x={186} y={34} w={160} h={76} tone="amber" title="提出前の検出" />
  </FigSvg>
</Figure>
```

```jsx
<Figure caption="導入範囲によって満たす要求が分かれる。">
  <FigGrid wide>
    <FigCard tone="mint" title="「最小限」でも満たす" note="壊れたマシンで使う">
      <FigChips tone="mint" items={['1 既定のエディター', '2 初回起動']} />
    </FigCard>
  </FigGrid>
</Figure>
```

## コンポーネント

| 名前 | 用途 | 主なプロパティ |
|---|---|---|
| `Figure` | 図全体の枠と説明文 | `caption` |
| `FigSvg` | SVG の本体。幅は760で固定し、高さだけ決める | `height`、`label`、`width` |
| `FigNode` | SVG の箱と、その中の文字 | `x`、`y`、`w`、`h`、`tone`、`title`、`lines`、`tag`、`align`、`valign`、`padX`、`rx` |
| `FigArrow` | SVG の線と矢印 | `points`、`tone`、`head` |
| `FigLabel` | SVG の小さなラベル（10px） | `x`、`y`、`align` |
| `FigNote` | SVG の補足の文字（11px） | `x`、`y`、`align` |
| `FigGrid` | HTML のカードを並べる格子 | `wide` |
| `FigCard` | HTML のカード | `tone`、`title`、`note` |
| `FigChips` / `FigChip` | 札の並びと、個々の札 | `tone`、`items` |
| `FigLegend` | 凡例 | `items` |
| `FigTerm` / `FigTermRow` | 端末の見た目 | なし |
| `FigInk` | HTML の文字に色を付ける | `tone` |
| `FigList` | カードの中の箇条書き | `items` |

- `tone` は `neon`、`mint`、`amber`、`rose`、`flux`、`ghost` から選ぶ。`FigLegend` と `FigInk` では `ghost` の代わりに `dim` を使う。
- `FigNode` の `title` は13px、`lines` は11px で表示され、箱の中で縦に中央揃えになる。箱の中に別の箱を置く場合は `valign="top"` で上に寄せる。
- `FigArrow` の `points` は折れ線の頂点を順に並べる。矢印の先端は最後の線分の向きから決まるため、`marker` を書かない。線だけ引くときは `head={false}` にする。
- 円や目盛りのような1枚かぎりの部品は、`fig-` のクラスを付けた `circle` や `path` をそのまま書く。

## 書くときの注意

- `class` ではなく `className` を使い、`stroke-width` ではなく `strokeWidth` のようにキャメルケースで書く。
- JSX の中ではマークダウン記法が効かない。バッククォートや `**` はそのまま文字として出る。文中のコードは `Code` で囲む。
- JSX のテキストでは `<`、`>`、`{`、`}` をそのまま書けない。`{'<'}` のように書く。
- 座標は幅760の `viewBox` の中で決める。表示時は画面幅に合わせて縮む。
- 日本語は折り返らない。13px で1文字あたり13px、11px で11px を目安に幅を見積もり、箱からはみ出す長さにしない。

## 色の意味

同じ図の中で色の意味を混ぜない。

| 色 | 意味 |
|---|---|
| neon | 中心になるもの、採用した案 |
| mint | 得られる結果、満たせる状態 |
| amber | 条件つき、待ち、注意して見る箇所 |
| rose | 問題、止まる、拒む |
| flux | 上の4色で足りないときの補助 |
| ghost（破線） | 対象外、枠、自動では起きないこと |

## クラス

コンポーネントが出力するクラスは `src/app/globals.css` にある。
本文は `doc-h2`、`doc-list`、`doc-steps`、`doc-item-label`、`doc-terms`、`doc-reqs`、`doc-trade`、`doc-alt`、`doc-sources` を使う。
図は `doc-figure`、`fig-svg`、`fig-box`、`fig-edge`、`fig-head`、`fig-title`、`fig-sub`、`fig-tag`、`fig-axis`、`fig-grid`、`fig-card`、`fig-chip`、`fig-term`、`fig-legend` と、色の `fig-neon` から `fig-dim` までが並ぶ。
足りない部品が出たら、個別の `style` を書かずに、クラスとコンポーネントを足す。
