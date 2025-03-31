export default defineNuxtConfig({
  modules: [
    '@nuxt/test-utils/module',
    '@nuxt/eslint',
  ],
  // TODO: I want to enable ssr even if it's mocked.
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
