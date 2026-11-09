import {
  Alternatives,
  Code,
  DocRef,
  DocSection,
  DocTable,
  Prose,
  Sources,
} from '@/components/doc'
import type { DocMeta } from '@/lib/docs'

export const meta = {
  title: 'AI が管理する issue を docs-hub の YAML 一つで持つ',
  lead: 'AI エージェントが管理する issue を、docs-hub の src/content/issues.yaml 一つに置き、サイトの一覧ページから読めるようにするという決定を記録する。',
  repository: 'mikinovation',
  attributes: [
    { label: '読者', value: '技術責任者、開発者、将来の保守者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-11-05' },
  ],
} satisfies DocMeta

export default function Body() {
  return (
    <>
      <DocSection label="Context" title="背景">
        <Prose>
          所有者は開発作業の多くを AI エージェントに任せている。
          任せた作業の残りや次にやることを置く場所がなく、
          会話を閉じるとどちらも分からなくなっていた。
        </Prose>
        <Prose>
          ノートとタスクは <DocRef kind="ADR" number="0006" /> の決定により Org
          形式で書き、Neovim の nvim-orgmode で扱っている。
          この流れのチケットは未着手から完了まで11の状態を経る。 ただし、
          レビューや QA のように人へ手番が移る状態を含むため、AI
          が機械的に進める前提では作っていない。
        </Prose>
        <Prose>
          所有者は <DocRef kind="PRD" number="0010" /> と{' '}
          <DocRef kind="ADR" number="0017" /> の決定により、PRD、ADR、設計書、
          学習ノートを docs-hub で公開している。 issue
          も同じ場所から読めれば、閲覧の仕組みを新しく作らずに済む。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <DocTable
          head={['観点', '満たすべき条件']}
          rows={[
            [
              '更新の手段',
              'AI がローカルのファイル編集だけで更新でき、認証もネットワークも必要ない',
            ],
            [
              '読み込みの時点',
              <>
                docs-hub はサーバーを持たず prerender
                で静的に書き出すため、ビルド時に読める場所に置く
              </>,
            ],
            ['公開の範囲', 'GitHub Pages で配信され、誰でも読める'],
            ['持つ情報', 'タイトルに当たる短い1行に限る'],
            [
              '既存の管理との境界',
              'PRD、ADR、設計書の流れとは別系統とし、Org のチケットには手を入れない',
            ],
          ]}
        />
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          issue は <Code>apps/docs-hub/src/content/issues.yaml</Code> の{' '}
          <Code>issues</Code> キーの配列に置く。1件は次の3つだけを持つ。
        </Prose>
        <DocTable
          head={['項目', '内容']}
          rows={[
            [
              'id',
              <>
                4桁の数字の文字列。<Code>done</Code>{' '}
                を含む既存の最大値に1を足し、欠番は埋めない
              </>,
            ],
            ['title', '60文字以内の1行。公開される前提で書く'],
            [
              'status',
              <>
                <Code>todo</Code>（未着手）、<Code>doing</Code>
                （着手している）、<Code>done</Code>（完了）のいずれか
              </>,
            ],
          ]}
        />
        <Prose>
          <Code>doing</Code> は実際に手を付けている issue
          に限り、同時に1件までを目安とする。
          <Code>done</Code> は PR をマージした時点で付け、完了した issue
          も同じファイルに残す。顧客名、非公開の案件の内容、 認証情報に触れる
          issue は、この仕組みに載せない。
        </Prose>
        <Prose>
          issue は <Code>/issues</Code> の一覧ページで読む。<Code>doing</Code>、
          <Code>todo</Code>、<Code>done</Code> の順に区画を分け、
          各区画に件数を出し、該当する issue がない区画は出さない。
          個別のページは作らない。
        </Prose>
        <Prose>
          形の検査は <Code>src/lib/issues-schema.ts</Code> の zod
          スキーマが行う。検査は、<Code>id</Code>{' '}
          が4桁の数字でない場合や重複する場合、<Code>title</Code>{' '}
          が空か60文字を超える場合、<Code>status</Code>{' '}
          が3値以外の場合に失敗する。
        </Prose>
        <Prose>
          <Code>scripts/issues-plugin.ts</Code> の Vite プラグインは、
          ビルド時に YAML を zod スキーマに通してから JavaScript
          のモジュールへ変換する。検査に失敗すると <Code>pnpm build</Code>{' '}
          が終了コード1で止まる。表示側は zod
          を読み込まず、型だけを使うため、クライアントのバンドルに zod
          は入らない。
        </Prose>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Prose>
          AI の更新が1ファイルへの数行の追記で済み、 索引を作り直すコマンドや
          API の呼び出しはいらない。docs-hub
          と同じリポジトリに置くため、サイトのビルドがそのまま読み、
          閲覧の仕組みを別に作らずに済む。
        </Prose>
        <Prose>
          YAML を選んだのは、入れ子を手で書きやすく、
          後から項目を足せるためである。TOML では入れ子の表現が煩雑になる。
          持つ情報をタイトルだけに絞れば、AI が毎回全件を読んでも負担は小さい。
        </Prose>
        <Prose>
          検査をビルド時の変換に置いたのは、prerender
          の最中に出た例外が記録されるだけで、
          ビルドが終了コード0で成功したためである。id を重複させた YAML
          で試すと、ビルドは成功したまま <Code>/issues</Code> の中身が欠けた。
        </Prose>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Alternatives
          items={[
            {
              option: 'GitHub Issues',
              reason: '読み書きに認証とネットワークが必要で、AI の手数が増える',
            },
            {
              option: 'Org のチケットに足す',
              reason:
                '11の状態は人へ手番が移る流れに合わせてあり、AI 用に変えると既存のチケットの扱いにも手を入れることになる',
            },
            {
              option: 'TOML で書く',
              reason: '入れ子の表現が煩雑になる',
            },
            {
              option: 'issue ごとに1ファイル',
              reason:
                '件数が増えても衝突しにくいが、1行のタイトルを持つだけの issue には重い',
            },
          ]}
        />
        <Prose>
          create-plan スキルは、進捗を計画の Markdown で管理し、GitHub の Issue
          を作らないと定めている。GitHub Issues を使うと、この方針と食い違う。
        </Prose>
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Prose>
          公開されるため、顧客名や非公開の案件に触れる issue は扱えない。
          扱いたい場合は、この仕組みの外に置く必要がある。
        </Prose>
        <Prose>
          1件の状態を変えるだけでもコミットが必要になる。
          状態は3値しかないため、レビューや QA
          のように人へ手番が移る段階は表せない。
          <Code>done</Code> を残す方針では件数が増え続けるので、AI
          が全件を読む負担が気になった時点で、 古い issue
          を削るかどうかを決め直す。
        </Prose>
        <Prose>
          検査をビルド時の変換に置いた判断は、prerender の例外が無視されるという
          docs-hub の今の挙動を前提にしている。 TanStack Start の prerender が
          render の失敗でビルドを止めるようになれば、 この置き場所を見直せる。
        </Prose>
        <Prose>
          Org のチケットとは別系統のため、 同じ作業が両方に載るおそれがある。
        </Prose>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: (
                <>
                  データと検査の実装:{' '}
                  <Code>apps/docs-hub/src/content/issues.yaml</Code>、
                  <Code>src/lib/issues-schema.ts</Code>、
                  <Code>scripts/issues-plugin.ts</Code>
                </>
              ),
            },
            {
              text: (
                <>
                  表示と規約: <Code>src/lib/issues.ts</Code>、
                  <Code>src/routes/issues.tsx</Code>、
                  <Code>apps/docs-hub/README.md</Code> の issue の節
                </>
              ),
            },
            {
              text: (
                <>
                  <DocRef kind="PRD" number="0010" />、
                  <DocRef kind="ADR" number="0017" />: docs-hub
                  の役割と、サーバーを持たず静的に書き出す構成
                </>
              ),
            },
            {
              text: (
                <>
                  <DocRef kind="ADR" number="0006" />: ノートとタスクを Org
                  形式で扱う決定と、11の状態
                </>
              ),
            },
            {
              text: 'create-plan スキル: 進捗を計画の Markdown で管理し、GitHub の Issue を作らない方針',
            },
            {
              text: '2026-11-05 に計測した事実: 実行時の検査では pnpm build が終了コード0で成功し、/issues の中身が欠けた',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
