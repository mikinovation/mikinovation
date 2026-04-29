import type { RoamEdge, RoamGraph, RoamNode, RoamStatus } from '~~/app/types/graph'

const HEADING = /^(\*+)\s+(?:(TODO|NEXT|WAIT|HOLD|DONE|CANCELLED)\s+)?(.+?)(?:\s+(:[\w@:]+:))?\s*$/
const ID_PROP = /^\s*:ID:\s+([\w-]+)\s*$/i
const PROPS_BEGIN = /^\s*:PROPERTIES:\s*$/
const PROPS_END = /^\s*:END:\s*$/
const ID_LINK = /\[\[id:([\w-]+)\](?:\[[^\]]*\])?\]/g
const SRC_BEGIN = /^\s*#\+begin_src\b/i
const SRC_END = /^\s*#\+end_src\s*$/i

const closedStatuses = new Set(['DONE', 'CANCELLED'])

type Pending = {
  node: RoamNode
  bodyStart: number
}

export function parseOrgRoam(text: string): RoamGraph {
  const lines = text.split(/\r?\n/)
  const nodes: RoamNode[] = []
  const edges: RoamEdge[] = []
  const parents: { id: string, level: number }[] = []

  let pending: Pending | null = null
  let inProps = false
  let inSrc = false

  const flush = (endLine: number) => {
    if (!pending || !pending.node.id) {
      pending = null
      return
    }
    const body = lines.slice(pending.bodyStart, endLine).join('\n')
    const sanitized = body.replace(/#\+begin_src[\s\S]*?#\+end_src/gi, '')
    let m: RegExpExecArray | null
    ID_LINK.lastIndex = 0
    while ((m = ID_LINK.exec(sanitized))) {
      edges.push({ source: pending.node.id, target: m[1]!, kind: 'link' })
    }
    while (parents.length && parents[parents.length - 1]!.level >= pending.node.level) {
      parents.pop()
    }
    if (parents.length) {
      edges.push({ source: parents[parents.length - 1]!.id, target: pending.node.id, kind: 'parent' })
    }
    nodes.push(pending.node)
    parents.push({ id: pending.node.id, level: pending.node.level })
    pending = null
  }

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]!

    if (inSrc) {
      if (SRC_END.test(ln)) inSrc = false
      continue
    }
    if (SRC_BEGIN.test(ln)) {
      inSrc = true
      continue
    }

    const h = HEADING.exec(ln)
    if (h) {
      flush(i)
      const level = h[1]!.length
      const kw = h[2]
      const status: RoamStatus = kw && closedStatuses.has(kw) ? 'closed' : 'open'
      const title = h[3]!.trim()
      const tags = h[4] ? h[4].split(':').filter(Boolean) : []
      pending = {
        node: { id: '', title, status, tags, level },
        bodyStart: i + 1,
      }
      inProps = false
      continue
    }

    if (!pending) continue

    if (PROPS_BEGIN.test(ln)) {
      inProps = true
      continue
    }
    if (inProps) {
      if (PROPS_END.test(ln)) {
        inProps = false
        pending.bodyStart = i + 1
        continue
      }
      const idm = ID_PROP.exec(ln)
      if (idm) pending.node.id = idm[1]!
    }
  }
  flush(lines.length)

  const ids = new Set(nodes.map(n => n.id))
  return {
    nodes,
    edges: edges.filter(e => ids.has(e.source) && ids.has(e.target)),
  }
}
