import {
  Bullets,
  Code,
  DocPart,
  DocRef,
  DocSection,
  DocSub,
  DocTable,
  Item,
  Prose,
  Requirements,
  Sources,
  Terms,
  TradeOffs,
} from '@/components/doc'
import {
  FigArrow,
  FigCard,
  FigChips,
  FigGrid,
  FigLabel,
  FigNode,
  FigSvg,
  Figure,
} from '@/components/figure'

export const meta = {
  title: 'ノートとタスクの管理',
  lead: 'リポジトリの所有者が、エディターの中でナレッジノートと開発チケットを管理するための要求と受入条件を定める。ノートを後から探しやすくし、自分が手を動かすべきチケットを一目で判別できるようにする。',
  attributes: [
    { label: '読者', value: '開発者' },
    {
      label: '段階',
      value: '5. デリバリー（要求と受入条件を確定し、実装済み）',
    },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>この PRD の用語は次の意味で使う。</Prose>
      <Terms
        items={[
          {
            term: 'ナレッジノート',
            description:
              '所有者が知識や判断を書き残す、1件ごとのノート。ノート同士をリンクでつなげる。',
          },
          {
            term: 'メタデータ',
            description: 'ノートの種類、説明、タグ、作成日時の4つの欄。',
          },
          {
            term: 'チケット',
            description: '開発作業の単位。作業状態を持つ見出しとして書く。',
          },
          {
            term: '手番',
            description: 'そのチケットを次に進めるのが、所有者か他者か。',
          },
          {
            term: 'アジェンダ',
            description: '開いているチケットを集めた一覧。',
          },
          {
            term: '`refile.org`',
            description: '分類前のメモやタスクをいったん置くファイル。',
          },
          {
            term: '「すべて」「最小限」',
            description: (
              <>
                開発環境の導入範囲。
                <DocRef kind="PRD" number="0001" />
                「開発環境の導入」で定める。
              </>
            ),
          },
        ]}
      />
      <DocSection label="Problem" title="課題">
        <DocSub title="問題と根拠">
          <Prose>
            ナレッジノートに種類やタグなどのメタデータがないと、ノートが増えるにつれて、人と
            AI エージェントのどちらからもノートを探しにくくなる。
            メタデータを付けるかどうかを所有者の注意に任せると、付け忘れたノートが残る。
          </Prose>
          <Prose>
            開発チケットは、未着手から完了まで11の状態を経る。
            状態を一つずつ順に切り替える方法では、目的の状態に変えるまでの操作が多すぎて使えない。
            また、状態を段階ごとの色で表すと、色の種類が多すぎて見分けられない。
            その結果、自分が手を動かすべきチケットを一目で判別できない。
          </Prose>
        </DocSub>
        <DocSub title="対象となる利用者">
          <Prose>
            リポジトリの所有者本人だけを対象とする。 AI
            エージェントは、ナレッジノートを読む側としてだけ想定する。
          </Prose>
        </DocSub>
        <DocSub title="提供する価値">
          <Prose>
            所有者は、ノートを作った時点で、分類に使うメタデータの欄が揃った状態から書き始められる。
            分類し忘れたノートを、後から一覧で拾える。
            開いているチケットのうち、自分の手番のものがすぐにわかる。
          </Prose>
        </DocSub>
        <DocSub title="対象外">
          <Bullets>
            <Item>ノート全体の関係をグラフで表示すること。</Item>
            <Item>ノートのタグを補完すること。</Item>
            <Item>Emacs でノートとタスクを扱うこと。</Item>
            <Item>Claude のセッションログをアジェンダに出すこと。</Item>
          </Bullets>
        </DocSub>
        <DocSub title="制約とトレードオフ">
          <Prose>所有者は、次のことを受け入れる。</Prose>
          <Bullets>
            <Item>
              タグに複数の値を持たせるために、メタデータをノートのプロパティではなく、ノートの本文に
              YAML で埋め込む。
            </Item>
            <Item>
              完了状態を一つにまとめる。その代わり、受け入れ済み、日常の雑務の完了、中止を状態で区別しない。
            </Item>
            <Item>
              状態の色を手番で分ける。その代わり、色からは個々の段階がわからない。
            </Item>
            <Item>
              Claude
              のセッションログをアジェンダから外す。その代わり、セッションログに残った未完了の見出しは、アジェンダでは見えない。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="成功条件">
          <Bullets>
            <Item>
              新しいナレッジノートが、すべて作成時点でメタデータの欄を持つ。
            </Item>
            <Item>タグのないナレッジノートの一覧を空にできる。</Item>
            <Item>開いているチケットを、手番がわかる形で一覧できる。</Item>
          </Bullets>
          <Prose>数値目標は設けない。</Prose>
        </DocSub>
        <DocSub title="計測と学習の計画">
          <Prose>
            計測の仕組みは設けない。
            所有者が、タグのないノートの一覧とアジェンダを普段の利用の中で確かめる。
            使いにくさや不足に気づいた場合は、要求と対象外を見直す材料にする。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Solution" title="解決策">
        <DocSub title="解決案とトレードオフ">
          <DocPart title="メタデータの持ち方">
            <Prose>次の2案を比べ、案2を採った。</Prose>
            <TradeOffs
              items={[
                {
                  id: '1',
                  option: 'ノートのプロパティとして持つ',
                  fields: [
                    { label: '利点', value: 'ノートの標準的な書き方に沿う' },
                    { label: '欠点', value: '1つの欄に複数の値を持てない' },
                  ],
                },
                {
                  id: '2',
                  option: 'ノートの本文に YAML で埋め込む',
                  fields: [
                    { label: '利点', value: 'タグに複数の値を持てる' },
                    { label: '欠点', value: '記録なし' },
                  ],
                },
              ]}
            />
          </DocPart>
          <DocPart title="ノート同士の関係の見方">
            <Prose>
              次の3案を比べた。
              ノートとリンクがまだ少ないため、当面は案1で運用すると決めた。
              ノートが増えて全体を俯瞰したくなった時点で、案2を再検討する。
            </Prose>
            <TradeOffs
              items={[
                {
                  id: '1',
                  option: '標準のバックリンク表示で済ませる',
                  fields: [
                    {
                      label: '利点',
                      value: '追加の作業がなく、エディター内で完結する',
                    },
                    {
                      label: '欠点',
                      value:
                        '1件のノートの前後しかたどれず、全体の構造は見えない',
                    },
                  ],
                },
                {
                  id: '2',
                  option: 'ノートからグラフを生成する仕組みを自作する',
                  fields: [
                    { label: '利点', value: 'ノート全体の構造を俯瞰できる' },
                    { label: '欠点', value: '作成と保守の手間がかかる' },
                  ],
                },
                {
                  id: '3',
                  option: '関係を表示する Web 画面を自作する',
                  fields: [
                    { label: '利点', value: '自由に作り込める' },
                    { label: '欠点', value: '手間が最も大きい' },
                  ],
                },
              ]}
            />
          </DocPart>
          <DocPart title="チケットの状態の変え方">
            <Prose>
              キーを押すたびに状態を順に切り替える方式ではなく、絞り込める一覧から状態を選ぶ方式を採った。
              11の状態を一つずつ送る方式は、操作が多すぎて使えないためである。
              状態ごとの短縮キーも、覚える負担に見合わないため設けない。
            </Prose>
          </DocPart>
        </DocSub>
        <DocSub title="要求と受入条件">
          <Figure caption="欄は作成時に揃い、付け忘れは一覧から回収する。分類を所有者の注意に任せない。">
            <FigSvg
              height={230}
              label="新しいノートにメタデータの欄が揃い、タグのないノートを一覧から回収する流れ"
            >
              <FigNode
                x={0}
                y={60}
                w={170}
                h={80}
                title="新しいノート"
                lines={['作成日時は自動で入る']}
              />
              <FigArrow
                points={[
                  [170, 100],
                  [206, 100],
                ]}
              />

              <FigNode
                x={210}
                y={30}
                w={200}
                h={140}
                tone="neon"
                valign="top"
                title="メタデータの4欄"
              />
              <FigNode
                x={226}
                y={66}
                w={168}
                h={22}
                rx={6}
                lines={['種類（6種から補完）']}
              />
              <FigNode x={226} y={92} w={168} h={22} rx={6} lines={['説明']} />
              <FigNode
                x={226}
                y={118}
                w={168}
                h={22}
                rx={6}
                lines={['タグ（複数持てる）']}
              />
              <FigNode
                x={226}
                y={144}
                w={168}
                h={22}
                rx={6}
                lines={['作成日時']}
              />

              <FigArrow
                points={[
                  [410, 100],
                  [410, 55],
                  [556, 55],
                ]}
              />
              <FigLabel x={480} y={44}>
                タグが空
              </FigLabel>
              <FigArrow
                points={[
                  [410, 100],
                  [410, 155],
                  [556, 155],
                ]}
                tone="neon"
              />
              <FigLabel x={480} y={144}>
                タグあり
              </FigLabel>

              <FigNode
                x={560}
                y={28}
                w={200}
                h={56}
                tone="amber"
                title="タグなしの一覧"
                lines={['選ぶとそのノートが開く']}
              />
              <FigArrow
                points={[
                  [660, 28],
                  [660, 8],
                  [310, 8],
                  [310, 26],
                ]}
                tone="soft"
              />
              <FigLabel x={470} y={18}>
                後から付けて回収する
              </FigLabel>

              <FigNode
                x={560}
                y={128}
                w={200}
                h={56}
                tone="mint"
                title="探せるノート"
                lines={['人と AI のどちらからも引ける']}
              />
            </FigSvg>
          </Figure>
          <Prose>各要求と、その要求を受け入れる条件は次のとおり。</Prose>
          <Requirements
            items={[
              {
                id: '1',
                demand: '新しいノートを作ると、メタデータの欄が揃う',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '新規作成したノートに種類、説明、タグ、作成日時の欄があり、作成日時が自動で入る',
                  },
                ],
              },
              {
                id: '2',
                demand: 'ノートの種類を補完できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '種類の欄で、6つの種類と各種類の説明が候補に出る。種類の欄以外では出ない',
                  },
                ],
              },
              {
                id: '3',
                demand: 'タグのないノートを一覧から開ける',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      'タグの欄がない、またはタグが空のノートだけが一覧に出て、選ぶとそのノートが開く。該当がなければ、その旨が通知される',
                  },
                ],
              },
              {
                id: '4',
                demand: 'ノート同士をリンクし、リンク元を確かめられる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      'あるノートから、そのノートにリンクしているノートを表示できる',
                  },
                ],
              },
              {
                id: '5',
                demand: 'チケットの状態を一覧から選んで設定できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      'カーソルに最も近い見出しの状態を、11の状態または「なし」に変えられる。見出しの本文は変わらない',
                  },
                ],
              },
              {
                id: '6',
                demand: '手番を色で判別できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '未着手、所有者の手番、他者の手番が、それぞれ別の色の帯で表示される。完了は目立たない色で表示される',
                  },
                ],
              },
              {
                id: '7',
                demand: '開いているチケットを状態の順に一覧できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      'アジェンダに、チケットが状態の順で並ぶ。Claude のセッションログは含まれない',
                  },
                ],
              },
              {
                id: '8',
                demand: (
                  <>
                    <Code>refile.org</Code> をすぐ開ける
                  </>
                ),
                fields: [
                  {
                    label: '受入条件',
                    value: (
                      <>
                        1回の操作で <Code>refile.org</Code> が開く
                      </>
                    ),
                  },
                ],
              },
              {
                id: '9',
                demand: '見出しに ID を付けられる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '見出しに ID がなければ付与される。すでにあれば、その ID が保たれる',
                  },
                ],
              },
              {
                id: '10',
                demand: '選択範囲を Markdown としてコピーできる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '選択範囲が Markdown に変換されてクリップボードに入る。変換できない場合は、エラーが通知される',
                  },
                ],
              },
            ]}
          />
          <Prose>要求2の6つの種類は次のとおり。</Prose>
          <DocTable
            head={['種類', '説明']}
            rows={[
              ['note', '日常のメモ、永続ノート'],
              ['reference', '外部資料の参照'],
              ['project', 'プロジェクト単位のノート'],
              ['person', '人物に関するノート'],
              ['meeting', '会議、商談の議事録'],
              ['decision', '意思決定、トレードオフの記録'],
            ]}
          />
          <Prose>要求5の11の状態と、要求6の色分けは次のとおり。</Prose>
          <Figure caption="色は段階ではなく手番を表す。チケットは左から右へ進み、色が変わる位置が手を離す位置になる。">
            <FigGrid>
              <FigCard tone="ghost" title="未着手" note="まだ着手していない">
                <FigChips tone="ghost" items={['1 未着手']} />
              </FigCard>
              <FigCard tone="neon" title="所有者の手番" note="自分が手を動かす">
                <FigChips
                  tone="neon"
                  items={[
                    '2 ISSUE 作成',
                    '3 設計',
                    '4 テストケース作成',
                    '5 実装',
                    '6 セルフレビュー',
                  ]}
                />
              </FigCard>
              <FigCard
                tone="amber"
                title="他者の手番"
                note="返ってくるのを待つ"
              >
                <FigChips
                  tone="amber"
                  items={[
                    '7 レビュー',
                    '8 QA 中',
                    '9 QA 完了',
                    '10 受け入れ中',
                  ]}
                />
              </FigCard>
              <FigCard
                title="完了"
                note="受け入れ済み、雑務の完了、中止をまとめる"
              >
                <FigChips tone="ghost" items={['11 完了']} />
              </FigCard>
            </FigGrid>
          </Figure>
          <DocTable
            head={['順', '状態', '手番による色分け']}
            rows={[
              ['1', '未着手', '未着手'],
              ['2', 'ISSUE 作成', '所有者'],
              ['3', '設計', '所有者'],
              ['4', 'テストケース作成', '所有者'],
              ['5', '実装', '所有者'],
              ['6', 'セルフレビュー', '所有者'],
              ['7', 'レビュー', '他者'],
              ['8', 'QA 中', '他者'],
              ['9', 'QA 完了', '他者'],
              ['10', '受け入れ中', '他者'],
              ['11', '完了', '完了'],
            ]}
          />
        </DocSub>
        <DocSub title="成功条件の測定方法">
          <Bullets>
            <Item>
              新しいノートを作るたびに、メタデータの欄が揃っているかを確かめる。
            </Item>
            <Item>タグのないノートの一覧を開き、空にできるかを確かめる。</Item>
            <Item>
              アジェンダを開き、開いているチケットが手番のわかる形で並んでいるかを確かめる。
            </Item>
          </Bullets>
          <Prose>計測の仕組みは設けない。</Prose>
        </DocSub>
        <DocSub title="展開計画">
          <Prose>
            所有者のマシンだけに提供する。
            開発環境を「すべて」の範囲で導入すると、すべての要求を使える。
            「最小限」の範囲では、要求1と要求4から要求9を使える。
            次の要求は、使う道具が「最小限」に入らないため使えない。
          </Prose>
          <Bullets>
            <Item label="要求2">補完の道具</Item>
            <Item label="要求3">一覧の道具</Item>
            <Item label="要求10">変換の道具</Item>
          </Bullets>
          <Prose>
            ノートとタスクの保管場所は、所有者が事前に用意する。
            段階的な公開はしない。
            変更は、各マシンで導入操作をやり直した時点で、そのマシンに反映される。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Open Questions" title="未解決の問い">
        <Bullets>
          <Item>ノートのタグを補完することを、要求にするか。</Item>
          <Item>
            ノートが増えたときに、ノート全体の関係を俯瞰する方法をどの案で再検討するか。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: '所有者のノート（2026-07-26）: メタデータの持ち方、ノート同士の関係の見方、検索性を高めるという目的',
            },
            {
              text: '所有者へのヒアリング（2026-10-02）: 対象範囲、段階、問題と根拠、対象となる利用者、提供する価値、対象外、制約とトレードオフ、成功条件、計測と学習の計画、要求と受入条件、成功条件の測定方法、展開計画',
            },
            {
              text: '所有者の依頼（2026-10-04）: 「最小限」でも Orgmode と org-roam を使う',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
