import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/vite-vue-bpmn-process/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      types: path.resolve(__dirname, 'types/')
    }
  },
  server: {
    port: 80
  },
  plugins: [vue(), vueJsx({})]
})
