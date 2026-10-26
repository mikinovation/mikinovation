import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const contentDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'content',
)

const kinds = { PRD: 'prd', ADR: 'adr', 設計書: 'design' }

const slugs = new Map()
for (const [label, kind] of Object.entries(kinds)) {
  for (const file of readdirSync(join(contentDir, kind))) {
    if (file.endsWith('.mdx')) {
      slugs.set(
        `${label} ${file.slice(0, 4)}`,
        `/${kind}/${file.replace(/\.mdx$/, '')}`,
      )
    }
  }
}

const reference =
  /(PRD|ADR|設計書)\s?(\d{4})(?:\s*から\s*(?:(PRD|ADR|設計書)\s?)?(\d{4}))?/g

const skipped = new Set([
  'link',
  'linkReference',
  'heading',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
])

const linkNode = (href, text) => ({
  type: 'link',
  url: href,
  children: [{ type: 'text', value: text }],
})

const rangeLinks = (kind, from, to) => {
  const links = []
  for (let number = Number(from); number <= Number(to); number += 1) {
    const padded = String(number).padStart(4, '0')
    const href = slugs.get(`${kind} ${padded}`)
    if (href === undefined) {
      continue
    }
    if (links.length > 0) {
      links.push({ type: 'text', value: '、' })
    }
    links.push(
      linkNode(href, links.length === 0 ? `${kind} ${padded}` : padded),
    )
  }
  return links
}

const splitText = (node) => {
  const parts = []
  let last = 0

  reference.lastIndex = 0
  let match = reference.exec(node.value)
  while (match !== null) {
    const [whole, kind, from, rangeKind, to] = match
    const href = slugs.get(`${kind} ${from}`)
    const isRange =
      to !== undefined &&
      (rangeKind === undefined || rangeKind === kind) &&
      Number(to) > Number(from)
    const replacement = isRange
      ? rangeLinks(kind, from, to)
      : href === undefined
        ? []
        : [linkNode(href, `${kind} ${from}`)]
    const consumed = isRange
      ? whole.length
      : `${kind}`.length + whole.slice(kind.length).search(/\d{4}/) + 4

    if (replacement.length > 0) {
      if (match.index > last) {
        parts.push({ type: 'text', value: node.value.slice(last, match.index) })
      }
      parts.push(...replacement)
      last = match.index + consumed
    }

    reference.lastIndex = match.index + consumed
    match = reference.exec(node.value)
  }

  if (parts.length === 0) {
    return null
  }
  if (last < node.value.length) {
    parts.push({ type: 'text', value: node.value.slice(last) })
  }

  return parts
}

const walk = (node) => {
  if (!Array.isArray(node.children)) {
    return
  }

  const children = []
  for (const child of node.children) {
    if (child.type === 'text') {
      const parts = splitText(child)
      children.push(...(parts ?? [child]))
      continue
    }

    if (!skipped.has(child.type)) {
      walk(child)
    }
    children.push(child)
  }
  node.children = children
}

export default function remarkDocLinks() {
  return (tree) => {
    walk(tree)
  }
}
