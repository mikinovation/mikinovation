<script setup lang="ts">
type Props = {
  page: {
    body: any
  }
}

defineProps<Props>()
</script>

<template>
  <div class="prose prose-lg md:prose-xl max-w-none dark:prose-invert prose-slate prose-headings:font-bold prose-a:text-primary">
    <ContentRenderer :value="page" />
  </div>
</template>
