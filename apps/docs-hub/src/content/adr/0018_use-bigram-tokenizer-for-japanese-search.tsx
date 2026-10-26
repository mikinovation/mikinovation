import {
  Alternatives,
  Bullets,
  Code,
  DocRef,
  DocSection,
  Item,
  Prose,
  Sources,
} from '@/components/doc'
import { FigArrow, FigNode, FigNote, FigSvg, Figure } from '@/components/figure'

export const meta = {
  title: 'ドキュメントハブの日本語検索に文字 bigram のトークナイザーを使う',
  lead: 'ドキュメントハブで日本語の全文検索をどう実現するかの決定を記録する。VitePress 標準の検索を使い、トークナイザーを文字 bigram に差し替える。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-10-06' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>
        用語は <DocRef kind="PRD" number="0010" /> および{' '}
        <DocRef kind="ADR" number="0017" /> と同じ意味で使う。
        ドキュメントハブ（以下、ハブ）は、<Code>docs/</Code> の Markdown を Web
        上で閲覧できるようにするサイトを指す。
        トークナイザーは、検索のために文を語の単位に区切る関数を指す。 文字
        bigram
        は、文を先頭から1文字ずつずらしながら、2文字ずつ区切る方法を指す。たとえば「全文検索」は「全文」「文検」「検索」に区切る。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="ADR" number="0017" /> で、ハブの生成に VitePress
          を使うと決めた。 VitePress
          標準の検索（MiniSearch）は、日本語を分かち書きしない。
          そのため、標準のままでは <DocRef kind="PRD" number="0010" />{' '}
          の機能要求2（日本語のキーワードによる全文検索）を満たせない。
          <DocRef kind="ADR" number="0017" /> では、検索の方式を別の ADR
          で決めることにしていた。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>選べる案は、次の条件を満たす必要がある。</Prose>
        <Bullets>
          <Item>
            機能要求2の受入条件を満たす。受入条件は、既存の文書の本文にある日本語の語で検索すると、その文書が結果に出ることである。
          </Item>
          <Item>文書の書き方を変えない。</Item>
          <Item>所有者一人で保守でき、運用費をかけない。</Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          VitePress 標準の検索（MiniSearch）を使う。 MiniSearch
          のトークナイザーを、文字 bigram で区切る関数に差し替える。
        </Prose>
        <Figure caption="語の区切りを判断せず2文字ずつに分けるため、語の途中からでも一致する。">
          <FigSvg
            height={200}
            label="文書の語と検索語を同じ2文字の組に分け、重なった組で一致する仕組み"
          >
            <FigNode
              x={0}
              y={20}
              w={220}
              h={50}
              title="文書の中の語"
              lines={['ドキュメントハブ']}
            />
            <FigNode x={260} y={25} w={62} h={40} rx={8} title="ドキ" />
            <FigNode x={330} y={25} w={62} h={40} rx={8} title="キュ" />
            <FigNode x={400} y={25} w={62} h={40} rx={8} title="ュメ" />
            <FigNode
              x={470}
              y={25}
              w={62}
              h={40}
              rx={8}
              tone="mint"
              title="メン"
            />
            <FigNode
              x={540}
              y={25}
              w={62}
              h={40}
              rx={8}
              tone="mint"
              title="ント"
            />
            <FigNode x={610} y={25} w={62} h={40} rx={8} title="トハ" />
            <FigNode x={680} y={25} w={62} h={40} rx={8} title="ハブ" />

            <FigArrow
              points={[
                [501, 110],
                [501, 70],
              ]}
              tone="neon"
            />
            <FigArrow
              points={[
                [571, 110],
                [571, 70],
              ]}
              tone="neon"
            />

            <FigNode
              x={0}
              y={115}
              w={220}
              h={50}
              tone="neon"
              title="検索語"
              lines={['メント']}
            />
            <FigNode
              x={470}
              y={115}
              w={62}
              h={40}
              rx={8}
              tone="mint"
              title="メン"
            />
            <FigNode
              x={540}
              y={115}
              w={62}
              h={40}
              rx={8}
              tone="mint"
              title="ント"
            />
            <FigNote x={380} y={188}>
              どちらも同じ区切り方で分けるため、語の一部でも組が重なる
            </FigNote>
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            文字 bigram
            は辞書による分割の結果に左右されない。本文にある2文字以上の語なら、文中のどこを切り出して検索しても一致する。そのため、受入条件を確実に満たせる。
          </Item>
          <Item>
            トークナイザーを差し替えるだけで済み、検索画面も標準のものを使える。追加の依存や外部のサービスが要らないため、一人で保守し、運用費をかけないという制約を守れる。
          </Item>
          <Item>
            文書は数十本の規模なので、文字 bigram
            で索引が大きくなっても問題になりにくい。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: (
                <>
                  <Code>Intl.Segmenter</Code> で単語に分割する案
                </>
              ),
              reason:
                '辞書による分割に頼るため、複合語の一部で検索すると一致しないことがある。たとえば「全文検索」が1語として索引されると、「検索」では引けない。受入条件を外すおそれがある。',
            },
            {
              option: 'Pagefind を使う案',
              reason:
                'VitePress の検索画面とは別のツールを組み込み、保守することになる。',
            },
            {
              option: 'Algolia DocSearch を使う案',
              reason:
                '申請が要り、外部のサービスに依存する。一人で保守し、運用費をかけないという制約から外れる。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            索引を作るときと検索するときに、同じトークナイザーを使う必要がある。トークナイザーの関数を自作し、保守する。
          </Item>
          <Item>
            索引は単語単位で区切る場合より大きくなり、ページと一緒に配信する量が増える。
          </Item>
          <Item>関係の薄い文書も、検索結果に混ざりやすくなる。</Item>
          <Item>
            1文字だけの検索をどう扱うかと、英数字の語を2文字ずつ区切るかどうかは、この
            ADR では決めていない。設計書で決める必要がある。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0010「ドキュメントハブ」',
              href: '/prd/0010_document-hub',
            },
            {
              text: 'ADR 0017「ドキュメントハブを VitePress で生成する」',
              href: '/adr/0017_use-vitepress-for-document-hub',
            },
            { text: '所有者へのヒアリング（2026-10-06）' },
          ]}
        />
      </DocSection>
    </>
  )
}
