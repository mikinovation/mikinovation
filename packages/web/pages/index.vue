<template>
  <div>
    <nav class="navbar">
      <div class="nav-content">
        <h1>Mikinovation</h1>
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

    <main class="main-content">
      <div v-if="pending">
        Loading...
      </div>
      <div v-else-if="error">
        <p>Not authenticated. Please <NuxtLink to="/login">login</NuxtLink>.</p>
      </div>
      <div v-else-if="user">
        <h2>Welcome, {{ user.name || user.username }}!</h2>
        <p>Your GitHub ID: {{ user.github_id }}</p>
        <NuxtLink
          to="/github"
          class="link"
        >View GitHub Repositories</NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
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

// Fetch user data on setup
const { data: user, pending, error } = await useFetch<User>('/api/user', {
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

<style scoped>
.navbar {
  background-color: #24292e;
  color: white;
  padding: 1rem 0;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.link {
  color: #0366d6;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>
