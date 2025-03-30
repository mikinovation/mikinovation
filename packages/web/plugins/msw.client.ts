import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const enableMock = !!config.public.apiMock
  
  if (enableMock) {
    try {
      const { worker } = await import('@/mocks/browser')
      await worker.start({
        onUnhandledRequest: 'bypass',
      })

      console.log('[MSW] Client-side mocking enabled')
    } catch (error) {
      console.error('[MSW] Failed to initialize client-side mocking:', error)
    }
  }
})
