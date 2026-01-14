import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // 載入所有環境變數 (包括不帶 VITE_ 前綴的)
  const env = loadEnv(mode, process.cwd(), '');
  
  // 按照優先權抓取金鑰
  const apiKey = env.API_KEY || process.env.API_KEY || env.VITE_API_KEY || "";

  // === 關鍵診斷：這段日誌會出現在 Vercel 的 Building 階段日誌中 ===
  console.log(`[Vite Build] 當前模式: ${mode}`);
  if (apiKey) {
    console.log(`[Vite Build] 成功抓取到 API_KEY (長度: ${apiKey.length}, 前四碼: ${apiKey.substring(0, 4)})`);
  } else {
    console.error(`[Vite Build] 錯誤：抓不到 API_KEY！請檢查 Vercel 的 Environment Variables 是否設定了名稱為 API_KEY 的變數。`);
  }

  return {
    plugins: [react()],
    define: {
      // 這會在打包時，把程式碼中所有的 process.env.API_KEY 替換為實際的字串
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