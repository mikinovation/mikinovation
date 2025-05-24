import { ViteMcp } from 'vite-plugin-mcp'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/test-utils', 'nuxt-mcp'],
  // TODO: SSR is disabled because of the API mocking
  ssr: !process.env.NUXT_PUBLIC_API_MOCK,
  devtools: { enabled: true },
  runtimeConfig: {
    githubApiToken: process.env.GITHUB_API_TOKEN,
    public: {
      apiMock: process.env.NUXT_PUBLIC_API_MOCK,
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3333',
    },
  },
  compatibilityDate: '2024-11-01',
  vite: {
    plugins: [
      ViteMcp(),
    ],
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
