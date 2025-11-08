<script setup lang="ts">
import type { RelatedArticle } from '@/composables/useRelatedArticles'

type Props = {
  articles: RelatedArticle[]
}

const props = defineProps<Props>()

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div v-if="props.articles.length > 0" class="mt-12 pt-8 border-t border-gray-200">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">関連記事</h2>
    <div class="grid gap-6 md:grid-cols-2">
      <NuxtLink
        v-for="article in props.articles"
        :key="article.slug"
        :to="article.path"
        class="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
      >
        <h3 class="text-lg font-semibold mb-2 text-gray-900 hover:text-blue-600">
          {{ article.title }}
        </h3>
        <p class="text-sm text-gray-600 mb-3 line-clamp-2">
          {{ article.description }}
        </p>
        <div class="flex items-center justify-between">
          <time class="text-xs text-gray-500">
            {{ formatDate(article.date) }}
          </time>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="label in article.labels.slice(0, 2)"
              :key="label"
              class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
            >
              {{ label }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
