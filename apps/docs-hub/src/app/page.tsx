import { Section } from '@/components/doc'
import { Badge, CardGrid, DocCard, Hero } from '@/components/doc-page'
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
            <Badge tone="stage">{total} docs</Badge>
            <Badge>TSX</Badge>
            <Badge>静的書き出し</Badge>
          </>
        }
      />

      <Section title="プロフィール">
        <CardGrid>
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
        </CardGrid>
      </Section>

      {sections.map((section) => (
        <Section
          key={section.kind}
          id={section.kind}
          title={section.label}
          aside={`${section.docs.length} docs`}
        >
          <CardGrid>
            {section.docs.map((doc) => (
              <DocCard
                key={doc.slug}
                label={section.label}
                number={doc.number}
                title={doc.title}
                badge={doc.badge}
                href={doc.href}
              />
            ))}
          </CardGrid>
        </Section>
      ))}
    </div>
  )
}
