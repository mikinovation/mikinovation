export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  // TODO: I want to enable ssr even if it's mocked.
  ssr: !process.env.NUXT_PUBLIC_API_MOCK,
  devtools: { enabled: true },
  modules: [
    '@nuxt/test-utils/module',
    '@nuxt/eslint',
  ],
  runtimeConfig: {
    githubApiToken: process.env.GITHUB_API_TOKEN,
    public: {
      apiMock: process.env.NUXT_PUBLIC_API_MOCK,
    }
  },
})
