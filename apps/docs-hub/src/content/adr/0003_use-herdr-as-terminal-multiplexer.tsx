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
import { FigCard, FigChips, FigGrid, Figure } from '@/components/figure'

export const meta = {
  title: '端末多重化ツールに herdr を使う',
  lead: '端末多重化ツールとして herdr を採用し、設定を Home Manager で管理し、Neovim から herdr のエージェントへ送る仕組みを自前で実装するという決定を記録する。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-07-04' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>
        用語は <DocRef kind="PRD" number="0003" /> と同じ意味で使う。
        エージェントは、指示を受けてコードを書き換える AI
        のプログラムのうち、端末の中で動かすものを指す。
        端末多重化ツールは、一つの端末画面を分割し、複数の作業を同時に表示して切り替えるツールを指す。
        「すべて」「最小限」は、
        <DocRef kind="PRD" number="0001" /> が定める導入範囲を指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="PRD" number="0003" />{' '}
          は、エージェントを複数同時に走らせるときの問題を挙げる。
          どれが入力待ちでどれが作業中かを一度に見られないため、端末を順に切り替えて確かめることになり、手を入れるべきエージェントへの気付きが遅れる。
          扱うプロジェクトが複数あると、プロジェクトごとの端末の行き来も増える。
          エディターで開いているコードや指示をエージェントへ渡すたびに、手作業のコピーと貼り付けが挟まる。
        </Prose>
        <Prose>
          所有者は端末とシェルを中心に作業し、
          <DocRef kind="ADR" number="0002" /> の決定により Neovim
          を端末の中で使う。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0003" />{' '}
          の要求のうち、エージェントの監視について、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>
            複数のエージェントの状態を、切り替えずに一画面で把握できる。
          </Item>
          <Item>手を入れるべきエージェントが一覧の上位に来る。</Item>
          <Item>
            注目するエージェントを、1つの操作で全画面表示と元の配置に行き来できる。
          </Item>
          <Item>
            一覧を出すサイドバーを1つの操作で開閉でき、畳むと画面を占有しない。
          </Item>
        </Bullets>
        <Prose>画面とタブの操作については、次の条件を満たす必要がある。</Prose>
        <Bullets>
          <Item>画面を縦横に分割し、上下左右の隣へ移動できる。</Item>
          <Item>タブを増やし、前後に切り替えられる。</Item>
          <Item>
            プロジェクト単位でタブをまとめ、まとまりを新規作成して前後に切り替えられる。
          </Item>
          <Item>
            分割、移動、タブの操作を、一般的な端末多重化ツールと同じ指使いで行える。
          </Item>
          <Item>マウスでも操作できる。</Item>
          <Item>画面から流れた過去の出力を、上限まで戻って読める。</Item>
        </Bullets>
        <Prose>
          エディターからの操作については、次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>
            選択範囲、現在行、ファイルパス、自由入力のテキストを、動いているエージェントへ送れる。
          </Item>
          <Item>
            送り先のエージェントが複数あるときだけ、送り先を選ばせる。
          </Item>
          <Item>
            編集中のファイルの場所を作業場所として、名前を付けたエージェントを立ち上げ、隣の領域に並べられる。
          </Item>
          <Item>
            動いているプロジェクトのまとまりを一覧し、選んだものへ切り替えられる。
          </Item>
          <Item>
            送れない状態のときは理由が示され、何も起きない。操作の成否がエディター上で分かる。
          </Item>
        </Bullets>
        <Prose>
          導入については、
          <DocRef kind="PRD" number="0003" /> の対象範囲と、
          <DocRef kind="PRD" number="0001" /> の要求および{' '}
          <DocRef kind="ADR" number="0001" />{' '}
          の決定から、次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>導入範囲「すべて」にだけ含め、「最小限」には含めない。</Item>
          <Item>macOS、WSL、それ以外の Linux で同じ操作で導入できる。</Item>
          <Item>何度導入しても同じ状態になる。</Item>
          <Item>導入後に手作業で設定しなくても使える。</Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          端末多重化ツールとして herdr を採用する。 herdr は{' '}
          <DocRef kind="ADR" number="0001" /> の共通の Home Manager
          設定から、flake input <Code>github:ogulcancelik/herdr</Code>{' '}
          として導入し、導入範囲「すべて」にだけ含める。
        </Prose>
        <Bullets>
          <Item>
            版は <Code>flake.lock</Code> で固定し、herdr が使う nixpkgs
            はリポジトリ共通の入力に合わせる。
          </Item>
          <Item>
            設定は Home Manager が <Code>~/.config/herdr/config.toml</Code>{' '}
            に配置する。
          </Item>
          <Item>
            prefix は <Code>ctrl+b</Code>{' '}
            とし、画面の分割、ペイン間の移動、タブの操作は tmux
            と同じ指使いに合わせる。
          </Item>
          <Item>
            エージェントの監視は、注目するエージェントを全画面に広げる操作を主とし、優先度順に並ぶサイドバーを副とする。サイドバーは畳むと画面を占有しない。
          </Item>
          <Item>
            Neovim から herdr のエージェントへ送る仕組みは、herdr の CLI を呼ぶ{' '}
            <Code>plugins/herdr/actions</Code>{' '}
            として自前で実装する。選択範囲、現在行、ファイルパス、自由入力の送信と、エージェントの起動、ワークスペースの切り替えを行う。
          </Item>
        </Bullets>
        <Figure caption="監視と画面の操作は herdr の機能に任せ、エディターとの連携だけを自前で持つ。">
          <FigGrid>
            <FigCard
              tone="neon"
              title="herdr が担う"
              note="自前の実装を要しない"
            >
              <FigChips
                tone="neon"
                items={[
                  'エージェントの一覧',
                  '状態の表示',
                  '優先度順の並び',
                  '全画面との行き来',
                  'サイドバーの開閉',
                  'ワークスペース',
                  '分割とタブ',
                  'マウス操作',
                  '過去の出力',
                ]}
              />
            </FigCard>
            <FigCard
              tone="amber"
              title="自前で実装する"
              note="herdr の CLI を呼ぶ Neovim のモジュール"
            >
              <FigChips
                tone="amber"
                items={[
                  '選択範囲の送信',
                  '現在行の送信',
                  'ファイルパスの送信',
                  '自由入力の送信',
                  'エージェントの起動',
                  'ワークスペースの切り替え',
                ]}
              />
            </FigCard>
            <FigCard
              tone="ghost"
              title="Nix が担う"
              note="「すべて」にだけ含める"
            >
              <FigChips
                items={[
                  'flake input で導入',
                  'flake.lock で版を固定',
                  'config.toml の配置',
                ]}
              />
            </FigCard>
          </FigGrid>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            エージェントの一覧、状態の表示、優先度順の並びを herdr
            自身が持つため、監視に関わる制約を自前の実装なしで満たせる。
          </Item>
          <Item>
            ワークスペースでタブをプロジェクト単位にまとめられるため、プロジェクトをまたぐ行き来に関わる制約を満たせる。
          </Item>
          <Item>
            分割、ペイン移動、タブ操作のキーを設定で変更でき、tmux
            と同じ指使いに合わせられる。
          </Item>
          <Item>
            CLI が1行の JSON
            を返すため、エージェントの一覧、送信、起動、ワークスペースの切り替えを外部から呼び出せ、エディターとの連携を組める。
          </Item>
          <Item>
            flake を提供しており、
            <DocRef kind="ADR" number="0001" /> の Home Manager
            設定から宣言的に導入して版を固定できる。
          </Item>
          <Item>
            既存の Neovim プラグインは、端末多重化ツールとして tmux と zellij
            にしか対応せず、herdr へ送る経路を持たない。そのため herdr の CLI
            を直接呼ぶモジュールを自前で書く。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: 'tmux',
              reason:
                'エージェントの一覧、状態の把握、優先度順の並びに当たる機能がない。監視に関わる制約を満たすには、ペインの一覧と状態の判定を自前で作る必要がある。',
            },
            {
              option: 'zellij',
              reason:
                '同じくエージェントの監視に当たる機能がない。エディターから送る仕組みは既存のプラグインが対応しているが、監視に関わる制約を満たせないため、その利点では覆らない。',
            },
            {
              option: '端末エミュレータに内蔵された多重化機能',
              reason: (
                <>
                  次の2点から採らない。
                  <Bullets>
                    <Item>エージェントの監視に当たる機能がない。</Item>
                    <Item>
                      多重化を端末エミュレータ側に置くと、その端末エミュレータでしか同じ操作にならない。
                    </Item>
                  </Bullets>
                </>
              ),
            },
            {
              option:
                '端末多重化ツールを使わず、エディターの端末ウィンドウだけで済ませる案',
              reason: (
                <>
                  次の2点から採らない。
                  <Bullets>
                    <Item>通常のシェル作業を同じ画面で行えない。</Item>
                    <Item>
                      エージェントがエディターの寿命に縛られ、複数のプロジェクトをまたいで走らせ続けられない。
                    </Item>
                  </Bullets>
                </>
              ),
            },
            {
              option: 'Orca',
              reason: (
                <>
                  エージェントごとに git worktree
                  を分けて並列に動かし、差分のレビューや PR
                  との連携までを一画面で扱うデスクトップアプリ。次の2点から採らない。
                  <Bullets>
                    <Item>
                      GUI
                      アプリのため、所有者が端末とシェルを中心に作業するという前提に合わない。Neovim
                      から herdr のエージェントへ送る仕組みも使えなくなる。
                    </Item>
                    <Item>
                      同じリポジトリで並列に作業するときの作業ツリーの衝突は、Claude
                      Code の <Code>--worktree</Code> で worktree
                      を分ければ避けられる。
                    </Item>
                  </Bullets>
                </>
              ),
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            導入範囲「最小限」の環境には herdr
            も設定も入らないため、エージェントの監視とエディターからの送信を使えない。
          </Item>
          <Item>
            herdr は nixpkgs になく flake から取得する Rust
            製のため、バイナリキャッシュが効かない環境ではソースからのビルドになり、メモリの限られた環境では導入に時間がかかる。
          </Item>
          <Item>
            版は <Code>flake.lock</Code> で固定するため、herdr の更新は lock
            の更新を通じてのみ行う。
          </Item>
          <Item>
            自前のモジュールは herdr の CLI の出力形式に依存するため、herdr 側で
            CLI が変わると動かなくなる。テストは CLI
            の応答を固定値で置き換えており、実際の CLI
            との食い違いはテストでは分からない。
          </Item>
          <Item>
            エディターから立ち上げられるエージェントは claude に限られる。
          </Item>
          <Item>
            多重化を herdr
            に置いたため、端末エミュレータ側のタブとペインの機能は使わない。
          </Item>
          <Item>
            端末を閉じたあとの画面構成は復元されず、シェルの起動時に自動では立ち上がらない。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0003「端末多重化ツールの導入」',
              href: '/prd/0003_terminal-multiplexer',
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
              text: 'ADR 0002「Neovim を既定エディターにする」',
              href: '/adr/0002_use-neovim-as-default-editor',
            },
            { text: '所有者へのヒアリング（2026-09-29）' },
            { text: '所有者へのヒアリング（2026-10-08）' },
            {
              text: 'Orca（stablyai/orca）',
              href: 'https://github.com/stablyai/orca',
            },
            {
              text: 'Claude Code の worktrees の文書',
              href: 'https://code.claude.com/docs/en/worktrees',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
