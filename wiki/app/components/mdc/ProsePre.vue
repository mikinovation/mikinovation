<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

type Props = {
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: number[]
  meta?: string | null
  class?: string
  style?: any
}

const props = withDefaults(defineProps<Props>(), {
  code: '',
  language: null,
  filename: null,
  highlights: () => [],
  meta: null,
})

const {
  code = '',
  language = null,
  filename = null,
  highlights = [],
  meta = null,
  class = null,
  style = null 
} = defineProps<Props>()

const mermaidContainer = ref<HTMLElement | null>(null)
const isMermaid = computed(() => language.value === 'mermaid')
const rendered = ref(false)

async function renderMermaid() {
  if (!mermaidContainer.value || !isMermaid.value) {
    return
  }

  // Check if already rendered
  if (mermaidContainer.value.querySelector('svg')) {
    return
  }

  try {
    // Dynamic import to avoid SSR issues
    const { default: mermaid } = await import('mermaid')

    // Initialize mermaid with configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    })

    // Set the mermaid code as text content
    mermaidContainer.value.textContent = code.value
    mermaidContainer.value.classList.add('mermaid')

    // Render the diagram
    await mermaid.run({
      nodes: [mermaidContainer.value],
    })

    rendered.value = true
  } catch (error) {
    console.error('Failed to render Mermaid diagram:', error)
    // Fallback: show code if rendering fails
    if (mermaidContainer.value) {
      mermaidContainer.value.innerHTML = `<pre><code>${code.value}</code></pre>`
    }
  }
}

onMounted(() => {
  if (isMermaid.value) {
    renderMermaid()
  }
})
</script>

<template>
  <div v-if="isMermaid" class="overflow-x-auto p-4 bg-transparent my-6">
    <div ref="mermaidContainer" class="flex justify-center items-center min-h-[100px] [&_svg]:max-w-full [&_svg]:h-auto"></div>
  </div>
  <pre v-else :class="class" :style="style">
    <slot />
  </pre>
</template>
