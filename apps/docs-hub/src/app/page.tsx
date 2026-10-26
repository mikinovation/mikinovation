import Link from 'next/link'

import { docKindLabels, docKinds, listDocs } from '@/lib/docs'

export default function Home() {
  const sections = docKinds.map((kind) => ({
    kind,
    label: docKindLabels[kind],
    docs: listDocs(kind),
  }))
  const total = sections.reduce(
    (count, section) => count + section.docs.length,
    0,
  )

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
          ポートフォリオと
          PRD、ADR、設計書を一つにまとめるサイトです。種類別に一覧からたどれます。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-stage">{total} docs</span>
          <span className="badge">MDX</span>
          <span className="badge">静的書き出し</span>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">プロフィール</h2>
        <Link href="/career" className="doc-card">
          <div className="flex items-center gap-2.5">
            <span className="label text-neon-soft">Career</span>
          </div>
          <p className="mt-1.5 leading-snug font-medium text-ink">経歴</p>
          <p className="mt-2 text-sm text-ink-dim">
            フリーランスのエンジニアとして担ってきた役割、取り組んできたこと、扱える技術をまとめている。
          </p>
        </Link>
      </section>

      {sections.map((section) => (
        <section
          key={section.kind}
          id={section.kind}
          className="flex flex-col gap-5"
        >
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold">{section.label}</h2>
            <p className="label">{section.docs.length} docs</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {section.docs.map((doc) => (
              <Link
                key={doc.slug}
                href={`/${doc.kind}/${doc.slug}`}
                className="doc-card"
              >
                <div className="flex items-center gap-2.5">
                  <span className="label text-neon-soft">{section.label}</span>
                  <span className="font-mono text-xs text-ink-faint">
                    {doc.number}
                  </span>
                </div>
                <p className="mt-1.5 leading-snug font-medium text-ink">
                  {doc.title}
                </p>
                {doc.badge !== null && (
                  <div className="mt-3">
                    <span className={doc.badge.className}>
                      {doc.badge.text}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
