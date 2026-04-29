import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force'
import type { RoamGraph, RoamNode } from '~/types/graph'

export type PositionedNode = RoamNode & { x: number, y: number }

export function computeForceLayout(graph: RoamGraph, ticks = 300): PositionedNode[] {
  const sNodes: PositionedNode[] = graph.nodes.map(n => ({ ...n, x: 0, y: 0 }))
  const sEdges = graph.edges.map(e => ({ source: e.source, target: e.target }))

  const sim = forceSimulation(sNodes as unknown as { x: number, y: number }[])
    .force('charge', forceManyBody().strength(-220))
    .force('center', forceCenter(0, 0))
    .force('link', forceLink(sEdges).id((d: unknown) => (d as { id: string }).id).distance(110))
    .force('collide', forceCollide(50))
    .stop()

  for (let i = 0; i < ticks; i++) sim.tick()

  return sNodes
}
