<script setup lang="ts">
import { computed } from 'vue'
import { VueFlow, type Edge, type Node } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import RoamNode from './RoamNode.vue'
import type { RoamGraph } from '~/types/graph'

const props = defineProps<{ graph: RoamGraph }>()

const positioned = computed(() => computeForceLayout(props.graph))

const nodes = computed<Node[]>(() =>
  positioned.value.map(n => ({
    id: n.id,
    type: 'roam',
    position: { x: n.x, y: n.y },
    data: { title: n.title, tags: n.tags, status: n.status },
  })),
)

const edges = computed<Edge[]>(() =>
  props.graph.edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    style: {
      stroke: e.kind === 'parent' ? '#6a8' : '#666',
      strokeWidth: 1,
      strokeDasharray: e.kind === 'parent' ? '4 2' : undefined,
    },
  })),
)

const nodeTypes = { roam: RoamNode }
</script>

<template>
  <div class="h-[80vh] border-2 border-[#888888] bg-[#0a0a0a]">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      :nodes-draggable="true"
      :nodes-connectable="false"
      :elements-selectable="true"
      fit-view-on-init
    >
      <Background pattern-color="#222" :gap="24" />
      <Controls />
    </VueFlow>
  </div>
</template>
