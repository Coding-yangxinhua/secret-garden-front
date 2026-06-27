import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 生产环境去掉 vueDevTools
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 生产环境去掉 vueDevTools，减少构建体积
    // 生产环境启用 gzip 预压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 大于 10KB 才压缩
      deleteOriginFile: false, // 保留原文件，让 Nginx 可以 fallback
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // 关闭超过大小的告警阈值
    chunkSizeWarningLimit: 2000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // 手动分块，减小首屏 JS 体积
        manualChunks(id) {
          // Vant 单独打包（体积最大）
          if (id.includes('node_modules/vant')) {
            return 'vant'
          }
          // Vue 全家桶单独打包
          if (
            id.includes('node_modules/vue') ||
            id.includes('node_modules/pinia') ||
            id.includes('node_modules/vue-router')
          ) {
            return 'vue-core'
          }
          // lodash 单独打包
          if (id.includes('node_modules/lodash-es')) {
            return 'lodash'
          }
          // 其他 node_modules 依赖
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    // 配置代理
    proxy: {
      '/sg': {
        target: 'http://localhost:4871', // 后端接口的实际域名
        changeOrigin: true, // 允许跨域（虚拟主机站点需要）
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉请求路径中的 '/api' 前缀
      },
    },
  },
})
