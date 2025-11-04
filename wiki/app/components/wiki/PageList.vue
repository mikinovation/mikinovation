<script setup lang="ts">
type Props = {
  pages: Array<{
    _path: string
    title: string
    description: string
    date: string | Date
    labels: string[]
  }>
}

defineProps<Props>()
</script>

<template>
  <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    <WikiPageCard
      v-for="page in pages"
      :key="page._path"
      :page="page"
    />
  </div>
</template>
