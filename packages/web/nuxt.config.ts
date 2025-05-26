import { ViteMcp } from 'vite-plugin-mcp'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/test-utils', 'nuxt-mcp', '@sentry/nuxt/module'],
  // TODO: SSR is disabled because of the API mocking
  ssr: false,
  devtools: { enabled: true },
  runtimeConfig: {
    githubApiToken: process.env.GITHUB_API_TOKEN,
    public: {
      apiMock: process.env.NUXT_PUBLIC_API_MOCK,
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3333',
      sentry: {
        dsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
        environment: process.env.NUXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
      },
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
  sentry: {
    sourceMapsUploadOptions: {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    },
  },
})
