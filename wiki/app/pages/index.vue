<script setup lang="ts">
const config = useRuntimeConfig()

// production環境では /mikinovation/wiki にリダイレクト
// development環境では /wiki にリダイレクト
if (import.meta.client) {
  const targetPath = config.app.baseURL === '/mikinovation/'
    ? '/mikinovation/wiki'
    : '/wiki'
  await navigateTo(targetPath, { replace: true })
}

// サーバーサイドでもリダイレクト
if (import.meta.server) {
  const targetPath = config.app.baseURL === '/mikinovation/'
    ? '/mikinovation/wiki'
    : '/wiki'
  await navigateTo(targetPath, { replace: true })
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <p class="text-gray-600">リダイレクト中...</p>
    </div>
  </div>
</template>
