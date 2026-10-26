import {
  Bullets,
  Code,
  DocRef,
  DocSection,
  DocSub,
  Item,
  Prose,
  Requirements,
  Sources,
  Steps,
  Terms,
  TradeOffs,
} from '@/components/doc'
import {
  FigArrow,
  FigCard,
  FigChips,
  FigGrid,
  FigNode,
  FigNote,
  FigSvg,
  Figure,
} from '@/components/figure'

export const meta = {
  title: 'ドキュメントハブ',
  lead: 'docs/ の文書を探しにくく、関連する文書をたどりにくいという課題について、問題と仮説を整理し、何を解決し何を解決しないかを定める。そのうえで、Web 上の専用サイトで解くための要求を定める。',
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
            term: 'ドキュメントハブ',
            description: (
              <>
                <Code>docs/</Code> の Markdown を Web
                上で閲覧できるようにするサイト。以下、ハブと呼ぶ。
              </>
            ),
          },
          {
            term: '文書参照',
            description: (
              <>
                本文中で別の文書を指す表記。「
                <DocRef kind="ADR" number="0007" />
                」「
                <DocRef kind="PRD" number="0004" />
                」のように、文書の種類と番号で書く。
              </>
            ),
          },
          {
            term: 'メタ情報',
            description:
              '各文書の冒頭の箇条書きに書く、読者、状態、段階などの情報。',
          },
        ]}
      />
      <DocSection label="Problem" title="課題">
        <DocSub title="問題と根拠">
          <Prose>
            所有者は、<Code>docs/</Code>{' '}
            の文書を読むときに次の問題を抱えている。
          </Prose>
          <Bullets>
            <Item>
              目的の文書を探しにくい。GitHub
              のファイル一覧と検索では、日本語の本文を横断して探しにくい。
            </Item>
            <Item>
              関連する文書をたどれない。文書参照がリンクになっておらず、参照先を一つずつ開き直している。
            </Item>
            <Item>
              文書を一覧で把握できない。どの ADR が採用されているか、どの PRD
              がどの段階かを一目で把握できない。
            </Item>
          </Bullets>
          <Prose>
            補助的な問題として、チームや協力者に、読み物として文書を共有しにくい。
          </Prose>
          <Prose>リポジトリでは、次の事実を確かめた。</Prose>
          <Bullets>
            <Item>
              <Code>docs/</Code> には26本の文書がある。内訳は ADR が16本、PRD
              が9本、設計書が1本である。
            </Item>
            <Item>
              文書参照はすべて文字だけで書かれており、リンクになっていない。
            </Item>
            <Item>メタ情報は、各文書の冒頭の箇条書きにしかない。</Item>
          </Bullets>
          <Prose>
            探しにくさは所有者の経験に基づく。
            問題の大きさを数値では検証していない。
          </Prose>
        </DocSub>
        <DocSub title="なぜ今か">
          <Prose>
            PRD、ADR、設計書、テストケース、計画を作るスキルが揃い、文書はこれから継続的に増える。
            <Code>docs/test/</Code> と <Code>docs/plan/</Code>{' '}
            もこれから追加され、文書の種類と文書参照が増える。
            文書の件数が少ないうちにハブを作る方が、手間が少ない。
          </Prose>
        </DocSub>
        <DocSub title="対象となる利用者">
          <Prose>所有者と、チームや協力者を対象とする。</Prose>
          <Prose>
            外部の閲覧者がハブを読むことは妨げないが、外部の閲覧者の問題は解かない。
            ハブを公開するのは、隠す理由がないためである。
          </Prose>
        </DocSub>
        <DocSub title="仮説">
          <Prose>
            文書を Web
            上で検索でき、文書参照をリンクでたどれるようになれば、次のことが起きる。
          </Prose>
          <Steps>
            <Item>関連する過去の決定（ADR や PRD）を見つける手間が減る。</Item>
            <Item>
              新しい文書を書くときに、既存の文書を参照する頻度が上がる。
            </Item>
            <Item>チームや協力者に、URL ひとつで文書を共有できる。</Item>
          </Steps>
        </DocSub>
        <DocSub title="提供する価値">
          <Prose>
            所有者は、過去の ADR や PRD をすぐに見つけられる。
            新しい文書を、既存の決定と食い違わないように書ける。
          </Prose>
          <Prose>
            チームや協力者は、URL ひとつで最新の文書を読める。
            各文書の状態（採用、段階など）を把握できる。
          </Prose>
        </DocSub>
        <DocSub title="対象外">
          <Bullets>
            <Item>
              このリポジトリの外にある文書。ほかのリポジトリ、Notion、Google
              Docs などを含む。
            </Item>
            <Item>
              <Code>docs/</Code> 以外の Markdown。README、SKILL.md、AGENTS.md
              などを含む。
            </Item>
            <Item>
              外部の閲覧者に向けた導入ページ、用語の説明、文章の品質向上。
            </Item>
            <Item>認証とアクセス制御。</Item>
            <Item>多言語化。</Item>
            <Item>Web 上での文書の編集。</Item>
          </Bullets>
        </DocSub>
        <DocSub title="制約とトレードオフ">
          <Prose>ハブは次の制約を守る。</Prose>
          <Bullets>
            <Item>正本は Git 上の Markdown とし、ハブは表示だけを担う。</Item>
            <Item>
              リポジトリは公開されており、ハブも検索エンジンに載る形で公開する。そのため、機密情報を{' '}
              <Code>docs/</Code>{' '}
              に書かない運用を前提とする。非公開のデータは、別の非公開リポジトリに置く。
            </Item>
            <Item>
              既存の文書と、文書を作るスキルの書き方を、ハブの都合で変えない。GitHub
              上でも、今のまま読める状態を保つ。
            </Item>
            <Item>所有者一人で保守できる範囲にとどめ、運用費をかけない。</Item>
          </Bullets>
          <Prose>所有者は、次のことを受け入れる。</Prose>
          <Bullets>
            <Item>
              認証を持たず、仕組みを簡素にする。その代わりに、誤って書いた内容がすぐに公開され、検索エンジンに載るおそれがある。
            </Item>
            <Item>
              文書の書き方を変えずにスキルとの整合を保つ代わりに、ハブに表示できるメタ情報は、今の書き方から読み取れる範囲に限られる。
            </Item>
            <Item>
              保守の負担を抑える代わりに、ハブの機能を絞る。どの機能を持たせるかは、段階4で定める。
            </Item>
            <Item>
              問題の大きさを、数値で検証しないまま進める。検証は、段階6の振り返りで行う。
            </Item>
            <Item>
              チームや協力者が同じ問題を感じているかを、確かめないまま進める。公開後に
              URL を伝えるときに意見を聞き、段階6で反映する。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="成功条件">
          <Prose>ハブを提供できているかは、次の条件で判断する。</Prose>
          <Bullets>
            <Item>
              <Code>docs/</Code> のすべての文書が、push
              の後に自動で公開されている。
            </Item>
            <Item>本文中の文書参照が、すべてリンクになっている。</Item>
            <Item>
              日本語のキーワードで全文を検索し、目的の文書を見つけられる。
            </Item>
          </Bullets>
          <Prose>ハブの成果は、次の条件で判断する。</Prose>
          <Bullets>
            <Item>
              新しく書いた文書で、既存の文書を参照する回数が増えている。
            </Item>
            <Item>
              チームや協力者と文書を共有するときに、ハブの URL が使われている。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="計測と学習の計画">
          <Prose>提供の条件は、公開後に次の方法で確かめる。</Prose>
          <Bullets>
            <Item>
              <Code>docs/</Code>{' '}
              の文書数と、ハブに載っている文書数が一致するかを確かめる。
            </Item>
            <Item>リンクにできなかった文書参照が0件であることを確かめる。</Item>
            <Item>
              代表的な日本語のキーワードを数件決めて検索し、目的の文書が見つかるかを手作業で確かめる。
            </Item>
          </Bullets>
          <Prose>成果の条件は、次の方法で確かめる。</Prose>
          <Bullets>
            <Item>
              公開前に既存の26本について、1本あたりの文書参照の数を数え、基準として記録する。公開後に書いた文書の同じ値と比べる。
            </Item>
            <Item>
              アクセス解析は入れない。ハブの URL
              を共有に使ったかは、振り返りのときに所有者が申告する。
            </Item>
          </Bullets>
          <Prose>
            公開から3か月後に、段階6として振り返り、結果を仮説1〜3と比べる。
            仮説1は数値では測らず、使ってみた感想として記録する。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Solution" title="解決策">
        <DocSub title="解決案とトレードオフ">
          <Prose>次の3案を比べ、案Aを採った。</Prose>
          <TradeOffs
            items={[
              {
                option: 'A. Web 上の専用サイト',
                fields: [
                  {
                    label: '振る舞い',
                    value:
                      '検索、種類別のメニュー、一覧を備え、文書参照がリンクになったサイトで読む',
                  },
                  { label: '利点', value: '問題 a〜d をすべて解く' },
                  { label: '欠点', value: '保守するものが一つ増える' },
                ],
              },
              {
                option: 'B. GitHub 上の索引ファイル',
                fields: [
                  {
                    label: '振る舞い',
                    value: (
                      <>
                        <Code>docs/</Code> に自動で作る一覧ページを、GitHub
                        上で開く
                      </>
                    ),
                  },
                  { label: '利点', value: '新しいサイトが要らない' },
                  {
                    label: '欠点',
                    value: '探しにくさとたどりにくさ（a と b）が残る',
                  },
                ],
              },
              {
                option: 'C. 手元のアプリで閲覧',
                fields: [
                  {
                    label: '振る舞い',
                    value: (
                      <>
                        Obsidian などのノートアプリで <Code>docs/</Code> を開く
                      </>
                    ),
                  },
                  { label: '利点', value: '検索とリンクが強力' },
                  {
                    label: '欠点',
                    value: 'URL で共有できず、d が残る。各自の導入が要る',
                  },
                ],
              },
            ]}
          />
          <Prose>
            案Bは一覧の問題（c）しか解けず、案Cは共有の問題（d）を解けない。
          </Prose>
          <Prose>所有者は、案Aについて次のことを受け入れる。</Prose>
          <Bullets>
            <Item>
              保守するものが一つ増える。この負担は、制約（一人で保守できる範囲にとどめ、機能を絞る）の中で引き受ける。
            </Item>
            <Item>
              ファイル名を変えると URL
              が変わり、それまでに共有したリンクは切れる。そのため、URL
              ひとつで共有できるという価値（問題 d）は一部弱まる。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="要求と受入条件">
          <Prose>業務要求と、各要求を受け入れる条件は次のとおり。</Prose>
          <Requirements
            items={[
              {
                id: '1',
                demand: (
                  <>
                    文書を <Code>docs/</Code> に書いて push
                    するだけでハブに公開できる
                  </>
                ),
                fields: [
                  {
                    label: '受入条件',
                    value:
                      'ほかのファイルを変えなくても、新しい文書を追加して push するとハブに載る',
                  },
                ],
              },
              {
                id: '2',
                demand:
                  '文書を作るスキルが書いたファイルを、手を加えないままハブで読める',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      'スキルが書いたままの文書が表示され、一覧にメタ情報が出る',
                  },
                ],
              },
            ]}
          />
          <Prose>
            業務要求1では、索引の更新や設定の追記など、ハブのための追加の作業を要らなくする。
            業務要求2のスキルは、PRD、ADR、設計書、テストケース、計画を作るスキルである。
          </Prose>
          <Figure caption="文書を書いて push する以外の作業を増やさない。ハブは正本を表示するだけで、内容を持たない。">
            <FigSvg
              height={210}
              label="文書を書いて push すると自動で公開され、読者がハブで検索し参照をたどる流れ"
            >
              <FigNode
                x={0}
                y={30}
                w={160}
                h={70}
                title="文書を書く"
                lines={['スキルが書いたまま']}
              />
              <FigArrow
                points={[
                  [160, 65],
                  [196, 65],
                ]}
              />
              <FigNode
                x={200}
                y={30}
                w={160}
                h={70}
                title="main へ push"
                lines={['ほかのファイルは触らない']}
              />
              <FigArrow
                points={[
                  [360, 65],
                  [396, 65],
                ]}
                tone="neon"
              />
              <FigNode
                x={400}
                y={30}
                w={160}
                h={70}
                tone="neon"
                title="自動で公開"
                lines={['10分以内に反映']}
              />
              <FigArrow
                points={[
                  [560, 65],
                  [596, 65],
                ]}
                tone="neon"
              />
              <FigNode
                x={600}
                y={30}
                w={160}
                h={70}
                tone="mint"
                title="読者"
                lines={['URL ひとつで読める']}
              />

              <FigNode
                x={200}
                y={128}
                w={560}
                h={66}
                tone="ghost"
                tag="ハブが担うのは表示だけ"
              />
              <FigNote x={330} y={172}>
                種類別のメニュー
              </FigNote>
              <FigNote x={480} y={172}>
                日本語の全文検索
              </FigNote>
              <FigNote x={640} y={172}>
                文書参照のリンク
              </FigNote>
              <FigArrow
                points={[
                  [480, 128],
                  [480, 100],
                ]}
                tone="soft"
                head={false}
              />

              <FigNode
                x={0}
                y={128}
                w={160}
                h={66}
                title="正本は Git"
                lines={['リポジトリの文書']}
              />
              <FigArrow
                points={[
                  [80, 128],
                  [80, 100],
                ]}
                tone="soft"
                head={false}
              />
            </FigSvg>
          </Figure>
          <Prose>機能要求と、各要求が解く問題と受入条件は次のとおり。</Prose>
          <Requirements
            items={[
              {
                id: '1',
                demand: '5種類の文書を、種類別のメニューから開ける',
                fields: [
                  { label: '解く問題', value: 'a' },
                  {
                    label: '受入条件',
                    value:
                      '文書がある種類がメニューに並び、各種類の全文書を開ける',
                  },
                ],
              },
              {
                id: '2',
                demand:
                  '日本語のキーワードで全文を検索し、該当する文書を開ける',
                fields: [
                  { label: '解く問題', value: 'a' },
                  {
                    label: '受入条件',
                    value:
                      '既存の文書の本文にある日本語の語で検索すると、その文書が結果に出る',
                  },
                ],
              },
              {
                id: '3',
                demand: '本文中の文書参照がリンクになり、参照先へ移れる',
                fields: [
                  { label: '解く問題', value: 'b' },
                  {
                    label: '受入条件',
                    value:
                      '既存の文書の文書参照がすべてリンクになり、参照先を開ける',
                  },
                ],
              },
              {
                id: '4',
                demand:
                  '種類ごとの一覧で、各文書の番号、タイトル、メタ情報が見られる',
                fields: [
                  { label: '解く問題', value: 'c' },
                  {
                    label: '受入条件',
                    value:
                      '一覧に番号とタイトルが出る。ADR は状態、PRD は段階が出る',
                  },
                ],
              },
              {
                id: '5',
                demand: '各文書に URL があり、本文を更新しても変わらない',
                fields: [
                  { label: '解く問題', value: 'd' },
                  {
                    label: '受入条件',
                    value:
                      '本文だけを変えて push した後も、その文書の URL が変わらない',
                  },
                ],
              },
              {
                id: '6',
                demand: 'Mermaid の図が図として表示される',
                fields: [
                  { label: '解く問題', value: '読みやすさ' },
                  {
                    label: '受入条件',
                    value: 'Mermaid のコードブロックが図として表示される',
                  },
                ],
              },
              {
                id: '7',
                demand: 'ダークモードで読める',
                fields: [
                  { label: '解く問題', value: '読みやすさ' },
                  {
                    label: '受入条件',
                    value:
                      'OS がダークモードならダークモードで表示され、手動でも切り替えられる',
                  },
                ],
              },
              {
                id: '8',
                demand: 'push の後、自動でハブに反映される',
                fields: [
                  { label: '解く問題', value: '業務要求1' },
                  {
                    label: '受入条件',
                    value:
                      'main ブランチへの push の後、10分以内にハブに反映される',
                  },
                ],
              },
              {
                id: '9',
                demand: 'スマートフォンでも崩れずに読める',
                fields: [
                  { label: '解く問題', value: '共有しやすさ' },
                  {
                    label: '受入条件',
                    value:
                      '幅375px の画面で、ページ全体を横にスクロールせずに本文を読める',
                  },
                ],
              },
            ]}
          />
          <Prose>
            要求1の5種類は、PRD、ADR、設計書、テストケース、計画である。
            テストケースと計画は、<Code>docs/test/</Code> と{' '}
            <Code>docs/plan/</Code> が追加された時点で載せる。
            文書が0件の種類は、メニューに出さない。
          </Prose>
          <Prose>
            要求3では、参照先が存在しない文書参照はリンクにせず、文字のまま表示する。
            <Code>ADR 0007 から ADR 0013</Code>{' '}
            のような範囲の参照は、範囲内に存在する文書すべてへのリンクを並べて表示する。
            どちらの場合も、文書の書き方は変えない。
          </Prose>
          <Prose>
            要求4のメタ情報は、ADR の状態、PRD の段階などである。
            メタ情報を読み取れない文書は、その欄を空欄にする。
          </Prose>
          <Prose>
            ただし、ファイル名を変えたときは、要求5の URL も変わる。 古い URL
            は引き継がない。
          </Prose>
          <Prose>
            要求7では、OS
            の設定に従って表示を切り替え、手動でも切り替えられるようにする。
            手動で選んだ表示は、ページを移っても保たれる。
          </Prose>
          <Prose>
            要求9では、広い表は表の中だけで横にスクロールできればよい。
          </Prose>
          <Prose>
            各文書から GitHub
            上の元のファイルを開く機能も検討したが、制約に従って機能を絞るため、要求に入れなかった。
          </Prose>
          <Figure caption="9つの機能要求のうち6つが問題 a から d に対応し、残る3つは読みやすさを支える。">
            <FigGrid wide>
              <FigCard tone="rose" title="a 目的の文書を探しにくい">
                <FigChips
                  tone="neon"
                  items={['要求1 種類別のメニュー', '要求2 日本語の全文検索']}
                />
              </FigCard>
              <FigCard tone="rose" title="b 関連する文書をたどれない">
                <FigChips tone="neon" items={['要求3 文書参照のリンク']} />
              </FigCard>
              <FigCard tone="rose" title="c 一覧で把握できない">
                <FigChips tone="neon" items={['要求4 メタ情報つきの一覧']} />
              </FigCard>
              <FigCard tone="rose" title="d 読み物として共有しにくい">
                <FigChips
                  tone="neon"
                  items={['要求5 変わらない URL', '要求8 push で自動反映']}
                />
              </FigCard>
              <FigCard
                tone="ghost"
                title="読みやすさを支える"
                note="問題 a から d には対応しない"
              >
                <FigChips
                  items={[
                    '要求6 図の表示',
                    '要求7 ダークモード',
                    '要求9 スマートフォン',
                  ]}
                />
              </FigCard>
            </FigGrid>
          </Figure>
        </DocSub>
        <DocSub title="成功条件の測定方法">
          <Prose>「計測と学習の計画」を、次の方法で具体化する。</Prose>
          <Bullets>
            <Item label="反映漏れ">
              公開時と振り返りのときに、<Code>docs/</Code>{' '}
              の文書数とハブの一覧の文書数を比べる。
            </Item>
            <Item label="文書参照のリンク">
              公開時に、リンクにならなかった文書参照が0件であることを確かめる。存在しない番号への参照は数えない。
            </Item>
            <Item label="検索">
              公開時にキーワードを5語決めて記録し、それぞれで目的の文書が結果に出るかを確かめる。振り返りでも、同じ5語で確かめる。
            </Item>
            <Item label="参照の増加">
              本文中の「PRD」「ADR」と4桁の番号の組を数える。公開前に、既存の26本の1本あたりの平均を基準として記録する。公開後3か月の間に書いた文書の平均と比べる。
            </Item>
            <Item label="URL の利用">振り返りのときに、所有者が申告する。</Item>
          </Bullets>
        </DocSub>
        <DocSub title="展開計画">
          <Bullets>
            <Item>
              main
              ブランチの内容だけをハブに載せる。作業中のブランチは載せない。
            </Item>
            <Item>
              段階的な公開はしない。検索エンジンも含めて、最初から全員に公開する。
            </Item>
            <Item>公開前に、文書参照の数の基準を記録する。</Item>
            <Item>
              公開後は、受入条件を確かめてから、チームや協力者に URL
              を伝える。そのときに、同じ問題を感じているかについて意見を聞く。
            </Item>
          </Bullets>
        </DocSub>
      </DocSection>
      <DocSection label="Open Questions" title="未解決の問い">
        <Prose>現時点で、未解決の問いはない。</Prose>
        <Prose>段階4までに残していた問いは、次のように決着させた。</Prose>
        <Bullets>
          <Item>
            問題の大きさの検証と、チームや協力者の意見の確認は、行わないまま進める。この判断は「制約とトレードオフ」に記した。
          </Item>
          <Item>仮説1は、使ってみた感想だけで測る。</Item>
          <Item>
            外部の閲覧者は、今回は対象となる利用者に含めない。段階6で見直す。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            { text: '所有者へのヒアリング（2026-10-06）: 課題のすべての項目' },
            {
              text: '所有者へのヒアリング（2026-10-06）: 解決案とトレードオフ、業務要求、機能要求',
            },
            {
              text: '所有者へのヒアリング（2026-10-06）: 受入条件、成功条件の測定方法、展開計画、未解決の問いの扱い',
            },
            {
              text: (
                <>
                  リポジトリの <Code>docs/</Code> の調査（2026-10-06）:
                  文書の本数と内訳、文書参照とメタ情報の書き方
                </>
              ),
            },
          ]}
        />
      </DocSection>
    </>
  )
}
