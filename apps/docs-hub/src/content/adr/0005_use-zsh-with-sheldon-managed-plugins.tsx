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
  title: 'シェルに zsh を使い、プラグインを sheldon で管理する',
  lead: 'シェルとして zsh を採用し、設定を Home Manager で生成し、プラグインの取得を sheldon に任せるという決定を記録する。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-09-27' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>
        用語は <DocRef kind="PRD" number="0005" /> と同じ意味で使う。
        非対話の実行は、人が入力せず、スクリプトや AI
        エージェントがコマンドを動かすことを指す。 「すべて」「最小限」は、
        <DocRef kind="PRD" number="0001" /> が定める導入範囲を指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="PRD" number="0005" />{' '}
          は、設定を加えていないシェルでの手数を問題として挙げる。
          所有者はよく使うコマンドを毎回最後まで打ち、過去に打ったコマンドを探して履歴を遡り、深い階層のディレクトリへは移動を重ねる。
          直前のコマンドが失敗しても気付かないまま、次の操作へ進むことがある。
          WSL では、シェルでコピーした内容が Windows 側と行き来しない。
        </Prose>
        <Prose>
          所有者は Nix を導入する前から zsh を使い、プラグインを sheldon
          で管理していた。
          <DocRef kind="ADR" number="0001" /> の決定により環境を Home Manager
          へ移したとき、この設定を宣言的に書き直した。
          シェルとプラグイン管理の新規選定ではなく、既存の設定の引き継ぎが出発点である。
        </Prose>
        <Prose>
          <DocRef kind="ADR" number="0004" /> で導入した Claude Code
          をはじめ、エージェントとスクリプトは非対話でこのシェルを呼ぶ。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0005" />{' '}
          の要求から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>
            WSL、macOS、それ以外の Linux
            で、ログイン時に対象のシェルが開き、開いた直後に入力を受け付ける。
          </Item>
          <Item>
            現在のディレクトリ、Git
            のブランチと変更の有無、直前のコマンドの失敗、長くかかった処理の所要時間を、プロンプトで見られる。
          </Item>
          <Item>
            よく使うコマンドを短い綴りで打て、入力中に過去のコマンドの続きが候補として出る。
          </Item>
          <Item>
            コマンドの構文が色で区別され、コマンド名と引数を補完できる。
          </Item>
          <Item>別のシェルで打ったコマンドを履歴から呼び出せる。</Item>
          <Item>
            履歴を絞り込んで選ぶとその場で実行され、その実行が履歴に残り、同じコマンドは1件にまとまる。
          </Item>
          <Item>
            ディレクトリ名だけで移動でき、過去に訪れた場所へは名前の一部で移動でき、上の階層と直前のディレクトリへ短い入力で戻れる。
          </Item>
          <Item>
            WSL で、シェルからコピーした内容を Windows
            側に貼り付けられ、その逆もできる。
          </Item>
          <Item>
            対話のために加えた機能が、非対話の実行を壊さない。とくに、対話用に上書きした組み込みコマンドを理由として、非対話で実行したコマンドが失敗しない。
          </Item>
        </Bullets>
        <Prose>
          導入については、
          <DocRef kind="PRD" number="0001" /> の要求と{' '}
          <DocRef kind="ADR" number="0001" />{' '}
          の決定から、次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>導入範囲「すべて」「最小限」の両方に含める。</Item>
          <Item>macOS、WSL、それ以外の Linux で同じ手順で導入できる。</Item>
          <Item>導入後に手作業で設定しなくても使える。</Item>
        </Bullets>
        <Prose>
          <DocRef kind="ADR" number="0001" />{' '}
          は、導入するものの版を固定し、何度導入してもどのマシンでも同じ状態になることを決めている。
          シェルのプラグインについては、これを望ましい条件として扱い、必須とはしない。
          その判断の理由は決定理由に書く。
        </Prose>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          シェルとして zsh を採用し、設定は <DocRef kind="ADR" number="0001" />{' '}
          の共通の Home Manager 設定から生成する。
          導入範囲は「すべて」「最小限」の両方に含める。
        </Prose>
        <Bullets>
          <Item>
            既定シェルにする仕組みは OS ごとに分ける。NixOS と macOS
            では、それぞれ NixOS と nix-darwin
            が持つユーザーのシェル設定で指定する。それ以外の Linux では、Home
            Manager の activation が <Code>/etc/shells</Code> へ追記して{' '}
            <Code>chsh</Code> を実行する。
          </Item>
          <Item>
            プラグインの取得は sheldon に任せる。Home Manager が{' '}
            <Code>plugins.toml</Code> を配置し、そこには GitHub
            のリポジトリ名だけを書いて版を指定しない。読み込むのは
            oh-my-zsh、Powerlevel10k、zsh-autosuggestions、zsh-syntax-highlighting、zsh-completions、zsh-abbr、zsh-defer
            とする。
          </Item>
          <Item>
            プロンプトは Powerlevel10k とする。instant prompt を有効にし、Home
            Manager が <Code>.p10k.zsh</Code>{' '}
            を配置し、設定ウィザードは環境変数で止める。プロンプトにはディレクトリ、Git
            の状態、直前の終了コード、3秒を超えた処理の所要時間を出す。
          </Item>
          <Item>
            短縮入力は zsh-abbr で行い、git、docker、nvim
            の綴りを定義する。ディレクトリ移動は zoxide を使う。
          </Item>
          <Item>
            履歴の絞り込みは自前の zsh 関数 <Code>cmi</Code> で行う。
            <Code>fc</Code> が返す履歴から重複を1件にまとめて fzf
            で選ばせ、選んだコマンドを履歴へ残してから実行する。キーバインドは割り当てず、
            <Code>cmi</Code> と打って呼ぶ。fzf
            はこの関数の中だけで使い、キーバインドと補完はシェルへ入れない。
          </Item>
          <Item>
            履歴の共有と階層移動には設定を書かず、Home Manager の既定（
            <Code>SHARE_HISTORY</Code> ほか）と oh-my-zsh の既定（
            <Code>auto_cd</Code>、<Code>...</Code>{' '}
            系のグローバルエイリアス）に任せる。
          </Item>
          <Item>
            <Code>.zshenv</Code> に PATH と fnm の設定を置き、
            <Code>.zshrc</Code> に対話用の読み込みを置く。zoxide
            は対話シェルでは <Code>cd</Code>、非対話シェルでは <Code>z</Code>{' '}
            として初期化する。zsh は非対話シェルでは <Code>.zshrc</Code>{' '}
            を読まないため、この書き分けが効くのは、<Code>.zshrc</Code>{' '}
            を読ませたうえで非対話でコマンドを動かす呼び出し（Claude Code
            のシェルスナップショットなど）である。
          </Item>
          <Item>
            WSL のクリップボード連携とロケールは <Code>wsl.zsh</Code> に分け、
            <Code>/proc/version</Code> を見て WSL
            でだけ有効にする。クリップボードの読み書きには <Code>clip.exe</Code>{' '}
            と <Code>powershell.exe</Code> を使う。
          </Item>
        </Bullets>
        <Figure caption="非対話でも読む設定と、対話でだけ読む設定を分け、WSL 固有の設定は条件付きで読む。">
          <FigSvg
            height={240}
            label="zshenv と zshrc の読み込み経路と、対話シェルで有効になる機能の構成"
          >
            <FigNode
              x={0}
              y={30}
              w={180}
              h={76}
              title=".zshenv"
              lines={['PATH と fnm', '非対話でも読まれる']}
            />
            <FigArrow
              points={[
                [90, 106],
                [90, 146],
              ]}
            />
            <FigNode
              x={0}
              y={150}
              w={180}
              h={76}
              tone="neon"
              title=".zshrc"
              lines={['対話シェルで読まれる']}
            />
            <FigArrow
              points={[
                [180, 188],
                [226, 188],
              ]}
              tone="neon"
            />
            <FigNode
              x={230}
              y={150}
              w={190}
              h={76}
              tone="amber"
              title="wsl.zsh"
              lines={['/proc/version を見て', 'WSL でだけ読む']}
            />
            <FigArrow
              points={[
                [180, 170],
                [205, 170],
                [205, 36],
                [456, 36],
              ]}
              tone="neon"
            />
            <FigNode
              x={460}
              y={10}
              w={300}
              h={52}
              title="sheldon"
              lines={['プラグインを取得（版は指定しない）']}
            />
            <FigArrow
              points={[
                [205, 170],
                [205, 94],
                [456, 94],
              ]}
              tone="neon"
            />
            <FigNode
              x={460}
              y={68}
              w={300}
              h={52}
              title="Powerlevel10k"
              lines={['instant prompt と状態の表示']}
            />
            <FigArrow
              points={[
                [205, 170],
                [205, 152],
                [456, 152],
              ]}
              tone="neon"
            />
            <FigNode
              x={460}
              y={126}
              w={300}
              h={52}
              title="zsh-abbr と zoxide"
              lines={['短い綴りの展開と移動']}
            />
            <FigArrow
              points={[
                [205, 188],
                [205, 210],
                [456, 210],
              ]}
              tone="neon"
            />
            <FigNode
              x={460}
              y={184}
              w={300}
              h={52}
              title="cmi"
              lines={['履歴を fzf で絞り込む自前の関数']}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            zsh
            は、所有者が持つ既存の設定（oh-my-zsh、Powerlevel10k、zsh-abbr）をそのまま使えるため、書き直しの手間なしに{' '}
            <DocRef kind="PRD" number="0005" /> の要求を満たせる。
          </Item>
          <Item>
            oh-my-zsh、Powerlevel10k、zsh-abbr と、それらを取得する sheldon
            は、いずれも zsh を前提とする。sheldon が対応するシェルは bash と
            zsh だけである。
          </Item>
          <Item>
            既定シェルを管理する主体は OS
            ごとに違うため、その主体に合わせて仕組みを分ける。
          </Item>
          <Item>
            sheldon は既存の <Code>plugins.toml</Code>{' '}
            をそのまま使えるため、プラグインの管理を書き直す手間がかからない。
          </Item>
          <Item>
            プラグインの版は固定しない。固定するには <Code>plugins.toml</Code>{' '}
            を Home Manager
            のプラグイン設定へ書き直す必要がある。版がずれても影響は対話の入力補助にとどまるため、書き直しの手間を避ける側を採った。
          </Item>
          <Item>
            Powerlevel10k は instant prompt
            を持ち、プラグインの読み込みを待たずにプロンプトを出せるため、開いた直後に入力を受け付けるという制約を満たせる。
          </Item>
          <Item>
            自前の関数 <Code>cmi</Code>{' '}
            は、選んだコマンドをその場で実行して履歴へ残し、同じコマンドを1件にまとめる。この2点が履歴の絞り込みに関する制約そのもので、既存のウィジェットでは満たせない。
          </Item>
          <Item>
            zoxide は Home Manager
            のモジュールを使わず手書きで初期化する。対話では <Code>cd</Code>{' '}
            を置き換え、非対話では <Code>z</Code>{' '}
            にする必要があり、モジュールが生成する1行の初期化では書き分けられない。fzf
            は <Code>cmi</Code>{' '}
            からコマンドとして呼ぶだけなので、シェルへの組み込みはいらない。
          </Item>
          <Item>
            zsh-abbr
            は入力行に完全なコマンドを展開するため、実行前に内容を確認でき、履歴にも完全な形で残る。
          </Item>
          <Item>
            <Code>clip.exe</Code> と <Code>powershell.exe</Code> は WSL
            に最初からあるため、追加の入手がいらず、導入後の手作業なしでクリップボードを共有できる。
          </Item>
          <Item>
            PATH と fnm の設定を <Code>.zshenv</Code>{' '}
            に置くのは、非対話の実行でも fnm が管理する Node.js
            を使うためである。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: 'fish',
              reason:
                '独自の構文を持ち、既存の設定をそのまま使えない。oh-my-zsh、Powerlevel10k、zsh-abbr はいずれも fish で動かず、sheldon も fish に対応しないため、プラグイン管理から作り直すことになる。',
            },
            {
              option: 'bash',
              reason:
                '移行の手間は小さいが、候補の提示、構文の着色、補完に関する制約を満たすプラグインが、zsh ほど揃っていない。',
            },
            {
              option: 'Home Manager のプラグイン設定',
              reason: (
                <>
                  nixpkgs のパッケージを使うため <Code>flake.lock</Code>{' '}
                  で版を固定でき、必要なプラグインも nixpkgs
                  に揃っている。版の固定という点では優れるが、既存の{' '}
                  <Code>plugins.toml</Code>{' '}
                  を書き直す必要があり、その手間に見合わない。
                </>
              ),
            },
            {
              option: 'starship',
              reason:
                '3 OS で同じ設定を使え、Nix で版も固定できる。ただし instant prompt に当たる仕組みがなく、開いた直後に入力を受け付けるという制約を満たしにくい。',
            },
            {
              option: (
                <>
                  fzf が持つ <Code>Ctrl-R</Code> の履歴ウィジェット
                </>
              ),
              reason:
                '選んだコマンドを入力行に置くだけで実行せず、重複もまとめないため、履歴の絞り込みに関する制約を満たせない。',
            },
            {
              option: 'atuin',
              reason:
                '別の履歴データベースを持ち込むため、zsh の履歴ファイルを共有する仕組みと二重になる。',
            },
            {
              option: 'エイリアス',
              reason:
                '入力行に展開されないため、履歴には短い綴りのまま残り、後から何を実行したか分からない。',
            },
            {
              option: 'win32yank',
              reason:
                'WSL のクリップボードを共有できるが、別途バイナリを配置する必要があり、導入後に手作業なしで使えるという制約を満たせない。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            プラグインの版は、そのマシンで初めてシェルを開いた時点のもので止まる。版を記録する{' '}
            <Code>plugins.lock</Code> は <Code>~/.local/share/sheldon</Code>{' '}
            にあってリポジトリの管理下になく、更新する仕組みもないため、マシン間で版が揃わない。
            <DocRef kind="ADR" number="0001" />{' '}
            が挙げた版の固定と冪等性を、プラグインについては満たしていない。
          </Item>
          <Item>
            初めてシェルを開くとき、sheldon が GitHub
            から取得するためネットワークが必要になる。取得できなければプロンプトと入力補助が使えない。
          </Item>
          <Item>
            環境変数 <Code>ZSH</Code> は sheldon の取得先を指す。
            <Code>plugins.toml</Code> から oh-my-zsh
            を外すと、この変数が無効なパスを指し、<Code>auto_cd</Code> と{' '}
            <Code>...</Code> 系のエイリアスによる階層移動も失われる。
          </Item>
          <Item>
            履歴の共有は Home Manager
            の既定に依存する。その既定が変われば、別のシェルで打ったコマンドを呼び出せる状態が、知らないうちに失われる。
          </Item>
          <Item>
            <Code>abbr.zsh</Code>、<Code>fzf.zsh</Code>、<Code>wsl.zsh</Code> は
            Home Manager が配置せず、<Code>DOTFILES_DIR</Code>{' '}
            が指すリポジトリのパスから読み込む。リポジトリをこのパスに置かないと、短縮入力、履歴の絞り込み、WSL
            のクリップボード連携が、知らないうちに失われる。
          </Item>
          <Item>
            Powerlevel10k のアイコン表示は Nerd Font
            を前提とするが、リポジトリは Nerd Font
            を入れていない。端末を動かす側で用意する必要がある。
          </Item>
          <Item>
            <Code>.p10k.zsh</Code>{' '}
            は1843行のウィザード生成物をリポジトリで管理しており、手で読み書きする前提ではない。
          </Item>
          <Item>
            zsh の設定には lint もテストもないため、変更の確認は手作業になる。
          </Item>
          <Item>
            <Code>.zshrc</Code>{' '}
            を読ませたうえで非対話でコマンドを動かす呼び出しでは、
            <Code>cd</Code> が zoxide
            に置き換わらないため、エージェントとスクリプトの手順で{' '}
            <Code>cd</Code> をそのまま使える。代わりに、名前の一部での移動は{' '}
            <Code>z</Code> になる。<Code>.zshrc</Code>{' '}
            を読まない非対話シェルでは zoxide が初期化されず、<Code>cd</Code>{' '}
            は組み込みのまま動き、<Code>z</Code> は使えない。
          </Item>
          <Item>
            導入範囲「最小限」でも zsh、sheldon、zoxide、fzf
            が入り、同じ操作を使える。fnm は「すべて」にだけ入るが、
            <Code>.zshenv</Code> の fnm
            の設定は存在を確かめてから動くため、「最小限」でもエラーにならない。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0005「シェル環境の導入」',
              href: '/prd/0005_shell-setup',
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
              text: 'ADR 0004「Claude Code を Home Manager で宣言的に管理する」',
              href: '/adr/0004_manage-claude-code-with-home-manager',
            },
            { text: '所有者へのヒアリング（2026-09-30）' },
          ]}
        />
      </DocSection>
    </>
  )
}
