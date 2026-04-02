import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, '../_components'),
      '@front-brain-example': path.resolve(__dirname, '../.claude/front-brain/examples/demo-run'),
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
