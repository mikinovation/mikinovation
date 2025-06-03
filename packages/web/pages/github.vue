<script setup lang="ts">
import GitHubRepositoryTable from '@/components/github/GithubRepositoryTable/index.vue'

type User = {
  id: string
  github_id: number
  username: string
  name?: string
  email?: string
  avatar_url?: string
}

const config = useRuntimeConfig()
const authToken = useCookie('auth_token')

// Check authentication on setup
const { data: user, error } = await useFetch<User>('/api/user', {
  baseURL: config.public.apiUrl,
  headers: authToken.value
    ? {
        Authorization: `Bearer ${authToken.value}`,
      }
    : {},
})

// Redirect to login if not authenticated
if (!authToken.value || error.value) {
  await navigateTo('/login')
}

const handleLogout = () => {
  authToken.value = null
  navigateTo('/login')
}
</script>

<template>
  <div class="github-page">
    <nav class="navbar">
      <div class="nav-content">
        <h1>GitHub Repositories</h1>
        <div
          v-if="user"
          class="user-info"
        >
          <img
            v-if="user.avatar_url"
            :src="user.avatar_url"
            :alt="user.username"
            class="avatar"
          >
          <span>{{ user.name || user.username }}</span>
          <button
            class="logout-button"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <div class="page-content">
      <GitHubRepositoryTable />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  background-color: #24292e;
  color: white;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.logout-button {
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
