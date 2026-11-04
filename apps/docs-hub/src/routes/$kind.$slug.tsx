import { createFileRoute, notFound } from '@tanstack/react-router'

import { DocBadges, DocPager, Hero } from '@/components/doc-page'
import { NotFound } from '@/components/not-found'
import { docKindLabels, findDoc, findSiblings } from '@/lib/docs'

export const Route = createFileRoute('/$kind/$slug')({
  loader: ({ params }) => {
    if (findDoc(params.kind, params.slug) === null) {
      throw notFound()
    }
  },
  head: ({ params }) => {
    const doc = findDoc(params.kind, params.slug)
    if (doc === null) {
      return {}
    }

    return {
      meta: [
        { title: `${doc.heading} | Docs Hub` },
        { name: 'description', content: doc.lead },
      ],
    }
  },
  component: DocumentPage,
})

function DocumentPage() {
  const { kind, slug } = Route.useParams()
  const doc = findDoc(kind, slug)
  if (doc === null) {
    return <NotFound />
  }

  const { previous, next } = findSiblings(doc)
  const { Body } = doc

  return (
    <article className="flex flex-col gap-10">
      <Hero
        trail={[
          { label: 'Docs Hub', href: '/' },
          { label: docKindLabels[doc.kind], href: `/#${doc.kind}` },
          { label: doc.number },
        ]}
        title={doc.title}
        compact
        lead={doc.lead}
        badges={<DocBadges badge={doc.badge} attributes={doc.details} />}
      />

      <div className="panel panel-glow doc-body flex flex-col gap-11 px-5 py-7 sm:px-9 sm:py-10">
        <Body />
      </div>

      <hr className="hairline" />

      <DocPager previous={previous} next={next} />
    </article>
  )
}
