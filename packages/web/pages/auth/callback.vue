<template>
  <div class="callback-container">
    <p>Authenticating...</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Get token from query parameter
const token = route.query.token as string

if (token) {
  // Store token in cookie
  const authToken = useCookie('auth_token', {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  authToken.value = token

  // Redirect to home page or dashboard
  router.push('/')
}
else {
  // No token, redirect to login
  router.push('/login')
}
</script>

<style scoped>
.callback-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
