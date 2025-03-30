import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async () => {
  const enableMock = process.env.NODE_ENV === 'development' || process.env.NUXT_PUBLIC_API_MOCK === 'true'
  
  if (enableMock) {
    try {
      const { worker } = await import('@/mocks/browser')
      await worker.start({
        onUnhandledRequest: 'bypass',
      })
      
      console.log('[MSW] Mock Service Worker started')
    } catch (error) {
      console.error('[MSW] Failed to initialize:', error)
    }
  }
})
