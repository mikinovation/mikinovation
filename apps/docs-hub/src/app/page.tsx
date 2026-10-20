const documents = [
  {
    kind: 'ADR',
    number: '0017',
    title: 'ドキュメントハブに VitePress を使う',
    badge: { text: '置き換え', className: 'badge badge-superseded' },
  },
  {
    kind: 'ADR',
    number: '0018',
    title: '日本語検索にバイグラムのトークナイザーを使う',
    badge: { text: '採用', className: 'badge badge-accepted' },
  },
  {
    kind: 'PRD',
    number: '0010',
    title: 'ドキュメントハブ',
    badge: { text: '段階 5 デリバリー', className: 'badge badge-stage' },
  },
  {
    kind: '設計書',
    number: '0001',
    title: '勤怠と請求',
    badge: { text: '作成中', className: 'badge' },
  },
]

const palette = [
  { name: 'base-900', className: 'bg-base-900' },
  { name: 'base-700', className: 'bg-base-700' },
  { name: 'base-600', className: 'bg-base-600' },
  { name: 'line-bright', className: 'bg-line-bright' },
  { name: 'neon', className: 'bg-neon' },
  { name: 'flux', className: 'bg-flux' },
  { name: 'mint', className: 'bg-mint' },
  { name: 'amber', className: 'bg-amber' },
]

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-5">
        <p className="label">Portfolio / Documents</p>
        <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          <span className="bg-gradient-to-r from-neon-soft via-ink to-flux bg-clip-text text-transparent">
            Docs Hub
          </span>
        </h1>
        <p className="max-w-xl text-ink-dim">
          ポートフォリオと <code className="code-chip">docs/</code>{' '}
          の文書を一つにまとめるサイトです。ADR、PRD、設計書、テストケース、計画を種類別にたどれます。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-stage">Next.js 16</span>
          <span className="badge">Tailwind CSS 4</span>
          <span className="badge">静的書き出し</span>
        </div>
      </section>

      <section id="documents" className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">文書</h2>
          <p className="label">28 docs</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {documents.map((doc) => (
            <a
              key={`${doc.kind}-${doc.number}`}
              href="#sample"
              className="doc-card"
            >
              <div className="flex items-center gap-2.5">
                <span className="label text-neon-soft">{doc.kind}</span>
                <span className="font-mono text-xs text-ink-faint">
                  {doc.number}
                </span>
              </div>
              <p className="mt-1.5 leading-snug font-medium text-ink">
                {doc.title}
              </p>
              <div className="mt-3">
                <span className={doc.badge.className}>{doc.badge.text}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="sample" className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">文書本文の見本</h2>
        <article className="panel panel-glow doc-body px-6 py-8 sm:px-9 sm:py-10">
          <p className="label">ADR 0019</p>
          <h1>ドキュメントハブを Next.js と Tailwind CSS で作る</h1>
          <p>
            ドキュメントハブの見た目を、暗い配色の未来的なテーマで組む。
            本文の読みやすさを保ったまま、一覧とメタ情報を見分けやすくする。
          </p>

          <h2>背景</h2>
          <p>
            <a href="#documents">PRD 0010</a> は、種類別のメニュー、全文検索、
            文書参照のリンク化、一覧でのメタ情報の表示を求めている。
            テーマはこの4つの表示を受け止める必要がある。
          </p>
          <blockquote>
            正本は Git 上の Markdown とし、ハブは表示だけを担う。
          </blockquote>

          <h3>決定</h3>
          <ul>
            <li>
              配色は <code>globals.css</code> の <code>@theme</code>{' '}
              にまとめ、クラス名から参照する
            </li>
            <li>本文の体裁は .doc-body の中だけに効かせる</li>
            <li>光彩と格子は背景と枠線にとどめ、本文には重ねない</li>
          </ul>

          <pre>
            <code>{`@theme {
  --color-neon: #3ae3ff;
  --color-flux: #9d7bff;
}`}</code>
          </pre>

          <h3>影響</h3>
          <table>
            <thead>
              <tr>
                <th>対象</th>
                <th>変更</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>配色</td>
                <td>暗い配色に固定し、手動の切り替えは持たない</td>
                <td>採用</td>
              </tr>
              <tr>
                <td>本文</td>
                <td>Markdown の変換結果に .doc-body を当てる</td>
                <td>採用</td>
              </tr>
              <tr>
                <td>検索</td>
                <td>入力欄の見た目だけを用意する</td>
                <td>保留</td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>

      <section id="palette" className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">配色</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {palette.map((color) => (
            <div key={color.name} className="flex flex-col gap-2">
              <div
                className={`h-16 rounded-lg border border-line ${color.className}`}
              />
              <p className="label">{color.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
