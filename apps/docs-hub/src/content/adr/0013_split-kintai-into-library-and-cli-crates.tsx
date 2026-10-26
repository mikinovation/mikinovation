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
import {
  FigArrow,
  FigLabel,
  FigNode,
  FigSvg,
  Figure,
} from '@/components/figure'

export const meta = {
  title:
    'kintai をライブラリと CLI の2つのクレートに分け、リポジトリのルートに workspace を置く',
  lead: 'kintai を、勤怠の業務と freee 連携をまとめたライブラリのクレートと、CLI のクレートに分け、リポジトリのルートに cargo の workspace を置くという決定を記録する。',
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
        <Code>kintai</Code> は、
        <DocRef kind="ADR" number="0007" /> で Rust で書くと決めた CLI を指す。
        freee 連携は、設計書「勤怠表と請求書の作成」のコンポーネントを指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="ADR" number="0012" /> で、freee
          連携などの部品を、今後の機能と Web API で共有すると決めた。
          <DocRef kind="ADR" number="0007" /> では、<Code>packages/kintai</Code>{' '}
          に1つのクレートとして置くと決めた。 このままでは、Web API
          から部品を使うときに、clap などの CLI の依存も一緒に引き込む。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="ADR" number="0007" /> と{' '}
          <DocRef kind="ADR" number="0012" />{' '}
          から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>Web API が、CLI の依存を引き込まずに部品を使える。</Item>
          <Item>
            Home Manager で、<Code>kintai</Code> のバイナリを導入できる。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          リポジトリのルートに、cargo の workspace を置く。 勤怠の業務と freee
          連携をまとめたライブラリのクレートを、<Code>packages/kintai</Code>{' '}
          に置く。 CLI のクレートを <Code>apps/kintai-cli</Code>{' '}
          に置き、バイナリの名前は <Code>kintai</Code> とする。 今後の Web API
          は、<Code>apps/</Code> の下に加える。
        </Prose>
        <Prose>
          <DocRef kind="ADR" number="0007" />{' '}
          の決定のうち、クレートの置き場だけを、この ADR で置き換える。
        </Prose>
        <Figure caption="業務とその入口を別のクレートに分け、今後の入口も同じ並びに加えられるようにする。">
          <FigSvg
            height={190}
            label="リポジトリのルートの workspace に、ライブラリのクレートと CLI のクレートが並ぶ構成"
          >
            <FigNode
              x={0}
              y={10}
              w={760}
              h={170}
              tone="ghost"
              tag="リポジトリのルート（cargo の workspace）"
            />
            <FigNode
              x={40}
              y={60}
              w={320}
              h={86}
              tone="neon"
              title="packages/kintai"
              lines={['ライブラリのクレート', '勤怠の業務と freee 連携']}
            />
            <FigNode
              x={400}
              y={60}
              w={320}
              h={86}
              title="apps/kintai-cli"
              lines={['CLI のクレート', 'バイナリの名前は kintai']}
            />
            <FigArrow
              points={[
                [400, 103],
                [364, 103],
              ]}
            />
            <FigLabel x={380} y={166}>
              今後の Web API も apps/ の下に加える
            </FigLabel>
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>Web API は、ライブラリのクレートだけに依存すればよい。</Item>
          <Item>
            ライブラリを <Code>packages/</Code> に、アプリケーションを{' '}
            <Code>apps/</Code> に置くと、既存の <Code>packages/dotfiles</Code>{' '}
            の並びにそろう。
          </Item>
          <Item>
            クレートが2つなので、分ける手間と、依存の管理が小さく済む。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: '勤怠の業務、freee 連携、CLI の3つに分ける案',
              reason:
                'ほかの機能が freee 連携だけを使いたくなった時点で分ければ足りる。',
            },
            {
              option: '1つのクレートにライブラリとバイナリを置く案',
              reason: 'Web API が、CLI の依存まで引き込む。',
            },
            {
              option: (
                <>
                  <Code>packages/kintai</Code> の中に workspace を置く案
                </>
              ),
              reason: (
                <>
                  ほかの機能や Web API が、<Code>kintai</Code>{' '}
                  の中を参照する形になる。
                </>
              ),
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            ほかの機能が freee 連携だけを使いたくなったら、freee
            連携を別のクレートに分け直す。
          </Item>
          <Item>
            nix の <Code>buildRustPackage</Code> では、workspace の中の CLI
            のクレートを指定してビルドする。
          </Item>
          <Item>
            リポジトリのルートに、<Code>Cargo.toml</Code> と{' '}
            <Code>Cargo.lock</Code> が置かれる。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'ADR 0007「勤怠表の CLI を Rust で書き、Typst を組み込んで PDF を生成する」',
              href: '/adr/0007_use-rust-and-typst-for-kintai-cli',
            },
            {
              text: 'ADR 0012「kintai は非同期で構成し、tokio と reqwest を使う」',
              href: '/adr/0012_use-tokio-and-reqwest-for-kintai',
            },
            { text: '所有者へのヒアリング（2026-10-03）' },
          ]}
        />
      </DocSection>
    </>
  )
}
