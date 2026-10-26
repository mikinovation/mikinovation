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
  FigNote,
  FigSvg,
  Figure,
} from '@/components/figure'

export const meta = {
  title: '勤怠表と請求書の作成',
  lead: '所有者が、日々の打刻から月末の勤怠表 PDF と freee の請求書の下書きまでを、案件ごとの精算のルールに従って誤りなく短時間で作れるようにするための要求と受入条件を定める。',
  attributes: [
    { label: '読者', value: '開発者' },
    { label: '段階', value: '5. デリバリー（要求と受入条件を確定し、実装前）' },
  ],
}

export default function Body() {
  return (
    <>
      <Prose>この PRD の用語は次の意味で使う。</Prose>
      <Terms
        items={[
          {
            term: '案件',
            description:
              '所有者が稼働する契約の単位。同時に稼働する案件は常に1つとする。',
          },
          {
            term: '打刻',
            description:
              'その日の稼働の開始と終了を、Org 形式のファイルに clock の記録として残すこと。',
          },
          {
            term: '日ごとの見出し',
            description:
              '案件の見出しの下に、1日に1つ作る見出し。打刻、休憩の例外、備考をここに書く。',
          },
          {
            term: '勤怠表',
            description:
              '対象月の日ごとの始業、終業、休憩、稼働と、月の精算を載せた PDF。先方に提出する。',
          },
          {
            term: '精算幅',
            description:
              '月の稼働時間の下限と上限。下限を下回ると控除、上限を超えると超過として精算する。',
          },
          {
            term: '稼働率',
            description:
              '月の途中で契約が始まる月や終わる月に、月額と精算幅に掛ける比率。先方が示す。',
          },
          {
            term: '基本額',
            description:
              '精算する前の月の請求額。月額に稼働率を掛けた額で、日割り月以外は月額と同じ。',
          },
          {
            term: '日割り月',
            description: '稼働率を使う、契約の開始月と終了月。',
          },
          {
            term: '下書き',
            description:
              'freee で作る、送付前の請求書。freee請求書では「送付待ち」の請求書にあたる。',
          },
          {
            term: 'skill',
            description: 'Claude Code に月末の作業を頼むための作業手順。',
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
            所有者は、毎月の勤怠表をスプレッドシートに手で記入し、PDF
            にして請求書と一緒に先方へ提出している。
            この作業に、毎月、月末に30分ほどかかる。
            時刻の15分単位の丸め、精算幅との比較、超過額と控除額の計算を、手作業と目視で行っている。
            これまでに、記入や計算の誤り、先方からの差し戻しが起きている。
            精算幅、単価、丸め方、日割りといった精算のルールは、案件ごとに変わる。
          </Prose>
          <Prose>
            2026年9月に新しい案件が始まり、日割りと精算の計算が必要になった。
            そのため、今取り組む。
          </Prose>
        </DocSub>
        <DocSub title="対象となる利用者">
          <Prose>所有者本人だけを対象とする。</Prose>
        </DocSub>
        <DocSub title="仮説">
          <Prose>
            日々の打刻を Org 形式の clock
            で記録し、月末に勤怠表と請求の内容を自動で生成すれば、次のことが起きると見込む。
          </Prose>
          <Bullets>
            <Item>月末の作業が、30分から5分以内に縮む。</Item>
            <Item>計算の誤りによる差し戻しがなくなる。</Item>
          </Bullets>
        </DocSub>
        <DocSub title="提供する価値">
          <Prose>
            所有者は、月末に Claude へ一言頼むだけで、先方に出せる勤怠表 PDF と
            freee の請求書の下書きを揃えられる。
            丸め、精算、日割りの計算は、案件ごとの設定に従って毎回同じ結果になるため、所有者が確かめ直す必要がない。
            打刻漏れや、日割り月の設定の入力漏れは、勤怠表と下書きを作る前に検出される。
          </Prose>
        </DocSub>
        <DocSub title="対象外">
          <Bullets>
            <Item>1日のうちに複数の案件で稼働すること。</Item>
            <Item>請求書を先方へ自動で送付すること。</Item>
            <Item>freee を使わずに、請求書の PDF を作ること。</Item>
            <Item>先方が指定する勤怠表の様式を再現すること。</Item>
            <Item>祝日を判定すること。</Item>
            <Item>日割り月の稼働率を自動で計算すること。</Item>
            <Item>チケットごとの作業時間や作業内容を記録すること。</Item>
            <Item>所有者以外が使うこと。</Item>
          </Bullets>
        </DocSub>
        <DocSub title="制約とトレードオフ">
          <Prose>所有者は、次のことを受け入れる。</Prose>
          <Bullets>
            <Item>
              休憩は案件ごとの既定値を使い、例外の日だけ明示する。その代わり、実際に取った休憩の時間は記録しない。
            </Item>
            <Item>
              始業は切り上げ、終業は切り捨てて丸める。その代わり、15分未満の稼働は請求に含まれない。
            </Item>
            <Item>
              日割り月の稼働率と精算幅は、先方が示した値を手で入力する。その代わり、入力の手間と入力漏れの危険を引き受ける。入力漏れは検出で補う。
            </Item>
            <Item>超過額と控除額は、10円未満を切り捨てる。</Item>
            <Item>
              freee の API
              を使うために、認証の準備と、その情報の管理を引き受ける。
            </Item>
            <Item>
              請求書の送付と、誤って作った請求書の取消は、所有者が freee
              の画面で行う。
            </Item>
            <Item>
              勤怠の記録と案件の設定は非公開のリポジトリで管理するため、このリポジトリだけでは使えない。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="成功条件">
          <Bullets>
            <Item>
              月末の作業が5分以内に終わる。作業は、勤怠表 PDF の生成から freee
              の下書きの作成までとする。
            </Item>
            <Item>計算の誤りを理由に、先方から差し戻されない。</Item>
            <Item>
              打刻漏れがある状態や、日割り月の設定が入力されていない状態では、勤怠表
              PDF も下書きも作られない。
            </Item>
          </Bullets>
        </DocSub>
        <DocSub title="計測と学習の計画">
          <Prose>
            最初の月である2026年9月分は、今の手作業のスプレッドシートと並行して作り、時間、精算額、請求額が一致するかを見比べる。
            2026年9月分から11月分までの3か月は、月末の作業時間と差し戻しの有無を、所有者がメモに残す。
            その結果を仮説と比べ、運用の段階で結果と学びに記す。
            これ以外の計測の仕組みは設けない。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Solution" title="解決策">
        <DocSub title="解決案とトレードオフ">
          <DocPart title="打刻の記録の仕方">
            <Prose>次の3案を比べ、案1を採った。</Prose>
            <TradeOffs
              items={[
                {
                  id: '1',
                  option:
                    '日ごとの見出しに、朝に開始し、夜に終了する打刻をする',
                  fields: [
                    {
                      label: '利点',
                      value:
                        '始業、終業、休憩をそのまま取り出せ、休憩の既定値のルールを表せる',
                    },
                    { label: '欠点', value: '作業の内訳は残らない' },
                  ],
                },
                {
                  id: '2',
                  option: 'チケットに打刻し、案件ごとに集計する',
                  fields: [
                    { label: '利点', value: '作業の内訳も残る' },
                    {
                      label: '欠点',
                      value:
                        '休憩が打刻の空白になり、休憩の既定値のルールとずれる',
                    },
                  ],
                },
                {
                  id: '3',
                  option: '後から時刻を手で入力する',
                  fields: [
                    { label: '利点', value: '打刻を忘れても困らない' },
                    { label: '欠点', value: '今の手作業と変わらない' },
                  ],
                },
              ]}
            />
          </DocPart>
          <DocPart title="操作の窓口と計算の担い手">
            <Prose>次の3案を比べ、案1を採った。</Prose>
            <TradeOffs
              items={[
                {
                  id: '1',
                  option: 'skill が窓口になり、計算は CLI が行う',
                  fields: [
                    {
                      label: '利点',
                      value:
                        '計算は毎回同じ結果になる。例外への対応は Claude が案内する',
                    },
                    { label: '欠点', value: 'CLI と skill の両方を保守する' },
                  ],
                },
                {
                  id: '2',
                  option: 'skill だけで完結させる',
                  fields: [
                    { label: '利点', value: '作るものが少ない' },
                    {
                      label: '欠点',
                      value: '金額の計算結果がぶれる余地が残る',
                    },
                  ],
                },
                {
                  id: '3',
                  option: 'CLI だけで完結させる',
                  fields: [
                    { label: '利点', value: 'Claude がなくても動く' },
                    {
                      label: '欠点',
                      value:
                        '打刻漏れの修正などの例外への対応を、毎回所有者が判断する',
                    },
                  ],
                },
              ]}
            />
          </DocPart>
          <DocPart title="freee との連携">
            <Prose>
              次の2案を比べ、案1を採った。
              freee請求書には下書きと発行の区別がないため、請求書を発行する案は比べる対象から外した。
            </Prose>
            <TradeOffs
              items={[
                {
                  id: '1',
                  option: '送付待ちの請求書を作る',
                  fields: [
                    { label: '利点', value: '送付の前に所有者が確認できる' },
                    { label: '欠点', value: '送付は手作業で残る' },
                  ],
                },
                {
                  id: '2',
                  option: '先方への送付まで行う',
                  fields: [
                    { label: '利点', value: 'すべて自動になる' },
                    { label: '欠点', value: '誤りに気付く機会がなくなる' },
                  ],
                },
              ]}
            />
          </DocPart>
          <DocPart title="日割り月の稼働率">
            <Prose>次の2案を比べ、案1を採った。</Prose>
            <TradeOffs
              items={[
                {
                  id: '1',
                  option: '先方が示した値を手で入力する',
                  fields: [
                    { label: '利点', value: '先方の数字と必ず一致する' },
                    {
                      label: '欠点',
                      value: '入力の手間と、入力漏れの危険がある',
                    },
                  ],
                },
                {
                  id: '2',
                  option: '営業日から自動で計算する',
                  fields: [
                    { label: '利点', value: '入力が要らない' },
                    {
                      label: '欠点',
                      value:
                        '先方の計算方法とずれる危険がある。祝日のデータが要る',
                    },
                  ],
                },
              ]}
            />
          </DocPart>
        </DocSub>
        <DocSub title="要求と受入条件">
          <Prose>
            各要求と、その要求を受け入れる条件は次のとおり。
            受入条件の金額と時間は、表の下に示す例の契約条件で計算した値である。
          </Prose>
          <Figure caption="検出で止まる場合、勤怠表も下書きも作られない。二重の下書きも同じ扱いで止める。">
            <FigSvg
              height={250}
              label="日々の打刻から検出、計算を経て勤怠表 PDF と freee の下書きに至る流れ"
            >
              <FigLabel x={380} y={10}>
                「9月の勤怠と請求書を作って」の一言で、検出から下書きまで進む
              </FigLabel>

              <FigNode
                x={0}
                y={34}
                w={150}
                h={76}
                title="日々の打刻"
                lines={['日ごとの見出しに残す']}
              />
              <FigArrow
                points={[
                  [150, 72],
                  [182, 72],
                ]}
              />
              <FigNode
                x={186}
                y={34}
                w={160}
                h={76}
                tone="amber"
                title="提出前の検出"
                lines={['打刻漏れ、日割りの設定漏れ']}
              />
              <FigArrow
                points={[
                  [266, 110],
                  [266, 166],
                ]}
              />
              <FigNode
                x={186}
                y={170}
                w={160}
                h={64}
                tone="rose"
                title="見つかれば止まる"
                lines={['直すべき箇所を案内する']}
              />

              <FigArrow
                points={[
                  [346, 72],
                  [378, 72],
                ]}
                tone="neon"
              />
              <FigNode
                x={382}
                y={34}
                w={160}
                h={76}
                tone="neon"
                title="丸めと精算の計算"
                lines={['毎回同じ結果になる']}
              />
              <FigNode
                x={382}
                y={170}
                w={160}
                h={64}
                tone="ghost"
                lines={['案件ごとの設定', '精算幅、単価、丸め、締め日']}
              />
              <FigArrow
                points={[
                  [462, 170],
                  [462, 114],
                ]}
                tone="soft"
              />

              <FigArrow
                points={[
                  [542, 72],
                  [562, 72],
                  [562, 48],
                  [596, 48],
                ]}
                tone="neon"
              />
              <FigArrow
                points={[
                  [542, 72],
                  [562, 72],
                  [562, 128],
                  [596, 128],
                ]}
                tone="neon"
              />
              <FigNode
                x={600}
                y={20}
                w={160}
                h={56}
                tone="mint"
                title="勤怠表 PDF"
                lines={['先方に提出する']}
              />
              <FigNode
                x={600}
                y={100}
                w={160}
                h={56}
                tone="mint"
                title="freee の下書き"
                lines={['送付は所有者が行う']}
              />
            </FigSvg>
          </Figure>
          <Requirements
            items={[
              {
                id: '1',
                demand: 'その日の見出しに打刻できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '1回の操作で、案件の見出しの下に当日の見出しができ、打刻が始まる。当日の見出しがすでにあれば、その見出しを使う',
                  },
                ],
              },
              {
                id: '2',
                demand: '休憩の例外を日ごとに指定できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '日ごとの見出しに休憩の時間を書いた日は、その時間が休憩になる。書いていない日は、案件の既定値が休憩になる',
                  },
                ],
              },
              {
                id: '3',
                demand: '備考を日ごとに書ける',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '日ごとの見出しに書いた備考が、勤怠表の備考の欄に載る',
                  },
                ],
              },
              {
                id: '4',
                demand: '案件ごとに精算のルールを設定できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '下に示す項目を案件ごとに設定でき、設定を変えると計算結果が変わる',
                  },
                ],
              },
              {
                id: '5',
                demand: '日割り月の稼働率と精算幅を上書きできる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '日割り月に稼働率0.5と精算幅70–90hを指定すると、基本額が ¥400,000、精算幅が 70–90h になる',
                  },
                ],
              },
              {
                id: '6',
                demand: '時刻が設定どおりに丸められる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '15分単位で始業を切り上げ、終業を切り捨てる設定では、始業9:58は10:00に、終業19:07は19:00になる',
                  },
                ],
              },
              {
                id: '7',
                demand: '精算額が設定どおりに計算される',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '要求5の日割り月で、稼働が91h、69.75h、精算幅の範囲内のとき、精算額が下に示す値になる',
                  },
                ],
              },
              {
                id: '8',
                demand: '打刻漏れを検出できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '終了のない打刻や、日をまたぐ打刻があると、その日付を示して止まる。勤怠表も下書きも作られない',
                  },
                ],
              },
              {
                id: '9',
                demand: '日割りの設定漏れを検出できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '契約の開始月または終了月に稼働率の上書きがないと、その月を示して止まる。勤怠表も下書きも作られない',
                  },
                ],
              },
              {
                id: '10',
                demand: '勤怠表 PDF を生成できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '対象月の全日が行になる。列、ヘッダー、表の下には、下に示す内容が載る',
                  },
                ],
              },
              {
                id: '11',
                demand: 'freee に請求書の下書きを作れる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '対象月の締め日を請求日とする送付待ちの請求書が freee にできる。請求書は送付されない',
                  },
                ],
              },
              {
                id: '12',
                demand: '勤怠表と請求書を一緒に提出できる',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '勤怠表 PDF が、freee から請求書と一緒に送れる形で用意される',
                  },
                ],
              },
              {
                id: '13',
                demand: '一言で月末の作業を頼める',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '「9月の勤怠と請求書を作って」と頼むと、skill が下に示す順に作業し、結果を報告する',
                  },
                ],
              },
              {
                id: '14',
                demand: '同じ月の下書きを二重に作らない',
                fields: [
                  {
                    label: '受入条件',
                    value:
                      '下に示す請求書がすでに freee にあると、そのことを知らせて止まる。新しい下書きは作られない',
                  },
                ],
              },
            ]}
          />
          <Prose>
            要求4で案件ごとに設定する項目は、契約期間、月額、基本額の端数の丸め方、精算幅、超過単価、控除単価、丸めの単位と向き、休憩の既定値、締め日、支払期日、請求の項目である。
          </Prose>
          <Prose>
            要求7の精算額は、稼働91hなら ¥400,000 ＋ 1h × ¥4,440 ＝ ¥404,440
            になる。 稼働69.75hなら、控除額 0.25h × ¥5,710 ＝ ¥1,427.5
            を切り捨てて ¥1,420 とし、¥398,580 になる。 精算幅の範囲内なら
            ¥400,000 になる。
          </Prose>
          <Figure caption="稼働が精算幅から外れた分だけを単価で精算し、10円未満は切り捨てる。">
            <FigSvg
              height={170}
              label="精算幅 70 から 90 時間を境に、控除、基本額のまま、超過に分かれる精算額の関係"
            >
              <FigNode
                x={60}
                y={78}
                w={160}
                h={32}
                rx={6}
                tone="rose"
                lines={['控除 ¥5,710/h']}
              />
              <FigNode
                x={220}
                y={78}
                w={320}
                h={32}
                rx={6}
                tone="mint"
                title="基本額のまま ¥400,000"
              />
              <FigNode
                x={540}
                y={78}
                w={160}
                h={32}
                rx={6}
                tone="amber"
                lines={['超過 ¥4,440/h']}
              />

              <path className="fig-axis" d="M220 110 V126" />
              <path className="fig-axis" d="M540 110 V126" />
              <FigLabel x={220} y={138}>
                70h
              </FigLabel>
              <FigLabel x={540} y={138}>
                90h
              </FigLabel>
              <FigLabel x={380} y={138}>
                精算幅（日割り月に上書きした値）
              </FigLabel>

              <path className="fig-axis" d="M216 60 V78" />
              <circle className="fig-rose" cx={216} cy={56} r={4} />
              <FigNote x={216} y={38}>
                稼働 69.75h → ¥398,580
              </FigNote>

              <path className="fig-axis" d="M556 60 V78" />
              <circle className="fig-amber" cx={556} cy={56} r={4} />
              <FigNote x={556} y={38}>
                稼働 91h → ¥404,440
              </FigNote>
            </FigSvg>
          </Figure>
          <Prose>
            要求10の勤怠表 PDF
            では、列は日付、曜日、始業、終業、休憩、稼働、備考で、稼働のない日は時刻の欄が空になる。
            ヘッダーに対象月、氏名、案件名、先方名が載る。 PDF
            の表の下に、合計時間、精算幅、超過または控除の時間、精算額が載る。
          </Prose>
          <Prose>
            要求11の請求書は、対象月の精算額にもとづく品目、数量、単価、税率、支払期日で作られる。
          </Prose>
          <Prose>
            要求13では、skill が検出、勤怠表の生成、下書きの作成を順に行い、PDF
            の場所と下書きを報告する。
            検出で止まった場合は、直すべき箇所を案内する。
          </Prose>
          <Prose>
            要求14で止まるのは、同じ取引先で対象月の締め日を請求日とする、取消していない請求書があるときである。
          </Prose>
          <Prose>
            受入条件の例に使う契約条件は次のとおり。 実際の案件の値ではない。
          </Prose>
          <DocTable
            head={['項目', '値']}
            rows={[
              ['月額', '¥800,000（税別）'],
              ['精算幅', '140–180h'],
              ['超過単価', '¥4,440（¥800,000 ÷ 180h の10円未満を切り捨て）'],
              ['控除単価', '¥5,710（¥800,000 ÷ 140h の10円未満を切り捨て）'],
              ['丸め', '15分単位。始業は切り上げ、終業は切り捨て'],
              ['超過額と控除額の丸め', '10円未満を切り捨て'],
            ]}
          />
        </DocSub>
        <DocSub title="成功条件の測定方法">
          <Bullets>
            <Item label="作業時間">
              2026年9月分から11月分まで、skill
              に頼んでから下書きができるまでの時間を所有者がメモに残し、5分以内かどうかで判断する。
            </Item>
            <Item label="差し戻し">
              同じ3か月に、計算の誤りによる差し戻しがあったかを記録する。
            </Item>
            <Item label="打刻漏れと設定漏れ">
              要求8と要求9の受入条件を満たすことで確かめる。
            </Item>
          </Bullets>
          <Prose>計測の仕組みは設けない。</Prose>
        </DocSub>
        <DocSub title="展開計画">
          <Prose>
            所有者のマシンだけに提供する。
            開発環境を「すべて」の範囲で導入すると使える。「最小限」には含まれない。
            使う前に、所有者が次のものを用意する。
          </Prose>
          <Bullets>
            <Item>案件の設定と勤怠の記録を置く、非公開のリポジトリ</Item>
            <Item>freee の API の認証</Item>
          </Bullets>
          <Prose>
            2026年9月分は手作業と並行して作り、結果が一致したら、10月分から手作業をやめる。
            段階的な公開はしない。
          </Prose>
        </DocSub>
      </DocSection>
      <DocSection label="Open Questions" title="未解決の問い">
        <Bullets>
          <Item>
            勤怠表の様式を自前のものに切り替えることを、先方に伝えるか。
          </Item>
        </Bullets>
      </DocSection>
      <DocSection label="Sources" title="出典">
        <Sources
          items={[
            {
              text: '所有者へのヒアリング（2026-10-02〜2026-10-03）: 精算のルール、課題と解決策のすべての項目',
            },
            {
              text: (
                <>
                  freee請求書 API の仕様（
                  <DocLink href="https://github.com/freee/freee-api-schema">
                    freee/freee-api-schema
                  </DocLink>{' '}
                  の <Code>iv/open-api-3/api-schema.yml</Code>、2026-10-02
                  時点）: 下書き、要求11、要求14
                </>
              ),
            },
            {
              text: '所有者へのヒアリング（2026-10-03）: 要求4の基本額の端数の丸め方',
            },
          ]}
        />
      </DocSection>
    </>
  )
}
