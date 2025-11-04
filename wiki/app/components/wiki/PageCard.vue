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
    class="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
  >

    <h2 class="text-xl font-bold mb-2 text-gray-900">{{ page.title }}</h2>
    <p class="text-gray-600 mb-4 line-clamp-2">{{ page.description }}</p>

    <div class="flex flex-wrap gap-2 mb-4">
      <span
        v-for="label in page.labels"
        :key="label"
        class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
      >
        {{ label }}
      </span>
    </div>

    <div class="text-sm text-gray-500">
      <time :datetime="formatDateISO(page.date)">{{ formatDate(page.date) }}</time>
    </div>
  </NuxtLink>
</template>
