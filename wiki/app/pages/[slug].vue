<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(`page-${route.params.slug}`, () =>
  queryCollection('wiki')
    .path(`/wiki/${route.params.slug}`)
    .first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

// SEO メタタグ設定
useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
})

// 日付フォーマット関数
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateISO = (date: string | Date) => {
  return new Date(date).toISOString().split('T')[0]
}
</script>

<template>
  <NuxtLayout>
    <div class="container mx-auto px-4 py-8">
      <article v-if="page">
        <!-- メタデータ -->
        <header class="mb-8">
          <h1 class="text-4xl font-bold mb-4">{{ page.title }}</h1>
          <div class="text-gray-600">
            <time :datetime="formatDateISO(page.date)">{{ formatDate(page.date) }}</time>
          </div>
        </header>

        <!-- ページ本文 -->
        <WikiPageContent :page="page" />
      </article>
    </div>
  </NuxtLayout>
</template>
