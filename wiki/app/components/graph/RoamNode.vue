<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  data: {
    title: string
    tags: string[]
    status: 'open' | 'closed'
  }
}>()
</script>

<template>
  <div
    :class="[
      'rounded border-2 px-3 py-2 max-w-[220px] min-w-[140px]',
      data.status === 'closed'
        ? 'border-[#555] bg-[#1a1a1a] text-[#888] line-through'
        : 'border-[#888] bg-[#222222] text-[#e0e0e0]',
    ]"
  >
    <div class="text-sm break-words">
      {{ data.title }}
    </div>
    <div v-if="data.tags.length" class="mt-1 flex flex-wrap gap-1">
      <span
        v-for="t in data.tags"
        :key="t"
        class="text-[10px] px-1 border border-[#555] text-[#aaa]"
      >
        #{{ t }}
      </span>
    </div>
    <Handle type="target" :position="Position.Left" class="!opacity-0" />
    <Handle type="source" :position="Position.Right" class="!opacity-0" />
  </div>
</template>
