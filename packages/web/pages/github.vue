<script setup lang="ts">
import { ref } from 'vue';
import GitHubRepositoryTable from '@/components/github/GithubRepositoryTable.vue';

const username = ref('mikinovation');
const currentUsername = ref('mikinovation');

const handleSearch = () => {
  if (username.value.trim()) {
    currentUsername.value = username.value.trim();
  }
};
</script>

<template>
  <div class="github-page">
    <h1>GitHub Repositories</h1>
    
    <div class="username-search">
      <label for="username-input">GitHub Username:</label>
      <div class="search-input-group">
        <input 
          id="username-input" 
          v-model="username" 
          type="text" 
          placeholder="Enter GitHub username" 
        >
        <button @click="handleSearch">Search</button>
      </div>
    </div>
    
    <GitHubRepositoryTable 
      :key="currentUsername" 
      :username="currentUsername"
    />
  </div>
</template>

<style scoped>
.github-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
}

.username-search {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

.username-search label {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.search-input-group {
  display: flex;
}

input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: #2ea44f;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background-color: #2c974b;
}
</style>
