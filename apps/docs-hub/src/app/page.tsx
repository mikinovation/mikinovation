import { DocCard, Hero } from '@/components/doc-page'
import { Section } from '@/components/doc'
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
      <Hero
        trail={[{ label: 'Portfolio / Documents' }]}
        title="Docs Hub"
        lead="ポートフォリオと PRD、ADR、設計書を一つにまとめるサイトです。種類別に一覧からたどれます。"
        badges={
          <>
            <span className="badge badge-stage">{total} docs</span>
            <span className="badge">TSX</span>
            <span className="badge">静的書き出し</span>
          </>
        }
      />

      <Section title="プロフィール">
        <div className="grid gap-3 sm:grid-cols-2">
          <DocCard
            label="Career"
            title="経歴"
            note="フリーランスのエンジニアとして担ってきた役割、取り組んできたこと、扱える技術をまとめている。"
            href="/career"
          />
          <DocCard
            label="Repositories"
            title="リポジトリ"
            note="公開している開発環境と、Neovim のプラグインや開発中に使う道具を紹介している。"
            href="/repositories"
          />
        </div>
      </Section>

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
              <DocCard
                key={doc.slug}
                label={section.label}
                number={doc.number}
                title={doc.title}
                badge={
                  doc.badge === null ? undefined : (
                    <span className={doc.badge.className}>
                      {doc.badge.text}
                    </span>
                  )
                }
                href={doc.href}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
