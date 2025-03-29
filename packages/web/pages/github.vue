<script setup lang="ts">
import GitHubRepositoryTable from '@/components/github/GithubRepositoryTable.vue';
</script>

<template>
  <div class="github-page">
    <h1>GitHub Repositories</h1>
    
    <GitHubRepositoryTable />
  </div>
</template>

<style lang="scss" scoped>
.github-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;

  > h1 {
    margin-bottom: 2rem;
    font-size: 2rem;
    font-weight: 700;
   }
}
</style>
