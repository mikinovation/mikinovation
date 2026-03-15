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
  <div v-if="props.articles.length > 0" class="mt-12 pt-8 border-t-2 border-[#888888]">
    <h2 class="text-2xl font-bold mb-6 text-[#e0e0e0]">関連記事</h2>
    <div class="grid gap-6 md:grid-cols-2">
      <NuxtLink
        v-for="article in props.articles"
        :key="article.slug"
        :to="article.path"
        class="block p-6 bg-[#222222] border-2 border-[#888888] hover:bg-[#111111] transition-colors"
      >
        <h3 class="text-lg font-semibold mb-2 text-[#e0e0e0]">
          {{ article.title }}
        </h3>
        <p class="text-sm text-[#e0e0e0]/70 mb-3 line-clamp-2">
          {{ article.description }}
        </p>
        <div class="flex items-center justify-between">
          <time class="text-xs text-[#e0e0e0]/50">
            {{ formatDate(article.date) }}
          </time>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="label in article.labels.slice(0, 2)"
              :key="label"
              class="px-2 py-1 text-xs font-medium bg-[#e0e0e0] text-[#111111]"
            >
              {{ label }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
