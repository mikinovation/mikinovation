export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/test-utils'],
  runtimeConfig: {
    githubApiToken: process.env.GITHUB_API_TOKEN,
    public: {
      apiMock: process.env.NUXT_PUBLIC_API_MOCK,
    }
  },
})
