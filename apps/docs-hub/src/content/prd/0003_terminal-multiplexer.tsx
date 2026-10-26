import {
  Bullets,
  DocRef,
  DocSection,
  DocSub,
  Item,
  Prose,
  Requirements,
  Sources,
  Terms,
} from '@/components/doc'
import {
  FigArrow,
  FigLabel,
  FigLegend,
  FigNode,
  FigSvg,
  Figure,
} from '@/components/figure'

export const meta = {
  title: '端末多重化ツールの導入',
  lead: '所有者が、複数のエージェントを同時に走らせながら、どれに手を入れるべきかを一画面で判断できるようにするための要求と受入条件を定める。',
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
            term: 'エージェント',
            description:
              '指示を受けてコードを書き換える AI のプログラムのうち、端末の中で動かすもの。',
          },
          {
            term: '端末多重化ツール',
            description:
              '一つの端末画面を分割し、複数の作業を同時に表示して切り替えるツール。',
          },
          {
            term: '「すべて」「最小限」',
            description: (
              <>
                <DocRef kind="PRD" number="0001" />
                「開発環境の導入」で定める導入範囲。
              </>
            ),
          },
        ]}
      />
      <DocSection label="Problem" title="課題">
        <DocSub title="問題と根拠">
          <Prose>
            エージェントを複数同時に走らせると、どれが入力待ちでどれが作業中かを一度に見られない。
            所有者は端末を順に切り替えて状態を確かめることになり、手を入れるべきエージェントに気付くのが遅れる。
            扱うプロジェクトが複数あると、プロジェクトごとの端末の行き来も増える。
            また、エディターで開いているコードや指示をエージェントへ渡すたびに、手作業でコピーと貼り付けをすることになる。
          </Prose>
        </DocSub>
        <DocSub title="対象となる利用者">
          <Prose>リポジトリの所有者本人だけを対象とする。</Prose>
        </DocSub>
        <DocSub title="提供する価値">
          <Prose>
            所有者は、同時に走るエージェントのうちどれに手を入れるべきかをすぐ判断でき、端末を探し回らずに済む。
            エディターを離れずに、エージェントへ指示を渡し、新しいエージェントを立ち上げられる。
            エージェントの監視だけでなく、通常のシェル作業も同じ画面で行う。
            この機能は「すべて」を導入した場合にだけ使える。
          </Prose>
        </DocSub>
        <DocSub title="対象外">
          <Bullets>
            <Item>「最小限」の導入範囲でこの機能を提供すること。</Item>
            <Item>端末を閉じたあとの画面構成の復元。</Item>
            <Item>シェルの起動時に自動で立ち上げること。</Item>
          </Bullets>
        </DocSub>
        <DocSub title="制約とトレードオフ">
          <Prose>所有者は、次のことを受け入れる。</Prose>
          <Bullets>
            <Item>
              「最小限」を軽く保つ代わりに、「最小限」ではエージェントの監視とエディターからの送信を使えない。
            </Item>
            <Item>
              端末多重化ツールの完成品が手に入らない環境では、導入に時間がかかる。
            </Item>
            <Item>
              エディターから立ち上げられるエージェントは、1種類に限られる。
            </Item>
            <Item>
              画面の分割とタブをこの端末多重化ツールだけで行う代わりに、端末アプリ側のタブと分割は使わない。
            </Item>
            <Item>
              端末を閉じると画面構成は失われ、シェルを起動しても自動では立ち上がらない。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="成功条件">
          <Prose>
            「すべて」を導入したあと、手作業で設定せずに、複数のエージェントを同時に走らせて監視でき、エディターを離れずに指示を渡せる。
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
          <Figure caption="一覧は手を入れるべきエージェントを上に並べ、画面を切り替えずに状態がわかる。">
            <FigSvg
              height={320}
              label="サイドバーの一覧、プロジェクト単位のタブ、分割した領域からなる画面構成"
            >
              <FigNode x={0} y={0} w={760} h={320} />
              <FigNode
                x={14}
                y={10}
                w={130}
                h={26}
                rx={7}
                tone="neon"
                title="プロジェクトA"
              />
              <FigNode
                x={152}
                y={10}
                w={130}
                h={26}
                rx={7}
                title="プロジェクトB"
              />
              <FigNode
                x={290}
                y={10}
                w={130}
                h={26}
                rx={7}
                title="プロジェクトC"
              />
              <FigLabel x={746} y={23} align="end">
                タブのまとまりを切り替える
              </FigLabel>

              <FigNode
                x={14}
                y={50}
                w={210}
                h={256}
                rx={10}
                tone="ghost"
                tag="一覧（優先度順・開閉できる）"
              />
              <FigNode
                x={26}
                y={86}
                w={186}
                h={34}
                rx={8}
                align="start"
                padX={32}
                title="agent-1　入力待ち"
              />
              <circle className="fig-amber" cx={44} cy={103} r={4} />
              <FigNode
                x={26}
                y={126}
                w={186}
                h={34}
                rx={8}
                align="start"
                padX={32}
                title="agent-2　入力待ち"
              />
              <circle className="fig-amber" cx={44} cy={143} r={4} />
              <FigNode
                x={26}
                y={166}
                w={186}
                h={34}
                rx={8}
                align="start"
                padX={32}
                title="agent-3　作業中"
              />
              <circle className="fig-neon" cx={44} cy={183} r={4} />
              <FigNode
                x={26}
                y={206}
                w={186}
                h={34}
                rx={8}
                align="start"
                padX={32}
                lines={['shell　通常の作業']}
              />
              <circle className="fig-dim" cx={44} cy={223} r={4} />

              <FigNode
                x={236}
                y={50}
                w={258}
                h={256}
                rx={10}
                tone="neon"
                title="agent-3"
                lines={['注目中（全画面に広げられる）']}
              />
              <FigNode
                x={502}
                y={50}
                w={244}
                h={124}
                rx={10}
                title="agent-1"
                lines={['入力待ち']}
              />
              <FigNode
                x={502}
                y={182}
                w={244}
                h={124}
                rx={10}
                title="shell"
                lines={['通常のシェル作業']}
              />
            </FigSvg>
            <FigLegend
              items={[
                { tone: 'amber', text: '入力待ち（手を入れるべき）' },
                { tone: 'neon', text: '作業中' },
                { tone: 'dim', text: 'エージェント以外' },
              ]}
            />
          </Figure>
          <Prose>各要求と、その要求を受け入れる条件は次のとおり。</Prose>
          <Requirements
            items={[
              {
                id: '1',
                demand:
                  '複数のエージェントを同時に走らせ、一画面で状態を把握できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '複数のエージェントが動いている状態で、切り替えずに各々の状態が分かる',
                  },
                ],
              },
              {
                id: '2',
                demand: '注目するエージェントを全画面に広げて詳しく見られる',
                fields: [
                  {
                    label: '受入条件',
                    value: '1つの操作で全画面表示と元の配置を行き来できる',
                  },
                ],
              },
              {
                id: '3',
                demand: '一覧を出すサイドバーを開閉できる',
                fields: [
                  {
                    label: '受入条件',
                    value: '1つの操作で開閉でき、畳むと画面を占有しない',
                  },
                ],
              },
              {
                id: '4',
                demand: '手を入れるべきエージェントが一覧の上位に来る',
                fields: [
                  { label: '受入条件', value: '一覧が優先度の順で並ぶ' },
                ],
              },
              {
                id: '5',
                demand:
                  'プロジェクト単位でタブをまとめ、まとまりを切り替えられる',
                fields: [
                  {
                    label: '受入条件',
                    value: 'まとまりを新規作成し、前後に切り替えられる',
                  },
                ],
              },
              {
                id: '6',
                demand: 'タブを増やし、前後に切り替えられる',
                fields: [
                  {
                    label: '受入条件',
                    value: 'タブを新規作成し、前後に切り替えられる',
                  },
                ],
              },
              {
                id: '7',
                demand: '画面を縦横に分割し、隣の領域へ移動できる',
                fields: [
                  {
                    label: '受入条件',
                    value: '縦横に分割でき、上下左右の隣へ移動できる',
                  },
                ],
              },
              {
                id: '8',
                demand:
                  '分割、移動、タブの操作を、一般的な端末多重化ツールと同じ指使いで行える',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      'これらの操作のキーが、一般的な端末多重化ツールの割り当てと一致する',
                  },
                ],
              },
              {
                id: '9',
                demand: 'マウスでも操作できる',
                fields: [
                  { label: '受入条件', value: 'マウスの操作を受け付ける' },
                ],
              },
              {
                id: '10',
                demand: '過去の出力を一定量さかのぼって読める',
                fields: [
                  {
                    label: '受入条件',
                    value: '画面から流れた出力を、上限まで戻って読める',
                  },
                ],
              },
              {
                id: '11',
                demand:
                  'エディターから、選択範囲、現在行、ファイルパス、自由入力のテキストを、動いているエージェントへ送れる',
                fields: [
                  {
                    label: '受入条件',
                    value: '4種類のいずれも、エディターから送信まで完了する',
                  },
                ],
              },
              {
                id: '12',
                demand:
                  '送り先のエージェントが複数あるときだけ、送り先を選べる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '1つのときは選択を求めずに送る。複数のときは選ばせる',
                  },
                ],
              },
              {
                id: '13',
                demand:
                  'エディターから、編集中のファイルの場所で新しいエージェントを立ち上げられる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '編集中のファイルの場所を作業場所としてエージェントが起動し、隣の領域に並ぶ',
                  },
                ],
              },
              {
                id: '14',
                demand: '立ち上げるエージェントに名前を付けられる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '起動時に名前を尋ね、編集中の場所の名前が既定値として入る',
                  },
                ],
              },
              {
                id: '15',
                demand:
                  'エディターから、プロジェクトのまとまりを一覧して切り替えられる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '動いているまとまりを一覧でき、選んだものへ切り替わる',
                  },
                ],
              },
              {
                id: '16',
                demand: '送れない状態のときは、その理由が分かり、何も起きない',
                fields: [
                  {
                    label: '受入条件',
                    value: '下記の異常時の受入条件をすべて満たす',
                  },
                ],
              },
              {
                id: '17',
                demand: '操作の成否がエディター上で分かる',
                fields: [
                  {
                    label: '受入条件',
                    value: '成功時と失敗時で、それぞれ区別できる通知が出る',
                  },
                ],
              },
            ]}
          />
          <Prose>要求15では、まとまりが1つのときは選択を求めない。</Prose>
          <Figure caption="送れない状態では理由を示して何も起こさず、成否はどちらの操作でもエディター上でわかる。">
            <FigSvg
              height={250}
              label="エディターから内容を送る流れと、新しいエージェントを立ち上げる流れ"
            >
              <FigNode
                x={0}
                y={20}
                w={180}
                h={210}
                rx={10}
                tone="ghost"
                tag="エディター"
              />
              <FigNode x={14} y={56} w={152} h={30} rx={8} title="選択範囲" />
              <FigNode x={14} y={94} w={152} h={30} rx={8} title="現在行" />
              <FigNode
                x={14}
                y={132}
                w={152}
                h={30}
                rx={8}
                title="ファイルパス"
              />
              <FigNode
                x={14}
                y={170}
                w={152}
                h={30}
                rx={8}
                title="自由入力のテキスト"
              />

              <FigArrow
                points={[
                  [180, 70],
                  [246, 70],
                ]}
              />
              <FigNode
                x={250}
                y={40}
                w={170}
                h={62}
                rx={10}
                tone="amber"
                title="送り先を選ぶ"
                lines={['1つのときは尋ねない']}
              />
              <FigArrow
                points={[
                  [420, 71],
                  [486, 71],
                ]}
                tone="neon"
              />
              <FigNode
                x={490}
                y={40}
                w={170}
                h={62}
                rx={10}
                tone="neon"
                title="動いているエージェント"
                lines={['内容が届く']}
              />

              <FigArrow
                points={[
                  [180, 185],
                  [246, 185],
                ]}
              />
              <FigNode
                x={250}
                y={154}
                w={170}
                h={62}
                rx={10}
                title="新しく立ち上げる"
                lines={['編集中の場所と名前で']}
              />
              <FigArrow
                points={[
                  [420, 185],
                  [486, 185],
                ]}
              />
              <FigNode
                x={490}
                y={154}
                w={170}
                h={62}
                rx={10}
                title="隣の領域に並ぶ"
                lines={['一覧にも現れる']}
              />

              <FigArrow
                points={[
                  [660, 71],
                  [700, 71],
                  [700, 102],
                ]}
                tone="soft"
                head={false}
              />
              <FigArrow
                points={[
                  [660, 185],
                  [700, 185],
                  [700, 166],
                ]}
                tone="soft"
                head={false}
              />
              <FigNode
                x={672}
                y={104}
                w={88}
                h={60}
                rx={10}
                tone="ghost"
                lines={['成否を', '通知する']}
              />
            </FigSvg>
          </Figure>
          <Prose>要求16と要求17の異常時の受入条件は次のとおり。</Prose>
          <Bullets>
            <Item>
              端末多重化ツールの外で操作すると、理由が示され、何も起きない。
            </Item>
            <Item>
              端末多重化ツールが使えない環境で操作すると、理由が示され、何も起きない。
            </Item>
            <Item>
              送り先のエージェントが1つも無いとき、理由が示され、何も送られない。
            </Item>
            <Item>送る内容が空のとき、理由が示され、何も送られない。</Item>
            <Item>送り先の選択や名前の入力を取り消すと、何も起きない。</Item>
            <Item>
              送信、起動、切り替えに失敗したとき、成功の通知は出ない。
            </Item>
          </Bullets>
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
            { text: '所有者へのヒアリング（2026-09-29）' },
            {
              text: '所有者へのヒアリング（2026-10-02）: 段階、制約とトレードオフ、計測と学習の計画、成功条件の測定方法、展開計画',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
