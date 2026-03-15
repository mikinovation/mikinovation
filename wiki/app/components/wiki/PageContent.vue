<script setup lang="ts">
type Props = {
  page: {
    body: any
  }
}

defineProps<Props>()
</script>

<template>
  <div class="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-a:text-[#cccccc] prose-a:underline prose-a:decoration-dotted prose-pre:bg-[#222222] prose-pre:border-2 prose-pre:border-[#888888] prose-pre:rounded-none">
    <ContentRenderer :value="page" />
  </div>
</template>
