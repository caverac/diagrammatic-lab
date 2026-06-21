import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The app version tracks the root package.json (bumped by semantic-release).
const rootPkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf-8')
) as { version: string }

// Resolve the sibling workspace packages from source so the app needs no
// prior build of core/renderer (and HMR sees their edits immediately).
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(rootPkg.version)
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('../core/src', import.meta.url)),
      '@renderer': fileURLToPath(new URL('../renderer/src', import.meta.url)),
      '@diagrammatic-lab/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
      '@diagrammatic-lab/renderer': fileURLToPath(
        new URL('../renderer/src/index.ts', import.meta.url)
      )
    }
  }
})
