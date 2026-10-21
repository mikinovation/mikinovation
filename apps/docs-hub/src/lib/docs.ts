import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export const docKinds = ['prd', 'adr', 'design'] as const

export type DocKind = (typeof docKinds)[number]

export const docKindLabels: Record<DocKind, string> = {
  prd: 'PRD',
  adr: 'ADR',
  design: '設計書',
}

export type DocAttribute = {
  label: string
  value: string
}

export type DocBadge = {
  text: string
  className: string
}

export type Doc = {
  kind: DocKind
  slug: string
  number: string
  title: string
  lead: string
  attributes: DocAttribute[]
  badge: DocBadge | null
}

const contentRoot = join(process.cwd(), 'src', 'content')

const titlePrefixPattern = /^(?:ADR|PRD|設計書|テストケース|計画)\s*[:：]\s*/
const attributePattern = /^-\s+(.+?)\s*[:：]\s*(.+?)\s*$/

const isDocKind = (value: string): value is DocKind =>
  (docKinds as readonly string[]).includes(value)

const badgeOf = (attributes: DocAttribute[]): DocBadge | null => {
  const state = attributes.find((attribute) => attribute.label === '状態')
  if (state !== undefined) {
    if (state.value.startsWith('採用')) {
      return { text: state.value, className: 'badge badge-accepted' }
    }
    if (state.value.startsWith('却下')) {
      return { text: state.value, className: 'badge badge-rejected' }
    }
    if (
      state.value.startsWith('置き換え') ||
      state.value.startsWith('廃止')
    ) {
      return { text: state.value, className: 'badge badge-superseded' }
    }
    return { text: state.value, className: 'badge' }
  }

  const stage = attributes.find((attribute) => attribute.label === '段階')
  if (stage !== undefined) {
    const number = /^\d+/.exec(stage.value)
    return {
      text: `段階 ${number === null ? stage.value : number[0]}`,
      className: 'badge badge-stage',
    }
  }

  const layer = attributes.find(
    (attribute) => attribute.label === '到達している層',
  )
  if (layer !== undefined) {
    return { text: layer.value, className: 'badge badge-stage' }
  }

  return null
}

const parse = (kind: DocKind, slug: string, source: string): Doc => {
  const lines = source.split('\n')
  const headingIndex = lines.findIndex((line) => line.startsWith('# '))
  const heading = headingIndex < 0 ? slug : lines[headingIndex].slice(2).trim()
  const body = lines.slice(headingIndex + 1)

  let cursor = 0
  while (cursor < body.length && body[cursor].trim() === '') {
    cursor += 1
  }

  const lead: string[] = []
  while (cursor < body.length && body[cursor].trim() !== '') {
    lead.push(body[cursor].trim())
    cursor += 1
  }

  while (
    cursor < body.length &&
    !body[cursor].startsWith('- ') &&
    !body[cursor].startsWith('#')
  ) {
    cursor += 1
  }

  const attributes: DocAttribute[] = []
  while (cursor < body.length && body[cursor].startsWith('- ')) {
    const matched = attributePattern.exec(body[cursor])
    if (matched !== null) {
      attributes.push({ label: matched[1], value: matched[2] })
    }
    cursor += 1
  }

  return {
    kind,
    slug,
    number: slug.slice(0, 4),
    title: heading.replace(titlePrefixPattern, ''),
    lead: lead.join(''),
    attributes,
    badge: badgeOf(attributes),
  }
}

export const listDocs = (kind: DocKind): Doc[] => {
  const directory = join(contentRoot, kind)
  if (!existsSync(directory)) {
    return []
  }

  return readdirSync(directory)
    .filter((name) => name.endsWith('.mdx'))
    .sort()
    .map((name) =>
      parse(
        kind,
        name.slice(0, -'.mdx'.length),
        readFileSync(join(directory, name), 'utf8'),
      ),
    )
}

export const listAllDocs = (): Doc[] => docKinds.flatMap(listDocs)

export const findDoc = (kind: string, slug: string): Doc | null => {
  if (!isDocKind(kind)) {
    return null
  }

  return listDocs(kind).find((doc) => doc.slug === slug) ?? null
}
