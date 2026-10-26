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
import {
  FigArrow,
  FigLabel,
  FigNode,
  FigSvg,
  Figure,
} from '@/components/figure'

export const meta = {
  title: '勤怠表の CLI を Rust で書き、Typst を組み込んで PDF を生成する',
  lead: '勤怠表と請求書を作る CLI kintai を Rust で書き、Typst をライブラリとして組み込んで勤怠表 PDF を生成するという決定を記録する。',
  attributes: [
    { label: '読者', value: '技術責任者、開発者、将来の保守者' },
    { label: '状態', value: '採用' },
    { label: '決定日', value: '2026-10-03' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>
        用語は <DocRef kind="PRD" number="0007" /> と同じ意味で使う。
        案件、打刻、日ごとの見出し、勤怠表、精算幅、稼働率、日割り月、下書き、skill
        の意味は <DocRef kind="PRD" number="0007" /> による。
        テンプレートは、勤怠表の見た目を定める Typst のファイルを指す。
        「すべて」「最小限」は、
        <DocRef kind="PRD" number="0001" /> が定める導入範囲を指す。
      </Prose>
      <DocSection label="Context" title="背景">
        <Prose>
          <DocRef kind="PRD" number="0007" /> は、日々の打刻から月末の勤怠表 PDF
          と freee
          の下書きまでを、案件ごとの精算のルールに従って作ることを求める。
          その解決案として、計算は CLI が行い、skill が窓口になる案を採った。
          そのため、CLI を書く言語と、勤怠表 PDF
          を生成する方式を決める必要がある。
        </Prose>
      </DocSection>
      <DocSection label="Constraints" title="制約">
        <Prose>
          <DocRef kind="PRD" number="0007" /> と{' '}
          <DocRef kind="ADR" number="0001" />{' '}
          から、選べる案は次の条件を満たす必要がある。
        </Prose>
        <Bullets>
          <Item>
            丸め、精算、日割りの計算が毎回同じ結果になり、ユニットテストで守れる。
          </Item>
          <Item>勤怠表の見た目を、計算の処理を変えずに差し替えられる。</Item>
          <Item>日本語を含む表を PDF に組める。</Item>
          <Item>Org 形式のファイルにある CLOCK 行とプロパティを読める。</Item>
          <Item>
            導入範囲「すべて」で、所有者のマシンに Home Manager で導入できる。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Decision" title="決定">
        <Prose>
          CLI <Code>kintai</Code> を Rust で書き、このリポジトリの{' '}
          <Code>packages/kintai</Code> に cargo のクレートとして置く。
        </Prose>
        <Prose>
          勤怠表 PDF は、<Code>typst</Code> と <Code>typst-pdf</Code>{' '}
          のクレートを組み込んで生成する。 CLI
          は集計結果をテンプレートに渡すだけにし、見た目はすべてテンプレートが担う。
          既定のテンプレートはバイナリに同梱し、案件の設定で別のテンプレートに差し替えられるようにする。
          日本語のフォントには Noto Sans JP を使い、バイナリに同梱する。
        </Prose>
        <Prose>
          Org 形式の解析は、CLOCK
          行と日ごとの見出しのプロパティに限り、正規表現で行う。
        </Prose>
        <Prose>
          導入は、<Code>buildRustPackage</Code> で nix のパッケージにし、Home
          Manager で行う。
        </Prose>
        <Figure caption="CLI は集計までを担い、見た目はテンプレートに委ねる。">
          <FigSvg
            height={215}
            label="Org のファイルを kintai が解析し、typst のテンプレートを通して勤怠表 PDF を作る構成"
          >
            <FigNode
              x={0}
              y={70}
              w={160}
              h={70}
              title="Org のファイル"
              lines={['CLOCK 行と見出し']}
            />
            <FigArrow
              points={[
                [160, 105],
                [196, 105],
              ]}
            />
            <FigNode
              x={200}
              y={40}
              w={200}
              h={130}
              tone="neon"
              valign="top"
              title="kintai（Rust）"
              lines={['正規表現で解析する', '集計の結果を渡すだけ']}
            />
            <FigArrow
              points={[
                [400, 105],
                [420, 105],
                [420, 55],
                [436, 55],
              ]}
              tone="neon"
            />
            <FigNode
              x={440}
              y={20}
              w={160}
              h={70}
              title="typst のテンプレート"
              lines={['見た目を担う']}
            />
            <FigArrow
              points={[
                [600, 55],
                [636, 55],
              ]}
              tone="neon"
            />
            <FigNode
              x={640}
              y={20}
              w={120}
              h={70}
              tone="mint"
              title="勤怠表 PDF"
            />
            <FigArrow
              points={[
                [420, 105],
                [420, 150],
                [436, 150],
              ]}
              tone="soft"
            />
            <FigNode
              x={440}
              y={120}
              w={320}
              h={70}
              tone="ghost"
              lines={[
                'テンプレートと Noto Sans JP は同梱する',
                '案件の設定で差し替えられる',
              ]}
            />
            <FigLabel x={300} y={205}>
              buildRustPackage で Home Manager から導入する
            </FigLabel>
          </FigSvg>
        </Figure>
      </DocSection>
      <DocSection label="Rationale" title="決定理由">
        <Bullets>
          <Item>
            Rust は単一のバイナリを作れるため、実行時に Node や Python
            などの実行環境を用意しなくて済む。Home Manager
            でバイナリを置くだけで導入でき、導入の制約に合う。
          </Item>
          <Item>
            Typst は Rust
            で書かれているため、ライブラリとして組み込める。外部のコマンドに頼らず、単一のバイナリのまま
            PDF を生成できる。
          </Item>
          <Item>
            集計結果をテンプレートに渡す形にすると、計算は Rust
            の中に、見た目はテンプレートの中に分かれる。計算はユニットテストで守り、見た目は計算の処理を変えずに差し替えられる。
          </Item>
          <Item>
            Typst
            は日本語を含む表を組めるため、日本語の表の制約に合う。フォントを同梱すれば、マシンに入っているフォントにかかわらず同じ見た目になる。
          </Item>
          <Item>
            読む必要があるのは CLOCK
            行とプロパティだけなので、正規表現で足りる。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Alternatives" title="代替案">
        <Prose>次の案は、それぞれの理由で採らない。</Prose>
        <Alternatives
          items={[
            {
              option: 'TypeScript と Typst',
              reason:
                '実行に Node が要り、単一のバイナリにならない。Typst を組み込めず、外部のコマンドとして呼ぶことになる。',
            },
            {
              option: 'Python',
              reason: 'Python と依存ライブラリの実行環境が要る。',
            },
            {
              option: 'HTML を Chromium で PDF にする案',
              reason:
                'Chromium が要り、重い。改ページや印刷時のレイアウトの調整が難しい。',
            },
            {
              option: (
                <>
                  <Code>printpdf</Code> などで PDF をコードから描画する案
                </>
              ),
              reason:
                '見た目がコードに埋め込まれ、計算の処理を変えずに見た目を差し替えるという制約を満たさない。',
            },
            {
              option: (
                <>
                  Rust から <Code>typst</Code> のコマンドを呼ぶ案
                </>
              ),
              reason: '実行時に別のコマンドが要り、単一のバイナリにならない。',
            },
            {
              option: (
                <>
                  <Code>orgize</Code> などの Org 形式の解析ライブラリ
                </>
              ),
              reason:
                '読むのは CLOCK 行とプロパティだけで、依存を増やすほどの利点がない。',
            },
            {
              option: 'フォントをマシンから探す案',
              reason:
                'マシンによって見た目が変わり、フォントがなければ失敗する。',
            },
            {
              option: (
                <>
                  各マシンで <Code>cargo install</Code> を実行して導入する案
                </>
              ),
              reason: (
                <>
                  マシンごとの手作業が残り、
                  <DocRef kind="ADR" number="0001" /> の宣言的な管理から外れる。
                </>
              ),
            },
          ]}
        />
      </DocSection>
      <DocSection label="Consequences" title="結果">
        <Bullets>
          <Item>
            開発には Rust のツールチェーンが要る。「すべて」には rustup
            が入るが、「最小限」では kintai を使えない。
          </Item>
          <Item>
            <Code>typst</Code> のクレートは API
            が安定していないため、版を上げるたびに、組み込む側のコードの追従を引き受ける。
          </Item>
          <Item>
            Noto Sans JP を同梱するため、バイナリが数 MB 大きくなる。OFL
            のライセンスの表示も同梱する。
          </Item>
          <Item>
            <Code>buildRustPackage</Code>{' '}
            で導入するため、依存のクレートを更新するたびに、nix
            側のハッシュも更新する。
          </Item>
          <Item>勤怠表の見た目を変えるには、Typst の書き方の知識が要る。</Item>
          <Item>
            Org 形式の解析は、nvim-orgmode が出力する CLOCK
            行の書式に依存する。手で書式を崩した行は読めず、エラーになる。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0007「勤怠表と請求書の作成」',
              href: '/prd/0007_attendance-invoice',
            },
            {
              text: 'ADR 0001「開発環境を Nix flakes で宣言的に管理する」',
              href: '/adr/0001_manage-environment-with-nix-flakes',
            },
            {
              text: 'ADR 0004「Claude Code を Home Manager で宣言的に管理する」',
              href: '/adr/0004_manage-claude-code-with-home-manager',
            },
            { text: '所有者へのヒアリング（2026-10-02〜2026-10-03）' },
          ]}
        />
      </DocSection>
    </>
  )
}
