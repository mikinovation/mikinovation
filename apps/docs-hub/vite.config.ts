import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { issuesYaml } from './scripts/issues-plugin'

export default defineConfig({
  base: '/mikinovation/',
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    issuesYaml(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
      },
      pages: [
        {
          path: '/404',
          prerender: { enabled: true, outputPath: '/404.html' },
        },
      ],
    }),
    viteReact(),
  ],
})
