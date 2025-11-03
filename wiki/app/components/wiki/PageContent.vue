<script setup lang="ts">
type Props = {
  page: {
    body: any
  }
}

defineProps<Props>()
</script>

<template>
  <div class="prose prose-lg max-w-none">
    <ContentRenderer :value="page" />
  </div>
</template>
