import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // loadEnv 會讀取 .env 或 Vercel 注入的環境變數
  const env = loadEnv(mode, process.cwd(), '');
  
  // 優先從 env 讀取，其次從 process.env
  const apiKey = env.API_KEY || process.env.API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // 這會在編譯時，將所有程式碼中的 process.env.API_KEY 替換成實際的金鑰
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    server: {
      port: 3000
    },
    build: {
      outDir: 'dist',
      minify: 'esbuild',
      sourcemap: false
    }
  };
});