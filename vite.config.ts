import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // loadEnv(mode, path, prefixes) - 第三個參數設為 '' 才能讀取非 VITE_ 開頭的變數
  const env = loadEnv(mode, process.cwd(), '');
  
  // 按照優先權讀取：.env 檔案 > 系統環境變數 > VITE_ 前綴備案
  const apiKey = env.API_KEY || process.env.API_KEY || env.VITE_API_KEY || "";

  // 如果在 Build 期間沒抓到 Key，在 Vercel Build Logs 中會看到這個警告
  if (!apiKey && mode === 'production') {
    console.warn('WARNING: API_KEY is empty during build! Check Vercel Environment Variables.');
  }

  return {
    plugins: [react()],
    define: {
      // 強制將代碼中的字串替換為實際金鑰
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    server: {
      port: 3000
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});