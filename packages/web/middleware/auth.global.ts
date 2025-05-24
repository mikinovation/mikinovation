export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check for login and callback pages
  const publicRoutes = ['/login', '/auth/callback']
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Check if user is authenticated
  const authToken = useCookie('auth_token')

  if (!authToken.value) {
    return navigateTo('/login')
  }
})
