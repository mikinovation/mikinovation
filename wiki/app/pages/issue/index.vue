<script setup lang="ts">
import type { RoamGraph } from '~/types/graph'

const { data: graph } = await useFetch<RoamGraph>('/api/graph')

useSeoMeta({ title: 'Issue Graph - mikinovation' })
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-[#e0e0e0] mb-2 tracking-wider">
      &gt; Issue_Graph_
    </h1>
    <p class="text-sm text-[#888] mb-4">
      編集は <code class="text-[#aaa]">wiki/data/issue.org</code> を直接編集してください。
    </p>
    <ClientOnly>
      <GraphRoamGraph v-if="graph" :graph="graph" />
      <template #fallback>
        <div class="h-[80vh] border-2 border-[#888888] bg-[#0a0a0a] flex items-center justify-center text-[#666]">
          loading...
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
