<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-[#111111] border-t-2 border-[#888888] mt-12">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center text-[#e0e0e0]/60">
        <p>&copy; {{ currentYear }} mikinovation. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
