import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // 載入所有變數，包括沒帶 VITE_ 前綴的
  const env = loadEnv(mode, process.cwd(), '');
  
  // 優先權：1. Vercel 注入的 API_KEY, 2. .env 裡的 API_KEY, 3. 備用的 VITE_API_KEY
  const apiKey = env.API_KEY || process.env.API_KEY || env.VITE_API_KEY || "";

  console.log(`--- [Vite Build Diagnostic] ---`);
  console.log(`Mode: ${mode}`);
  if (apiKey) {
    console.log(`API_KEY found! Length: ${apiKey.length}. Starts with: ${apiKey.substring(0, 4)}`);
  } else {
    console.error(`CRITICAL: API_KEY IS EMPTY! Please go to Vercel -> Settings -> Environment Variables and add 'API_KEY'.`);
  }
  console.log(`-------------------------------`);

  return {
    plugins: [react()],
    define: {
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