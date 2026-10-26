import {
  Alternatives,
  Bullets,
  Code,
  DocLink,
  DocRef,
  DocSection,
  Item,
  Prose,
  Sources,
} from '@/components/doc'
import { FigArrow, FigNode, FigSvg, Figure } from '@/components/figure'

export const meta = {
  title:
    'Neovim のプラグインを lazy.nvim で管理し、版を各プラグインの定義の commit で固定して Renovate で更新を知らせる',
  lead: 'Neovim のプラグインの取得と読み込みを lazy.nvim に任せ、各プラグインの版を定義の commit で固定して定義を版の記録とし、新しい版を Renovate で週に1回まとめて知らせるという決定を記録する。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-10-04' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>
        用語は <DocRef kind="PRD" number="0008" /> と同じ意味で使う。
        エディターは、
        <DocRef kind="ADR" number="0002" /> で既定エディターにした Neovim
        を指す。 プラグインの定義は、
        <Code>
          packages/dotfiles/nix/programs/neovim/nvim/plugins/{'<'}名前{'>'}
          /init.lua
        </Code>{' '}
        が返す lazy.nvim の spec を指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="PRD" number="0008" /> は2つの問題を挙げる。
          プラグインの版がマシンごとにずれると、同じ設定でもマシンによって挙動が変わり、エラーが出るマシンが生じる。
          プラグインをマシンごとに手作業で揃えるには手間がかかる。
        </Prose>
        <Prose>
          <DocRef kind="ADR" number="0002" /> は当初、プラグインを lazy.nvim
          で管理し、版をリポジトリの <Code>lazy-lock.json</Code>{' '}
          で固定すると決めていた。 ところが、その <Code>lazy-lock.json</Code>{' '}
          は定義と食い違っていた。 削除した nvim-cmp
          系のプラグインが残り、使っている blink.cmp が載っていなかった。
          nvim-treesitter は旧 <Code>master</Code>{' '}
          ブランチのコミットのままで、今の定義が呼ぶ API がなかった。 CI
          の起動確認は <Code>:Lazy! sync</Code>{' '}
          で各プラグインの最新版を使うため、この食い違いを見つけられなかった。
        </Prose>
        <Prose>
          <Code>:Lazy update</Code>{' '}
          は、定義に版の指定がないプラグインを最新版へ進め、
          <Code>lazy-lock.json</Code> を書き換える。
          版の記録が定義と別のファイルにあるため、更新の操作一つで記録と定義が離れていく。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0008" />{' '}
          の要求から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>初回起動時に、所有者が操作せずに全プラグインが揃う。</Item>
          <Item>どのマシンでも、版の記録どおりの版のプラグインが入る。</Item>
          <Item>
            所有者がプラグインの版を更新し、その結果を版の記録としてリポジトリに残せる。
          </Item>
          <Item>
            所有者が更新の操作をしない限り、プラグインの版が変わらない。
          </Item>
          <Item>プラグインを、使うときに読み込む。</Item>
          <Item>
            取得時に組み立てが必要なプラグインも、所有者が道具を手作業で導入せずに使える。
          </Item>
          <Item>プラグインの設定の誤りを、変更のたびに自動で見つける。</Item>
        </Bullets>
        <Prose>所有者は、次のことも求める。</Prose>
        <Bullets>
          <Item>
            <Code>:Lazy update</Code> で版が変わらない。
          </Item>
          <Item>
            版の記録は定義そのものとし、別のファイルとの食い違いを生まない。
          </Item>
          <Item>
            新しい版を週に1回まとめて知らせ、取り込むかを所有者が決められる。
          </Item>
        </Bullets>
        <Prose>
          <DocRef kind="ADR" number="0001" /> と{' '}
          <DocRef kind="ADR" number="0002" /> から、次の条件も満たす必要がある。
        </Prose>
        <Bullets>
          <Item>
            設定は Lua で書き、Home Manager が <Code>~/.config/nvim</Code>{' '}
            に配置する。
          </Item>
          <Item>組み立てに使う道具は Nix で導入する。</Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          Neovim のプラグインは lazy.nvim で取得し、読み込む。
          版の記録は、各プラグインの定義の <Code>commit</Code> とする。
        </Prose>
        <Bullets>
          <Item>
            すべてのプラグインの定義に、40文字のコミットハッシュで{' '}
            <Code>commit</Code> を書く。<Code>version</Code> と <Code>tag</Code>{' '}
            は書かない。
          </Item>
          <Item>
            各定義の <Code>commit</Code>{' '}
            の直前に、追う対象を1つ書く。既定のブランチを追うプラグインは{' '}
            <Code>branch</Code> を書く。リリースを追うプラグインは{' '}
            <Code>
              -- renovate: tag={'<'}タグ{'>'}
            </Code>{' '}
            のコメントを書く。リリースを追うのは
            blink.cmp、git-conflict.nvim、toggleterm.nvim、org-roam.nvim
            とする。
          </Item>
          <Item>
            別の定義の <Code>dependencies</Code> に{' '}
            <Code>"作者/リポジトリ"</Code>{' '}
            の文字列だけで書いたプラグインは、そのプラグイン自身の定義の{' '}
            <Code>commit</Code> で固定する。
          </Item>
          <Item>
            lazy.nvim 自体は、<Code>plugins.lua</Code> の{' '}
            <Code>LAZY_COMMIT</Code>{' '}
            で固定する。初回起動時の取得ではこのコミットを checkout し、
            <Code>lazy.setup</Code> にも同じコミットの spec を渡す。
          </Item>
          <Item>
            <Code>lazy.setup</Code> の <Code>lockfile</Code> は{' '}
            <Code>stdpath("state")</Code> 配下に置く。lazy.nvim
            はロックファイルを必ず書くが、リポジトリでは管理しない。
          </Item>
          <Item>
            新しい版は Renovate の regex マネージャーで検知する。
            <Code>branch</Code> のプラグインと lazy.nvim は{' '}
            <Code>git-refs</Code>{' '}
            データソースでブランチの最新コミットを、タグのプラグインは{' '}
            <Code>github-tags</Code>{' '}
            データソースで新しいタグとそのコミットを調べる。
          </Item>
          <Item>
            Neovim のプラグインの更新は、<Code>neovim plugins</Code> グループの
            PR 1つにまとめ、月曜の午前5時前（UTC）にだけ作る。メジャー更新も同じ
            PR に入れる。
          </Item>
          <Item>
            版の更新は、所有者が Renovate の PR をマージするか、定義の{' '}
            <Code>commit</Code> を書き換えてコミットする。各マシンには{' '}
            <Code>:Lazy sync</Code> で反映する。
          </Item>
          <Item>
            lazy.nvim の新しい版の確認（<Code>checker</Code>）は有効にしない。
          </Item>
          <Item>
            各プラグインの定義は{' '}
            <Code>
              plugins/{'<'}名前{'>'}/init.lua
            </Code>{' '}
            に置き、<Code>event</Code>、<Code>cmd</Code>、<Code>keys</Code>、
            <Code>ft</Code> のいずれかで読み込む契機を指定する。Neovim
            に組み込まれた使わない runtime プラグインは、
            <Code>performance.rtp.disabled_plugins</Code> で読み込まない。
          </Item>
          <Item>
            取得時に組み立てが必要なプラグインは、lazy.nvim の{' '}
            <Code>build</Code> で組み立てる。組み立てに使う
            cargo、make、yarn、npm、tree-sitter、C コンパイラー、luarocks
            は、Neovim の追加パッケージと、Rust と Node.js の Home Manager
            モジュールで Nix から導入する。
          </Item>
          <Item>
            設定の誤りは、dotfiles の CI で変更のたびに確かめる。busted
            で、定義の形式と、全定義に <Code>commit</Code> があること、
            <Code>branch</Code>{' '}
            かタグのコメントのどちらか一方があること、文字列だけの依存がいずれかの定義で固定されていることを検証する。Neovim
            をヘッドレスで起動して、起動時のエラーがないことも確かめる。
          </Item>
        </Bullets>
        <Figure caption="定義の commit を版の記録とし、更新は Renovate の提案を取り込んだときだけ動く。">
          <FigSvg
            height={245}
            label="定義の commit を記録として lazy.nvim が取得し、Renovate が更新を提案し、CI が定義を検証する構成"
          >
            <FigNode
              x={250}
              y={0}
              w={510}
              h={56}
              tone="amber"
              title="Renovate（月曜に1つの PR）"
              lines={['git-refs と github-tags で新しい版を調べる']}
            />
            <FigArrow
              points={[
                [250, 28],
                [95, 28],
                [95, 76],
              ]}
            />

            <FigNode
              x={0}
              y={80}
              w={190}
              h={80}
              tone="neon"
              title="定義の commit"
              lines={['版の記録', 'branch かタグを併記']}
            />
            <FigArrow
              points={[
                [190, 120],
                [246, 120],
              ]}
              tone="neon"
            />
            <FigNode
              x={250}
              y={80}
              w={190}
              h={80}
              title="lazy.nvim"
              lines={['初回起動で取得', 'Lazy sync で反映']}
            />
            <FigArrow
              points={[
                [440, 120],
                [496, 120],
              ]}
            />
            <FigNode
              x={500}
              y={80}
              w={260}
              h={80}
              tone="mint"
              title="各マシンの Neovim"
              lines={['どのマシンでも同じ版']}
            />

            <FigArrow
              points={[
                [95, 160],
                [95, 186],
              ]}
              tone="soft"
            />
            <FigNode
              x={0}
              y={190}
              w={760}
              h={52}
              tone="ghost"
              lines={[
                'CI は busted で定義の形式と commit の有無を確かめ、ヘッドレス起動でエラーがないことを確かめる',
              ]}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            lazy.nvim は、checkout の対象を定義の <Code>commit</Code>、
            <Code>tag</Code>、<Code>version</Code> の順に決める。
            <Code>commit</Code> があれば <Code>:Lazy update</Code> も{' '}
            <Code>:Lazy sync</Code> もそのコミットを checkout
            するため、更新の操作で版が変わらない。
          </Item>
          <Item>
            <Code>:Lazy restore</Code>{' '}
            だけは、ロックファイルの版を定義より優先する。ロックファイルをリポジトリから外し、各マシンの
            state に置けば、リポジトリに定義と食い違う版の記録が残らない。
          </Item>
          <Item>
            版が定義と同じファイルにあるため、プラグインを足すときも外すときも、版の記録が一緒に変わる。食い違いは
            busted で見つかる。
          </Item>
          <Item>
            定義の <Code>commit</Code> を書き換えたあと <Code>:Lazy sync</Code>{' '}
            を実行すれば、取得済みの既存のマシンでも定義どおりの版になる。
          </Item>
          <Item>
            ロックファイルのパスを <Code>DOTFILES_DIR</Code>{' '}
            から組み立てる必要がなくなるため、環境変数がない状態で起動しても版は定義どおりになる。
          </Item>
          <Item>
            lazy.nvim を <Code>LAZY_COMMIT</Code>{' '}
            で固定すると、初回の取得から定義どおりの版で動く。
          </Item>
          <Item>
            Renovate の regex マネージャーは、<Code>commit</Code>{' '}
            だけでは追う対象を決められず、ブランチ名かタグ名を求める。
            <Code>branch</Code> は lazy.nvim では <Code>commit</Code>{' '}
            に優先されないため、定義の動きを変えずに追う対象を示せる。
          </Item>
          <Item>
            <Code>git-refs</Code> と <Code>git-tags</Code> は、annotated tag
            ではタグ自体のハッシュを返す。<Code>github-tags</Code>{' '}
            はタグをたどってコミットのハッシュを返すため、定義に書くコミットと比べられる。
          </Item>
          <Item>
            更新を1つの PR
            にまとめて週に1回にすると、70を超えるプラグインの更新を一度に確かめられ、PR
            の数が抑えられる。PR
            をマージしない限り版は変わらないため、更新の操作をしない限り版が変わらないという要求も満たす。
          </Item>
          <Item>
            CI の <Code>:Lazy! sync</Code> も定義の <Code>commit</Code> を
            checkout するため、版の記録どおりの組み合わせで起動を確かめられる。
          </Item>
          <Item>
            lazy.nvim
            は、プラグインごとに読み込む契機を宣言できるため、使わないプラグインを起動時に読み込まない。
          </Item>
          <Item>
            <Code>build</Code> に必要な道具を Nix
            で導入すれば、所有者が道具を手作業で導入せずに、組み立てが必要なプラグインを使える。
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
                  リポジトリの <Code>lazy-lock.json</Code> で固定する案（
                  <DocRef kind="ADR" number="0002" /> の当初の決定）
                </>
              ),
              reason: (
                <>
                  <Code>:Lazy update</Code>{' '}
                  が版を進めてロックファイルを書き換える。版の記録が定義と別のファイルにあるため、食い違っても気付きにくく、実際に食い違っていた。
                </>
              ),
            },
            {
              option: (
                <>
                  <Code>pin = true</Code> で更新を止める案
                </>
              ),
              reason: (
                <>
                  取得済みのプラグインは定義の <Code>commit</Code>{' '}
                  を書き換えても checkout
                  されないため、版の更新を既存のマシンへ反映できない。
                </>
              ),
            },
            {
              option: (
                <>
                  <Code>:Lazy update</Code> のコマンドを上書きして無効にする案
                </>
              ),
              reason: (
                <>
                  lazy.nvim の画面のキー操作や <Code>:Lazy sync</Code>{' '}
                  からの更新は止められず、版の記録が別のファイルにある問題も残る。
                </>
              ),
            },
            {
              option: (
                <>
                  lazy.nvim の <Code>checker</Code> で新しい版を知らせる案
                </>
              ),
              reason: (
                <>
                  各マシンで Neovim を開いたときにしか知らされず、更新の結果は{' '}
                  <Code>:Lazy update</Code>{' '}
                  で版を進める操作になるため、定義を正とする方針と合わない。
                </>
              ),
            },
            {
              option: 'プラグインごとに Renovate の PR を作る案',
              reason:
                '70を超えるプラグインの PR が別々に作られ、確かめる手間が大きい。',
            },
            {
              option: (
                <>
                  タグのプラグインを <Code>git-tags</Code>{' '}
                  データソースで調べる案
                </>
              ),
              reason:
                'GitHub のトークンなしで調べられるが、annotated tag のタグ自体のハッシュを返すため、blink.cmp で偽の更新が出る。',
            },
            {
              option: (
                <>
                  Home Manager の <Code>programs.neovim.plugins</Code> で
                  nixpkgs のプラグインを導入する案
                </>
              ),
              reason: (
                <>
                  <Code>flake.lock</Code>{' '}
                  で版を固定でき、初回起動にネットワークもいらない。ただし、nixpkgs
                  にないプラグインは自前でパッケージを定義して保守する必要があり、プラグインの版を上げる時期が
                  nixpkgs
                  の更新に縛られる。また、プラグインごとに読み込む契機を宣言する仕組みを、別に用意する必要がある。
                </>
              ),
            },
            {
              option: 'nixvim などの Nix で Neovim の設定を書く仕組み',
              reason: (
                <>
                  版の固定と遅延読み込みを Nix で書けるが、設定を Nix
                  で書き直す必要があり、
                  <DocRef kind="ADR" number="0002" /> が決めた、設定を Lua
                  で書いて luacheck と busted で検証する方針と合わない。
                </>
              ),
            },
            {
              option: (
                <>
                  Neovim 本体のプラグイン管理（<Code>vim.pack</Code>）
                </>
              ),
              reason:
                'Neovim 0.12 で加わったもので、CI で起動を確かめている Neovim 0.11 では使えない。また、読み込む契機の宣言を自前で書く必要がある。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            初回起動では、lazy.nvim とプラグインを GitHub
            から取得するため、ネットワークへの接続が必要になる。
          </Item>
          <Item>
            版を上げる手段は、Renovate の PR のマージか、定義の{' '}
            <Code>commit</Code> の手での書き換えになる。
            <Code>:Lazy update</Code> は版を上げる手段ではなくなる。
          </Item>
          <Item>
            新しい版が出ても、知らされるのは月曜の PR
            までになる。急ぐ更新は、定義を手で書き換えるか、Renovate の
            Dependency Dashboard から PR を作らせる。
          </Item>
          <Item>
            <Code>branch</Code>{' '}
            のプラグインは、リリースではなくブランチの最新コミットへ更新される。上流がブランチの名前を変えると
            Renovate は最新コミットを調べられず、lazy.nvim
            の取得も失敗するため、定義の <Code>branch</Code> を直す必要がある。
          </Item>
          <Item>
            メジャー更新も同じ PR に入るため、所有者が PR
            の中身を見て、取り込まないプラグインを外す必要がある。
          </Item>
          <Item>
            定義の <Code>commit</Code>{' '}
            を書き換えて取り込んだあとも、既存のマシンでは{' '}
            <Code>:Lazy sync</Code> を実行するまで版が変わらない。
            <Code>:Lazy restore</Code>{' '}
            はそのマシンの古いロックファイルへ戻すため、使わない。
          </Item>
          <Item>
            版の条件で選んでいた blink.cmp（<Code>1.*</Code>
            ）、git-conflict.nvim（<Code>2.0.0</Code>）、toggleterm.nvim（
            <Code>*</Code>
            ）は、そのとき選ばれていたタグのコミットで固定し、そのタグをコメントに書く。
          </Item>
          <Item>
            手で書き換えるときは、annotated tag
            のハッシュではなく、タグが指すコミットのハッシュを書く必要がある。busted
            は40文字の16進数であることだけを確かめ、どちらのハッシュかは区別しない。
          </Item>
          <Item>
            タグのプラグインの検知には GitHub のトークンが要る。Renovate の
            GitHub App は持っているが、手元で Renovate
            を動かすときはトークンを渡さないとこの4つが検知されない。
          </Item>
          <Item>
            文字列だけで書いた依存を固定する定義が <Code>lazy.setup</Code>{' '}
            に渡されていないと、その依存は固定されない。busted
            は定義の存在を確かめるが、<Code>lazy.setup</Code>{' '}
            に渡されているかは確かめない。
          </Item>
          <Item>
            リポジトリの <Code>lazy-lock.json</Code> を削除し、Home Manager が{' '}
            <Code>~/.config/nvim</Code>{' '}
            を配置するときにこのファイルを除く指定もなくす。
            <DocRef kind="ADR" number="0002" /> と{' '}
            <DocRef kind="ADR" number="0006" />{' '}
            の版の固定の記述も、この決定に合わせて改めた。
          </Item>
          <Item>
            組み立てが必要なプラグインは、組み立てに使う道具が導入範囲「すべて」の
            Rust と Node.js
            のモジュールにあることを前提とする。これらのモジュールから道具を外すと、そのプラグインが使えなくなる。
          </Item>
          <Item>
            プラグインの組み立ては lazy.nvim が初回起動時に行うため、Nix
            のビルドとは異なり、何度導入しても同じ成果物になるとは限らない。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0008「エディターのプラグイン管理」',
              href: '/prd/0008_editor-plugin-management',
            },
            {
              text: 'PRD 0002「エディターの導入」',
              href: '/prd/0002_editor-setup',
            },
            {
              text: 'ADR 0001「開発環境を Nix flakes で宣言的に管理する」',
              href: '/adr/0001_manage-environment-with-nix-flakes',
            },
            {
              text: 'ADR 0002「Neovim を既定エディターにする」',
              href: '/adr/0002_use-neovim-as-default-editor',
            },
            {
              text: 'ADR 0006「ノートとタスクを Org 形式で書き、nvim-orgmode と org-roam.nvim で扱う」',
              href: '/adr/0006_use-orgmode-and-org-roam-for-notes-and-tasks',
            },
            {
              text: 'packages/dotfiles/nix/programs/neovim/default.nix',
              href: 'https://github.com/mikinovation/mikinovation/blob/main/packages/dotfiles/nix/programs/neovim/default.nix',
            },
            {
              text: 'packages/dotfiles/nix/programs/neovim/nvim/plugins.lua',
              href: 'https://github.com/mikinovation/mikinovation/blob/main/packages/dotfiles/nix/programs/neovim/nvim/plugins.lua',
            },
            {
              text: 'packages/dotfiles/nix/programs/neovim/nvim/plugins/plugin_spec_spec.lua',
              href: 'https://github.com/mikinovation/mikinovation/blob/main/packages/dotfiles/nix/programs/neovim/nvim/plugins/plugin_spec_spec.lua',
            },
            {
              text: 'packages/dotfiles/scripts/nvim-smoke-test.sh',
              href: 'https://github.com/mikinovation/mikinovation/blob/main/packages/dotfiles/scripts/nvim-smoke-test.sh',
            },
            {
              text: '.github/workflows/dotfiles-ci.yml',
              href: 'https://github.com/mikinovation/mikinovation/blob/main/.github/workflows/dotfiles-ci.yml',
            },
            {
              text: 'renovate.json',
              href: 'https://github.com/mikinovation/mikinovation/blob/main/renovate.json',
            },
            {
              text: (
                <>
                  <DocLink href="https://github.com/folke/lazy.nvim">
                    lazy.nvim のソース
                  </DocLink>
                  （<Code>lua/lazy/manage/git.lua</Code> の{' '}
                  <Code>get_target</Code>、
                  <Code>lua/lazy/manage/task/git.lua</Code> の{' '}
                  <Code>checkout</Code>）
                </>
              ),
            },
            {
              text: (
                <>
                  所有者の依頼（2026-10-04、<Code>:Lazy update</Code>{' '}
                  を防ぎ定義を正とする）
                </>
              ),
            },
            {
              text: '所有者の依頼（2026-10-04、Renovate で新しい版を週に1回まとめて知らせる）',
            },
            {
              text: (
                <>
                  <DocLink href="https://github.com/renovatebot/renovate">
                    Renovate のソース
                  </DocLink>
                  （<Code>git-refs</Code>、<Code>git-tags</Code>、
                  <Code>github-tags</Code> データソースの <Code>getDigest</Code>
                  ）と、v41 での手元のドライラン
                </>
              ),
            },
          ]}
        />
      </DocSection>
    </>
  )
}
