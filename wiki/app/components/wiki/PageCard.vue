<script setup lang="ts">
type Props = {
  page: {
    path: string
    title: string
    description: string
    date: string | Date
    labels: string[]
  }
}

defineProps<Props>()

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateISO = (date: string | Date) => {
  return new Date(date).toISOString().split('T')[0]
}
</script>

<template>
  <NuxtLink
    :to="page.path"
    class="block bg-[#222222] border-2 border-[#888888] p-6 hover:bg-[#111111] transition-colors"
  >

    <h2 class="text-xl font-bold mb-2 text-[#e0e0e0]">{{ page.title }}</h2>
    <p class="text-[#e0e0e0]/70 mb-4 line-clamp-2">{{ page.description }}</p>

    <div class="flex flex-wrap gap-2 mb-4">
      <span
        v-for="label in page.labels"
        :key="label"
        class="px-2 py-1 text-xs font-medium bg-[#e0e0e0] text-[#111111]"
      >
        {{ label }}
      </span>
    </div>

    <div class="text-sm text-[#e0e0e0]/50">
      <time :datetime="formatDateISO(page.date)">{{ formatDate(page.date) }}</time>
    </div>
  </NuxtLink>
</template>
