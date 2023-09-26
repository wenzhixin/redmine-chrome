import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./node_modules', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js'
    },
    extensions: ['.js', '.vue']
  },
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    https: false,
    hotOnly: false,
    proxy: {
      '/redmine': {
        changeOrigin: true,
        target: 'https://redmine.scutech.com'
      }
    }
  }
})
