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
    'freee の認証情報は、変わらない値を 1Password に、トークンを状態ファイルに置く',
  lead: 'freee の API を呼ぶための認証情報について、クライアント ID とシークレットは 1Password、トークンは所有者のマシンの状態ファイルに置くという決定を記録する。',
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
        <Code>kintai</Code> は、
        <DocRef kind="ADR" number="0007" /> で Rust で書くと決めた CLI を指す。
        「すべて」「最小限」は、
        <DocRef kind="PRD" number="0001" /> が定める導入範囲を指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="ADR" number="0008" /> で、<Code>kintai</Code> が freee
          の API を呼んで請求書の下書きを作ると決めた。 freee の API
          を呼ぶには、OAuth の認証情報が要る。
          認証情報には、変わらない値であるクライアント ID
          とシークレットと、更新のたびに書き換わるアクセストークンとリフレッシュトークンがある。
          <DocRef kind="PRD" number="0007" />{' '}
          では、認証の準備とその情報の管理を所有者が引き受けると決めた。
          そのため、それぞれの認証情報を置く場所を決める必要がある。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0007" /> と{' '}
          <DocRef kind="ADR" number="0008" />{' '}
          から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>認証情報を、このリポジトリに置かない。</Item>
          <Item>
            更新されたトークンを、<Code>kintai</Code> が自分で書き戻せる。
          </Item>
          <Item>導入範囲「すべて」で使える。</Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          クライアント ID とシークレットは 1Password に置き、<Code>kintai</Code>{' '}
          が <Code>op read</Code> で読む。 1Password
          の参照先は、設定で指定する。
        </Prose>
        <Prose>
          アクセストークンとリフレッシュトークンは、権限を 600
          にしたファイルとして <Code>$XDG_STATE_HOME/kintai/</Code>（既定は{' '}
          <Code>~/.local/state/kintai/</Code>）の下に置く。
          <Code>kintai</Code>{' '}
          は、トークンを更新するたびにこのファイルへ書き戻す。
        </Prose>
        <Figure caption="変わらない値と、更新され続ける値を、置き場所で分ける。">
          <FigSvg
            height={220}
            label="クライアント ID とシークレットを 1Password に、トークンを状態ファイルに置く構成"
          >
            <FigNode
              x={0}
              y={20}
              w={220}
              h={80}
              title="1Password"
              lines={['クライアント ID', 'シークレット']}
            />
            <FigNode
              x={0}
              y={130}
              w={220}
              h={80}
              tone="amber"
              title="状態ファイル（600）"
              lines={['アクセストークン', 'リフレッシュトークン']}
            />
            <FigArrow
              points={[
                [220, 60],
                [250, 60],
                [250, 92],
                [276, 92],
              ]}
            />
            <FigLabel x={252} y={48}>
              op read で読む
            </FigLabel>
            <FigArrow
              points={[
                [220, 170],
                [250, 170],
                [250, 118],
                [276, 118],
              ]}
            />
            <FigNode
              x={280}
              y={70}
              w={200}
              h={80}
              tone="neon"
              title="kintai"
              lines={['参照先は設定で指定', '更新のたびに書き戻す']}
            />
            <FigArrow
              points={[
                [330, 150],
                [330, 192],
                [224, 192],
              ]}
              tone="soft"
            />
            <FigLabel x={400} y={192}>
              新しいトークンを書き戻す
            </FigLabel>
            <FigArrow
              points={[
                [480, 110],
                [536, 110],
              ]}
              tone="neon"
            />
            <FigNode
              x={540}
              y={70}
              w={220}
              h={80}
              title="freee の API"
              lines={['トークンで認可する']}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>変わらないシークレットが、平文のファイルで残らない。</Item>
          <Item>
            書き換わるトークンは、1Password にサインインしなくても書き戻せる。
          </Item>
          <Item>トークンのファイルをなくしても、再認証すれば元に戻せる。</Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: 'すべてを 1Password に置く案',
              reason:
                'トークンを更新するたびに、1Password のサインインが要る。',
            },
            {
              option: 'すべてをファイルに置く案',
              reason: 'シークレットが平文で残る。',
            },
            {
              option: 'OS のキーリングに置く案',
              reason: 'WSL や macOS など、マシンによって振る舞いが変わる。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            <Code>kintai</Code> で freee の API を呼ぶには、1Password CLI
            とそのサインインが要る。
          </Item>
          <Item>
            トークンは平文のファイルで残り、その保護はファイルの権限に頼る。
          </Item>
          <Item>
            最初の認証と再認証のための操作を、<Code>kintai</Code> に用意する。
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
              text: 'ADR 0008「freee の請求書の下書きは kintai が freee の API を呼んで作る」',
              href: '/adr/0008_call-freee-api-from-kintai',
            },
            { text: '所有者へのヒアリング（2026-10-03）' },
          ]}
        />
      </DocSection>
    </>
  )
}
