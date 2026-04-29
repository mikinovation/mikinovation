export type RoamStatus = 'open' | 'closed'

export type RoamNode = {
  id: string
  title: string
  status: RoamStatus
  tags: string[]
  level: number
}

export type RoamEdgeKind = 'link' | 'parent'

export type RoamEdge = {
  source: string
  target: string
  kind: RoamEdgeKind
}

export type RoamGraph = {
  nodes: RoamNode[]
  edges: RoamEdge[]
}
