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

export const meta = {
  title: 'ドキュメントハブを VitePress で生成する',
  lead: 'ドキュメントハブをどの方法で生成するかの決定を記録する。サイトの生成には VitePress を使い、docs/ の Markdown をそのまま読み込む。',
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
        用語は <DocRef kind="PRD" number="0010" /> と同じ意味で使う。
        ドキュメントハブ（以下、ハブ）は、<Code>docs/</Code> の Markdown を Web
        上で閲覧できるようにするサイトを指す。 文書参照は、「
        <DocRef kind="ADR" number="0007" />
        」のように文書の種類と番号で別の文書を示す表記を指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="PRD" number="0010" /> では、<Code>docs/</Code>{' '}
          の文書について次の問題を挙げた。
        </Prose>
        <Prose>
          目的の文書を探しにくく、関連する文書をたどれない。文書を一覧で把握できず、チームや協力者にも共有しにくい。
        </Prose>
        <Prose>
          これらを解決するため、
          <DocRef kind="PRD" number="0010" /> では案A「Web
          上の専用サイト」を採った。 サイトをどの方法で生成するかは、
          <DocRef kind="PRD" number="0010" /> では決めていない。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0010" />{' '}
          の制約から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <DocTable
          head={['観点', '満たすべき条件']}
          rows={[
            [
              '正本',
              <>
                <Code>docs/</Code> の Markdown のままにし、ハブは表示だけを担う
              </>,
            ],
            [
              '既存の書き方',
              '既存の文書と、文書を作るスキルの書き方を変えない。文書にはフロントマターがなく、冒頭の H1 と箇条書きにタイトルとメタ情報を書いている',
            ],
            ['保守と費用', '所有者一人で保守でき、運用費がかからない'],
          ]}
        />
        <Prose>
          あわせて、
          <DocRef kind="PRD" number="0010" />{' '}
          の機能要求1〜9を満たせる必要がある。
          機能要求には、次のものが含まれる。
        </Prose>
        <DocTable
          head={['機能要求', '求めること']}
          rows={[
            ['機能要求2', '日本語のキーワードによる全文検索'],
            ['機能要求3', '文書参照のリンク化'],
            ['機能要求6', 'Mermaid の図の表示'],
            ['機能要求7', 'ダークモードと、その手動での切り替え'],
            ['機能要求9', '幅375px の画面での表示'],
          ]}
        />
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          ハブの生成には VitePress を使う。 VitePress の <Code>srcDir</Code> に{' '}
          <Code>docs/</Code> を指定し、<Code>docs/</Code> の Markdown
          を直接読み込む。
        </Prose>
        <Figure caption="正本の Markdown を複製も変換もせず、そのまま読み込んでサイトにする。">
          <FigSvg
            height={170}
            label="docs の Markdown を VitePress が srcDir として直接読み込み、ハブを生成する構成"
          >
            <FigNode
              x={0}
              y={50}
              w={220}
              h={70}
              tone="neon"
              title="docs/ の Markdown"
              lines={['正本をそのまま置く']}
            />
            <FigArrow
              points={[
                [220, 85],
                [266, 85],
              ]}
              tone="neon"
            />
            <FigNode
              x={270}
              y={50}
              w={220}
              h={70}
              title="VitePress"
              lines={['srcDir に docs/ を指定', '複製も変換もしない']}
            />
            <FigArrow
              points={[
                [490, 85],
                [536, 85],
              ]}
              tone="neon"
            />
            <FigNode
              x={540}
              y={50}
              w={220}
              h={70}
              tone="mint"
              title="ハブ"
              lines={['push のたびに生成する']}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <DocTable
          head={['決定した要素', '要求を満たせる理由']}
          rows={[
            [
              <>
                <Code>srcDir</Code> の指定
              </>,
              <>
                <Code>docs/</Code>{' '}
                を指定すれば、フロントマターのない既存の文書を書き換えずに表示できる
              </>,
            ],
            [
              '標準のテーマ',
              'ダークモードの切り替えとスマートフォン向けの表示を標準で備えるため、機能要求7と9を設定だけで満たせる',
            ],
            [
              'markdown-it のプラグイン',
              'Markdown の変換に足せるため、文書参照のリンク化（機能要求3）と Mermaid（機能要求6）を組み込める',
            ],
            ['静的なファイルの生成', '運用費のかからない公開先に置ける'],
          ]}
        />
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: 'Astro Starlight',
              reason: (
                <>
                  各文書のフロントマターに <Code>title</Code>{' '}
                  が必須である。既存の文書を変えずに読むには、独自のローダーを作って保守する必要がある。
                </>
              ),
            },
            {
              option: 'MkDocs Material',
              reason:
                'Python のツールチェーンが増える。リポジトリではすでに Node.js のツールチェーンを使っており、それとは別の言語のツールチェーンも保守することになる。',
            },
            {
              option: 'Next.js で作る案',
              reason:
                '採らない。Next.js は Markdown の表示、サイドバー、検索、ダークモードの切り替えを標準で備えていない。どれも自分で組み込み、保守することになる。',
            },
            {
              option: 'remark や unified などで自作する案',
              reason:
                '検索、ダークモード、スマートフォン向けの表示をすべて自分で作り、保守することになる。一人で保守できる範囲を超える。',
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <DocTable
          head={['領域', '引き受けること']}
          rows={[
            [
              '依存の追加',
              <>
                Node.js
                のパッケージが1つ増え、その依存を更新し続ける。リポジトリにはすでに{' '}
                <Code>packages/dotfiles</Code> に Node.js のパッケージがある
              </>,
            ],
            [
              'サイドバー',
              <>
                VitePress
                のサイドバーは設定ファイルに並べた項目から作られるため、文書を追加しただけでは項目が増えない。業務要求1を満たすため、
                <Code>docs/</Code>{' '}
                のファイル一覧からサイドバーを作る処理を自作し、保守する
              </>,
            ],
            [
              '一覧のメタ情報と文書参照',
              '機能要求4と機能要求3は VitePress の標準機能にないため、本文の箇条書きと文書参照を読み取る処理を自作し、保守する',
            ],
            [
              '日本語の検索',
              <>
                標準の検索は日本語を分かち書きしないため、標準のままでは機能要求2を満たせない。検索の方式は{' '}
                <DocRef kind="ADR" number="0018" /> で決める
              </>,
            ],
            [
              'URL',
              <>
                ファイル名から決まるため、ファイル名を変えると URL
                も変わる。この点は <DocRef kind="PRD" number="0010" />{' '}
                で受け入れ済みである
              </>,
            ],
          ]}
        />
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0010「ドキュメントハブ」',
              href: '/prd/0010_document-hub',
            },
            {
              text: 'ADR 0018「ドキュメントハブの日本語検索に文字 bigram のトークナイザーを使う」',
              href: '/adr/0018_use-bigram-tokenizer-for-japanese-search',
            },
            { text: '所有者へのヒアリング（2026-10-06）' },
          ]}
        />
      </DocSection>
    </>
  )
}
