import {
  DocSection,
  DocSub,
  DocTable,
  Prose,
  Requirements,
  Sources,
  Terms,
} from '@/components/doc'
import { FigCard, FigChips, FigGrid, Figure } from '@/components/figure'
import type { DocMeta } from '@/lib/docs'

export const meta = {
  title: 'エディターの導入',
  lead: '所有者が、開発環境を導入するだけで、どのマシンでも同じ操作で使えるエディターを得られるようにするための要求と受入条件を定める。',
  repository: 'mikinovation',
  attributes: [
    { label: '読者', value: '開発者' },
    {
      label: '段階',
      value: '5. デリバリー（要求と受入条件を確定し、実装済み）',
    },
    { label: '更新日', value: '2026-11-09' },
  ],
} satisfies DocMeta

export default function Body() {
  return (
    <>
      <Prose>この PRD の用語は次の意味で使う。</Prose>
      <Terms
        items={[
          {
            term: '既定のエディター',
            description:
              'ほかのツールが文章の入力を求めるときに開くエディター。',
          },
          { term: 'WSL', description: 'Windows 上で Linux を動かす機能。' },
        ]}
      />
      <DocSection label="Problem" title="課題">
        <DocSub title="問題と根拠">
          <Prose>
            エディターと、言語ごとの補完や診断をマシンごとに手作業で揃えると、マシン間で設定がずれる。
            その結果、補完や診断を使えないマシンが生じる。
            また、エディターだけで開発作業を終えられないと、Git
            の操作やテスト、データベースの操作などのたびに別のアプリへ切り替えて作業が途切れる。
          </Prose>
        </DocSub>
        <DocSub title="対象となる利用者">
          <Prose>リポジトリの所有者本人だけを対象とする。</Prose>
        </DocSub>
        <DocSub title="提供する価値">
          <Prose>
            所有者は導入するだけで、既存マシンと同じ操作で編集を始められる。
            使う言語の補完、診断、整形も、導入した時点で使える。
            開発作業の多くを、エディターを離れずに終えられる。
          </Prose>
          <Figure caption="左の作業はエディターを離れずに終わる。右のアプリへ切り替える往復がなくなる。">
            <FigGrid wide>
              <FigCard
                tone="neon"
                title="エディターの中で終える作業"
                note="導入したすべてのマシン"
              >
                <FigChips
                  tone="neon"
                  items={[
                    '補完と診断',
                    '定義への移動',
                    '整形',
                    'ファイル検索',
                    'Git 操作',
                    'Issue と PR',
                    'テスト実行',
                    'データベース',
                    'HTTP リクエスト',
                    '端末',
                    'AI の補完と送信',
                  ]}
                />
              </FigCard>
              <FigCard
                tone="ghost"
                title="切り替えていた別アプリ"
                note="Git クライアント、ブラウザ、テストの実行環境、データベースの操作ツール、HTTP の送信ツール、別の端末"
              />
            </FigGrid>
          </Figure>
        </DocSub>
        <DocSub title="対象外">
          <DocTable
            head={['対象外にすること', '扱い']}
            rows={[
              [
                'WSL 以外の Linux で、エディターと OS のクリップボードを共有すること',
                '所有者が使う WSL と macOS だけで提供する',
              ],
              [
                'ネットワークに接続していない状態での初回起動',
                '初回起動には接続を前提とする',
              ],
              [
                'エディターから呼び出す外部ツールのうち、一部を導入すること',
                '所有者が、そのツールを使う前に手作業で導入する',
              ],
            ]}
          />
        </DocSub>
        <DocSub title="制約とトレードオフ">
          <Prose>所有者は、次のことを受け入れる。</Prose>
          <DocTable
            head={['得られること', '引き受けること']}
            rows={[
              [
                '初回起動で編集機能が自動で揃う',
                '初回起動にはネットワークへの接続が必要になる',
              ],
              [
                'クリップボードを共有できる',
                '共有は所有者が使う WSL と macOS だけで提供する',
              ],
              [
                '導入を軽く保てる',
                'エディターから呼び出す外部ツールの一部は、使う前に所有者が手作業で導入する',
              ],
            ]}
          />
        </DocSub>
        <DocSub title="成功条件">
          <Prose>
            新規のマシンまたは復旧したマシンに導入したあと、手作業で設定せずに既存マシンと同じ操作で編集を始められる。
            数値目標は設けない。
          </Prose>
        </DocSub>
        <DocSub title="計測と学習の計画">
          <Prose>
            新規のマシンへの導入と、壊れたマシンの復旧のたびに、成功条件を満たしたかを確かめる。
            手作業の設定が要った場合や不具合が生じた場合は記録し、要求と対象外を見直す材料にする。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Solution" title="解決策">
        <DocSub title="要求と受入条件">
          <Prose>各要求と、その要求を受け入れる条件は次のとおり。</Prose>
          <Requirements
            items={[
              {
                id: '1',
                demand: '導入したエディターを既定のエディターとして使える',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '既定のエディターを開く操作で、導入したエディターが起動する',
                  },
                ],
              },
              {
                id: '2',
                demand: '初回起動時に、編集機能が自動で揃う',
                fields: [
                  {
                    label: '受入条件',
                    value: '初回起動で、所有者が操作せずに編集機能が揃う',
                  },
                ],
              },
              {
                id: '3',
                demand: '起動時にエラーが出ない',
                fields: [
                  {
                    label: '受入条件',
                    value: '2回目以降の起動で、エラーが表示されない',
                  },
                ],
              },
              {
                id: '4',
                demand: '日常的に使う言語で、補完と診断を使える',
                fields: [
                  {
                    label: '受入条件',
                    value: '対象言語のファイルで、補完と診断が表示される',
                  },
                ],
              },
              {
                id: '5',
                demand: '定義への移動と名前の変更を使える',
                fields: [
                  {
                    label: '受入条件',
                    value: '対象言語のファイルで、定義へ移動し名前を変更できる',
                  },
                ],
              },
              {
                id: '6',
                demand: 'コードを整形できる',
                fields: [
                  {
                    label: '受入条件',
                    value: '言語側が整形に対応している場合だけ、整形できる',
                  },
                ],
              },
              {
                id: '7',
                demand: 'ファイル名や文字列でファイルを探せる',
                fields: [
                  {
                    label: '受入条件',
                    value: '名前と文字列のどちらでもファイルを探せる',
                  },
                ],
              },
              {
                id: '8',
                demand: 'ファイルの一覧をツリーで表示できる',
                fields: [
                  {
                    label: '受入条件',
                    value: 'エディター内でファイルのツリーを開ける',
                  },
                ],
              },
              {
                id: '9',
                demand: 'Git の日常的な操作をエディター内で行える',
                fields: [
                  {
                    label: '受入条件',
                    value: '状態の確認とコミットができ、差分と履歴を表示できる',
                  },
                ],
              },
              {
                id: '10',
                demand: 'Git のコンフリクトをエディター内で解消できる',
                fields: [
                  {
                    label: '受入条件',
                    value: 'コンフリクト箇所で、どちらの変更を採るか選べる',
                  },
                ],
              },
              {
                id: '11',
                demand: 'GitHub の Issue と PR をエディター内で扱える',
                fields: [
                  {
                    label: '受入条件',
                    value: 'エディター内で Issue と PR を表示できる',
                  },
                ],
              },
              {
                id: '12',
                demand: 'テストをエディター内で実行できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      'カーソル位置のテストと、ファイル内の全テストを実行できる',
                  },
                ],
              },
              {
                id: '13',
                demand: 'データベースをエディター内で操作できる',
                fields: [
                  {
                    label: '受入条件',
                    value: 'エディター内でデータベースに問い合わせられる',
                  },
                ],
              },
              {
                id: '14',
                demand: 'HTTP リクエストをエディター内で送れる',
                fields: [
                  {
                    label: '受入条件',
                    value: 'エディター内でリクエストを送り、応答を表示できる',
                  },
                ],
              },
              {
                id: '15',
                demand: 'エディター内で端末を開ける',
                fields: [
                  {
                    label: '受入条件',
                    value: 'エディターを閉じずに端末を開閉できる',
                  },
                ],
              },
              {
                id: '16',
                demand: 'メモとタスクを作業状態ごとに管理できる',
                fields: [
                  {
                    label: '受入条件',
                    value: 'タスクに作業状態を付け、状態ごとに一覧できる',
                  },
                ],
              },
              {
                id: '17',
                demand: 'AI の入力補完を使える',
                fields: [
                  {
                    label: '受入条件',
                    value: '入力中に AI の補完候補が表示される',
                  },
                ],
              },
              {
                id: '18',
                demand: 'AI にファイルや選択範囲を送れる',
                fields: [
                  {
                    label: '受入条件',
                    value: 'ファイルと選択範囲を、エディターから AI へ送れる',
                  },
                ],
              },
              {
                id: '19',
                demand: 'エディターと OS のクリップボードを共有できる',
                fields: [
                  {
                    label: '受入条件',
                    value: 'WSL と macOS で、双方向にコピーと貼り付けができる',
                  },
                ],
              },
              {
                id: '20',
                demand: '同じキーに複数の操作を割り当てない',
                fields: [
                  {
                    label: '受入条件',
                    value: '同じキーに割り当てた操作が1つだけである',
                  },
                ],
              },
            ]}
          />
          <Prose>
            要求2の初回起動には、ネットワークへの接続が必要である。
            要求21は「最小限」での利用を扱っていたため取り下げた。残る要求の番号は詰めない。
          </Prose>
          <Figure caption="20の要求は、エディターとして使えること、編集機能、エディター内で終える作業、AI の支援に分かれる。">
            <FigGrid wide>
              <FigCard title="エディターとして使える">
                <FigChips
                  items={[
                    '1 既定のエディター',
                    '2 初回起動で機能が揃う',
                    '3 起動時にエラーが出ない',
                    '19 クリップボードの共有',
                    '20 キーの重複なし',
                  ]}
                />
              </FigCard>
              <FigCard title="編集機能">
                <FigChips
                  items={[
                    '4 補完と診断',
                    '5 定義への移動と名前の変更',
                    '6 整形',
                  ]}
                />
              </FigCard>
              <FigCard title="エディター内で終える作業">
                <FigChips
                  items={[
                    '7 ファイル検索',
                    '8 ファイルのツリー',
                    '9 Git の操作',
                    '10 コンフリクトの解消',
                    '11 Issue と PR',
                    '12 テストの実行',
                    '13 データベース',
                    '14 HTTP リクエスト',
                    '15 端末',
                    '16 メモとタスクの管理',
                  ]}
                />
              </FigCard>
              <FigCard title="AI の支援">
                <FigChips items={['17 AI の入力補完', '18 AI への送信']} />
              </FigCard>
            </FigGrid>
          </Figure>
        </DocSub>
        <DocSub title="成功条件の測定方法">
          <Prose>
            新規のマシンまたは復旧したマシンに導入したとき、所有者が受入条件を手作業で一つずつ確かめる。
            あわせて、導入のほかに手作業の設定が要ったかを確かめる。
            計測の仕組みは設けない。
          </Prose>
        </DocSub>
        <DocSub title="展開計画">
          <Prose>
            所有者のマシンだけに提供する。 段階的な公開はしない。
            変更は、各マシンで導入操作をやり直した時点で、そのマシンに反映される。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Open Questions" title="未解決の問い">
        <Prose>なし。</Prose>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            { text: '所有者へのヒアリング（2026-09-28）' },
            {
              text: '所有者へのヒアリング（2026-10-02）: 段階、制約とトレードオフ、計測と学習の計画、成功条件の測定方法、展開計画',
            },
            {
              text: '所有者の依頼（2026-11-09）: 導入範囲の区別があると壊れやすいため、区別をやめて1つに統一する',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
