<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-50 border-t border-gray-200 mt-12">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center text-gray-600">
        <p>&copy; {{ currentYear }} mikinovation. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
