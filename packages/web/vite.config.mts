import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Resolve the sibling workspace packages from source so the app needs no
// prior build of core/renderer (and HMR sees their edits immediately).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@diagrammatic-lab/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
      '@diagrammatic-lab/renderer': fileURLToPath(
        new URL('../renderer/src/index.ts', import.meta.url)
      )
    }
  }
})
