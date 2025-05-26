import * as Sentry from '@sentry/nuxt'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  if (config.public.sentry.dsn) {
    Sentry.init({
      dsn: config.public.sentry.dsn,
      environment: config.public.sentry.environment,
      integrations: [
        Sentry.nodeProfilingIntegration(),
      ],
      tracesSampleRate: config.public.sentry.environment === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,
    })
  }
})