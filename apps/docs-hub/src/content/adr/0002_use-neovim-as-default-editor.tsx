import {
  Alternatives,
  Bullets,
  Code,
  DocLink,
  DocRef,
  DocSection,
  DocTable,
  Item,
  Prose,
  Sources,
} from '@/components/doc'
import { FigArrow, FigNode, FigSvg, Figure } from '@/components/figure'

export const meta = {
  title: 'Neovim を既定エディターにする',
  lead: 'Neovim を既定エディターにし、本体、設定、周辺ツールを Home Manager で管理するという決定を記録する。導入範囲「最小限」には、メモとタスクの管理に絞った Neovim を含める。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-09-28' },
  ],
}

export default function Body() {
  return (
    <>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="PRD" number="0002" /> は2つの問題を挙げる。
          エディターと言語ごとの補完や診断をマシンごとに手作業で揃えると、マシン間で設定がずれる。
          エディターだけで開発作業を終えられないと、別のアプリへ切り替えるたびに作業が途切れる。
          所有者は端末とシェルを中心に作業し、Vim
          系のモード型の操作に慣れている。
        </Prose>
        <Prose>
          導入範囲「最小限」は、壊れた環境でもすぐに作業を始めるための範囲である。
          壊れた環境の復旧でも、Git
          のコミットメッセージの入力や設定ファイルの修正にエディターが要る。
          メモとタスクも <DocRef kind="ADR" number="0006" /> で Neovim
          に置いているため、「最小限」にエディターがないと扱えない。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0002" />{' '}
          の要求から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>
            ほかのツールが文章の入力を求めるときに開く、既定のエディターとして使える。
          </Item>
          <Item>初回起動で、所有者が操作せずに編集機能が揃う。</Item>
          <Item>
            日常的に使う言語で、補完、診断、整形、定義への移動、名前の変更を使える。
          </Item>
          <Item>ファイルの検索とツリー表示を、エディター内で行える。</Item>
          <Item>
            Git の操作とコンフリクトの解消、GitHub の Issue と PR
            の表示を、エディター内で行える。
          </Item>
          <Item>
            テストの実行、データベースへの問い合わせ、HTTP
            リクエストの送信、端末の開閉、メモとタスクの管理を、エディター内で行える。
          </Item>
          <Item>
            AI の入力補完と、ファイルや選択範囲の AI への送信を使える。
          </Item>
          <Item>
            導入範囲「最小限」でも、既定のエディターとして使え、メモとタスクを管理できる（
            <DocRef kind="PRD" number="0002" /> の要求21）。
          </Item>
          <Item>
            導入範囲「最小限」を軽く保つ。言語サーバーや、メモとタスクに関係のないプラグインと道具を入れない。
          </Item>
        </Bullets>
        <Prose>
          <DocRef kind="PRD" number="0001" /> の要求と{' '}
          <DocRef kind="ADR" number="0001" />{' '}
          の決定から、次の条件も満たす必要がある。
        </Prose>
        <Bullets>
          <Item>macOS、WSL、それ以外の Linux で同じ操作で導入できる。</Item>
          <Item>何度導入しても同じ状態になる。</Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          Neovim を既定エディターにする。 Neovim は{' '}
          <DocRef kind="ADR" number="0001" /> の共通の Home Manager 設定から、
          <Code>packages/dotfiles/nix/programs/neovim</Code>{' '}
          のモジュールとして導入し、導入範囲「すべて」と「最小限」の両方に含める。
        </Prose>
        <Bullets>
          <Item>
            環境変数 <Code>EDITOR</Code> と <Code>VISUAL</Code> を{' '}
            <Code>nvim</Code> にし、<Code>vi</Code>、<Code>vim</Code>、
            <Code>vimdiff</Code> を Neovim の別名にする。
          </Item>
          <Item>
            設定は Lua で書き、Home Manager が <Code>~/.config/nvim</Code>{' '}
            に配置する。
          </Item>
          <Item>
            言語サーバー、formatter、linter、tree-sitter
            のパーサーのビルドに使うツールは、Neovim の追加パッケージとして Nix
            で導入する。
          </Item>
          <Item>
            制約に挙げた編集機能と開発作業は、プラグインで Neovim 内に収める。
          </Item>
          <Item>
            プラグインは lazy.nvim で管理し、版は{' '}
            <DocRef kind="ADR" number="0014" /> のとおり各プラグインの定義の{' '}
            <Code>commit</Code> で固定する。
          </Item>
          <Item>
            両方の導入範囲で共通の設定を <Code>core.lua</Code> と{' '}
            <Code>core_keymaps.lua</Code> に置く。<Code>core.lua</Code> は
            leader、オプション、クリップボードを設定し、
            <Code>core_keymaps.lua</Code> は Neovim
            に組み込まれた機能だけを使うキーマップを設定する。
          </Item>
          <Item>
            <Code>plugins.lua</Code> は、lazy.nvim を取得して起動する{' '}
            <Code>setup(specs)</Code> と、「すべて」の定義の一覧を返す{' '}
            <Code>full_specs()</Code> を持つ。
          </Item>
        </Bullets>
        <Prose>導入範囲ごとの違いは次のとおり。</Prose>
        <DocTable
          head={['', 'すべて', '最小限']}
          rows={[
            [
              '入口',
              <>
                <Code>init.lua</Code>
              </>,
              <>
                <Code>minimal.lua</Code>（<Code>init.lua</Code> として配置）
              </>,
            ],
            [
              '読み込むプラグイン',
              <>
                <Code>full_specs()</Code> の全定義
              </>,
              <>
                nvim-orgmode と org-roam.nvim の定義だけ（
                <DocRef kind="ADR" number="0006" />）
              </>,
            ],
            [
              '言語サーバーとキーマップ',
              '全部を読み込む',
              <>
                <Code>core_keymaps.lua</Code> だけ
              </>,
            ],
            [
              '追加パッケージ',
              '言語サーバー、formatter、linter、組み立ての道具',
              'C コンパイラーだけ',
            ],
            [
              <>
                <Code>~/.config/nvim</Code> に置くもの
              </>,
              <>
                <Code>nvim</Code> ディレクトリー全体
              </>,
              <>
                <Code>minimal-config-files</Code> に挙げたファイルだけ
              </>,
            ],
          ]}
        />
        <Bullets>
          <Item>
            「最小限」のファイルは、Nix の <Code>linkFarm</Code>{' '}
            で1つのディレクトリーにまとめて配置する。
          </Item>
          <Item>
            C コンパイラーは、nvim-orgmode が tree-sitter-org
            を組み立てるために使うため、両方の導入範囲に入れる。Linux は
            gcc、macOS は clang とする。
          </Item>
          <Item>
            起動確認のスクリプトは、同じ <Code>minimal-config-files</Code>{' '}
            から「最小限」の配置を組み立て、空のデータのディレクトリーでプラグインを取得したあと、エラーなく起動することを確かめる。
          </Item>
        </Bullets>
        <Figure caption="入口だけを分け、共通の設定とプラグインの定義は両方の導入範囲で同じものを読む。">
          <FigSvg
            height={240}
            label="共通の設定から入口が2つに分かれ、同じプラグインの定義を参照する構成"
          >
            <FigNode
              x={0}
              y={75}
              w={200}
              h={90}
              tone="neon"
              title="共通の設定"
              lines={['core.lua（オプション）', 'core_keymaps.lua']}
            />
            <FigArrow
              points={[
                [200, 120],
                [250, 120],
                [250, 63],
                [296, 63],
              ]}
            />
            <FigArrow
              points={[
                [200, 120],
                [250, 120],
                [250, 177],
                [296, 177],
              ]}
            />
            <FigNode
              x={300}
              y={20}
              w={200}
              h={86}
              title="init.lua（すべて）"
              lines={['full_specs() の全定義', '言語サーバーと道具']}
            />
            <FigNode
              x={300}
              y={134}
              w={200}
              h={86}
              tone="amber"
              title="minimal.lua（最小限）"
              lines={['orgmode と org-roam だけ', 'C コンパイラーだけ']}
            />
            <FigArrow
              points={[
                [500, 63],
                [530, 63],
                [530, 110],
                [556, 110],
              ]}
            />
            <FigArrow
              points={[
                [500, 177],
                [530, 177],
                [530, 130],
                [556, 130],
              ]}
            />
            <FigNode
              x={560}
              y={72}
              w={200}
              h={96}
              tone="ghost"
              title="プラグインの定義"
              lines={['lazy.nvim が初回起動で取得', 'commit で版を固定']}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            端末内で動くため、端末中心の作業に合い、macOS、WSL、それ以外の Linux
            の端末から同じ操作で使える。
          </Item>
          <Item>
            本体、設定、周辺ツールを Home Manager で宣言できるため、どの OS
            でも同じ版と同じ設定になり、何度導入しても状態が変わらない。
          </Item>
          <Item>
            設定を Lua で書くため、luacheck と busted で設定を検証できる。
          </Item>
          <Item>
            言語サーバーのクライアントと tree-sitter
            を内蔵しており、プラグインも豊富なため、補完、デバッグ、テストの実行をエディター内で行える。
          </Item>
          <Item>
            「最小限」にも同じエディターを入れ、共通の設定を同じファイルから読み込むため、導入範囲によって操作やオプションがずれない。
          </Item>
          <Item>
            「最小限」のプラグインの定義を「すべて」と共有するため、版の固定と
            Renovate による更新の通知が両方で同じになる。
          </Item>
          <Item>
            Home Manager の Neovim モジュールは、プロバイダーを無効にする{' '}
            <Code>init.lua</Code>{' '}
            を自動で生成する。「すべて」ではディレクトリーごと配置するため、この生成物はリポジトリの{' '}
            <Code>init.lua</Code>{' '}
            に隠れる。「最小限」もディレクトリーごと配置すれば、同じ仕組みで隠れ、配置先の衝突が起きない。
          </Item>
          <Item>
            配置するファイルの一覧を1つのファイルにまとめるため、Nix
            の配置と起動確認が同じ一覧を使い、一覧の漏れを CI
            で見つけられる。起動確認は空のデータのディレクトリーで動くため、「すべて」で取得済みのプラグインに隠れて漏れを見逃すこともない。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: 'VS Code',
              reason: '端末の外で動くため、端末中心の作業に合わない。',
            },
            {
              option: 'Cursor',
              reason: (
                <>
                  次の2点から採らない。
                  <Bullets>
                    <Item>端末の外で動くため、端末中心の作業に合わない。</Item>
                    <Item>
                      AI の入力補完と選択範囲の送信は Neovim
                      でもプラグインで満たせるため、エディターに組み込まれた AI
                      機能は Cursor を選ぶ理由にならない。
                    </Item>
                  </Bullets>
                </>
              ),
            },
            {
              option: 'Vim',
              reason:
                '設定を Lua で書けないため、luacheck や busted で設定を検証できない。',
            },
            {
              option: 'Emacs',
              reason:
                '所有者は Vim 系のモード型の操作を使いたいが、Emacs でその操作を使うには evil などのプラグインが必要になる。',
            },
            {
              option: 'IntelliJ IDEA',
              reason: (
                <>
                  次の2点から採らない。
                  <Bullets>
                    <Item>端末の外で動くため、端末中心の作業に合わない。</Item>
                    <Item>
                      設定を IDE の中で変更するため、宣言的に管理しにくい。
                    </Item>
                  </Bullets>
                </>
              ),
            },
            {
              option: '「最小限」に Neovim を含めない案',
              reason:
                '壊れた環境の復旧でエディターを使えず、メモとタスクも扱えない。',
            },
            {
              option: '「最小限」の Neovim をプラグインなしにする案',
              reason:
                'ネットワークなしで起動できるが、メモとタスクを扱えない。',
            },
            {
              option: '「最小限」にも「すべて」と同じ設定を配置する案',
              reason:
                '70を超えるプラグインと、その組み立てに使う Rust、Node.js、luarocks などの道具が要り、「最小限」が重くなる。',
            },
            {
              option: (
                <>
                  「最小限」では <Code>vim</Code> や <Code>nano</Code>{' '}
                  など別のエディターを既定にする案
                </>
              ),
              reason:
                '導入範囲によって操作が変わり、オプションやキーマップを別に保守する必要がある。',
            },
            {
              option: (
                <>
                  環境変数で <Code>init.lua</Code> の動きを切り替える案
                </>
              ),
              reason:
                'シェルを経由しない起動では環境変数がなく、「最小限」でも全プラグインを取得しようとする。',
            },
            {
              option: (
                <>
                  「最小限」のファイルを1つずつ <Code>~/.config/nvim</Code>{' '}
                  配下に配置する案
                </>
              ),
              reason: (
                <>
                  Home Manager が生成する <Code>init.lua</Code>{' '}
                  と配置先が衝突し、評価時にエラーになる。
                </>
              ),
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            導入範囲「最小限」の環境にも Neovim が入り、<Code>EDITOR</Code>{' '}
            が設定される。ただし、補完、診断、ファイルの検索、Git
            の操作など、メモとタスク以外のプラグインと言語サーバーに頼る機能は使えない。
          </Item>
          <Item>「最小限」には C コンパイラーが入る。</Item>
          <Item>
            「最小限」で使う設定を足すときは、<Code>minimal-config-files</Code>{' '}
            に加える必要がある。加え忘れると、起動確認で見つかる。
          </Item>
          <Item>
            <Code>core.lua</Code> と <Code>core_keymaps.lua</Code>{' '}
            にプラグインに頼る設定を書くと、「最小限」の起動でエラーになる。起動確認で見つかる。
          </Item>
          <Item>
            プラグインは Nix ではなく lazy.nvim
            が初回起動時に取得するため、両方の導入範囲で、初回起動にはネットワークへの接続が必要になる。
          </Item>
          <Item>
            言語サーバーなどの周辺ツールのうち nixpkgs
            にないものは、自前のパッケージとして定義し、保守する。
          </Item>
          <Item>
            OS のクリップボードとの共有は WSL と macOS でだけ設定し、それ以外の
            Linux では設定しない。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0002「エディターの導入」',
              href: '/prd/0002_editor-setup',
            },
            {
              text: 'PRD 0001「開発環境の導入」',
              href: '/prd/0001_environment-setup',
            },
            {
              text: 'ADR 0001「開発環境を Nix flakes で宣言的に管理する」',
              href: '/adr/0001_manage-environment-with-nix-flakes',
            },
            { text: '所有者へのヒアリング（2026-09-28）' },
            {
              text: 'ADR 0006「ノートとタスクを Org 形式で書き、nvim-orgmode と org-roam.nvim で扱う」',
              href: '/adr/0006_use-orgmode-and-org-roam-for-notes-and-tasks',
            },
            {
              text: 'ADR 0014「Neovim のプラグインを lazy.nvim で管理し、版を各プラグインの定義の commit で固定して Renovate で更新を知らせる」',
              href: '/adr/0014_pin-neovim-plugins-by-commit-in-lazy-nvim-specs',
            },
            {
              text: (
                <>
                  <DocLink href="https://github.com/nix-community/home-manager">
                    Home Manager のソース
                  </DocLink>
                  （<Code>modules/programs/neovim/default.nix</Code> の{' '}
                  <Code>nvim/init.lua</Code>、<Code>modules/files.nix</Code> の{' '}
                  <Code>insertFile</Code>）
                </>
              ),
            },
            {
              text: '所有者の依頼（2026-10-04、「最小限」でも Neovim を使えるようにする）',
            },
            {
              text: '所有者の依頼（2026-10-04、「最小限」でも Orgmode と org-roam を Neovim のプラグインとして使う）',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
