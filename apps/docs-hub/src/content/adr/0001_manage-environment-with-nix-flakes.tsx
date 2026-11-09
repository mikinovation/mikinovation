import {
  Alternatives,
  Code,
  DocRef,
  DocSection,
  DocTable,
  Prose,
  Sources,
} from '@/components/doc'
import { FigArrow, FigNode, FigSvg, Figure } from '@/components/figure'
import type { DocMeta } from '@/lib/docs'

export const meta = {
  title: '開発環境を Nix flakes で宣言的に管理する',
  lead: '開発環境の導入と管理に Nix flakes を使い、OS ごとの仕組みから共通の Home Manager 設定を適用するという決定を記録する。',
  repository: 'mikinovation',
  attributes: [
    { label: '読者', value: '技術責任者、開発者、将来の保守者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-11-09' },
  ],
} satisfies DocMeta

export default function Body() {
  return (
    <>
      <DocSection label="Context" title="背景">
        <Prose>
          開発環境を手作業で構築すると、同じ環境を再現できない。 所有者は WSL と
          macOS
          の複数マシンを使っており、手作業で揃えるとマシン間で設定がずれ、手順も漏れる。
          壊れた環境の復旧にも時間がかかる。
        </Prose>
        <Prose>
          以前は導入範囲を「すべて」と「最小限」に分け、flake
          の出力とモジュールの読み込みを範囲ごとに分岐させていた。
          分岐に手を入れるたびに片方の範囲だけが動かなくなることがあるため、設定が壊れやすかった。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0001" />{' '}
          の要求から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <DocTable
          head={['観点', '満たすべき条件']}
          rows={[
            ['導入操作', 'macOS、WSL、それ以外の Linux で同じ操作で導入できる'],
            ['再実行', '何度導入しても同じ状態になる'],
            [
              '対象',
              '所有者本人だけを対象とし、所有者と異なるユーザー名、マシン名、リポジトリの配置先には対応しない',
            ],
          ]}
        />
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          <Code>packages/dotfiles/nix/flake.nix</Code> の1つの flake
          で、すべての OS の環境を定義する。 ユーザー環境は共通の Home Manager
          設定（<Code>packages/dotfiles/nix/home.nix</Code>）で定義し、OS
          ごとに次の仕組みから適用する。
        </Prose>
        <DocTable
          head={['OS', '適用する仕組み', 'flake の出力']}
          rows={[
            [
              'WSL',
              'NixOS-WSL の NixOS に、Home Manager をモジュールとして組み込む',
              <>
                <Code>nixosConfigurations</Code>
              </>,
            ],
            [
              'macOS',
              'nix-darwin に、Home Manager をモジュールとして組み込む',
              <>
                <Code>darwinConfigurations</Code>
              </>,
            ],
            [
              'それ以外の Linux',
              'Home Manager を単体で使う',
              <>
                <Code>homeConfigurations</Code>
              </>,
            ],
          ]}
        />
        <Prose>
          導入操作は <Code>setup.sh</Code> に一本化する。<Code>setup.sh</Code>{' '}
          は OS を判定して、適用する仕組みと flake の出力を選ぶ。
        </Prose>
        <Figure caption="1つの flake と共通の設定から、OS ごとの仕組みに合わせた出力を作る。">
          <FigSvg
            height={240}
            label="setup.sh が OS を判定し、1つの flake の3種類の出力から適切なものを適用する構成"
          >
            <FigNode
              x={0}
              y={85}
              w={150}
              h={80}
              title="setup.sh"
              lines={['OS を判定し', '出力を選ぶ']}
            />
            <FigArrow
              points={[
                [150, 125],
                [196, 125],
              ]}
              tone="neon"
            />
            <FigNode
              x={200}
              y={40}
              w={180}
              h={80}
              tone="neon"
              title="flake.nix（1つ）"
              lines={['flake.lock で版を固定']}
            />
            <FigNode
              x={200}
              y={140}
              w={180}
              h={70}
              tone="neon"
              title="共通の設定"
              lines={['home.nix（Home Manager）']}
            />
            <FigArrow
              points={[
                [290, 140],
                [290, 124],
              ]}
            />
            <FigArrow
              points={[
                [380, 80],
                [410, 80],
                [410, 51],
                [436, 51],
              ]}
            />
            <FigArrow
              points={[
                [380, 80],
                [410, 80],
                [410, 125],
                [436, 125],
              ]}
            />
            <FigArrow
              points={[
                [380, 80],
                [410, 80],
                [410, 199],
                [436, 199],
              ]}
            />
            <FigNode
              x={440}
              y={20}
              w={320}
              h={62}
              title="nixosConfigurations"
              lines={['WSL：NixOS-WSL に組み込む']}
            />
            <FigNode
              x={440}
              y={94}
              w={320}
              h={62}
              title="darwinConfigurations"
              lines={['macOS：nix-darwin に組み込む']}
            />
            <FigNode
              x={440}
              y={168}
              w={320}
              h={62}
              title="homeConfigurations"
              lines={['それ以外の Linux：単体で使う']}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <DocTable
          head={['決定した要素', '要求を満たせる理由']}
          rows={[
            [
              '1つの flake と共通の Home Manager 設定',
              'どの OS でも同じユーザー環境になる',
            ],
            [
              <>
                <Code>flake.lock</Code> での版の固定
              </>,
              'どのマシンでも同じ版で導入できる',
            ],
            [
              '宣言した状態の適用',
              '導入済みのマシンで再度導入しても状態が変わらない',
            ],
            [
              <>
                <Code>setup.sh</Code> による OS の判定
              </>,
              '所有者はどの OS でも同じ操作で導入できる',
            ],
          ]}
        />
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: 'シェルスクリプトと symlink',
              reason:
                'ツールの版の固定と、何度導入しても同じ状態になることを、自前のスクリプトで保証する必要がある。',
            },
            {
              option:
                'OS 標準のパッケージマネージャーと chezmoi などの dotfiles 管理ツール',
              reason:
                'Homebrew や apt など OS ごとに導入手順が分かれ、ツールの版をマシン間で揃えられない。',
            },
            {
              option: 'Ansible',
              reason:
                '状態ではなく手順を記述するため、パッケージの版の固定は OS のパッケージマネージャーに依存する。',
            },
            {
              option: 'Dev Container や Docker',
              reason:
                '開発環境をコンテナ内に閉じるため、ホストのシェルや設定ファイルを管理できない。また、コンテナの実行環境を常に動かす必要があり、macOS では Linux 仮想マシンを介するため、CPU、メモリ、ファイル入出力のオーバーヘッドが生じる。',
            },
            {
              option: 'mise',
              reason:
                'ランタイムやツールの版は管理できるが、設定ファイルと OS の設定は管理できない。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <DocTable
          head={['領域', '引き受けること']}
          rows={[
            ['導入の前提', '導入操作の前に、Nix 本体を所有者が導入しておく'],
            [
              '対象の範囲',
              'ユーザー名とマシン名を flake の出力に書くため、所有者と異なるユーザー名やマシン名では導入できない',
            ],
            [
              '版の更新',
              <>
                依存の版は <Code>flake.lock</Code> に固定され、版を上げるには{' '}
                <Code>flake.lock</Code> の更新が必要になる。nixpkgs は unstable
                を参照し、更新は Renovate が行う
              </>,
            ],
            [
              '自前のパッケージ',
              <>
                nixpkgs にないツールは <Code>packages/dotfiles/nix/pkgs/</Code>{' '}
                で定義し、保守する
              </>,
            ],
            [
              'Nix の管理外',
              'WSL で使う端末アプリの設定を Windows 側へ配置する作業と、macOS で Claude Code から操作するブラウザの導入は、手作業で行う',
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
            { text: '所有者へのヒアリング（2026-09-27）' },
            {
              text: '所有者の依頼（2026-11-09）: 導入範囲の区別があるため壊れやすく、区別をやめて1つに統一する',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
