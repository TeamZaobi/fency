import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // 设置项目根目录为当前目录
  build: {
    outDir: 'dist', // 输出目录
    emptyOutDir: true, // 清空输出目录
    rollupOptions: {
        input: {
             main: 'index.html' // 入口HTML文件
        }
    }
  },
  server: {
    open: '/index.html' // 自动打开index.html
  }
}); 