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
import { FigArrow, FigNode, FigSvg, Figure } from '@/components/figure'

export const meta = {
  title: 'エディターのプラグイン管理',
  lead: '所有者が、どのマシンでも同じ版のプラグインを揃え、版を上げる時期を自分で決められるようにするための要求と受入条件を定める。',
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
            term: 'エディター',
            description: (
              <>
                <DocRef kind="PRD" number="0002" />
                「エディターの導入」で導入するエディター。
              </>
            ),
          },
          { term: 'プラグイン', description: 'エディターに機能を加える拡張。' },
          {
            term: '版の記録',
            description: '各プラグインの版を書き留め、リポジトリに置く記録。',
          },
          {
            term: '導入操作',
            description: (
              <>
                <DocRef kind="PRD" number="0001" />
                「開発環境の導入」で定める、開発環境を導入する操作。
              </>
            ),
          },
        ]}
      />
      <DocSection label="Problem" title="課題">
        <DocSub title="問題と根拠">
          <Prose>
            プラグインの版がマシンごとにずれると、同じ設定でもマシンによって挙動が変わり、一部のマシンではエラーが出る。
            また、プラグインをマシンごとに手作業で揃えるには手間がかかる。
          </Prose>
        </DocSub>
        <DocSub title="対象となる利用者">
          <Prose>リポジトリの所有者本人だけを対象とする。</Prose>
        </DocSub>
        <DocSub title="提供する価値">
          <Prose>
            所有者は、どのマシンでも同じ版のプラグインを使える。
            プラグインの版を上げる時期を、所有者が決められる。
            プラグインの新しい版が出たことを、週に1回まとめて知ることができる。
            使わないプラグインを起動時に読み込まないため、エディターが速く起動する。
          </Prose>
        </DocSub>
        <DocSub title="対象外">
          <Bullets>
            <Item>
              開発環境の導入で設定される環境変数がない状態で起動したときに、プラグインの版を固定すること。
            </Item>
            <Item>
              あるマシンで更新した版の記録を、プラグインを取得済みの既存のマシンへ反映すること。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="制約とトレードオフ">
          <Prose>所有者は、次のことを受け入れる。</Prose>
          <Bullets>
            <Item>
              どのマシンでも版を揃える代わりに、所有者が版を更新するまで新しい版は入らない。
            </Item>
            <Item>
              初回起動でプラグインを自動で揃える代わりに、初回起動にはネットワークへの接続が必要になる。
            </Item>
            <Item>
              新しい版をまとめて知らせる代わりに、新しい版が出てから知るまでに最大で1週間かかる。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="成功条件">
          <Prose>
            新規のマシンまたは復旧したマシンで、既存マシンと同じ版のプラグインが揃い、起動時にエラーが出ない。
            数値目標は設けない。
          </Prose>
        </DocSub>
        <DocSub title="計測と学習の計画">
          <Prose>
            新規のマシンへの導入と、壊れたマシンの復旧のたびに、成功条件を満たしたかを確かめる。
            手作業での設定が必要になった場合や、不具合が生じた場合は記録し、要求と対象外を見直す材料にする。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Solution" title="解決策">
        <DocSub title="要求と受入条件">
          <Prose>各要求と、その要求を受け入れる条件は次のとおり。</Prose>
          <Figure caption="新しい版は提案として溜まり、所有者が取り込んだ時点ではじめて各マシンの版が動く。">
            <FigSvg
              height={210}
              label="上流の新しい版が週1回の提案として届き、所有者が取り込んだ版の記録が各マシンに反映される流れ"
            >
              <FigNode
                x={0}
                y={20}
                w={170}
                h={64}
                tone="ghost"
                title="上流の新しい版"
                lines={['いつ出るかは選べない']}
              />
              <FigArrow
                points={[
                  [170, 52],
                  [206, 52],
                ]}
              />
              <FigNode
                x={210}
                y={20}
                w={180}
                h={64}
                tone="amber"
                title="週に1回の提案"
                lines={['まとめて1つ届く']}
              />
              <FigArrow
                points={[
                  [390, 52],
                  [426, 52],
                ]}
              />
              <FigNode
                x={430}
                y={20}
                w={180}
                h={64}
                tone="neon"
                title="所有者が取り込む"
                lines={['版を上げる時期を決める']}
              />
              <FigArrow
                points={[
                  [520, 84],
                  [520, 116],
                  [396, 116],
                ]}
                tone="neon"
              />
              <FigNode
                x={210}
                y={120}
                w={180}
                h={64}
                tone="neon"
                title="版の記録"
                lines={['全マシンで共通']}
              />
              <FigArrow
                points={[
                  [390, 152],
                  [426, 152],
                ]}
              />
              <FigNode
                x={430}
                y={120}
                w={180}
                h={64}
                tone="mint"
                title="各マシン"
                lines={['初回起動で記録どおりに揃う']}
              />
              <FigArrow
                points={[
                  [210, 152],
                  [176, 152],
                ]}
                tone="soft"
                head={false}
              />
              <FigNode
                x={0}
                y={120}
                w={170}
                h={64}
                tone="ghost"
                lines={['取り込むまで', '版は変わらない']}
              />
            </FigSvg>
          </Figure>
          <Requirements
            items={[
              {
                id: '1',
                demand: '初回起動時に、所有者が操作せずに全プラグインが揃う',
                fields: [
                  {
                    label: '受入条件',
                    value: '初回起動のあと、全プラグインが導入されている',
                  },
                ],
              },
              {
                id: '2',
                demand: 'どのマシンでも、版の記録どおりの版のプラグインが入る',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '新規に導入したマシンで、各プラグインの版が版の記録と一致する',
                  },
                ],
              },
              {
                id: '3',
                demand:
                  '所有者がプラグインの版を更新し、その結果を版の記録としてリポジトリに残せる',
                fields: [
                  {
                    label: '受入条件',
                    value: '更新の操作のあと、版の記録が新しい版に変わる',
                  },
                ],
              },
              {
                id: '4',
                demand: 'プラグインの新しい版を自動で取り込まない',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '所有者が更新の操作をしない限り、プラグインの版が変わらない',
                  },
                ],
              },
              {
                id: '5',
                demand: 'プラグインを、使うときに読み込む',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '起動直後に読み込まれていないプラグインがあり、対応する操作をすると使える',
                  },
                ],
              },
              {
                id: '6',
                demand:
                  '取得時に組み立てが必要なプラグインも、所有者が道具を手作業で導入せずに使える',
                fields: [
                  {
                    label: '受入条件',
                    value: '導入直後に、組み立てが必要なプラグインを使える',
                  },
                ],
              },
              {
                id: '7',
                demand: 'プラグインの設定の誤りを、変更のたびに自動で見つける',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '変更のたびに、起動時のエラーとプラグインの定義の形式が自動で確かめられる',
                  },
                ],
              },
              {
                id: '8',
                demand:
                  'プラグインの新しい版を、週に1回まとめて所有者に知らせる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '新しい版があるとき、週に1回、版の記録を新しい版に書き換える変更の提案が1つ作られる',
                  },
                ],
              },
            ]}
          />
          <Prose>
            要求1の初回起動には、ネットワークへの接続が必要である。
            「最小限」では、要求1で揃う全プラグインは、メモとタスクの管理に使うプラグインを指す。版の記録は「すべて」と共通とする。
            要求8の変更の提案は、所有者が取り込むまで版を変えないため、要求4と両立する。
            起動時にエラーが出ないことは、
            <DocRef kind="PRD" number="0002" /> の要求3で定める。
          </Prose>
        </DocSub>
        <DocSub title="成功条件の測定方法">
          <Prose>
            新規のマシンまたは復旧したマシンに導入したとき、所有者が要求1から6の受入条件を手作業で一つずつ確かめる。
            要求7の受入条件は、変更のたびに自動で確かめる。
            要求8の受入条件は、変更の提案が作られるたびに、所有者が確かめる。
          </Prose>
        </DocSub>
        <DocSub title="展開計画">
          <Prose>
            所有者のマシンだけに提供する。 段階的な公開はしない。
            版の記録の更新は、新規に導入するマシンと、プラグインを取得し直したマシンに反映される。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Open Questions" title="未解決の問い">
        <Prose>なし。</Prose>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            { text: '所有者へのヒアリング（2026-10-04）' },
            {
              text: '所有者の依頼（2026-10-04、新しい版を週に1回まとめて知らせる）',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
