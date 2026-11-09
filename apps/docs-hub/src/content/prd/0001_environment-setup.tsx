import {
  DocSection,
  DocSub,
  DocTable,
  Prose,
  Requirements,
  Sources,
} from '@/components/doc'
import { FigArrow, FigNode, FigSvg, Figure } from '@/components/figure'
import type { DocMeta } from '@/lib/docs'

export const meta = {
  title: '開発環境の導入',
  lead: '所有者が、1回の操作でどのマシンにも同じ開発環境を導入できるようにするための要求と受入条件を定める。',
  repository: 'mikinovation',
  attributes: [
    { label: '読者', value: 'PdM、開発者、QA担当、CS担当' },
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
      <DocSection label="Problem" title="課題">
        <DocSub title="問題と根拠">
          <Prose>
            開発環境を手作業で構築すると、同じ環境を再現できない。 所有者は
            WSL（Windows 上で Linux を動かす機能）と macOS
            の複数マシンを使っており、手作業で揃えるとマシン間で設定がずれ、手順も漏れる。
            使えなくなった環境の復旧にも時間がかかる。 マシンのユーザー名は、OS
            の導入方法によってマシンごとに異なる。設定がユーザー名を前提にすると、ユーザー名の異なるマシンには導入できない。
          </Prose>
        </DocSub>
        <DocSub title="対象となる利用者">
          <Prose>リポジトリの所有者本人だけを対象とする。</Prose>
        </DocSub>
        <DocSub title="提供する価値">
          <Prose>
            所有者は、1回の操作で既存マシンと同じ開発環境を再現できる。
          </Prose>
        </DocSub>
        <DocSub title="対象外">
          <DocTable
            head={['対象外にすること', '扱い']}
            rows={[
              [
                '導入操作の前提となるツールの準備',
                '所有者が事前に済ませておく',
              ],
              [
                '所有者と異なるマシン名、リポジトリの配置先での導入',
                'ユーザー名は問わない（要求6）',
              ],
              [
                'WSL で使う端末アプリの設定を Windows 側へ配置すること',
                '所有者が手作業で配置する',
              ],
              [
                'macOS で、Claude Code から操作するブラウザを導入すること',
                '所有者が手作業で導入する',
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
                '1回の操作で導入できる',
                '導入操作の前提となるツールを事前に準備しておく必要がある',
              ],
              [
                'どのマシンでもツールの版が揃う',
                '新しい版は、所有者が版の固定を更新するまで入らない',
              ],
              [
                '所有者の環境だけを前提にできる',
                '所有者と異なるマシン名、リポジトリの配置先では導入できない',
              ],
            ]}
          />
        </DocSub>
        <DocSub title="成功条件">
          <Prose>
            新規のマシンまたは復旧したマシンで、前提となるツールの準備と導入操作のほかに手作業をせず、既存マシンと同じ環境が得られる。対象外に挙げた作業は、この手作業に含めない。
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
          <Figure caption="どの OS でも導入操作は同じで、同じ環境が揃う。">
            <FigSvg
              height={200}
              label="3種類の OS のどれでも同じ導入操作を行い、同じ開発環境が揃う流れ"
            >
              <FigNode x={0} y={10} w={130} h={44} rx={10} title="WSL" />
              <FigNode x={0} y={78} w={130} h={44} rx={10} title="macOS" />
              <FigNode
                x={0}
                y={146}
                w={130}
                h={44}
                rx={10}
                title="それ以外の Linux"
              />
              <FigArrow
                points={[
                  [130, 32],
                  [165, 32],
                ]}
                head={false}
              />
              <FigArrow
                points={[
                  [130, 100],
                  [165, 100],
                ]}
                head={false}
              />
              <FigArrow
                points={[
                  [130, 168],
                  [165, 168],
                ]}
                head={false}
              />
              <FigArrow
                points={[
                  [165, 32],
                  [165, 168],
                ]}
                head={false}
              />
              <FigArrow
                points={[
                  [165, 100],
                  [196, 100],
                ]}
                tone="neon"
              />
              <FigNode
                x={200}
                y={60}
                w={180}
                h={80}
                tone="neon"
                title="1回の導入操作"
                lines={['何度実行しても同じ状態']}
              />
              <FigArrow
                points={[
                  [380, 100],
                  [446, 100],
                ]}
              />
              <FigNode
                x={450}
                y={60}
                w={300}
                h={80}
                align="start"
                padX={24}
                title="日常的に使う開発環境の全体"
              />
            </FigSvg>
          </Figure>
          <Prose>各要求と、その要求を受け入れる条件は次のとおり。</Prose>
          <Requirements
            items={[
              {
                id: '1',
                demand: '1回の操作で開発環境を導入できる',
                fields: [
                  {
                    label: '受入条件',
                    value: '導入操作1回で、日常的に使う開発環境が揃う',
                  },
                ],
              },
              {
                id: '2',
                demand:
                  'macOS、WSL、それ以外の Linux のどれでも、同じ操作で導入できる',
                fields: [
                  {
                    label: '受入条件',
                    value: '3種類の OS のどれでも導入できる',
                  },
                ],
              },
              {
                id: '4',
                demand: '何度導入しても同じ状態になる',
                fields: [
                  {
                    label: '受入条件',
                    value: '導入済みのマシンで再度導入しても、状態が変わらない',
                  },
                ],
              },
              {
                id: '5',
                demand: '導入中の進み具合と、完了後にすることを示す',
                fields: [
                  {
                    label: '受入条件',
                    value: '完了時に、シェルの再起動を案内する',
                  },
                ],
              },
              {
                id: '6',
                demand: 'マシンのユーザー名にかかわらず、同じ操作で導入できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '設定を書き換えずに、所有者と異なるユーザー名で導入できる',
                  },
                ],
              },
            ]}
          />
          <Prose>
            要求3は導入範囲の指定を扱っていたため取り下げた。残る要求の番号は詰めない。
          </Prose>
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
            { text: '所有者へのヒアリング（2026-09-27）' },
            {
              text: '所有者へのヒアリング（2026-10-02）: 段階、制約とトレードオフ、計測と学習の計画、成功条件の測定方法、展開計画',
            },
            {
              text: '所有者の依頼（2026-10-06）: ユーザー名に依存せずに導入できるようにする（要求6）',
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
