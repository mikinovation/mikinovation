export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/test-utils'],
  // TODO: SSR is disabled because of the API mocking
  ssr: !process.env.NUXT_PUBLIC_API_MOCK,
  devtools: { enabled: true },
  runtimeConfig: {
    githubApiToken: process.env.GITHUB_API_TOKEN,
    public: {
      apiMock: process.env.NUXT_PUBLIC_API_MOCK,
    },
  },
  compatibilityDate: '2024-11-01',
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
