import {
  Bullets,
  Code,
  DocLink,
  DocPart,
  DocRef,
  DocSection,
  DocSub,
  DocTable,
  Item,
  Pre,
  Prose,
  Sources,
  Steps,
} from '@/components/doc'
import {
  FigArrow,
  FigLabel,
  FigNode,
  FigSvg,
  Figure,
} from '@/components/figure'

export const meta = {
  title: '勤怠表と請求書の作成',
  lead: 'PRD 0007「勤怠表と請求書の作成」の要求を満たすために、ADR 0007 から ADR 0013 の方式をどう組むかを示す。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '前提の PRD', value: 'PRD 0007' },
    { label: '到達している層', value: '層3（コンポーネント）まで' },
    { label: '層3を書いたコンポーネント', value: '読み込み、集計、freee 連携' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>
        この設計書は、上から読み進めるほど詳しくなる。
        層1を読むと、何のために、何を前提に、どんな形で作るかが分かる。
        層2まで読むと、コンポーネントがどう協調し、外からどう見えるかが分かる。
        層3まで読むと、判断が込み入るコンポーネントの内部をどう組むかが分かる。
        末尾には、影響とリスク、未解決点、出典をまとめる。
      </Prose>
      <Prose>
        用語は <DocRef kind="PRD" number="0007" /> と同じ意味で使う。
        案件、打刻、日ごとの見出し、勤怠表、精算幅、稼働率、基本額、日割り月、下書き、skill
        の意味は <DocRef kind="PRD" number="0007" /> による。
        下書きは、freee請求書では送付待ちの請求書にあたる。 テンプレートの意味は{' '}
        <DocRef kind="ADR" number="0007" /> による。 非公開リポジトリは、
        <DocRef kind="PRD" number="0007" />{' '}
        の展開計画で所有者が用意する、案件の設定と勤怠の記録を置くリポジトリを指す。
      </Prose>
      <DocSection label="Layer 1" title="層1: 概要">
        <DocSub title="目的">
          <Prose>
            <DocRef kind="PRD" number="0007" />{' '}
            の要求1から要求14を満たす構成を示す。 日々の打刻から、月末の勤怠表
            PDF と freee
            の下書きまでを、案件ごとの精算のルールに従って作れるようにする。
          </Prose>
        </DocSub>
        <DocSub title="スコープとスコープ外">
          <Prose>この設計書は、次のものを扱う。</Prose>
          <Bullets>
            <Item
              label={
                <>
                  CLI <Code>kintai</Code>
                </>
              }
            >
              設定と記録の読み込み、検出、集計、勤怠表 PDF の生成、freee
              の下書きの作成、freee の認証
            </Item>
            <Item label="打刻の操作">
              Neovim の中で当日の見出しを用意し、打刻を始める
            </Item>
            <Item label="月末の skill">
              Claude Code から <Code>kintai</Code> を順に呼ぶ窓口
            </Item>
            <Item label="導入">
              Home Manager による、導入範囲「すべて」への組み込み
            </Item>
          </Bullets>
          <Prose>次のものは扱わない。</Prose>
          <Bullets>
            <Item>
              <DocRef kind="PRD" number="0007" /> の対象外に挙げたこと
            </Item>
            <Item>非公開リポジトリに書く、実際の案件の値</Item>
            <Item>テンプレートの見た目の細部</Item>
          </Bullets>
        </DocSub>
        <DocSub title="前提とする決定">
          <DocTable
            head={['ADR', '決定', '設計への制約']}
            rows={[
              [
                <>
                  <DocRef kind="ADR" number="0001" />、
                  <DocRef kind="ADR" number="0004" />
                </>,
                '開発環境と Claude Code を Nix と Home Manager で宣言的に管理する',
                <>
                  <Code>kintai</Code> と skill は Home Manager で導入する
                </>,
              ],
              [
                <>
                  <DocRef kind="ADR" number="0006" />
                </>,
                'ノートとタスクを Org 形式で書き、nvim-orgmode で扱う',
                '勤怠の記録も Org 形式で書き、Neovim の中で扱う',
              ],
              [
                <>
                  <DocRef kind="ADR" number="0007" />
                </>,
                <>
                  <Code>kintai</Code> を Rust で書き、Typst を組み込んで PDF
                  を生成する
                </>,
                '計算は Rust、見た目はテンプレートが担う。Org 形式は CLOCK 行とプロパティだけを正規表現で読む',
              ],
              [
                <>
                  <DocRef kind="ADR" number="0008" />
                </>,
                <>
                  freee の下書きは <Code>kintai</Code> が freee の API
                  を呼んで作る
                </>,
                <>
                  金額は Claude を通さない。二重作成の確認も <Code>kintai</Code>{' '}
                  が行う
                </>,
              ],
              [
                <>
                  <DocRef kind="ADR" number="0009" />
                </>,
                '認証情報は、変わらない値を 1Password に、トークンを状態ファイルに置く',
                <>
                  <Code>kintai</Code> が <Code>op</Code>{' '}
                  で読み、トークンを自分で書き戻す
                </>,
              ],
              [
                <>
                  <DocRef kind="ADR" number="0010" />
                </>,
                '案件の設定は、非公開リポジトリに案件ごとの TOML ファイルで書く',
                'Org 形式の側から、案件の設定を指し示す手段が要る',
              ],
              [
                <>
                  <DocRef kind="ADR" number="0011" />
                </>,
                '打刻は Neovim のキー操作で行い、CLOCK 行は nvim-orgmode に書かせる',
                <>
                  <Code>kintai</Code> は Org
                  形式のファイルを読むだけで、書き込まない
                </>,
              ],
              [
                <>
                  <DocRef kind="ADR" number="0012" />
                </>,
                <>
                  <Code>kintai</Code> は非同期で構成し、tokio と reqwest を使う
                </>,
                'freee 連携は async にし、集計と検出は同期の関数に保つ',
              ],
              [
                <>
                  <DocRef kind="ADR" number="0013" />
                </>,
                <>
                  <Code>kintai</Code> をライブラリと CLI のクレートに分ける
                </>,
                '業務の部品はライブラリに置き、今後の Web API からも使えるようにする',
              ],
            ]}
          />
        </DocSub>
        <DocSub title="全体の構成">
          <Prose>
            全体は、Neovim の中の打刻、非公開リポジトリに置くデータ、
            <Code>kintai</Code>、skill、外部のサービスからなる。
          </Prose>
          <Figure caption="打刻は Neovim から記録へ、月末は skill から kintai へ流れ、外部との通信は freee 連携だけが持つ。">
            <FigSvg
              height={380}
              label="Neovim の打刻、非公開リポジトリのデータ、kintai の内部、skill と外部サービスの関係"
            >
              <FigNode x={0} y={0} w={300} h={86} tone="ghost" tag="Neovim" />
              <FigNode x={16} y={34} w={128} h={42} rx={8} title="打刻の操作" />
              <FigArrow
                points={[
                  [144, 55],
                  [170, 55],
                ]}
              />
              <FigNode
                x={174}
                y={34}
                w={110}
                h={42}
                rx={8}
                title="nvim-orgmode"
              />

              <FigArrow
                points={[
                  [229, 76],
                  [229, 142],
                ]}
              />
              <FigLabel x={262} y={110}>
                CLOCK 行
              </FigLabel>

              <FigNode
                x={0}
                y={106}
                w={300}
                h={236}
                tone="ghost"
                tag="非公開リポジトリ"
              />
              <FigNode
                x={16}
                y={146}
                w={268}
                h={48}
                title="勤怠の記録（Org）"
              />
              <FigNode
                x={16}
                y={206}
                w={268}
                h={48}
                title="案件の設定（TOML）"
              />
              <FigNode
                x={16}
                y={266}
                w={268}
                h={48}
                tone="mint"
                title="勤怠表 PDF"
              />

              <FigArrow
                points={[
                  [284, 170],
                  [330, 170],
                  [330, 112],
                  [368, 112],
                ]}
              />
              <FigArrow
                points={[
                  [284, 230],
                  [348, 230],
                  [348, 132],
                  [368, 132],
                ]}
              />

              <FigNode
                x={360}
                y={0}
                w={240}
                h={44}
                tone="amber"
                title="月末の skill"
              />
              <FigArrow
                points={[
                  [480, 44],
                  [480, 58],
                ]}
                tone="neon"
              />

              <FigNode
                x={360}
                y={62}
                w={240}
                h={280}
                tone="ghost"
                tag="kintai"
              />
              <FigNode
                x={376}
                y={100}
                w={208}
                h={44}
                rx={8}
                tone="neon"
                title="読み込み"
              />
              <FigArrow
                points={[
                  [480, 144],
                  [480, 152],
                ]}
                tone="neon"
                head={false}
              />
              <FigNode
                x={376}
                y={156}
                w={208}
                h={44}
                rx={8}
                tone="neon"
                title="検出"
              />
              <FigArrow
                points={[
                  [480, 200],
                  [480, 208],
                ]}
                tone="neon"
                head={false}
              />
              <FigNode
                x={376}
                y={212}
                w={208}
                h={44}
                rx={8}
                tone="neon"
                title="集計"
              />
              <FigArrow
                points={[
                  [480, 256],
                  [430, 256],
                  [430, 264],
                ]}
                tone="neon"
              />
              <FigArrow
                points={[
                  [480, 256],
                  [532, 256],
                  [532, 264],
                ]}
                tone="neon"
              />
              <FigNode x={376} y={268} w={108} h={52} rx={8} title="勤怠表" />
              <FigNode
                x={488}
                y={268}
                w={96}
                h={52}
                rx={8}
                title="freee 連携"
              />

              <FigArrow
                points={[
                  [430, 320],
                  [430, 356],
                  [150, 356],
                  [150, 318],
                ]}
              />

              <FigArrow
                points={[
                  [584, 282],
                  [606, 282],
                  [606, 130],
                  [626, 130],
                ]}
                tone="neon"
              />
              <FigNode
                x={630}
                y={100}
                w={130}
                h={60}
                title="freee請求書"
                lines={['確認と作成']}
              />
              <FigArrow
                points={[
                  [584, 296],
                  [600, 296],
                  [600, 212],
                  [626, 212],
                ]}
                tone="soft"
              />
              <FigNode
                x={630}
                y={190}
                w={130}
                h={46}
                tone="ghost"
                lines={['1Password']}
              />
              <FigArrow
                points={[
                  [584, 308],
                  [614, 308],
                  [614, 278],
                  [626, 278],
                ]}
                tone="soft"
              />
              <FigNode
                x={630}
                y={256}
                w={130}
                h={46}
                tone="ghost"
                lines={['状態ファイル']}
              />
            </FigSvg>
          </Figure>
        </DocSub>
      </DocSection>
      <DocSection label="Layer 2" title="層2: 構成">
        <DocSub title="コンポーネントの責務">
          <DocTable
            head={['コンポーネント', '受け持つこと', '受け持たないこと']}
            rows={[
              [
                '打刻の操作',
                '案件の見出しの下に当日の見出しを用意し、すでにあればそれを使って、nvim-orgmode の clock in を呼ぶ',
                '時刻の丸めや集計',
              ],
              [
                '読み込み',
                '案件の設定と、日ごとの見出しの CLOCK 行とプロパティを読み、型のあるデータにする',
                '記録の正しさの判定',
              ],
              [
                '検出',
                '打刻漏れと日割りの設定漏れを、対象月のすべてについて集め、まとめて報告する',
                '記録や設定の修正',
              ],
              [
                '集計',
                '時刻の丸め、休憩、日ごとの稼働、月の精算を計算する',
                'ファイルや外部のサービスとの入出力',
              ],
              [
                '勤怠表',
                '集計結果をテンプレートに渡し、勤怠表 PDF を非公開リポジトリの決まった場所に書き出す',
                '見た目。見た目はテンプレートが担う',
              ],
              [
                'freee 連携',
                '二重作成を確認してから、送付待ちの請求書を作る。認証とトークンの更新も受け持つ',
                '請求書の送付と取消',
              ],
              [
                '月末の skill',
                <>
                  <Code>kintai</Code>{' '}
                  を順に呼び、結果を所有者に報告する。止まったときは、直すべき箇所を案内する
                </>,
                '計算と金額の書き写し',
              ],
            ]}
          />
          <Prose>
            案件の見出しは、案件の設定を指すプロパティを持つ。
            打刻の操作と読み込みは、このプロパティで案件の見出しを見分ける。
          </Prose>
          <Prose>
            集計は外部の状態を持たない関数として作る。
            時間は分の整数で、金額は円の整数で扱い、浮動小数点数を使わない。
            1日に打刻が複数ある場合は、最初の開始を始業に、最後の終了を終業に使い、間の空白は休憩に数えない。
            休憩には、
            <DocRef kind="PRD" number="0007" />{' '}
            のとおり、案件の既定値か、日ごとの見出しに書いた例外の値を使う。
          </Prose>
        </DocSub>
        <DocSub title="データの流れ">
          <Prose>通常時は、次の順に流れる。</Prose>
          <Figure caption="skill は kintai を順に呼ぶだけで、金額の計算も freee との通信も kintai の中で完結する。">
            <FigSvg
              height={545}
              label="所有者から skill、kintai、freee請求書 API へと進む通常時のやり取りの順序"
            >
              <FigNode x={0} y={0} w={160} h={40} rx={8} title="所有者" />
              <FigNode
                x={210}
                y={0}
                w={160}
                h={40}
                rx={8}
                tone="amber"
                title="月末の skill"
              />
              <FigNode
                x={420}
                y={0}
                w={160}
                h={40}
                rx={8}
                tone="neon"
                title="kintai"
              />
              <FigNode
                x={610}
                y={0}
                w={150}
                h={40}
                rx={8}
                title="freee請求書 API"
              />

              <FigArrow
                points={[
                  [80, 40],
                  [80, 532],
                ]}
                tone="soft"
                head={false}
              />
              <FigArrow
                points={[
                  [290, 40],
                  [290, 532],
                ]}
                tone="soft"
                head={false}
              />
              <FigArrow
                points={[
                  [500, 40],
                  [500, 532],
                ]}
                tone="soft"
                head={false}
              />
              <FigArrow
                points={[
                  [685, 40],
                  [685, 532],
                ]}
                tone="soft"
                head={false}
              />

              <FigLabel x={185} y={62}>
                9月の勤怠と請求書を作って
              </FigLabel>
              <FigArrow
                points={[
                  [80, 76],
                  [286, 76],
                ]}
              />

              <FigLabel x={395} y={102}>
                check 2026-09
              </FigLabel>
              <FigArrow
                points={[
                  [290, 116],
                  [496, 116],
                ]}
              />

              <FigLabel x={395} y={142}>
                検出なし
              </FigLabel>
              <FigArrow
                points={[
                  [500, 156],
                  [294, 156],
                ]}
                tone="soft"
              />

              <FigLabel x={395} y={182}>
                report 2026-09
              </FigLabel>
              <FigArrow
                points={[
                  [290, 196],
                  [496, 196],
                ]}
              />

              <FigLabel x={395} y={222}>
                勤怠表 PDF の場所
              </FigLabel>
              <FigArrow
                points={[
                  [500, 236],
                  [294, 236],
                ]}
                tone="soft"
              />

              <FigLabel x={395} y={262}>
                invoice 2026-09
              </FigLabel>
              <FigArrow
                points={[
                  [290, 276],
                  [496, 276],
                ]}
              />

              <FigLabel x={592} y={302}>
                同じ月の請求書を確認
              </FigLabel>
              <FigArrow
                points={[
                  [500, 316],
                  [681, 316],
                ]}
                tone="neon"
              />

              <FigLabel x={592} y={342}>
                なし
              </FigLabel>
              <FigArrow
                points={[
                  [685, 356],
                  [504, 356],
                ]}
                tone="soft"
              />

              <FigLabel x={592} y={382}>
                送付待ちの請求書を作成
              </FigLabel>
              <FigArrow
                points={[
                  [500, 396],
                  [681, 396],
                ]}
                tone="neon"
              />

              <FigLabel x={592} y={422}>
                請求書の ID
              </FigLabel>
              <FigArrow
                points={[
                  [685, 436],
                  [504, 436],
                ]}
                tone="soft"
              />

              <FigLabel x={395} y={462}>
                請求書の ID と確認用の URL
              </FigLabel>
              <FigArrow
                points={[
                  [500, 476],
                  [294, 476],
                ]}
                tone="soft"
              />

              <FigLabel x={185} y={502}>
                PDF の場所と下書きを報告
              </FigLabel>
              <FigArrow
                points={[
                  [290, 516],
                  [84, 516],
                ]}
                tone="soft"
              />
            </FigSvg>
          </Figure>
          <Prose>
            <Code>report</Code> と <Code>invoice</Code>{' '}
            は、どちらも内部で必ず検出を通す。 skill が <Code>check</Code>{' '}
            を飛ばしても、検出を経ない勤怠表や下書きは作られない。
          </Prose>
          <Prose>重要な失敗時は、次のように流れる。</Prose>
          <Bullets>
            <Item>
              打刻漏れや日割りの設定漏れがあると、<Code>kintai</Code>{' '}
              は見つけたものをすべて報告して止まる。勤怠表と下書きは作らない。skill
              は、報告された日付や月をもとに、直すべき箇所を所有者に案内する。
            </Item>
            <Item>
              同じ月の請求書がすでに freee にあると、<Code>kintai</Code>{' '}
              はその請求書を示して止まる。新しい請求書は作らない。
            </Item>
            <Item>
              案件の設定に誤りがあると、<Code>kintai</Code>{' '}
              は読み込みの時点で、誤りのある項目を示して止まる。
            </Item>
            <Item>
              freee や 1Password との通信に失敗すると、<Code>kintai</Code>{' '}
              は失敗した相手と理由を示して止まる。
            </Item>
            <Item>
              アクセストークンの期限が切れていれば、リフレッシュトークンで更新してから続ける。リフレッシュトークンが失効していれば、
              <Code>kintai auth</Code> での再認証を求めて止まる。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="外部とのインターフェース">
          <Prose>
            <Code>kintai</Code> は、次のサブコマンドを持つ。 対象月は{' '}
            <Code>YYYY-MM</Code> の形で渡す。
          </Prose>
          <DocTable
            head={['サブコマンド', '振る舞い']}
            rows={[
              [
                <>
                  <Code>kintai auth</Code>
                </>,
                <>
                  freee
                  の最初の認証と再認証を行い、トークンを状態ファイルに書く。認可コードは、所有者のマシンの{' '}
                  <Code>127.0.0.1</Code> で一時的に待ち受けて受け取る
                </>,
              ],
              [
                <>
                  <Code>
                    kintai check {'<'}対象月{'>'}
                  </Code>
                </>,
                '検出だけを行う',
              ],
              [
                <>
                  <Code>
                    kintai report {'<'}対象月{'>'}
                  </Code>
                </>,
                '検出を通してから、勤怠表 PDF を生成する',
              ],
              [
                <>
                  <Code>
                    kintai invoice {'<'}対象月{'>'}
                  </Code>
                </>,
                '検出と二重作成の確認を通してから、送付待ちの請求書を作る',
              ],
            ]}
          />
          <Prose>すべてのサブコマンドは、次のオプションを受け付ける。</Prose>
          <Bullets>
            <Item
              label={
                <>
                  <Code>--json</Code>
                </>
              }
            >
              結果を JSON で出力する。skill はこの出力を読む。
            </Item>
            <Item
              label={
                <>
                  <Code>
                    --project {'<'}案件ID{'>'}
                  </Code>
                </>
              }
            >
              対象の案件を指定する。同時に稼働する案件が1つの月は、省略できる。
            </Item>
          </Bullets>
          <Prose>
            非公開リポジトリの場所は、環境変数 <Code>KINTAI_DIR</Code> で渡す。
          </Prose>
          <Prose>終了コードは、次のとおりとする。</Prose>
          <DocTable
            head={['終了コード', '意味']}
            rows={[
              ['0', '成功'],
              ['1', '検出、または同じ月の請求書があったために止まった'],
              ['2', '案件の設定に誤りがある'],
              ['3', 'freee や 1Password との通信に失敗した'],
            ]}
          />
          <Prose>日ごとの見出しには、次のプロパティを書ける。</Prose>
          <Bullets>
            <Item label="休憩の例外">その日の休憩の時間</Item>
            <Item label="備考">勤怠表の備考の欄に載せる文</Item>
          </Bullets>
          <Prose>
            勤怠表 PDF
            は、非公開リポジトリの中の決まった場所に、対象月と案件が分かる名前で書き出す。
            freee請求書 API
            には添付の手段がないため、所有者が請求書を送付するときに、この PDF
            を freee の画面で添付する。
          </Prose>
          <Prose>
            freee との認証は、OAuth 2.0 の認可コード方式で行う。 freee
            のトークンには、次の性質がある。
          </Prose>
          <Bullets>
            <Item>アクセストークンの有効期限は6時間である。</Item>
            <Item>
              リフレッシュトークンの有効期限は90日で、1回しか使えない。更新するたびに、新しいリフレッシュトークンが発行される。
            </Item>
          </Bullets>
          <Prose>そのため、freee 連携は次のようにトークンを扱う。</Prose>
          <Bullets>
            <Item>
              更新で受け取った新しいリフレッシュトークンを、API
              を呼ぶ前に状態ファイルへ書き戻す。書き戻しに失敗すると、次の更新ができなくなる。
            </Item>
            <Item>
              状態ファイルは、一時ファイルに書いてから置き換え、書き込みの途中で失われないようにする。
            </Item>
            <Item>
              月末に毎月使えば、リフレッシュトークンは90日の期限の前に更新される。3か月以上使わなかった場合は、
              <Code>kintai auth</Code> で認証し直す。
            </Item>
          </Bullets>
          <Prose>
            認可コードの受け取りには、freee が「ローカルのテスト用」としている{' '}
            <Code>urn:ietf:wg:oauth:2.0:oob</Code> を使わず、
            <Code>127.0.0.1</Code> のコールバック URL を使う。
            こうすると、認証が所有者のマシンの中で完結し、認可コードを手で写す手間もなくなる。
          </Prose>
        </DocSub>
        <DocSub title="論理データモデル">
          <DocTable
            head={['実体', '主な属性', '関係']}
            rows={[
              [
                '案件',
                '案件 ID、案件名、先方名、氏名、契約期間、月額、基本額の端数の丸め方、精算幅、超過単価、控除単価、丸めの単位と向き、休憩の既定値、締め日、支払期日、請求の項目、テンプレート、1Password の参照先、freee の事業所と取引先',
                '月の上書きと日の記録を持つ',
              ],
              [
                '月の上書き',
                '対象月、稼働率、精算幅',
                '1つの案件の、契約の開始月か終了月に属する',
              ],
              [
                '日の記録',
                '日付、打刻の並び、休憩の例外、備考',
                '1つの案件に属する。日ごとの見出しから読む',
              ],
              [
                '日の勤怠',
                '日付、曜日、始業、終業、休憩、稼働、備考',
                '日の記録から集計する',
              ],
              [
                '月の精算',
                '対象月、合計時間、精算幅、超過または控除の時間、基本額、精算額',
                '日の勤怠と、案件または月の上書きから集計する',
              ],
              [
                '下書き',
                '請求日、支払期日、品目、数量、単価、税率',
                '月の精算から作る。freee請求書では送付待ちの請求書になる',
              ],
            ]}
          />
          <Prose>
            請求日は、対象月の締め日とする。
            同じ月の請求書があるかは、同じ取引先で、請求日が対象月の締め日にあたり、取消されていない請求書があるかで判定する。
            取消した請求書は数えないため、誤って作った請求書は、freee
            で取消してから作り直せる。
          </Prose>
        </DocSub>
        <DocSub title="非機能要求への対応">
          <DocTable
            head={['要求', '対応する箇所']}
            rows={[
              [
                '計算の正確さ',
                <>
                  集計を入出力から切り離した関数にし、
                  <DocRef kind="PRD" number="0007" />{' '}
                  の受入条件の例を、そのまま集計のテストに使う
                </>,
              ],
              [
                '結果の再現性',
                'フォントとテンプレートをバイナリに同梱し、マシンによらず同じ PDF にする',
              ],
              [
                '誤った請求の防止',
                '送付の手段を持たない。作る前に、検出と二重作成の確認を必ず通す',
              ],
              [
                '認証情報の保護',
                'シークレットは 1Password から読み、トークンの状態ファイルは権限を 600 にする',
              ],
              [
                '保守性',
                '見た目はテンプレートに、計算は集計に、外部との通信は freee 連携に閉じ込め、互いの変更が波及しないようにする',
              ],
            ]}
          />
        </DocSub>
      </DocSection>
      <DocSection label="Layer 3" title="層3: コンポーネント">
        <Prose>
          層3では、層2のコンポーネントのうち、判断が込み入る読み込み、集計、freee
          連携の内部を示す。 検出、勤怠表、打刻の操作、月末の skill
          は、層2の記述とコードで足りるため、層3を書かない。
        </Prose>
        <Prose>
          3つのコンポーネントは、
          <DocRef kind="ADR" number="0013" /> のライブラリのクレートに置く。 CLI
          のクレートは、引数の解析、終了コード、JSON
          の出力だけを受け持ち、ライブラリの入口を呼ぶ。
        </Prose>
        <DocSub title="読み込み">
          <Prose>層2の読み込みを詳しくしたもの。</Prose>
          <DocPart title="モジュールの分割とインターフェース">
            <Prose>
              読み込みは、案件の設定を読むモジュールと、Org
              形式の記録を読むモジュールに分ける。
              外から呼ばれる入口は、次の2つに限る。
            </Prose>
            <Bullets>
              <Item>案件 ID を受け取り、案件の設定を返す。</Item>
              <Item>
                案件の設定と対象月を受け取り、その月の日の記録の並びと、書式の崩れの一覧を返す。
              </Item>
            </Bullets>
            <Prose>
              書式の崩れは、読み込みのエラーにせず、検出に渡す。
              こうすると、検出が打刻漏れと一緒にまとめて報告できる。
            </Prose>
          </DocPart>
          <DocPart title="物理データ形式">
            <Prose>
              非公開リポジトリの中は、案件ごとのディレクトリにまとめる。
              ディレクトリの名前を、案件 ID とする。
            </Prose>
            <Pre>{`$KINTAI_DIR/
  projects/
    <案件ID>/
      project.toml      案件の設定
      kintai.org        勤怠の記録
      reports/
        YYYY-MM.pdf     勤怠表`}</Pre>
            <Prose>案件の設定には、次の項目を書く。</Prose>
            <DocTable
              head={['表', '項目']}
              rows={[
                ['案件', '案件名、先方名、氏名、契約の開始日と終了日'],
                [
                  '精算',
                  '月額、基本額の端数の丸め方、精算幅の下限と上限、超過単価、控除単価',
                ],
                [
                  '勤怠',
                  '時刻の丸めの単位、始業と終業の丸めの向き、休憩の既定値',
                ],
                ['請求', '締め日、支払期日、明細の摘要'],
                [
                  'freee',
                  '事業所 ID、取引先 ID、敬称、税率、消費税の内税と外税、消費税の端数の扱い',
                ],
                [
                  '認証',
                  'クライアント ID とシークレットの 1Password の参照先、コールバックのポート',
                ],
                [
                  '勤怠表',
                  'テンプレート。省略すると、同梱のテンプレートを使う',
                ],
                [
                  '月の上書き',
                  '対象月、稼働率、精算幅。対象月ごとに1つの表にする',
                ],
              ]}
            />
            <Prose>
              締め日は、1日から28日までのいずれかの日、または末日とする。
              支払期日は、締め日から何か月後の何日かで書く。
              基本額の端数の丸め方は、切り捨て、切り上げ、四捨五入から選ぶ。
              稼働率は、<Code>"0.5"</Code>{' '}
              のような小数の文字列で書き、小数部は4桁までとする。
            </Prose>
            <Prose>勤怠の記録は、次の形で書く。</Prose>
            <Pre>{`* サンプル案件
  :PROPERTIES:
  :KINTAI_PROJECT: sample
  :END:
** 2026-09-01
   :PROPERTIES:
   :KINTAI_BREAK: 0:30
   :KINTAI_NOTE: 午後に通院
   :END:
   :LOGBOOK:
   CLOCK: [2026-09-01 火 09:58]--[2026-09-01 火 19:07] =>  9:09
   :END:`}</Pre>
            <Bullets>
              <Item>
                案件の見出しは、<Code>KINTAI_PROJECT</Code> のプロパティに案件
                ID を持つ。
              </Item>
              <Item>
                日ごとの見出しは、案件の見出しの1つ下の見出しとし、見出しの文字は{' '}
                <Code>YYYY-MM-DD</Code> だけにする。曜日は勤怠表で付ける。
              </Item>
              <Item>
                休憩の例外は <Code>KINTAI_BREAK</Code> に <Code>H:MM</Code>{' '}
                で書き、備考は <Code>KINTAI_NOTE</Code> に書く。
              </Item>
              <Item>CLOCK 行の曜日の欄は、どの表記でも受け付ける。</Item>
            </Bullets>
          </DocPart>
          <DocPart title="エラーの扱い">
            <DocTable
              head={['エラー', '検出の場所', '扱い']}
              rows={[
                [
                  '案件の設定がない、TOML として読めない、項目の型や値が誤っている',
                  '案件の設定を読むとき',
                  '項目の場所を示す設定のエラーとし、終了コード2で止まる',
                ],
                [
                  'CLOCK 行やプロパティの書式が崩れている',
                  '記録を読むとき',
                  '行番号を付けた書式の崩れとして検出に渡す',
                ],
                [
                  '見出しの日付と CLOCK 行の日付が食い違う',
                  '記録を読むとき',
                  '日付を付けた書式の崩れとして検出に渡す',
                ],
              ]}
            />
          </DocPart>
          <DocPart title="テストの位置">
            <Prose>
              nvim-orgmode が実際に出力した Org
              形式のファイルを、テストの入力の例として置く。
              書式の崩れは、崩れの種類ごとに入力の例を用意して確かめる。
            </Prose>
          </DocPart>
        </DocSub>
        <DocSub title="集計">
          <Prose>層2の集計を詳しくしたもの。</Prose>
          <DocPart title="モジュールの分割とインターフェース">
            <Prose>
              集計の入口は、案件の設定、対象月、日の記録の並びを受け取り、月の報告を返す、同期の関数1つとする。
              日ごとの丸めと稼働の計算、月の精算の計算、金額の端数の処理は、それぞれ別の関数にし、入口の中で順に呼ぶ。
            </Prose>
          </DocPart>
          <DocPart title="型と状態">
            <Prose>型は次のとおりとする。 集計は状態を持たない。</Prose>
            <Pre>{`struct Minutes(u32);          // 時間は分の整数
struct Yen(i64);              // 金額は円の整数。控除はマイナス
struct Rate { numerator: u64, denominator: u64 } // 稼働率。分母は10のべき乗

enum Settlement {
    Within,
    Over { minutes: Minutes, amount: Yen },
    Under { minutes: Minutes, amount: Yen },
}`}</Pre>
            <Prose>計算は次の順に行う。</Prose>
            <Steps>
              <Item>
                始業は、最初の打刻の開始を丸めの単位で切り上げた時刻とする。終業は、最後の打刻の終了を丸めの単位で切り捨てた時刻とする。
              </Item>
              <Item>
                日ごとの稼働は、終業から始業と休憩を引いた時間とする。休憩には、例外の値か、案件の既定値を使う。
              </Item>
              <Item>
                月の合計時間を、その月の精算幅と比べる。日割り月は、月の上書きの精算幅を使う。
              </Item>
              <Item>
                超過額と控除額は、分に単価を掛けて600で割った値を整数に切り捨て、10倍する。これで、10円未満を切り捨てた額になる。
              </Item>
              <Item>
                基本額は、月額に稼働率の分子を掛け、分母で割った値を、案件の設定の丸め方で丸める。
              </Item>
              <Item>
                精算額は、基本額に超過額を足すか、控除額を引いた額とする。
              </Item>
            </Steps>
            <Prose>浮動小数点数は、どの段階でも使わない。</Prose>
          </DocPart>
          <DocPart title="エラーの扱い">
            <Prose>
              休憩が、終業から始業を引いた時間以上になる日は、検出に加えて止める。
              稼働を黙って0にすると、記録の誤りに気付けない。
              その日に休憩を取らなかった場合は、休憩の例外に <Code>0:00</Code>{' '}
              と書けば通る。
            </Prose>
            <Prose>
              集計の入口は、検出を通った記録だけを受け取る前提とし、それ以外のエラーを持たない。
            </Prose>
          </DocPart>
          <DocPart title="テストの位置">
            <Prose>
              <DocRef kind="PRD" number="0007" />{' '}
              の要求5、要求6、要求7の受入条件の例を、そのまま集計のテストにする。
              始業9:58が10:00に、終業19:07が19:00に丸められること、日割り月で稼働91hなら
              ¥404,440 に、稼働69.75hなら ¥398,580 になることを確かめる。
            </Prose>
          </DocPart>
        </DocSub>
        <DocSub title="freee 連携">
          <Prose>層2の freee 連携を詳しくしたもの。</Prose>
          <DocPart title="モジュールの分割とインターフェース">
            <Prose>freee 連携は、次の4つのモジュールに分ける。</Prose>
            <DocTable
              head={['モジュール', '受け持つこと']}
              rows={[
                [
                  '認証',
                  <>
                    認可 URL の組み立て、<Code>127.0.0.1</Code>{' '}
                    での認可コードの待ち受け、state の照合、トークンの取得
                  </>,
                ],
                [
                  'トークンの保管',
                  '状態ファイルの読み書きと、トークンの更新の判断',
                ],
                [
                  'freee の API',
                  '請求書の一覧の取得と作成。async のメソッドを持つ trait とし、reqwest による実装を1つ持つ',
                ],
                [
                  '請求書の組み立て',
                  '月の報告と案件の設定から、二重作成の確認の条件と、作成の内容を組み立てる',
                ],
              ]}
            />
            <Prose>
              請求書の組み立ては、通信を持たない同期の関数とする。 freee の API
              の trait を差し替えれば、通信なしで振る舞いを確かめられる。
            </Prose>
          </DocPart>
          <DocPart title="型と状態">
            <Prose>トークンは、次の状態をとる。</Prose>
            <Figure caption="新しいトークンを書き戻してから API を呼び、書き戻せない状態で先へ進まない。">
              <FigSvg
                height={215}
                label="未認証、有効、更新中の3つの状態と、その間の遷移"
              >
                <FigNode
                  x={40}
                  y={90}
                  w={170}
                  h={64}
                  tone="ghost"
                  title="未認証"
                  lines={['状態ファイルがない']}
                />
                <FigArrow
                  points={[
                    [210, 122],
                    [296, 122],
                  ]}
                />
                <FigLabel x={253} y={108}>
                  kintai auth
                </FigLabel>

                <FigNode
                  x={300}
                  y={90}
                  w={160}
                  h={64}
                  tone="mint"
                  title="有効"
                />
                <FigArrow
                  points={[
                    [460, 110],
                    [556, 110],
                  ]}
                  tone="neon"
                />
                <FigLabel x={508} y={96}>
                  期限まで5分を切った
                </FigLabel>

                <FigNode
                  x={560}
                  y={90}
                  w={160}
                  h={64}
                  tone="amber"
                  title="更新中"
                />
                <FigArrow
                  points={[
                    [560, 136],
                    [464, 136],
                  ]}
                  tone="neon"
                />
                <FigLabel x={512} y={150}>
                  書き戻してから呼ぶ
                </FigLabel>

                <FigArrow
                  points={[
                    [640, 90],
                    [640, 40],
                    [125, 40],
                    [125, 86],
                  ]}
                  tone="soft"
                />
                <FigLabel x={380} y={30}>
                  更新が拒まれた
                </FigLabel>

                <FigArrow
                  points={[
                    [340, 154],
                    [340, 186],
                    [420, 186],
                    [420, 158],
                  ]}
                />
                <FigLabel x={380} y={200}>
                  期限まで5分以上ある
                </FigLabel>
              </FigSvg>
            </Figure>
            <Prose>
              更新中は、受け取った新しいトークンを一時ファイルに書いてから、状態ファイルと置き換える。
              置き換えたあとで、API を呼ぶ。
            </Prose>
            <Prose>
              状態ファイルは JSON
              とし、アクセストークン、リフレッシュトークン、アクセストークンの期限の日時、事業所
              ID を持つ。
            </Prose>
            <Prose>
              二重作成の確認では、請求書の一覧を次の条件で取得し、1件でもあれば止める。
            </Prose>
            <Bullets>
              <Item label="取引先 ID">案件の設定の取引先</Item>
              <Item label="請求日の開始日と終了日">どちらも対象月の締め日</Item>
              <Item label="取消の状態">取消されていないもの</Item>
            </Bullets>
            <Prose>作成する請求書の明細は、次のとおりとする。</Prose>
            <DocTable
              head={['行', '摘要', '数量', '単価']}
              rows={[
                ['1', '案件の設定の摘要と対象月', '1', '基本額'],
                ['2（超過の月だけ）', '超過の時間と超過単価', '1', '超過額'],
                [
                  '2（控除の月だけ）',
                  '控除の時間と控除単価',
                  '1',
                  '控除額のマイナス',
                ],
              ]}
            />
            <Prose>
              超過と控除の行は、数量を1にし、単価に <Code>kintai</Code>{' '}
              が計算した金額を入れる。 freee
              は数量に単価を掛けて行の金額を求め、1円単位で丸めるため、時間を数量にすると、10円未満を切り捨てた額と一致しない。
              例えば控除を「0.25h × ¥5,710」とすると、freee では ¥1,427 になり、
              <DocRef kind="PRD" number="0007" /> の ¥1,420 と食い違う。
            </Prose>
          </DocPart>
          <DocPart title="エラーの扱い">
            <DocTable
              head={['エラー', '扱い']}
              rows={[
                [
                  '未認証、または更新が拒まれた',
                  <>
                    <Code>kintai auth</Code>{' '}
                    での再認証を案内し、終了コード3で止まる
                  </>,
                ],
                [
                  'freee が回数の制限を超えたと応答した',
                  '制限が解ける日時を示し、終了コード3で止まる',
                ],
                [
                  'freee がそのほかのエラーを返した',
                  'HTTP の状態と freee のメッセージを示し、終了コード3で止まる',
                ],
                [
                  '通信に失敗した',
                  '失敗した相手と理由を示し、終了コード3で止まる',
                ],
                [
                  '1Password から読めない',
                  <>
                    <Code>op</Code> のサインインを案内し、終了コード3で止まる
                  </>,
                ],
              ]}
            />
            <Prose>
              請求書の作成は、自動で再試行しない。
              作成の応答を受け取れずに再試行すると、請求書を2つ作るおそれがある。
              所有者がもう一度実行すれば、二重作成の確認が働く。
            </Prose>
          </DocPart>
          <DocPart title="テストの位置">
            <Bullets>
              <Item>
                請求書の組み立ては、超過、控除、範囲内の月ごとに、明細と二重作成の確認の条件を確かめる。
              </Item>
              <Item>
                二重作成の確認と作成の順序は、freee の API の trait
                の偽物で確かめる。
              </Item>
              <Item>
                トークンの保管は、一時ディレクトリの中で、状態の遷移と置き換えの順序を確かめる。
              </Item>
            </Bullets>
          </DocPart>
        </DocSub>
      </DocSection>
      <DocSection label="Impact" title="影響とリスク">
        <Bullets>
          <Item>
            <Code>typst</Code> のクレートは API
            が安定していないため、版を上げると勤怠表のコンポーネントの追従が要る（層2の勤怠表）。
          </Item>
          <Item>
            freee請求書 API の変更は、freee
            連携のコンポーネントで吸収する（層2の freee 連携）。
          </Item>
          <Item>
            読み込みは nvim-orgmode が出力する CLOCK
            行の書式に依存する。書式が変わると、すべての月の読み込みに影響する（層2の読み込み）。
          </Item>
          <Item>
            freee に登録したコールバック URL
            のポートと、案件の設定のポートが一致していないと、認証できない（層3の
            freee 連携）。
          </Item>
          <Item>
            <Code>kintai</Code> は Org 形式のファイルも freee
            の請求書も消さないため、誤りは記録の修正と freee
            での取消で元に戻せる。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Open Issues" title="未解決点">
        <Prose>なし。</Prose>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: 'PRD 0007「勤怠表と請求書の作成」',
              href: '/prd/0007_attendance-invoice',
            },
            {
              text: (
                <>
                  ADR{' '}
                  <DocLink href="/adr/0001_manage-environment-with-nix-flakes">
                    0001
                  </DocLink>
                  、
                  <DocLink href="/adr/0004_manage-claude-code-with-home-manager">
                    0004
                  </DocLink>
                  、
                  <DocLink href="/adr/0006_use-orgmode-and-org-roam-for-notes-and-tasks">
                    0006
                  </DocLink>
                  、
                  <DocLink href="/adr/0007_use-rust-and-typst-for-kintai-cli">
                    0007
                  </DocLink>
                  、
                  <DocLink href="/adr/0008_call-freee-api-from-kintai">
                    0008
                  </DocLink>
                  、
                  <DocLink href="/adr/0009_store-freee-credentials-in-1password-and-state-file">
                    0009
                  </DocLink>
                  、
                  <DocLink href="/adr/0010_write-project-settings-in-toml">
                    0010
                  </DocLink>
                  、
                  <DocLink href="/adr/0011_clock-in-with-nvim-orgmode-keymap">
                    0011
                  </DocLink>
                  、
                  <DocLink href="/adr/0012_use-tokio-and-reqwest-for-kintai">
                    0012
                  </DocLink>
                  、
                  <DocLink href="/adr/0013_split-kintai-into-library-and-cli-crates">
                    0013
                  </DocLink>
                </>
              ),
            },
            {
              text: (
                <>
                  freee請求書 API の仕様（GitHub の{' '}
                  <DocLink href="https://github.com/freee/freee-api-schema">
                    freee/freee-api-schema
                  </DocLink>
                  、2026-10-02 時点）
                  <Bullets>
                    <Item>請求書の作成と一覧、送付待ちの状態、取消</Item>
                    <Item>
                      添付の手段がないこと、単価にマイナスを書けること
                    </Item>
                  </Bullets>
                </>
              ),
            },
            {
              text: (
                <>
                  freee の MCP サーバー（GitHub の{' '}
                  <DocLink href="https://github.com/freee/freee-mcp">
                    freee/freee-mcp
                  </DocLink>
                  、2026-10-01 時点）: 会計 API
                  の請求書の扱い、認可コードの受け取り方
                </>
              ),
            },
            {
              text: (
                <>
                  <DocLink href="https://developer.freee.co.jp/">
                    freee Developers Community
                  </DocLink>{' '}
                  のリファレンスの概要（認証）:
                  トークンの有効期限、リフレッシュトークンの使い捨て、コールバック
                  URL の扱い
                </>
              ),
            },
            {
              text: (
                <>
                  所有者へのヒアリング（2026-10-03）
                  <Bullets>
                    <Item>
                      層2: 到達させる層、コマンドの形、PDF
                      の置き場と添付、日ごとの見出しのプロパティ、複数の打刻の扱い
                    </Item>
                    <Item>
                      層2:
                      支払期日、二重作成の判定、請求日、認可コードの受け取り方
                    </Item>
                    <Item>
                      層3: 対象のコンポーネント、基本額の丸め、明細、置き場、Org
                      形式の書き方、稼働率
                    </Item>
                  </Bullets>
                </>
              ),
            },
          ]}
        />
      </DocSection>
    </>
  )
}
