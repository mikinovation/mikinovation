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
  FigCard,
  FigChip,
  FigChips,
  FigGrid,
  FigLegend,
  Figure,
} from '@/components/figure'

export const meta = {
  title: 'Claude Code を Home Manager で宣言的に管理する',
  lead: '端末で動かすエージェントとして Claude Code を採用し、本体の導入から設定、作業手順、参照の経路までを Home Manager で宣言するという決定を記録する。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-09-30' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>
        用語は <DocRef kind="PRD" number="0004" /> と同じ意味で使う。
        エージェントは、指示を受けてコードを書き換える AI
        のプログラムのうち、端末の中で動かすものを指す。
        文脈は、エージェントが一度に扱える指示と履歴のまとまりを指す。
        作業手順は、特定の作業のときにエージェントが呼び出す、決まった手順の定義を指す。
        「すべて」「最小限」は、
        <DocRef kind="PRD" number="0001" /> が定める導入範囲を指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="PRD" number="0004" />{' '}
          は、エージェントを使い始めるまでと、使っている間の両方に問題を挙げる。
          マシンが変わるたび、エージェントを使える状態にするまで手作業の設定が要る。
          既定のままでは操作のたびに確認待ちが挟まって作業が止まり、長い作業では扱える文脈が尽きて途切れる。
          作業が終わっても入力待ちになっても、画面を見ていなければ気付けない。
          指示や作業手順はマシンごと、作業ごとにばらつき、成果物の質が揃わない。
          エージェントはコードの意味や最新の外部情報を参照できず、推測で書く。
        </Prose>
        <Prose>
          所有者は <DocRef kind="ADR" number="0001" />{' '}
          の決定により、複数のマシンを共通の Home Manager 設定で管理する。 また{' '}
          <DocRef kind="ADR" number="0003" /> の決定により、エージェントを herdr
          の中で複数同時に走らせる。 所有者が使うモデルと、利用量の枠は Claude
          のものである。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0004" />{' '}
          の要求のうち、権限と安全については、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>明示的に許可した操作以外でも、実行前の確認が挟まらない。</Item>
          <Item>
            ファイルやディレクトリの消去、履歴の強制上書き、作業中の変更の破棄、ディスクへの直接書き込み、権限の全開放は、所有者が承認しても実行されない。
          </Item>
        </Bullets>
        <Prose>気付きと可視化については、次の条件を満たす必要がある。</Prose>
        <Bullets>
          <Item>
            作業完了時と入力待ち時に、Windows 側と macOS の双方で OS
            の通知が出る。
          </Item>
          <Item>
            作業場所、ブランチ、使っているモデル、5時間と7日それぞれの利用量の割合が常に表示される。
          </Item>
        </Bullets>
        <Prose>文脈については、次の条件を満たす必要がある。</Prose>
        <Bullets>
          <Item>
            扱える文脈量が最大のまま表示され、長い作業でも途切れない。
          </Item>
          <Item>圧縮が起きた時刻と作業場所が記録に残る。</Item>
        </Bullets>
        <Prose>指示と作業手順については、次の条件を満たす必要がある。</Prose>
        <Bullets>
          <Item>
            何も指示しない状態で、応答の作法、変更の進め方、検証の作法が指示どおりになる。
          </Item>
          <Item>
            外部の提供元から取り込んだ作業手順が一覧に現れ、呼び出せる。
          </Item>
          <Item>
            自作の作業手順を呼び出せる。対象は、変更を送り出す、設計と要求を文書に残す、依存を最新に保つ、文章を整えるの4種である。
          </Item>
          <Item>
            作業手順を有効にする配布先は、他の種類のエージェントへ広げない。
          </Item>
        </Bullets>
        <Prose>参照については、次の条件を満たす必要がある。</Prose>
        <Bullets>
          <Item>コードの定義や参照を引ける。</Item>
          <Item>
            ライブラリの文書、リポジトリの解説、インフラ定義を引ける。
          </Item>
          <Item>ブラウザを操作できる。</Item>
        </Bullets>
        <Prose>実行と更新の作法については、次の条件を満たす必要がある。</Prose>
        <Bullets>
          <Item>
            下位のエージェントが同一プロセスで走り、別の処理を起こさない。
          </Item>
          <Item>起動時に、定めたモデルと思考の強度が選ばれる。</Item>
          <Item>起動時にエージェント本体の更新が始まらない。</Item>
          <Item>生成したコミットに共著者の記載が入らない。</Item>
        </Bullets>
        <Prose>
          導入については、
          <DocRef kind="PRD" number="0001" /> の要求と{' '}
          <DocRef kind="ADR" number="0001" />{' '}
          の決定から、次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>「すべて」と「最小限」のどちらの導入範囲でも導入できる。</Item>
          <Item>
            ブラウザの操作と、コードの定義や参照を引く経路は、「すべて」にだけ含める。
          </Item>
          <Item>macOS、WSL、それ以外の Linux で同じ操作で導入できる。</Item>
          <Item>何度導入しても同じ状態になる。</Item>
          <Item>導入後に手作業で設定しなくても使える。</Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          エージェントとして Claude Code を採用する。
          本体、設定、作業手順、参照の経路は、
          <DocRef kind="ADR" number="0001" /> の共通の Home Manager
          設定から宣言し、両方の導入範囲に含める。
        </Prose>
        <Bullets>
          <Item label="本体">
            <Code>packages/dotfiles/nix/pkgs/claude-code.nix</Code>{' '}
            で自前のパッケージとして定義し、npm
            の配布物にプラットフォーム別のネイティブバイナリを組み合わせる。版はこの記述で固定し、対応する環境は
            x86_64-linux と aarch64-darwin とする。
          </Item>
          <Item label="設定">
            home-manager の <Code>programs.claude-code</Code> から settings.json
            を生成する。既定の権限モードを bypassPermissions
            とし、拒む破壊的な操作は hard_deny
            にパターンとして列挙する。モデルは opus、思考の強度は high
            を既定とする。共著者の記載を無効にし、下位のエージェントを同一プロセスで走らせ、本体の自動更新を無効にする。
          </Item>
          <Item label="通知と状態表示">
            Stop、Notification、PreCompact のフックと statusline
            のコマンドを、リポジトリ内のシェルスクリプトとして持つ。通知は WSL
            では Windows のトースト、macOS では通知センターへ出す。statusline
            は作業場所、ブランチ、モデル、5時間と7日の利用量の割合を表示する。圧縮のフックは、時刻と作業場所をログへ追記する。
          </Item>
          <Item label="文脈">
            headroom を OS のユーザーサービスとして常駐させ、
            <Code>ANTHROPIC_BASE_URL</Code>{' '}
            でエージェントの通信を常に経由させる。常駐は Linux では systemd
            のユーザーユニット、macOS では launchd
            のエージェントで行う。経由により扱える文脈量が縮むのは、
            <Code>_CLAUDE_CODE_ASSUME_FIRST_PARTY_BASE_URL</Code> で打ち消す。
          </Item>
          <Item label="指示">
            全プロジェクト共通の指示を1つの CLAUDE.md として配置する。
          </Item>
          <Item label="作業手順">
            外部の提供元5つを flake の入力として取り込み、agent-skills-nix
            で配布する。自作の作業手順と、文章を整える作業手順はリポジトリと自前のパッケージから配置する。変更を送り出す作業手順は、本体がスキル経由のコマンドを一覧に出さないため、ユーザーコマンドとして配置する。配布先は
            Claude Code だけとする。
          </Item>
          <Item label="参照">
            外部の情報は MCP サーバーから引く。ライブラリの文書は
            context7、リポジトリの解説は deepwiki、インフラ定義は
            terraform、ブラウザの操作は chrome-devtools を使い、chrome-devtools
            は「すべて」にだけ含める。コードの定義や参照は、6言語の LSP
            サーバーから引く。
          </Item>
        </Bullets>
        <Figure caption="本体から参照の経路までを1つの Home Manager 設定で宣言し、手作業の設定を残さない。">
          <FigGrid>
            <FigCard
              tone="neon"
              title="本体"
              note="x86_64-linux と aarch64-darwin"
            >
              <FigChips
                tone="neon"
                items={['自前のパッケージ', '版を記述で固定']}
              />
            </FigCard>
            <FigCard
              tone="rose"
              title="権限"
              note="承認しても実行されない操作を列挙"
            >
              <FigChips
                tone="rose"
                items={['確認を挟まない既定', '破壊的な操作は拒む']}
              />
            </FigCard>
            <FigCard title="気付きと可視化">
              <FigChips
                items={[
                  '完了と入力待ちの通知',
                  '作業場所とブランチ',
                  'モデルと利用量',
                ]}
              />
            </FigCard>
            <FigCard title="文脈" note="経由で縮む分は打ち消す">
              <FigChips
                items={[
                  'headroom を常駐',
                  '通信を常に経由',
                  '圧縮をログへ追記',
                ]}
              />
            </FigCard>
            <FigCard title="指示と作業手順" note="配布先は Claude Code だけ">
              <FigChips
                items={[
                  '共通の CLAUDE.md',
                  '外部5つを flake 入力',
                  '自作はリポジトリから',
                ]}
              />
            </FigCard>
            <FigCard title="参照">
              <FigChips>
                <FigChip>context7</FigChip>
                <FigChip>deepwiki</FigChip>
                <FigChip>terraform</FigChip>
                <FigChip tone="amber">chrome-devtools</FigChip>
                <FigChip tone="amber">6言語の LSP</FigChip>
              </FigChips>
            </FigCard>
          </FigGrid>
          <FigLegend
            items={[{ tone: 'amber', text: '「すべて」にだけ含める' }]}
          />
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            権限モード、拒否するパターン、フック、状態表示、共通の指示、作業手順、MCP、LSP
            のいずれも、設定ファイルとファイルの配置だけで宣言できる。設定の配置先は
            home-manager
            と各モジュールが引き受けるため、導入後に手作業で設定しなくても制約を満たせる。
          </Item>
          <Item>
            ネイティブバイナリ版を使うため、本体は自前のパッケージとして定義する。版の追随も、この記述の更新として直接行える。
          </Item>
          <Item>
            圧縮を通信の経路に置くと常に効くため、扱える文脈量が減らない。起動のたびにプロキシを立てる手作業を避けるため、OS
            のユーザーサービスとして常駐させる。
          </Item>
          <Item>
            通知は WSL の Linux 側ではなく Windows
            側へ出す必要があるため、フックから OS ごとのコマンドを呼ぶ。
          </Item>
          <Item>
            作業手順の取り込みを agent-skills-nix
            に任せると、提供元が増えても配置の記述は増えない。版は flake
            の入力として固定できる。
          </Item>
          <Item>
            コードの意味は LSP、外部の情報は MCP と経路を分ける。LSP
            はエディターと同じ精度で定義と参照を引けるため、grep
            による推測を避けられる。MCP
            の対象は、エージェントが推測で書きやすいライブラリの使い方、他リポジトリの構造、インフラ定義に絞る。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: 'Codex CLI',
              reason:
                'OpenAI のモデルに紐づくため、所有者が使うモデルと利用量の枠に合わない。フック、作業手順、MCP、宣言的な設定は揃っている。ただし状態表示は組み込みの項目を並べる形に限られ、5時間と7日の利用量の割合を出せない。',
            },
            {
              option: 'Gemini CLI',
              reason:
                '同じく Google のモデルに紐づくため、所有者が使うモデルと利用量の枠に合わない。フック、作業手順、MCP は揃っている。ただし home-manager に標準のモジュールがなく、設定の配置を自前で書くことになる。',
            },
            {
              option: 'aider',
              reason:
                'モデルを選べるため、所有者が使うモデルの制約には合う。ただし外部の情報を引く MCP をネイティブに扱えない。通知は任意のコマンドを呼べるものの、応答が終わって入力待ちになったときの1種類だけで、作業完了と入力待ちを区別できない。編集後の検査と試験を走らせる指定はあるが、任意の場面で呼ぶフックと、状態表示を差し替える仕組みはない。',
            },
            {
              option: 'nixpkgs の claude-code',
              reason: 'ネイティブバイナリ版を使えない。',
            },
            {
              option: '設定を Nix の管理外に置き、手作業で配置する案',
              reason:
                '導入後に手作業で設定しなくても使えるという条件を満たせない。',
            },
            {
              option: (
                <>
                  settings.json を <Code>home.file</Code> で直接書く案
                </>
              ),
              reason:
                '設定の配置先の違いを自前で書くことになり、MCP、作業手順、LSP の記述もそれぞれ書き下ろすことになる。',
            },
            {
              option: '本体の自動圧縮だけに任せる案',
              reason:
                '圧縮が起きるまで扱える文脈量が減り続けるため、長い作業が途切れる。',
            },
            {
              option: (
                <>
                  作業手順を <Code>home.file</Code> で提供元から取り込む案
                </>
              ),
              reason:
                '提供元ごとにディレクトリの構成が異なり、取り込みの記述を提供元ごとに書くことになる。',
            },
            {
              option: '本体に内蔵された通知の設定',
              reason: '画面を見ていないときに終了と入力待ちへ気付けない。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            「最小限」には LSP
            サーバーの本体が入らないため、コードの定義や参照を引けない。設定そのものは両方の導入範囲で書かれる。
          </Item>
          <Item>
            「最小限」には chrome-devtools の MCP
            サーバーとブラウザが入らないため、ブラウザを操作できない。
          </Item>
          <Item>
            headroom のプロキシが止まると、<Code>ANTHROPIC_BASE_URL</Code>{' '}
            の向き先が失われ、エージェントが通信できない。
          </Item>
          <Item>
            扱える文脈量の維持は、内部向けのフラグに依存する。本体側の変更で効かなくなりうる。
          </Item>
          <Item>
            本体を自前のパッケージとして持つため、版を上げるたびに npm
            の配布物とネイティブバイナリのハッシュを保守する。x86_64-linux と
            aarch64-darwin 以外では評価が失敗する。
          </Item>
          <Item>
            本体は自動更新されないため、更新は版の記述と <Code>flake.lock</Code>{' '}
            の更新を通じてのみ行う。
          </Item>
          <Item>
            フックと statusline
            はリポジトリ内のスクリプトを絶対パスで参照する。リポジトリを移動または削除すると、通知と状態表示が壊れる。反面、スクリプトの変更は再ビルドなしで効く。
          </Item>
          <Item>
            通知は WSL の PowerShell と macOS の osascript
            に依存するため、それ以外の Linux では通知が出ない。
          </Item>
          <Item>
            確認が挟まらないため、hard_deny
            に列挙したパターンに合致しない破壊的な操作は止まらない。
          </Item>
          <Item>
            外部の提供元の作業手順は flake
            の入力で固定されるため、上流の更新は入力の更新を通じてのみ届く。配布先は
            Claude Code だけであり、他の種類のエージェントには配らない。
          </Item>
          <Item>
            変更を送り出す作業手順はユーザーコマンドとして配置しているため、本体がスキル経由のコマンドを一覧に出すようになれば、配置し直しになる。
          </Item>
          <Item>
            圧縮の記録は追記されるだけで、読む仕組みも集計する仕組みもない。
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
              text: 'PRD 0001「開発環境の導入」',
              href: '/prd/0001_environment-setup',
            },
            {
              text: 'ADR 0001「開発環境を Nix flakes で宣言的に管理する」',
              href: '/adr/0001_manage-environment-with-nix-flakes',
            },
            {
              text: 'ADR 0003「端末多重化ツールに herdr を使う」',
              href: '/adr/0003_use-herdr-as-terminal-multiplexer',
            },
            { text: '所有者へのヒアリング（2026-09-30）' },
          ]}
        />
      </DocSection>
    </>
  )
}
