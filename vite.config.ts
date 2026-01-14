import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // loadEnv 會讀取 .env 檔案
  const env = loadEnv(mode, process.cwd(), '');
  
  // 優先級：.env 檔案裡的值 > 系統環境變數裡的值
  const finalApiKey = env.API_KEY || process.env.API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // 這行會將代碼中所有的 process.env.API_KEY 替換成真實的 Key 字串
      'process.env.API_KEY': JSON.stringify(finalApiKey)
    },
    server: {
      port: 3000
    },
    build: {
      // 確保不會因為警告而停止編譯
      chunkSizeWarningLimit: 1000
    }
  };
});