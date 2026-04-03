import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import erosPlugin from './vite-plugin-eros.js'
import workshopPlugin from './vite-plugin-workshop.js'

export default defineConfig({
  plugins: [vue(), erosPlugin(), workshopPlugin()],
  build: {
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, '../_components'),
      '@front-brain-runtime': path.resolve(__dirname, '../.claude/front-brain/runtime'),
    },
    dedupe: ['vue', 'vue-router', 'gsap'],
  },
  optimizeDeps: {
    include: ['gsap', 'gsap/ScrollTrigger'],
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  publicDir: path.resolve(__dirname, '../_components-preview/public'),
})
