import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  /*
  server: {
    proxy: {
      '/api': {
        target: 'https://m1.apifoxmock.com/m1/6123057-5814703-default',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  */
  server: {
    https: false, // 如果你的开发环境需要https，改为true
    host: '0.0.0.0',
    headers: {
      // 添加正确的 MIME 类型
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    },
    '/media': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    }
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web']
  },
  build: {
    commonjsOptions: {
      include: [/onnxruntime-web/, /node_modules/]
    }
  }

})