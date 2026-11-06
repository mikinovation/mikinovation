import {
  Code,
  DocSection,
  DocTable,
  Pre,
  Prose,
  Sources,
  Terms,
} from '@/components/doc'
import { FigArrow, FigNode, FigSvg, Figure } from '@/components/figure'
import type { DocMeta } from '@/lib/docs'

export const meta = {
  title: 'App Router の静的書き出しが何を出力するか',
  lead: "Next.js 16 の App Router で output: 'export' を指定したとき、何が生成されるのかを docs-hub のビルド結果から確かめた。生成物は、初回表示用の HTML と、クライアント遷移用の RSC ペイロードに分かれる。",
  repository: 'mikinovation',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '状態', value: '学習中' },
    { label: '更新日', value: '2026-11-02' },
  ],
} satisfies DocMeta

export default function Body() {
  return (
    <>
      <Prose>この学習ノートの用語は次の意味で使う。</Prose>
      <Terms
        items={[
          {
            term: '静的書き出し',
            description: (
              <>
                <Code>next build</Code> を実行したときに、ルートごとの静的
                ファイルを <Code>out/</Code> に生成する動作。
                <Code>next.config.ts</Code> の{' '}
                <Code>output: &apos;export&apos;</Code> で有効になる。
              </>
            ),
          },
          {
            term: 'RSC ペイロード',
            description:
              'Server Component の描画結果を文字列に直したデータ。ブラウザは HTML の代わりにこれを読み、画面の一部だけを描き替える。',
          },
          {
            term: 'セグメント',
            description: (
              <>
                ルートを構成する単位で、URL のパスを <Code>/</Code>{' '}
                で区切った部分に対応する。
                <Code>app/[kind]/[slug]/page.tsx</Code> なら <Code>[kind]</Code>
                、<Code>[slug]</Code>
                、ページ本体がそれぞれセグメントになる。
              </>
            ),
          },
        ]}
      />
      <DocSection label="Motivation" title="学ぶ動機">
        <Prose>
          docs-hub は GitHub Pages で配信するため、静的書き出しを使う。
          文書の種別に学習ノートを足す作業に合わせて、<Code>out/</Code>{' '}
          に何が生成されるのかを調べた。
        </Prose>
      </DocSection>
      <DocSection label="Summary" title="仕組みの要点">
        <Prose>
          静的書き出しは、ルートごとに初回表示用の HTML と、クライアント遷移用の
          RSC ペイロードを生成する。Server Component
          はビルド中に1度だけ実行され、 その戻り値が HTML と RSC
          ペイロードの両方に書き込まれる。
          <Code>&apos;use client&apos;</Code>{' '}
          を付けたコンポーネントもビルド時に描画され、その結果が HTML に入る。
          ブラウザは同じコンポーネントを読み込み直し、状態を保持して操作に反応する。
        </Prose>
        <Prose>
          RSC
          ペイロードは、ルート単位のものとセグメント単位のものに分かれて出力される。
          Next.js のドキュメントには、セグメントのプリフェッチと{' '}
          <Code>output: &apos;export&apos;</Code>{' '}
          が、応答の種類をパスの拡張子で見分ける方式をすでに使っていると書かれている。
        </Prose>
        <Prose>
          動的セグメントを含むルートでは、<Code>generateStaticParams</Code>{' '}
          が返した組み合わせだけが書き出される。
          サーバーがないため、返していないパスのページを後から描くことはできない。
          Next.js が <Code>dynamicParams: true</Code> のルートと、
          <Code>generateStaticParams</Code>{' '}
          を持たないルートを静的書き出しの非対応機能に挙げているのは、この制約による。
          docs-hub の <Code>src/app/[kind]/[slug]/page.tsx</Code> に{' '}
          <Code>dynamicParams = false</Code> を書いているのも同じ理由である。
        </Prose>
        <Figure caption="ルート1つから、HTML 1枚と RSC ペイロード5本が出る。">
          <FigSvg
            height={210}
            label="ルート1つから初回表示用の HTML とクライアント遷移用の RSC ペイロードが生成される関係"
          >
            <FigNode
              x={0}
              y={60}
              w={215}
              h={90}
              tone="neon"
              title="ルート"
              lines={['/learn/0001_...']}
            />

            <FigArrow
              points={[
                [215, 105],
                [240, 105],
                [240, 55],
                [265, 55],
              ]}
            />
            <FigArrow
              points={[
                [215, 105],
                [240, 105],
                [240, 155],
                [265, 155],
              ]}
            />

            <FigNode
              x={265}
              y={20}
              w={485}
              h={70}
              tone="mint"
              title="初回表示に使う HTML"
              lines={['0001_....html（1枚）']}
            />
            <FigNode
              x={265}
              y={110}
              w={485}
              h={90}
              title="クライアント遷移に使う RSC ペイロード"
              lines={[
                '0001_....txt（ルート単位で1本）',
                '__next._*.txt（セグメント単位で4本）',
              ]}
            />
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Verification" title="手元で動かした結果">
        <Prose>
          文書の種別に学習ノートを足したうえで <Code>pnpm build</Code>{' '}
          を実行し、
          <Code>out/</Code> のファイルを数えた。
        </Prose>
        <DocTable
          head={['確かめたこと', '方法', '結果']}
          rows={[
            [
              '新しい種別がルートに加わるか',
              <>
                <Code>docKinds</Code> に <Code>learn</Code> を足して{' '}
                <Code>pnpm build</Code>
              </>,
              <>
                <Code>out/learn/0001_....html</Code>{' '}
                ができた。ルートの定義は変えていない
              </>,
            ],
            [
              '返していないパスが出るか',
              '存在しない番号のファイルを探す',
              <>
                出ない。代わりに <Code>404.html</Code> が1枚だけ置かれる
              </>,
            ],
            [
              'クライアント側のコンポーネントが HTML に入るか',
              <>
                書き出された HTML で <Code>nav-doc</Code> を数える
              </>,
              '33個あった。サイドバーの全項目が入っている',
            ],
          ]}
        />
        <Prose>文書30本を含む36ルートから、次のファイルができた。</Prose>
        <DocTable
          head={['生成物', '本数']}
          rows={[
            ['HTML', '36枚'],
            ['ルート単位の RSC ペイロード', '35本'],
            ['セグメント単位の RSC ペイロード', '140本'],
          ]}
        />
        <Prose>
          HTML は1ルートに1枚で、<Code>404.html</Code>{' '}
          だけが対になるペイロードを持たない。
          セグメント単位のペイロードは、ルートごとのディレクトリに4本ずつ並ぶ。
        </Prose>
        <Pre>
          {`out/learn/0001_nextjs-app-router-static-export.html
out/learn/0001_nextjs-app-router-static-export.txt
out/learn/0001_nextjs-app-router-static-export/__next._full.txt
out/learn/0001_nextjs-app-router-static-export/__next._index.txt
out/learn/0001_nextjs-app-router-static-export/__next._tree.txt
out/learn/0001_nextjs-app-router-static-export/__next.$d$kind.$d$slug.__PAGE__.txt`}
        </Pre>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'Next.js 16 同梱のドキュメント node_modules/next/dist/docs/01-app/02-guides/static-exports.md',
            },
            {
              text: 'Next.js 16 同梱のドキュメント node_modules/next/dist/docs/01-app/02-guides/cdn-caching.md',
            },
            {
              text: 'docs-hub のビルド結果（2026-11-02 に pnpm build を実行）',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
