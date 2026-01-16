
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // 讀取環境變數，包含系統環境變數（Cloudflare 注入的）與 .env 檔案
  const env = loadEnv(mode, process.cwd(), '');
  
  // 優先順序：Cloudflare/System Env > VITE_ 前綴 > .env
  const apiKey = process.env.API_KEY || env.API_KEY || env.VITE_API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // 確保在前端可以使用 process.env.API_KEY 訪問
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      outDir: 'dist',
      minify: 'esbuild',
      sourcemap: false
    }
  };
});
