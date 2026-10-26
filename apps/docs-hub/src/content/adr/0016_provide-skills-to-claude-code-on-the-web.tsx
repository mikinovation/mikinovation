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
  title:
    'Nix のない環境ではプロジェクトスキルとセッション開始時のプラグイン導入で作業手順を配る',
  lead: 'Nix のない環境でも、このリポジトリで作業手順を呼び出せるようにする決定を記録する。自作の作業手順はプロジェクトスキルとして置き、外部の作業手順はセッションの開始時にプラグインとして導入する。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-10-06' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>
        用語は <DocRef kind="PRD" number="0004" /> と同じ意味で使う。
        作業手順は、特定の作業のときにエージェントが呼び出す、決まった手順の定義を指す。
        Nix のない環境は、ブラウザとスマホから使う Claude Code
        のように、このリポジトリの導入操作を行えない環境を指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="ADR" number="0004" /> の決定により、作業手順は Home
          Manager で <Code>~/.claude/skills</Code> に配置する。 Nix
          のない環境ではこの配置が行われず、ユーザーの設定も読まれない。
          そのため、
          <DocRef kind="PRD" number="0004" /> の要求17 を満たせない。
        </Prose>
        <Prose>
          自作の作業手順は <Code>packages/claude-skills/skills</Code> にある。
          リポジトリのルートの <Code>.claude-plugin/marketplace.json</Code>{' '}
          で、プラグインのマーケットプレイスとしても公開している。
          自作の作業手順は、tanteki、yomiyasu、mattpocock/skills の{' '}
          <Code>grilling</Code>、公式の commit-commands の <Code>commit</Code>{' '}
          を呼ぶ。
          これらは外部の提供元にあり、同じマーケットプレイスからプラグインとして入れられる。
        </Prose>
        <Prose>
          プロジェクトの設定 <Code>.claude/settings.json</Code>{' '}
          でマーケットプレイスとプラグインを有効にしても、Nix
          のない環境ではプラグインが導入されなかった。 2026-10-06
          に始めたセッションでは、導入済みのプラグインが一つもなかった。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0004" /> の要求17
          から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>
            Nix
            のない環境でこのリポジトリを開くと、手作業の設定なしに自作の作業手順と、それらが呼ぶ外部の作業手順が一覧に現れ、呼び出せる。
          </Item>
          <Item>
            作業手順が呼ぶ側の手順を書き換えずに済むよう、呼ばれる作業手順を名前で呼べる。
          </Item>
        </Bullets>
        <Prose>あわせて、次の条件を満たす必要がある。</Prose>
        <Bullets>
          <Item>
            自作の作業手順の正本は <Code>packages/claude-skills/skills</Code>{' '}
            の一か所に保つ。
          </Item>
          <Item>Nix で導入したマシンの振る舞いを変えない。</Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>自作の作業手順と外部の作業手順で、配り方を分ける。</Prose>
        <Bullets>
          <Item label="自作の作業手順">
            <Code>
              .claude/skills/{'<'}名前{'>'}
            </Code>{' '}
            に、
            <Code>
              packages/claude-skills/skills/{'<'}名前{'>'}
            </Code>{' '}
            を指すシンボリックリンクを置く。Claude Code
            はこれをプロジェクトスキルとして読み込み、名前空間なしの名前で呼べる。このリポジトリでは{' '}
            <Code>mikinovation-skills</Code> プラグインを有効にしない。
          </Item>
          <Item label="外部の作業手順">
            4つのプラグインを <Code>.claude/settings.json</Code> の{' '}
            <Code>enabledPlugins</Code> で有効にする。対象は
            tanteki、yomiyasu、mattpocock-skills、commit-commands である。
          </Item>
          <Item label="導入">
            SessionStart のフック <Code>.claude/hooks/session-start.sh</Code>{' '}
            を置く。フックは <Code>.claude/settings.json</Code>{' '}
            に書いたマーケットプレイスを追加し、有効にしたプラグインをプロジェクトのスコープで導入する。フックは{' '}
            <Code>CLAUDE_CODE_REMOTE</Code> が <Code>true</Code>{' '}
            のときだけ動き、導入が終わるまでセッションを待たせる。
            <Code>claude plugin</Code> のコマンドが書き直す{' '}
            <Code>.claude/settings.json</Code>{' '}
            は、フックの終了時に元の内容へ戻す。
          </Item>
        </Bullets>
        <Figure caption="自作の作業手順はリポジトリから直接読み、外部の作業手順だけをセッションの開始時に導入する。">
          <FigSvg
            height={215}
            label="リポジトリのプロジェクトスキルと設定から、SessionStart のフックが外部プラグインを導入してセッションが始まる流れ"
          >
            <FigNode
              x={0}
              y={20}
              w={360}
              h={180}
              tone="ghost"
              tag="このリポジトリ"
            />
            <FigNode
              x={20}
              y={64}
              w={320}
              h={56}
              tone="neon"
              title=".claude/skills のリンク"
              lines={['自作の作業手順をそのまま読む']}
            />
            <FigNode
              x={20}
              y={130}
              w={320}
              h={56}
              tone="amber"
              title=".claude/settings.json"
              lines={['外部の4プラグインを有効にする']}
            />
            <FigArrow
              points={[
                [360, 158],
                [400, 158],
                [400, 75],
                [436, 75],
              ]}
            />
            <FigNode
              x={440}
              y={40}
              w={320}
              h={70}
              title="SessionStart のフック"
              lines={[
                'マーケットプレイスを追加して導入',
                '遠隔の環境のときだけ動く',
              ]}
            />
            <FigArrow
              points={[
                [600, 110],
                [600, 136],
              ]}
              tone="neon"
            />
            <FigNode
              x={440}
              y={140}
              w={320}
              h={60}
              tone="mint"
              title="セッションの開始"
              lines={['導入が終わるまで待たせる']}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            シンボリックリンクにすると、正本を一か所に保ったまま、作業手順の変更が導入操作なしに効く。
          </Item>
          <Item>
            プロジェクトスキルは、Nix
            で配置した場合と同じ名前で呼べる。プラグインにすると{' '}
            <Code>mikinovation-skills:create-prd</Code>{' '}
            のように名前空間が付き、Nix
            で導入したマシンでは同じ作業手順が二重に並ぶ。
          </Item>
          <Item>
            外部の作業手順はこのリポジトリの外にあるため、シンボリックリンクでは置けない。プラグインなら、提供元から取り込む記述を持たずに済む。
          </Item>
          <Item>
            プロジェクトの設定だけではプラグインが導入されないため、導入を明示的に行う場所が要る。SessionStart
            のフックはセッションのたびに走り、リポジトリに置ける。
          </Item>
          <Item>
            フックはマーケットプレイスとプラグインの一覧を{' '}
            <Code>.claude/settings.json</Code>{' '}
            から読む。一覧を一か所に保つため、フックに書き写さない。
          </Item>
          <Item>
            導入の前に作業手順が呼ばれて失敗しないよう、フックは同期で走らせる。
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
                  <Code>mikinovation-skills</Code>{' '}
                  プラグインをこのリポジトリでも有効にする案
                </>
              ),
              reason:
                '名前空間が付き、Nix で導入したマシンでは同じ作業手順が二重に並ぶ。また、プロジェクトの設定だけでは導入されない。',
            },
            {
              option: (
                <>
                  自作の作業手順を <Code>.claude/skills</Code> に複製する案
                </>
              ),
              reason: '正本が二か所になり、内容が食い違いうる。',
            },
            {
              option: '外部の作業手順をリポジトリに取り込む案',
              reason:
                '上流ごとの複製を保守することになる。提供元ごとのライセンスの扱いも確かめることになる。',
            },
            {
              option: 'フックを非同期で走らせる案',
              reason:
                'セッションは早く始まるが、導入が終わる前に作業手順を呼ぶと失敗する。',
            },
            {
              option: 'フックにプラグインの一覧を直接書く案',
              reason: (
                <>
                  一覧が <Code>.claude/settings.json</Code> と二か所になる。
                </>
              ),
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            Nix
            のない環境では、マーケットプレイスとプラグインを取り込み終えるまでセッションが始まらない。
          </Item>
          <Item>
            マーケットプレイスは外部のプラグインの版を固定しないため、Nix
            のない環境では、新しいセッションごとに上流の最新が入る。Nix
            で導入したマシンとは、作業手順の版が食い違いうる。
          </Item>
          <Item>
            フックは、Nix のない環境に <Code>jq</Code> と <Code>claude</Code>{' '}
            のコマンドがあることに依存する。
          </Item>
          <Item>
            自作の作業手順を追加したときは、シンボリックリンクも手作業で追加する。追加し忘れると、Nix
            のない環境ではその作業手順を呼び出せない。
          </Item>
          <Item>
            Nix
            で導入したマシンでこのリポジトリを開くと、同じ名前の作業手順がユーザーとプロジェクトの両方に置かれる。導入操作をやり直すまでは、両者の内容が食い違いうる。
          </Item>
          <Item>
            フックの変更は、既定のブランチへ取り込んだあとに始めたセッションから効く。
          </Item>
          <Item>
            このリポジトリ以外のリポジトリで Nix
            のない環境に作業手順を配るには、そのリポジトリにプロジェクトの設定とフックを手作業で追加する。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0004「AI エージェントの導入」',
              href: '/prd/0004_ai-agent',
            },
            {
              text: 'ADR 0004「Claude Code を Home Manager で宣言的に管理する」',
              href: '/adr/0004_manage-claude-code-with-home-manager',
            },
            {
              text: 'packages/claude-skills/README.md',
              href: 'https://github.com/mikinovation/mikinovation/blob/main/packages/claude-skills/README.md',
            },
            { text: '所有者の依頼（2026-10-06）' },
          ]}
        />
      </DocSection>
    </>
  )
}
