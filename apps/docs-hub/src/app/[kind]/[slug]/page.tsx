import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Attributes, DocPager, Hero } from '@/components/doc-page'
import {
  docKindLabels,
  docKinds,
  findDoc,
  findSiblings,
  listDocs,
} from '@/lib/docs'

type Params = {
  kind: string
  slug: string
}

type Props = {
  params: Promise<Params>
}

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return docKinds.flatMap((kind) =>
    listDocs(kind).map((doc) => ({ kind, slug: doc.slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, slug } = await params
  const doc = findDoc(kind, slug)
  if (doc === null) {
    return {}
  }

  return {
    title: `${doc.heading} | Docs Hub`,
    description: doc.lead,
  }
}

export default async function DocumentPage({ params }: Props) {
  const { kind, slug } = await params
  const doc = findDoc(kind, slug)
  if (doc === null) {
    notFound()
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
        badges={
          <>
            {doc.badge !== null && (
              <span className={doc.badge.className}>{doc.badge.text}</span>
            )}
            <Attributes attributes={doc.details} />
          </>
        }
      />

      <div className="panel panel-glow doc-body flex flex-col gap-11 px-5 py-7 sm:px-9 sm:py-10">
        <Body />
      </div>

      <hr className="hairline" />

      <DocPager previous={previous} next={next} />
    </article>
  )
}
