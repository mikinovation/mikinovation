import {
  Alternatives,
  Code,
  DocLink,
  DocRef,
  DocSection,
  DocTable,
  Prose,
  Sources,
} from '@/components/doc'
import {
  FigArrow,
  FigCard,
  FigChips,
  FigGrid,
  FigNode,
  FigSvg,
  Figure,
} from '@/components/figure'
import type { DocMeta } from '@/lib/docs'

export const meta = {
  title: 'Neovim を既定エディターにする',
  lead: 'Neovim を既定エディターにし、本体、設定、周辺ツールを Home Manager で管理するという決定を記録する。',
  repository: 'mikinovation',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-11-09' },
  ],
} satisfies DocMeta

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
          以前は導入範囲ごとに Neovim
          の入口を分け、「最小限」ではメモとタスクのプラグインだけを読み込んでいた。
          入口が2つあると、共通の設定にプラグインを前提とした記述が増えるたびに「最小限」が起動できなくなるため、設定が壊れやすかった。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0002" />{' '}
          の要求から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Figure caption="制約は、エディター単体の条件と、エディター内に収める作業に分かれる。">
          <FigGrid wide>
            <FigCard
              tone="neon"
              title="既定のエディターとして"
              note="ほかのツールが文章の入力を求めるときに開き、初回起動では所有者が操作せずに編集機能が揃う"
            />
            <FigCard title="日常的に使う言語で">
              <FigChips
                items={['補完', '診断', '整形', '定義への移動', '名前の変更']}
              />
            </FigCard>
            <FigCard title="エディター内で行える作業">
              <FigChips
                items={[
                  'ファイルの検索',
                  'ツリー表示',
                  'Git の操作',
                  'コンフリクトの解消',
                  'GitHub の Issue と PR',
                  'テストの実行',
                  'データベースへの問い合わせ',
                  'HTTP リクエストの送信',
                  '端末の開閉',
                  'メモとタスクの管理',
                ]}
              />
            </FigCard>
            <FigCard
              title="AI の支援"
              note="入力補完と、ファイルや選択範囲の AI への送信を使える"
            />
          </FigGrid>
        </Figure>
        <Prose>
          <DocRef kind="PRD" number="0001" /> の要求と{' '}
          <DocRef kind="ADR" number="0001" />{' '}
          の決定から、次の条件も満たす必要がある。
        </Prose>
        <Prose>
          どの OS
          でも同じ操作で導入でき、何度導入しても同じ状態になることである。
        </Prose>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          Neovim を既定エディターにする。
          <DocRef kind="ADR" number="0001" /> の共通 Home Manager 設定から、
          <Code>packages/dotfiles/nix/programs/neovim</Code>{' '}
          のモジュールとして導入する。
        </Prose>
        <DocTable
          head={['対象', '決めたこと']}
          rows={[
            [
              '環境変数',
              <>
                <Code>EDITOR</Code> と <Code>VISUAL</Code> を <Code>nvim</Code>{' '}
                にし、<Code>vi</Code>、<Code>vim</Code>、<Code>vimdiff</Code> を
                Neovim の別名にする
              </>,
            ],
            [
              '設定',
              <>
                Lua で書き、Home Manager が <Code>~/.config/nvim</Code>{' '}
                に配置する
              </>,
            ],
            [
              '周辺ツール',
              '言語サーバー、formatter、linter、tree-sitter のパーサーのビルドに使うツールを、Neovim の追加パッケージとして Nix で導入する',
            ],
            [
              '編集機能と開発作業',
              '制約に挙げたものを、プラグインで Neovim 内に収める',
            ],
            [
              'プラグイン',
              <>
                lazy.nvim で管理し、版は <DocRef kind="ADR" number="0014" />{' '}
                のとおり各プラグインの定義の <Code>commit</Code> で固定する
              </>,
            ],
            [
              '共通の設定',
              <>
                <Code>core.lua</Code> と <Code>core_keymaps.lua</Code>{' '}
                に置く。前者は
                leader、オプション、クリップボードを設定し、後者は Neovim
                に組み込まれた機能だけを使うキーマップを設定する
              </>,
            ],
            [
              <>
                <Code>plugins.lua</Code>
              </>,
              <>
                lazy.nvim を取得して起動する <Code>setup(specs)</Code>{' '}
                と、プラグイン定義の一覧を返す <Code>specs()</Code> を持つ
              </>,
            ],
          ]}
        />
        <DocTable
          head={['対象', '扱い']}
          rows={[
            [
              'C コンパイラー',
              'nvim-orgmode が tree-sitter-org の組み立てに使う。Linux は gcc、macOS は clang とする',
            ],
            [
              '起動確認',
              <>
                <Code>nvim</Code>{' '}
                ディレクトリーをそのまま設定に使い、空のデータディレクトリーでプラグインを取得し、エラーなく起動するか確かめる
              </>,
            ],
          ]}
        />
        <Figure caption="設定はディレクトリーごと配置し、入口は init.lua の1つだけにする。">
          <FigSvg
            height={190}
            label="Home Manager が配置した設定を init.lua が読み込み、プラグインの定義は lazy.nvim が取得する構成"
          >
            <FigNode
              x={0}
              y={50}
              w={190}
              h={90}
              tone="neon"
              title="Home Manager"
              lines={['nvim ディレクトリーごと', '~/.config/nvim に配置']}
            />
            <FigArrow
              points={[
                [190, 95],
                [226, 95],
              ]}
            />
            <FigNode
              x={230}
              y={35}
              w={230}
              h={120}
              tone="neon"
              title="init.lua（入口）"
              lines={[
                'core.lua と core_keymaps.lua',
                'plugins.specs() の全定義',
                'lsp と keymaps',
              ]}
            />
            <FigArrow
              points={[
                [460, 95],
                [496, 95],
              ]}
            />
            <FigNode
              x={500}
              y={50}
              w={260}
              h={90}
              tone="ghost"
              title="プラグインの定義"
              lines={['lazy.nvim が初回起動で取得', 'commit で版を固定']}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <DocTable
          head={['決定した要素', '要求を満たせる理由']}
          rows={[
            [
              '端末内で動く',
              '端末中心の作業に合い、macOS、WSL、それ以外の Linux の端末から同じ操作で使える',
            ],
            [
              'Home Manager での宣言',
              '本体、設定、周辺ツールがどの OS でも同じ版と同じ設定になり、何度導入しても状態が変わらない',
            ],
            ['Lua での設定', 'luacheck と busted で設定を検証できる'],
            [
              '入口を1つにする',
              '導入範囲ごとの分岐がなくなり、共通の設定を変えても片方だけが動かなくなることがない',
            ],
            [
              '言語サーバーのクライアントと tree-sitter の内蔵',
              'プラグインも豊富なため、補完、デバッグ、テストの実行をエディター内で行える',
            ],
            [
              'ディレクトリーごとの配置',
              <>
                Home Manager が自動で生成する <Code>init.lua</Code>{' '}
                がリポジトリの <Code>init.lua</Code>{' '}
                に隠れ、配置先の衝突が起きない
              </>,
            ],
          ]}
        />
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
                  端末の外で動くため、端末中心の作業に合わない。また、AI
                  の入力補完と選択範囲の送信は Neovim
                  でもプラグインで満たせるため、エディターに組み込まれた AI
                  機能は Cursor を選ぶ理由にならない。
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
                  端末の外で動くため、端末中心の作業に合わない。また、設定を IDE
                  の中で変更するため、宣言的に管理しにくい。
                </>
              ),
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <DocTable
          head={['領域', '引き受けること']}
          rows={[
            [
              '初回起動',
              'プラグインは Nix ではなく lazy.nvim が初回起動時に取得するため、ネットワークへの接続が必要になる',
            ],
            [
              '壊れた環境の復旧',
              '復旧でも全プラグインと周辺ツールを取得するため、メモとタスクだけを扱う軽い構成を先に入れることはできない',
            ],
            [
              '周辺ツールの保守',
              '言語サーバーなどの周辺ツールのうち nixpkgs にないものは、自前のパッケージとして定義し、保守する',
            ],
            [
              'クリップボード',
              'OS のクリップボードとの共有は WSL と macOS でだけ設定し、それ以外の Linux では設定しない',
            ],
          ]}
        />
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
              text: '所有者の依頼（2026-11-09、導入範囲の区別をやめて1つに統一する）',
            },
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
          ]}
        />
      </DocSection>
    </>
  )
}
