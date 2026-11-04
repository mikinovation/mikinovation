import type { ReactNode } from 'react'

import { docEntries } from '@/content'

export const docKinds = ['prd', 'adr', 'design', 'learn'] as const

export type DocKind = (typeof docKinds)[number]

export const docKindLabels: Record<DocKind, string> = {
  prd: 'PRD',
  adr: 'ADR',
  design: '設計書',
  learn: '学習ノート',
}

export type DocAttribute = {
  label: string
  value: string
}

export type DocEntry = {
  kind: DocKind
  slug: string
  title: string
  lead: string
  attributes: DocAttribute[]
  Body: () => ReactNode
}

export type BadgeTone =
  | 'plain'
  | 'accepted'
  | 'rejected'
  | 'superseded'
  | 'stage'
  | 'review'

export type DocBadge = {
  text: string
  tone: BadgeTone
}

export type DocReview = {
  updatedAt: string
  dueAt: string
  overdue: boolean
}

export type Doc = DocEntry & {
  number: string
  href: string
  heading: string
  badge: DocBadge | null
  details: DocAttribute[]
  review: DocReview | null
}

export type ReviewDoc = Doc & { review: DocReview }

export const reviewIntervalMonths = 6

const isDocKind = (value: string): value is DocKind =>
  (docKinds as readonly string[]).includes(value)

const badgeOf = (attributes: DocAttribute[]): DocBadge | null => {
  const state = attributes.find((attribute) => attribute.label === '状態')
  if (state !== undefined) {
    if (state.value.startsWith('採用')) {
      return { text: state.value, tone: 'accepted' }
    }
    if (state.value.startsWith('却下')) {
      return { text: state.value, tone: 'rejected' }
    }
    if (state.value.startsWith('置き換え') || state.value.startsWith('廃止')) {
      return { text: state.value, tone: 'superseded' }
    }
    return { text: state.value, tone: 'plain' }
  }

  const stage = attributes.find((attribute) => attribute.label === '段階')
  if (stage !== undefined) {
    const number = /^\d+/.exec(stage.value)
    return {
      text: `段階 ${number === null ? stage.value : number[0]}`,
      tone: 'stage',
    }
  }

  const layer = attributes.find(
    (attribute) => attribute.label === '到達している層',
  )
  if (layer !== undefined) {
    return { text: layer.value, tone: 'stage' }
  }

  return null
}

const today = new Date().toISOString().slice(0, 10)

const pad = (value: number): string => String(value).padStart(2, '0')

const addMonths = (date: string, months: number): string => {
  const [year, month, day] = date.split('-').map(Number)
  const shifted = year * 12 + (month - 1) + months
  const nextYear = Math.floor(shifted / 12)
  const nextMonth = (shifted % 12) + 1
  const lastDay = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate()

  return `${nextYear}-${pad(nextMonth)}-${pad(Math.min(day, lastDay))}`
}

const reviewOf = (attributes: DocAttribute[]): DocReview | null => {
  const updated =
    attributes.find((attribute) => attribute.label === '更新日') ??
    attributes.find((attribute) => attribute.label === '決定日')
  if (updated === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(updated.value)) {
    return null
  }

  const dueAt = addMonths(updated.value, reviewIntervalMonths)

  return { updatedAt: updated.value, dueAt, overdue: dueAt < today }
}

const toDoc = (entry: DocEntry): Doc => {
  const number = entry.slug.slice(0, 4)
  const label = docKindLabels[entry.kind]
  const badge = badgeOf(entry.attributes)

  return {
    ...entry,
    number,
    href: `/${entry.kind}/${entry.slug}`,
    heading: `${label} ${number} ${entry.title}`,
    badge,
    details: entry.attributes.filter(
      (attribute) => attribute.value !== badge?.text,
    ),
    review: reviewOf(entry.attributes),
  }
}

const docs: Doc[] = docEntries
  .map(toDoc)
  .toSorted((left, right) =>
    left.kind === right.kind
      ? left.slug.localeCompare(right.slug)
      : docKinds.indexOf(left.kind) - docKinds.indexOf(right.kind),
  )

const hrefByReference = new Map(
  docs.map((doc) => [`${docKindLabels[doc.kind]} ${doc.number}`, doc.href]),
)

export const docRefHref = (kind: string, number: string): string | undefined =>
  hrefByReference.get(`${kind} ${number}`)

export const listDocs = (kind: DocKind): Doc[] =>
  docs.filter((doc) => doc.kind === kind)

export const listAllDocs = (): Doc[] => docs

export const listDocsByReview = (): ReviewDoc[] =>
  docs
    .filter((doc): doc is ReviewDoc => doc.review !== null)
    .toSorted((left, right) =>
      left.review.dueAt.localeCompare(right.review.dueAt),
    )

export const findDoc = (kind: string, slug: string): Doc | null => {
  if (!isDocKind(kind)) {
    return null
  }

  return docs.find((doc) => doc.kind === kind && doc.slug === slug) ?? null
}

export const findSiblings = (
  doc: Doc,
): { previous: Doc | null; next: Doc | null } => {
  const siblings = listDocs(doc.kind)
  const position = siblings.findIndex((sibling) => sibling.slug === doc.slug)

  return {
    previous: position > 0 ? siblings[position - 1] : null,
    next: position < siblings.length - 1 ? siblings[position + 1] : null,
  }
}
