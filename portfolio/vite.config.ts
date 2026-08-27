import { cpSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function copyRuntimeAssets() {
  return {
    name: 'copy-runtime-assets',
    apply: 'build' as const,
    closeBundle() {
      cpSync(resolve('src/assets'), resolve('dist/src/assets'), {
        recursive: true,
        filter: (source) => basename(source) !== '.DS_Store',
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyRuntimeAssets()],
})
