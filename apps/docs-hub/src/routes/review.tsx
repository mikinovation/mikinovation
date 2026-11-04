import { createFileRoute } from '@tanstack/react-router'

import { Section } from '@/components/doc'
import { Badge, CardGrid, DocCard, Hero } from '@/components/doc-page'
import type { ReviewDoc } from '@/lib/docs'
import {
  docKindLabels,
  listAllDocs,
  listDocsByReview,
  reviewIntervalMonths,
} from '@/lib/docs'

export const Route = createFileRoute('/review')({
  head: () => ({
    meta: [
      { title: '見直し | Docs Hub' },
      {
        name: 'description',
        content: '各文書の更新日と、次に見直す時期の一覧',
      },
    ],
  }),
  component: ReviewPage,
})

function ReviewCard({ doc }: { doc: ReviewDoc }) {
  return (
    <DocCard
      label={docKindLabels[doc.kind]}
      number={doc.number}
      title={doc.title}
      note={`更新 ${doc.review.updatedAt} / 見直し ${doc.review.dueAt}`}
      badge={doc.review.overdue ? { text: '要見直し', tone: 'review' } : null}
      href={doc.href}
    />
  )
}

function ReviewPage() {
  const docs = listDocsByReview()
  const overdue = docs.filter((doc) => doc.review.overdue)
  const upcoming = docs.filter((doc) => !doc.review.overdue)
  const undated = listAllDocs().length - docs.length

  return (
    <div className="flex flex-col gap-16">
      <Hero
        trail={[{ label: 'Docs Hub', href: '/' }, { label: '見直し' }]}
        title="見直し"
        compact
        lead={`各文書は更新日から${reviewIntervalMonths}か月を目安に見直す。期限の近い順に並べている。`}
        badges={
          <>
            <Badge tone="review">要見直し {overdue.length}</Badge>
            <Badge>期限内 {upcoming.length}</Badge>
          </>
        }
        note={
          undated === 0
            ? '更新日は文書の属性に持つ。ADR は決定日を基準にする。'
            : `更新日と決定日のどちらも持たない文書が${undated}件あり、この一覧には出ない。`
        }
      />

      <Section title="期限を過ぎた文書">
        {overdue.length === 0 ? (
          <p className="text-sm text-ink-dim">期限を過ぎた文書はない。</p>
        ) : (
          <CardGrid>
            {overdue.map((doc) => (
              <ReviewCard key={doc.href} doc={doc} />
            ))}
          </CardGrid>
        )}
      </Section>

      <Section title="次の見直し" aside={`${upcoming.length} docs`}>
        <CardGrid>
          {upcoming.map((doc) => (
            <ReviewCard key={doc.href} doc={doc} />
          ))}
        </CardGrid>
      </Section>
    </div>
  )
}
