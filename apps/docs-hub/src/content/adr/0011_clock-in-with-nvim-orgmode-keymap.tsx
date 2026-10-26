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
  title: '打刻は Neovim のキー操作で行い、CLOCK 行は nvim-orgmode に書かせる',
  lead: '勤怠の打刻を Neovim のキー操作で行い、CLOCK 行は nvim-orgmode に書かせ、kintai は Org 形式のファイルを読むだけにするという決定を記録する。',
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
        案件、打刻、日ごとの見出しの意味は <DocRef kind="PRD" number="0007" />{' '}
        による。
        <Code>kintai</Code> は、
        <DocRef kind="ADR" number="0007" /> で Rust で書くと決めた CLI を指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="PRD" number="0007" />{' '}
          の要求1は、1回の操作で、案件の見出しの下に当日の見出しができ、打刻が始まることを求める。
          当日の見出しがすでにあれば、その見出しを使う。 この操作を、Neovim
          の中で行うか、<Code>kintai</Code> で行うかは決まっていない。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="ADR" number="0006" />、
          <DocRef kind="ADR" number="0007" />、
          <DocRef kind="ADR" number="0010" />{' '}
          から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>
            Org 形式の解析は、nvim-orgmode が出力する CLOCK 行の書式に依存する。
          </Item>
          <Item>Org 形式のファイルを扱う環境は、nvim-orgmode とする。</Item>
          <Item>Org 形式の側から、案件の設定を指し示す手段が要る。</Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          打刻は Neovim のキー操作で行う。 自作の Lua
          が、案件の見出しの下に当日の見出しを作り、すでにあればその見出しを使って、nvim-orgmode
          の clock in を呼ぶ。 打刻の終了には、nvim-orgmode の標準の clock out
          を使う。
        </Prose>
        <Prose>
          <Code>kintai</Code> は Org
          形式のファイルを読むだけにし、書き込まない。
        </Prose>
        <Figure caption="書き込むのは nvim-orgmode だけで、kintai は読むだけにする。">
          <FigSvg
            height={210}
            label="キー操作から自作の Lua と nvim-orgmode を経て Org のファイルに打刻が書かれ、kintai はそれを読む流れ"
          >
            <FigNode
              x={0}
              y={60}
              w={150}
              h={70}
              title="キー操作"
              lines={['Neovim で打刻する']}
            />
            <FigArrow
              points={[
                [150, 95],
                [186, 95],
              ]}
            />
            <FigNode
              x={190}
              y={60}
              w={180}
              h={70}
              tone="amber"
              title="自作の Lua"
              lines={['当日の見出しを用意']}
            />
            <FigArrow
              points={[
                [370, 95],
                [406, 95],
              ]}
            />
            <FigNode
              x={410}
              y={60}
              w={180}
              h={70}
              tone="neon"
              title="nvim-orgmode"
              lines={['clock in と clock out']}
            />
            <FigArrow
              points={[
                [590, 95],
                [626, 95],
              ]}
              tone="neon"
            />
            <FigNode
              x={630}
              y={60}
              w={130}
              h={70}
              tone="mint"
              title="Org のファイル"
            />
            <FigArrow
              points={[
                [695, 164],
                [695, 134],
              ]}
            />
            <FigNode
              x={410}
              y={168}
              w={350}
              h={42}
              tone="ghost"
              lines={['kintai は読むだけで書き込まない']}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            CLOCK 行を nvim-orgmode が書くため、
            <DocRef kind="ADR" number="0007" /> が依存する書式とずれない。
          </Item>
          <Item>
            <Code>kintai</Code> に Org
            形式を書く処理が要らず、開いているバッファとの書き込みの衝突も起きない。
          </Item>
          <Item>
            <DocRef kind="ADR" number="0006" /> で選んだ、Neovim
            の中でノートとタスクを扱う流れのまま打刻できる。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: (
                <>
                  <Code>kintai</Code> のサブコマンドで打刻する案
                </>
              ),
              reason:
                'Org 形式を書く処理が要り、書式のずれと、開いているバッファとの衝突の危険がある。',
            },
            {
              option: (
                <>
                  Neovim のキー操作と <Code>kintai</Code>{' '}
                  のサブコマンドの両方を用意する案
                </>
              ),
              reason: '同じ操作を2か所で保守することになる。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>打刻は Neovim の中でしかできない。</Item>
          <Item>
            打刻の Lua を、Neovim の設定のほかの Lua
            と同じくテストで守り、保守する。
          </Item>
          <Item>
            案件の見出しを Lua と <Code>kintai</Code>{' '}
            の両方が見分けられるように、案件の見出しに、案件の設定を指すプロパティを持たせる。
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
              text: 'ADR 0006「ノートとタスクを Org 形式で書き、nvim-orgmode と org-roam.nvim で扱う」',
              href: '/adr/0006_use-orgmode-and-org-roam-for-notes-and-tasks',
            },
            {
              text: 'ADR 0007「勤怠表の CLI を Rust で書き、Typst を組み込んで PDF を生成する」',
              href: '/adr/0007_use-rust-and-typst-for-kintai-cli',
            },
            {
              text: 'ADR 0010「案件の設定は、非公開のリポジトリに案件ごとの TOML ファイルで書く」',
              href: '/adr/0010_write-project-settings-in-toml',
            },
            { text: '所有者へのヒアリング（2026-10-03）' },
          ]}
        />
      </DocSection>
    </>
  )
}
