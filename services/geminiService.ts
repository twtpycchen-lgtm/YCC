import { GoogleGenAI, Type } from "@google/genai";

const getSafeAI = () => {
  // 這裡的 process.env.API_KEY 會被 Vite 替換成 "AIza..."
  const apiKey = process.env.API_KEY;
  
  console.log(`[V6] 診斷 - Key類型: ${typeof apiKey}, 長度: ${apiKey?.length || 0}`);

  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey.length < 10) {
    console.error("[V6] 錯誤：API 金鑰未注入。");
    console.log("[V6] 可能原因：1. Vercel 變數名稱不是 API_KEY。 2. Redeploy 時沒關閉 Cache。 3. 專案根目錄缺少必要的編譯設定。");
    return null;
  }
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("[V6] AI 初始化失敗:", err);
    return null;
  }
};

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = getSafeAI();
  if (!ai) return "（系統訊息：AI 功能目前停用。請確保 Vercel 的 Environment Variables 中有一個名為 API_KEY 的變數。）";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請為名為「${albumTitle}」的音樂專輯提供一段簡短、富有哲學詩意且神秘的專輯介紹。
      專輯的主題背景為：「${description}」。
      要求：必須使用繁體中文，語氣高端藝術，字數約 120 字。`,
    });
    return response.text || "（無法生成內容）";
  } catch (error) {
    console.error("[V6] Gemini Error:", error);
    return "（AI 暫時無法回應，請檢查 API Key 權限。）";
  }
};

export const cleanTrackTitles = async (rawTitles: string[], albumTitle: string, albumDescription: string) => {
  const ai = getSafeAI();
  if (!ai) return rawTitles;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位享譽國際的音樂策展人。專輯標題：「${albumTitle}」。曲目：${JSON.stringify(rawTitles)}。
      請將曲名優化為具藝術感的中文正式曲名，僅回傳 JSON 陣列。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      }
    });
    return JSON.parse(response.text || "[]") || rawTitles;
  } catch (error) {
    return rawTitles;
  }
};