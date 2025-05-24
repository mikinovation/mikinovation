<template>
  <div class="login-container">
    <h1>Login</h1>
    <button
      class="github-login-button"
      @click="handleLogin"
    >
      Login with GitHub
    </button>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const handleLogin = () => {
  // Redirect to API GitHub OAuth endpoint
  const loginUrl = `${config.public.apiUrl}/api/auth/github`
  window.location.href = loginUrl
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.github-login-button {
  background-color: #24292e;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.github-login-button:hover {
  background-color: #2f363d;
}
</style>
