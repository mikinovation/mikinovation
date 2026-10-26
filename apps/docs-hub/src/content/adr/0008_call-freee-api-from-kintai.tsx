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
  title: 'freee の請求書の下書きは kintai が freee の API を呼んで作る',
  lead: 'freee の請求書の下書きを、CLI kintai が freee の API を直接呼んで作るという決定を記録する。',
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
        案件、下書き、skill の意味は <DocRef kind="PRD" number="0007" />{' '}
        による。
        <Code>kintai</Code> は、
        <DocRef kind="ADR" number="0007" /> で Rust で書くと決めた CLI を指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="PRD" number="0007" /> は、対象月の精算額にもとづいて
          freee
          に請求書の下書きを作ること（要求11）と、同じ月の下書きを二重に作らないこと（要求14）を求める。
          <DocRef kind="PRD" number="0007" /> の解決案では、計算は CLI
          が行い、skill が窓口になる案を採った。 ただし、freee の API を CLI と
          skill のどちらから呼ぶかは決めていない。
          そのため、下書きを作る担い手を決める必要がある。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0007" />、
          <DocRef kind="ADR" number="0001" />、
          <DocRef kind="ADR" number="0004" />{' '}
          から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>下書きの金額が、CLI の計算結果と必ず一致する。</Item>
          <Item>下書きを作るだけで、請求書を先方へ送付しない。</Item>
          <Item>
            対象月の下書きがすでにあれば、新しい下書きを作らずに止まる。
          </Item>
          <Item>freee の API の認証の準備は、所有者が引き受ける。</Item>
          <Item>
            導入範囲「すべて」で、所有者のマシンに Home Manager で導入できる。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          <Code>kintai</Code> が freee の API を呼び、請求書の下書きを作る。
          対象月の下書きがすでにあるかの確認も、<Code>kintai</Code> が行う。
          skill は <Code>kintai</Code>{' '}
          を呼び、その結果を所有者に報告するだけにする。
        </Prose>
        <Figure caption="skill は窓口に徹し、API の呼び出しと重複の確認はどちらも kintai が行う。">
          <FigSvg
            height={220}
            label="skill が kintai を呼び、kintai が freee の API を呼んで下書きを作る流れ"
          >
            <FigNode
              x={0}
              y={50}
              w={180}
              h={70}
              title="skill"
              lines={['kintai を呼び', '結果を報告する']}
            />
            <FigArrow
              points={[
                [180, 85],
                [246, 85],
              ]}
            />
            <FigNode
              x={250}
              y={50}
              w={200}
              h={70}
              tone="neon"
              title="kintai"
              lines={['下書きの作成', '重複の確認']}
            />
            <FigArrow
              points={[
                [450, 85],
                [516, 85],
              ]}
              tone="neon"
            />
            <FigNode
              x={520}
              y={50}
              w={240}
              h={70}
              title="freee の API"
              lines={['送付待ちの請求書を作る']}
            />
            <FigArrow
              points={[
                [350, 120],
                [350, 146],
              ]}
            />
            <FigNode
              x={250}
              y={150}
              w={200}
              h={60}
              tone="rose"
              lines={['同じ月の下書きがあれば', '知らせて止まる']}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            金額が Claude を通らないため、下書きの金額は CLI
            の計算結果と必ず一致する。
          </Item>
          <Item>
            二重作成の確認が毎回同じ結果になり、ユニットテストで守れる。
          </Item>
          <Item>
            Claude がなくても動き、
            <DocRef kind="ADR" number="0007" />{' '}
            で選んだ単一のバイナリのままで済む。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: 'skill が freee の MCP サーバーを使って下書きを作る案',
              reason:
                '下書きの金額を Claude が書き写すため、誤りの余地が残る。二重作成の確認も、Claude の判断で行うことになる。',
            },
            {
              option: '下書きの作成だけを別のスクリプトで行う案',
              reason: '実行環境がもう1つ要り、単一のバイナリでなくなる。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            OAuth のトークンの更新と、freee の API との通信を Rust
            で実装し、保守する。
          </Item>
          <Item>HTTP クライアントのクレートへの依存が増える。</Item>
          <Item>
            freee の API が変わったら、<Code>kintai</Code> を追従させる。
          </Item>
          <Item>テストでは、freee の API を差し替えて振る舞いを確かめる。</Item>
          <Item>freee の認証情報の保管先は、別の ADR で決める。</Item>
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
            { text: '所有者へのヒアリング（2026-10-03）' },
          ]}
        />
      </DocSection>
    </>
  )
}
