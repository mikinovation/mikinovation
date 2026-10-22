import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { docKindLabels, docKinds, findDoc, listDocs } from '@/lib/docs'

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
    title: `${docKindLabels[doc.kind]} ${doc.number} ${doc.title} | Docs Hub`,
    description: doc.lead,
  }
}

export default async function DocumentPage({ params }: Props) {
  const { kind, slug } = await params
  const doc = findDoc(kind, slug)
  if (doc === null) {
    notFound()
  }

  const { default: Body } = await import(`@/content/${kind}/${slug}.mdx`)
  const siblings = listDocs(doc.kind)
  const position = siblings.findIndex((sibling) => sibling.slug === doc.slug)
  const previous = position > 0 ? siblings[position - 1] : null
  const next = position < siblings.length - 1 ? siblings[position + 1] : null

  return (
    <article className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-3">
        <nav className="label flex items-center gap-2">
          <Link href="/" className="transition-colors hover:text-neon-soft">
            Docs Hub
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={`/#${doc.kind}`}
            className="transition-colors hover:text-neon-soft"
          >
            {docKindLabels[doc.kind]}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink-dim">{doc.number}</span>
        </nav>
        {doc.badge !== null && (
          <span className={doc.badge.className}>{doc.badge.text}</span>
        )}
      </div>

      <div className="panel panel-glow doc-body px-5 py-7 sm:px-9 sm:py-10">
        <Body />
      </div>

      <hr className="hairline" />

      <nav className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        {previous !== null ? (
          <Link
            href={`/${previous.kind}/${previous.slug}`}
            className="nav-link"
          >
            <span>
              ← {docKindLabels[previous.kind]} {previous.number}{' '}
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next !== null && (
          <Link
            href={`/${next.kind}/${next.slug}`}
            className="nav-link sm:text-right"
          >
            <span>
              {docKindLabels[next.kind]} {next.number} {next.title} →
            </span>
          </Link>
        )}
      </nav>
    </article>
  )
}
