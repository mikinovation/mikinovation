import {
  Bullets,
  Code,
  DocLink,
  DocRef,
  DocSection,
  DocSub,
  Item,
  Prose,
  Requirements,
  Sources,
  Terms,
  TradeOffs,
} from '@/components/doc'
import {
  FigArrow,
  FigLabel,
  FigNode,
  FigSvg,
  Figure,
} from '@/components/figure'

export const meta = {
  title: 'refile.org への定期的なメモの促し',
  lead: '所有者が、作業中に考えたことや気付きを refile.org に書かないまま忘れてしまう課題について、問題と仮説を整理し、まず中断の小さい通知で解くための要求と受入条件を定める。',
  attributes: [
    { label: '読者', value: '開発者' },
    {
      label: '段階',
      value: '5. デリバリー（要求と受入条件を確定した。実装は未着手）',
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
            term: '`refile.org`',
            description: (
              <>
                分類前のメモやタスクをいったん置くファイル。
                <DocRef kind="PRD" number="0006" />
                「ノートとタスクの管理」で定める。
              </>
            ),
          },
          {
            term: '促し',
            description: (
              <>
                一定の間隔で、所有者に <Code>refile.org</Code>{' '}
                へメモを書くよう求めること。
              </>
            ),
          },
          {
            term: '一時停止',
            description: '所有者が選んだ時間だけ、促しを止めること。',
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
            所有者は、<Code>refile.org</Code> を1回の操作で開ける（
            <DocRef kind="PRD" number="0006" /> の要求8）。
            それでも、作業中に考えたことや気付きを <Code>refile.org</Code>{' '}
            に書かないまま忘れてしまう。
          </Prose>
          <Prose>
            所有者の申告では、書き忘れは毎日、毎時間のように起きる。
            意思の力で書こうとしても続かない。
            書き忘れた考えを思い出したり、同じことを考え直したりするために、所有者の時間が失われている。
            この根拠は所有者の申告であり、件数を測ってはいない。
          </Prose>
        </DocSub>
        <DocSub title="なぜ今か">
          <Prose>
            <Code>refile.org</Code> の運用が <DocRef kind="PRD" number="0006" />{' '}
            で整った。 次の段階として、<Code>refile.org</Code>{' '}
            に書く習慣をつけたい。
          </Prose>
        </DocSub>
        <DocSub title="対象となる利用者">
          <Prose>リポジトリの所有者本人だけを対象とする。</Prose>
        </DocSub>
        <DocSub title="仮説">
          <Bullets>
            <Item>
              15分ごとに促されれば、<Code>refile.org</Code>{' '}
              に残るメモの件数が増える。
            </Item>
            <Item>15分ごとに作業を中断されても、作業の効率は落ちない。</Item>
            <Item>
              通知だけでも、<Code>refile.org</Code>{' '}
              に残るメモの件数が導入前より増える。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="提供する価値">
          <Prose>
            所有者は、作業中の考えを <Code>refile.org</Code>{' '}
            に残し、後から拾える。
            書くかどうかを、所有者が意識しなくてよくなる。
            <Code>refile.org</Code> のメモから、1日の作業の流れをたどれる。
          </Prose>
        </DocSub>
        <DocSub title="対象外">
          <Bullets>
            <Item>
              <Code>refile.org</Code> のメモを分類して移す作業。
            </Item>
            <Item>スマートフォンなど、ほかの端末からメモを書くこと。</Item>
            <Item>
              促しの間隔を、作業の状況に合わせて自動で長くしたり短くしたりすること。
            </Item>
            <Item>エディター以外で作業しているときに促すこと。</Item>
          </Bullets>
        </DocSub>
        <DocSub title="制約とトレードオフ">
          <Prose>所有者は、次のことを受け入れる。</Prose>
          <Bullets>
            <Item>
              メモを書く習慣をつける代わりに、15分ごとに作業を中断される。
            </Item>
            <Item>
              エディターの中で促す代わりに、エディターを開いていないときは促されない。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="成功条件">
          <Prose>
            <Code>refile.org</Code> のメモの件数が、導入前より増える。
            数値目標は設けない。
          </Prose>
        </DocSub>
        <DocSub title="計測と学習の計画">
          <Prose>
            導入前と導入後の各2週間について、<Code>refile.org</Code>{' '}
            に追加された見出しの数を、<Code>refile.org</Code> を置くリポジトリの
            Git 履歴から数えて比べる。
            中断がつらいと感じた場合は所有者が記録し、促しの間隔や方法を見直す材料にする。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Solution" title="解決策">
        <DocSub title="解決案とトレードオフ">
          <Prose>次の3案を比べ、案Aを採った。</Prose>
          <TradeOffs
            items={[
              {
                option: 'A. 通知だけ',
                fields: [
                  { label: '振る舞い', value: 'エディターに通知が出る' },
                  { label: '利点', value: '中断が最も小さい' },
                  { label: '欠点', value: '無視できる' },
                ],
              },
              {
                option: 'B. 入力欄を開く',
                fields: [
                  {
                    label: '振る舞い',
                    value: '入力欄が開き、書かずに閉じられる',
                  },
                  { label: '利点', value: '書き始める手間がない' },
                  { label: '欠点', value: '閉じる癖がつくおそれがある' },
                ],
              },
              {
                option: 'C. 書くまで閉じられない',
                fields: [
                  {
                    label: '振る舞い',
                    value: '1件書くまで入力欄を閉じられない',
                  },
                  { label: '利点', value: '意思の力に頼らない' },
                  { label: '欠点', value: '中断が最も大きい' },
                ],
              },
            ]}
          />
          <Prose>
            「問題と根拠」では、意思の力で書こうとしても続かないとしている。
            案Aは、最後には意思の力に頼る。
            それでも、まず中断の最も小さい案Aで試す。
            3つ目の仮説が外れた場合は、案Bまたは案Cに切り替える。
          </Prose>
        </DocSub>
        <DocSub title="要求と受入条件">
          <Prose>各要求と、その要求を受け入れる条件は次のとおり。</Prose>
          <Figure caption="直接 refile.org に書いた場合も数え直す。促しは通知だけで、書くかどうかは所有者が決める。">
            <FigSvg
              height={240}
              label="最後のメモから15分で通知が出て、メモを書くと数え直し、一時停止の間は通知が止まる流れ"
            >
              <FigNode
                x={210}
                y={0}
                w={350}
                h={52}
                tone="ghost"
                title="一時停止（30分・1時間・2時間）"
                lines={['その間は通知が出ない']}
              />
              <FigArrow
                points={[
                  [300, 90],
                  [300, 52],
                ]}
                tone="soft"
                head={false}
              />
              <FigLabel x={334} y={72}>
                止める
              </FigLabel>
              <FigArrow
                points={[
                  [240, 52],
                  [80, 52],
                  [80, 86],
                ]}
                tone="soft"
              />
              <FigLabel x={150} y={72}>
                過ぎたら数え直す
              </FigLabel>

              <FigNode
                x={0}
                y={90}
                w={160}
                h={64}
                title="起動、または直前のメモ"
                lines={['ここから15分を数える']}
              />
              <FigArrow
                points={[
                  [160, 122],
                  [216, 122],
                ]}
              />
              <FigLabel x={188} y={108}>
                15分
              </FigLabel>
              <FigNode
                x={220}
                y={90}
                w={160}
                h={64}
                tone="amber"
                title="エディターに通知"
                lines={['閉じるか書くまで残る']}
              />
              <FigArrow
                points={[
                  [380, 122],
                  [416, 122],
                ]}
                tone="neon"
              />
              <FigNode
                x={420}
                y={90}
                w={170}
                h={64}
                tone="neon"
                title="1回の操作で入力欄"
                lines={['日時付きの見出しを書く']}
              />
              <FigArrow
                points={[
                  [590, 122],
                  [626, 122],
                ]}
                tone="neon"
              />
              <FigNode
                x={630}
                y={90}
                w={130}
                h={64}
                tone="mint"
                title="refile.org"
                lines={['見出しが1件増える']}
              />
              <FigArrow
                points={[
                  [695, 154],
                  [695, 200],
                  [80, 200],
                  [80, 158],
                ]}
                tone="neon"
              />
              <FigLabel x={390} y={190}>
                見出しが増えた時刻から15分を数え直す
              </FigLabel>
            </FigSvg>
          </Figure>
          <Requirements
            items={[
              {
                id: '1',
                demand:
                  '最後にメモを書いてから15分たつと、エディターに通知が出る',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '起動または最後のメモから15分たつと通知が出る。15分たつ前には出ない',
                  },
                ],
              },
              {
                id: '2',
                demand: '通知は、所有者が閉じるかメモを書くまで残る',
                fields: [
                  {
                    label: '受入条件',
                    value: '閉じる操作をするかメモを書くまで、通知が消えない',
                  },
                ],
              },
              {
                id: '3',
                demand: '1回の操作で、日時付きの見出しを書く入力欄が開く',
                fields: [
                  {
                    label: '受入条件',
                    value: '1回の操作で入力欄が開き、メモの本文を書ける',
                  },
                ],
              },
              {
                id: '4',
                demand: (
                  <>
                    書いたメモは、日時付きの見出しとして <Code>refile.org</Code>{' '}
                    に追加される
                  </>
                ),
                fields: [
                  {
                    label: '受入条件',
                    value: (
                      <>
                        書いたメモが <Code>* [日時] 本文</Code> の形で{' '}
                        <Code>refile.org</Code> に追加される
                      </>
                    ),
                  },
                ],
              },
              {
                id: '5',
                demand: (
                  <>
                    <Code>refile.org</Code>{' '}
                    の見出しが1件増えると、15分を数え直す
                  </>
                ),
                fields: [
                  {
                    label: '受入条件',
                    value: (
                      <>
                        <Code>refile.org</Code>{' '}
                        の見出しが増えると、その時刻から15分を数え直す
                      </>
                    ),
                  },
                ],
              },
              {
                id: '6',
                demand: '一時停止でき、止めるたびに長さを選べる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '30分、1時間、2時間から長さを選べ、その間は通知が出ない',
                  },
                ],
              },
              {
                id: '7',
                demand: '一時停止の時間が過ぎると、促しが自動で再開する',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '止めた時間が過ぎると、その時刻から15分後に通知が出る',
                  },
                ],
              },
            ]}
          />
          <Prose>
            要求1の15分は、起動してからメモを1件も書いていない場合、起動した時刻から数える。
            エディターを複数開いている場合は、エディターごとに別々に数えて通知する。
          </Prose>
          <Prose>
            要求4の見出しは、<Code>* [2026-10-04 Sun 14:30] メモの本文</Code>{' '}
            のように、レベル1の見出しの先頭に日時を置く。
          </Prose>
          <Prose>
            要求5は、メモの書き方を問わない。
            <Code>refile.org</Code> を直接開いて書いた場合も、数え直す。
          </Prose>
        </DocSub>
        <DocSub title="成功条件の測定方法">
          <Prose>
            <Code>refile.org</Code> を置くリポジトリの Git 履歴から、
            <Code>refile.org</Code> に追加された見出しの数を数える。
            導入日より前の2週間と、導入日からの2週間を、コミット日で分けて比べる。
          </Prose>
          <Prose>
            コミットする前に別のファイルへ移した見出しは数えられない。
            この漏れは導入の前と後の両方で起きるため、比べるうえでは受け入れる。
          </Prose>
        </DocSub>
        <DocSub title="展開計画">
          <Prose>
            所有者のマシンだけに提供する。
            開発環境を「すべて」と「最小限」のどちらの範囲で導入しても、すべての要求を満たす。
            段階的な公開はしない。
            変更は、各マシンで開発環境の導入をやり直した時点で、そのマシンに反映される。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Open Questions" title="未解決の問い">
        <Prose>現時点で、未解決の問いはない。</Prose>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: '所有者の依頼（2026-10-04）: 「15分ごとにneovimのrefileにメモを強制するにはどうすればいいでしょうか」',
            },
            {
              text: '所有者へのヒアリング（2026-10-04）: 課題と解決策のすべての項目',
            },
            {
              text: (
                <>
                  <DocLink href="/prd/0006_note-taking">
                    PRD 0006「ノートとタスクの管理」
                  </DocLink>
                  : <Code>refile.org</Code> の定義、<Code>refile.org</Code>{' '}
                  を1回の操作で開く要求
                </>
              ),
            },
          ]}
        />
      </DocSection>
    </>
  )
}
