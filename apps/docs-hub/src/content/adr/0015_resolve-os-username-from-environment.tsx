import {
  Alternatives,
  Code,
  DocRef,
  DocSection,
  DocTable,
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
import type { DocMeta } from '@/lib/docs'

export const meta = {
  title:
    '設定する OS のユーザー名を flake に書かず、評価時に環境変数から決める',
  lead: 'flake の出力に OS のユーザー名を書かず、導入時の環境変数から設定するユーザーを決めて、同じ出力をどのユーザー名でも使えるようにするという決定を記録する。',
  repository: 'mikinovation',
  attributes: [
    { label: '読者', value: '技術責任者、開発者、将来の保守者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-10-06' },
  ],
} satisfies DocMeta

export default function Body() {
  return (
    <>
      <Prose>
        この ADR は、
        <DocRef kind="ADR" number="0001" /> のうち「ユーザー名を flake
        の出力に書く」という部分を置き換える。 1つの flake と共通の Home Manager
        設定で全 OS の環境を定義するという <DocRef kind="ADR" number="0001" />{' '}
        の決定は変えない。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="ADR" number="0001" /> は、ユーザー名を flake
          の出力に書くと決めていた。
          そのため、出力ごとにユーザー名が固定されていた。
        </Prose>
        <DocTable
          head={['OS', '出力', '固定されていたユーザー名']}
          rows={[
            [
              'WSL',
              <>
                <Code>nixosConfigurations.nixos</Code>
              </>,
              <>
                <Code>nixos</Code>
              </>,
            ],
            [
              'macOS',
              <>
                <Code>darwinConfigurations.mac</Code>
              </>,
              <>
                <Code>mikinovation</Code>
              </>,
            ],
            [
              'それ以外の Linux',
              <>
                <Code>
                  homeConfigurations.{'<'}ユーザー名{'>'}
                </Code>
              </>,
              <>
                <Code>mikinovation</Code> と <Code>nixos</Code>
              </>,
            ],
          ]}
        />
        <Prose>
          マシンのユーザー名が flake
          に書かれた名前と異なると、そのマシンには導入できない。
          新しいユーザー名のマシンで導入するたびに、flake
          に出力を書き足す必要があった。 それ以外の Linux
          では、同じ内容の出力がユーザー名の数だけ並んでいた。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0001" /> と{' '}
          <DocRef kind="ADR" number="0001" />{' '}
          から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <DocTable
          head={['観点', '満たすべき条件']}
          rows={[
            ['導入操作', 'macOS、WSL、それ以外の Linux で同じ操作で導入できる'],
            ['導入範囲', '「すべて」と「最小限」から選べる'],
            [
              'ユーザー名',
              '所有者と異なるユーザー名でも、flake を書き換えずに導入できる',
            ],
            [
              'CI',
              <>
                <Code>nix flake check</Code>{' '}
                と試し組み立てを、マシンのユーザー名なしで実行できる
              </>,
            ],
          ]}
        />
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          flake の出力にユーザー名を書かない。
          <Code>packages/dotfiles/nix/flake.nix</Code>{' '}
          は、評価時に次の環境変数を順に読み、最初に見つかった値を設定するユーザー名とする。
        </Prose>
        <DocTable
          head={['順', '環境変数', '使われる場面']}
          rows={[
            [
              '1',
              <>
                <Code>DOTFILES_USER</Code>
              </>,
              '明示的に指定する場合',
            ],
            [
              '2',
              <>
                <Code>SUDO_USER</Code>
              </>,
              <>
                <Code>sudo nixos-rebuild</Code> と{' '}
                <Code>sudo darwin-rebuild</Code>
              </>,
            ],
            [
              '3',
              <>
                <Code>USER</Code>
              </>,
              'Home Manager を単体で使う場合',
            ],
          ]}
        />
        <Prose>
          値が <Code>root</Code> の環境変数は飛ばす。
          どれも見つからない場合は、NixOS-WSL の既定ユーザーである{' '}
          <Code>nixos</Code> を使う。
        </Prose>
        <Prose>
          それ以外の Linux の出力は、ユーザー名ではなく導入範囲で分け、
          <Code>homeConfigurations.linux</Code> と{' '}
          <Code>homeConfigurations.linux-minimal</Code> の2つにする。 WSL と
          macOS の出力名は変えない。
        </Prose>
        <Prose>
          環境変数を読むには評価を impure にする必要があるため、
          <Code>setup.sh</Code> は3つの OS のすべてで <Code>--impure</Code>{' '}
          を付けて適用する。
        </Prose>
        <Figure caption="出力にユーザー名を書かず、評価時に環境変数から決める。">
          <FigSvg
            height={205}
            label="DOTFILES_USER、SUDO_USER、USER の順に環境変数を読み、どれもなければ nixos を使う流れ"
          >
            <FigLabel x={380} y={18}>
              値が root の環境変数は飛ばす
            </FigLabel>
            <FigNode
              x={0}
              y={56}
              w={170}
              h={70}
              tone="neon"
              title="DOTFILES_USER"
              lines={['明示的に指定する場合']}
            />
            <FigArrow
              points={[
                [170, 91],
                [206, 91],
              ]}
            />
            <FigLabel x={188} y={76}>
              なければ
            </FigLabel>
            <FigNode
              x={210}
              y={56}
              w={170}
              h={70}
              title="SUDO_USER"
              lines={['sudo で適用する場合']}
            />
            <FigArrow
              points={[
                [380, 91],
                [416, 91],
              ]}
            />
            <FigNode
              x={420}
              y={56}
              w={170}
              h={70}
              title="USER"
              lines={['単体で使う場合']}
            />
            <FigArrow
              points={[
                [590, 91],
                [626, 91],
              ]}
            />
            <FigNode
              x={630}
              y={56}
              w={130}
              h={70}
              tone="ghost"
              title="nixos"
              lines={['既定のユーザー']}
            />
            <FigNode
              x={0}
              y={150}
              w={760}
              h={50}
              tone="ghost"
              lines={[
                '環境変数を読むため評価は impure になり、setup.sh は3つの OS すべてで --impure を付ける',
              ]}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <DocTable
          head={['決定した要素', '要求を満たせる理由']}
          rows={[
            [
              '環境からユーザー名を決める',
              'flake を書き換えずに、どのユーザー名のマシンにも導入できる',
            ],
            [
              <>
                <Code>USER</Code> より <Code>SUDO_USER</Code> を先に読む
              </>,
              <>
                <Code>sudo</Code> で実行すると <Code>USER</Code> が{' '}
                <Code>root</Code> になるが、<Code>SUDO_USER</Code>{' '}
                に実行したユーザーが残る。この順で読めば、<Code>sudo</Code>{' '}
                を使う WSL と macOS でも、使わないそれ以外の Linux
                でも、利用者は同じ操作で導入できる
              </>,
            ],
            [
              <>
                <Code>root</Code> を飛ばす
              </>,
              'root のシェルから実行しても、root を通常のユーザーとして設定しない',
            ],
            [
              'pure な評価での既定値',
              <>
                <Code>nix flake check</Code> などでは環境変数を読めず{' '}
                <Code>nixos</Code> に決まるため、CI
                はマシンのユーザー名なしで同じ結果を得る
              </>,
            ],
            [
              '出力を導入範囲だけで分ける',
              <>
                出力名から選ぶものが導入範囲だけになり、
                <DocRef kind="ADR" number="0001" />{' '}
                の「導入範囲の選択を出力名の選択として扱う」考え方と合う
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
              option: '使うユーザー名ごとに出力を書き足す（従来の方式）',
              reason:
                '新しいユーザー名のマシンで導入するたびに flake の変更が要り、同じ内容の出力が増える。',
            },
            {
              option: (
                <>
                  ユーザー名を <Code>setup.sh</Code>{' '}
                  の引数や環境変数として必須にする
                </>
              ),
              reason: (
                <>
                  利用者の操作が OS ごとに増える。<Code>sudo</Code>{' '}
                  は既定で環境変数を引き継がないため、WSL と macOS
                  では渡し方も変わる。
                </>
              ),
            },
            {
              option: 'ユーザー名を書いた、Git で管理しない設定ファイルを置く',
              reason:
                'flake は Git で管理していないファイルを読めないため、そのファイルを置けない。',
            },
            {
              option: '全員を固定のユーザー名にそろえる',
              reason:
                'マシンのユーザー名は、OS の導入時や組織の方針で決まることがあり、所有者が選べない場合がある。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <DocTable
          head={['領域', '引き受けること']}
          rows={[
            [
              <>
                <Code>--impure</Code> の指定
              </>,
              <>
                適用するたびに必要になる。<Code>setup.sh</Code>{' '}
                が付けるが、手動で適用する場合は利用者が付ける。付け忘れると{' '}
                <Code>nixos</Code> として評価される
              </>,
            ],
            [
              '依存の版',
              <>
                <Code>--impure</Code> を付けても <Code>flake.lock</Code>{' '}
                による固定は外れない。ユーザー名が同じなら同じ構成になり、バイナリキャッシュもこれまでどおり使える
              </>,
            ],
            [
              '評価への影響',
              <>
                impure
                な評価では、環境変数がユーザー名を通じて評価結果に影響する。同じ{' '}
                <Code>flake.lock</Code>{' '}
                でもユーザー名が違えば別の構成になり、シェルに{' '}
                <Code>DOTFILES_USER</Code>{' '}
                が残っていると意図しないユーザーで設定されるおそれがある
              </>,
            ],
            [
              'CI の検証範囲',
              <>
                <Code>nix flake check</Code> と試し組み立ては pure
                な評価のままで、ユーザー名は <Code>nixos</Code> に決まる。CI
                はマシンごとのユーザー名とホームディレクトリの違いを検証しない
              </>,
            ],
            [
              'impure で使える書き方',
              <>
                環境変数、<Code>builtins.currentSystem</Code>、flake
                の外の絶対パス、ハッシュのない取得などを使える。今はユーザー名を決める{' '}
                <Code>builtins.getEnv</Code>{' '}
                のほかに使っていないが、ほかの箇所に加えても評価はエラーにならないため、レビューで防ぐ必要がある
              </>,
            ],
            [
              '評価キャッシュ',
              'flake の評価キャッシュは pure な評価でしか使われないため、適用のたびに評価をやり直す。ビルドの結果のキャッシュには影響しない',
            ],
            [
              '出力名',
              <>
                それ以外の Linux の出力名が{' '}
                <Code>
                  {'<'}ユーザー名{'>'}
                </Code>{' '}
                から <Code>linux</Code>{' '}
                に変わるため、手動で適用する場合の出力名を改める必要がある
              </>,
            ],
            [
              '対象外',
              'マシン名とリポジトリの配置先はこの決定の対象外である。WSL の出力名と、リポジトリの配置先の参照は、これまでどおり固定する',
            ],
            [
              'Git の設定',
              'コミットに使う名前とメールアドレスは OS のユーザー名とは別のものであり、この決定では変えない',
            ],
          ]}
        />
        <Prose>
          <Code>--impure</Code> を付け忘れた場合の結果は、OS
          ごとに次のようになる。
        </Prose>
        <DocTable
          head={['OS', '付け忘れたときの結果']}
          rows={[
            [
              'それ以外の Linux',
              'Home Manager の適用がユーザー名の不一致で失敗し、誤った設定は入らない',
            ],
            [
              'WSL',
              <>
                既定ユーザーの <Code>nixos</Code>{' '}
                で使っている場合は、付けた場合と同じ結果になる
              </>,
            ],
            [
              'macOS',
              <>
                存在しない <Code>nixos</Code>{' '}
                ユーザーを前提にした構成になり、適用が失敗するおそれがある
              </>,
            ],
          ]}
        />
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0001「開発環境の導入」',
              href: '/prd/0001_environment-setup',
            },
            {
              text: 'ADR 0001「開発環境を Nix flakes で宣言的に管理する」',
              href: '/adr/0001_manage-environment-with-nix-flakes',
            },
            {
              text: '所有者の依頼（2026-10-06）: ユーザー名に依存しない設計にする',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
