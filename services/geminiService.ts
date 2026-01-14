import { GoogleGenAI, Type } from "@google/genai";

/**
 * 取得經過安全檢查的 AI 實例
 */
const getSafeAI = () => {
  // 這裡的 process.env.API_KEY 會在 Vite 打包時被替換為 "AIza..." 這樣的字串
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey.length < 10) {
    console.error("[V4] 關鍵錯誤：API 金鑰無效或未注入。請檢查 Vercel 變數名稱是否為 API_KEY。");
    return null;
  }
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("[V4] AI 初始化失敗:", err);
    return null;
  }
};

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = getSafeAI();
  if (!ai) return "（系統訊息：AI 功能目前停用。請確保金鑰已正確配置並重新部署。）";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請為名為「${albumTitle}」的音樂專輯提供一段簡短、富有哲學詩意且神秘的專輯介紹。
      專輯的主題背景為：「${description}」。
      要求：必須使用繁體中文，語氣高端藝術，字數約 120 字。`,
    });
    return response.text || "（無法生成內容）";
  } catch (error) {
    console.error("[V4] Gemini Error:", error);
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