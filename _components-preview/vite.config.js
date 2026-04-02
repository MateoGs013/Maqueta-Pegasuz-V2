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
      '@components': path.resolve(__dirname, '../_components'),
    },
    dedupe: ['vue', 'gsap'],
  },
  optimizeDeps: {
    include: ['gsap', 'gsap/ScrollTrigger'],
  },
  publicDir: path.resolve(__dirname, 'public'),
})
