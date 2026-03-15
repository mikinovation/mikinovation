<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#111111] text-[#e0e0e0]">
    <LayoutHeader />
    <main class="flex-grow">
      <slot />
    </main>
    <LayoutFooter />
  </div>
</template>
