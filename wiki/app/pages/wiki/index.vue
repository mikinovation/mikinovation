<script setup lang="ts">
const { data: pages } = await useAsyncData('pages', () =>
  queryCollection('wiki')
    .all()
)

useSeoMeta({
  title: 'Wiki - mikinovation',
  description: 'ナレッジベース。技術的なドキュメントやメモを整理しています。',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Wiki</h1>
      <p class="text-gray-600">ナレッジベース</p>
    </div>

    <WikiPageList v-if="pages" :pages="pages" />
    <div v-else class="text-center text-gray-500">
      ページがありません
    </div>
  </div>
</template>
