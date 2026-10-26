import {
  Alternatives,
  Bullets,
  Code,
  DocRef,
  DocSection,
  Item,
  Prose,
  Sources,
} from '@/components/doc'
import { FigArrow, FigNode, FigSvg, Figure } from '@/components/figure'

export const meta = {
  title: '案件の設定は、非公開のリポジトリに案件ごとの TOML ファイルで書く',
  lead: 'kintai が読む案件の設定を、勤怠の記録と同じ非公開のリポジトリに、案件ごとの TOML ファイルとして置くという決定を記録する。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-10-03' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>
        用語は <DocRef kind="PRD" number="0007" /> と同じ意味で使う。
        案件、打刻、日ごとの見出し、精算幅、稼働率、日割り月の意味は{' '}
        <DocRef kind="PRD" number="0007" /> による。
        <Code>kintai</Code> は、
        <DocRef kind="ADR" number="0007" /> で Rust で書くと決めた CLI を指す。
        テンプレートの意味は <DocRef kind="ADR" number="0007" /> による。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="PRD" number="0007" />{' '}
          の要求4は、精算のルールを案件ごとに設定できることを求める。
          設定する項目には、契約期間、月額、精算幅、超過単価、控除単価、丸めの単位と向き、休憩の既定値、締め日、請求の項目がある。
          要求5は、日割り月の稼働率と精算幅を月ごとに上書きできることを求める。
          <DocRef kind="ADR" number="0007" />{' '}
          では、テンプレートを案件の設定で差し替えられるようにすると決めた。
          <DocRef kind="ADR" number="0009" /> では、1Password
          の参照先を設定で指定すると決めた。
          これらを書く形式と置き場は決まっていない。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0007" /> と{' '}
          <DocRef kind="ADR" number="0007" />{' '}
          から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>非公開のリポジトリに置く。</Item>
          <Item>
            月ごとの上書きや請求の項目のような、入れ子と一覧を表せる。
          </Item>
          <Item>
            Org 形式の解析は、CLOCK 行と日ごとの見出しのプロパティに限る。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          案件の設定は、勤怠の記録を書く Org
          形式のファイルと同じ非公開のリポジトリに、案件ごとの TOML
          ファイルとして置く。
          日割り月の上書き、テンプレートの差し替え、1Password
          の参照先も、同じファイルに書く。
          <Code>kintai</Code> は、<Code>serde</Code> と <Code>toml</Code>{' '}
          のクレートで設定を読む。
        </Prose>
        <Figure caption="精算のルールと勤怠の記録を同じ非公開のリポジトリに置き、kintai は読むだけにする。">
          <FigSvg
            height={200}
            label="非公開のリポジトリに案件ごとの TOML と Org の記録を置き、kintai が読む構成"
          >
            <FigNode
              x={0}
              y={20}
              w={420}
              h={170}
              tone="ghost"
              tag="非公開のリポジトリ"
            />
            <FigNode
              x={20}
              y={60}
              w={180}
              h={56}
              tone="neon"
              title="案件ごとの TOML"
              lines={['精算のルール']}
            />
            <FigNode
              x={220}
              y={60}
              w={180}
              h={56}
              title="Org の記録"
              lines={['打刻と備考']}
            />
            <FigNode
              x={20}
              y={126}
              w={380}
              h={50}
              tone="ghost"
              lines={[
                '日割りの上書き、テンプレートの差し替え、',
                '1Password の参照先も同じファイルに書く',
              ]}
            />
            <FigArrow
              points={[
                [420, 105],
                [536, 105],
              ]}
              tone="neon"
            />
            <FigNode
              x={540}
              y={70}
              w={220}
              h={70}
              tone="neon"
              title="kintai"
              lines={['serde と toml で読む']}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            型を決めて読めるため、設定の誤りを読み込みの時点で検出できる。
          </Item>
          <Item>
            コメントを書けるため、先方の指示など、値の根拠を設定の横に残せる。
          </Item>
          <Item>表と配列で、月ごとの上書きや請求の項目を表せる。</Item>
          <Item>
            Org 形式の解析を、
            <DocRef kind="ADR" number="0007" /> で決めた範囲にとどめられる。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: 'Org 形式の案件の見出しのプロパティに書く案',
              reason:
                '入れ子や一覧を表しにくく、Org 形式の解析の範囲が広がる。',
            },
            {
              option: 'YAML で書く案',
              reason:
                '暗黙の型変換によって、金額の設定を誤って読む危険がある。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            設定と打刻の記録が別のファイルに分かれるため、Org
            形式の側から案件の設定を指し示す手段が要る。
          </Item>
          <Item>
            <Code>toml</Code> のクレートへの依存が増える。
          </Item>
          <Item>
            設定の項目を変えるときは、TOML の形式と Rust の型を一緒に保守する。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0007「勤怠表と請求書の作成」',
              href: '/prd/0007_attendance-invoice',
            },
            {
              text: 'ADR 0007「勤怠表の CLI を Rust で書き、Typst を組み込んで PDF を生成する」',
              href: '/adr/0007_use-rust-and-typst-for-kintai-cli',
            },
            {
              text: 'ADR 0009「freee の認証情報は、変わらない値を 1Password に、トークンを状態ファイルに置く」',
              href: '/adr/0009_store-freee-credentials-in-1password-and-state-file',
            },
            { text: '所有者へのヒアリング（2026-10-03）' },
          ]}
        />
      </DocSection>
    </>
  )
}
