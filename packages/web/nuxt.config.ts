import { ViteMcp } from 'vite-plugin-mcp'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    'nuxt-mcp',
    '@sentry/nuxt/module',
  ],
  ssr: !process.env.NUXT_PUBLIC_API_MOCK,
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
      // TODO: Enable this plugin when MCP is ready for Nuxt 3
      // ViteMcp(),
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
