import { GoogleGenAI, Type } from "@google/genai";

/**
 * 取得經過安全檢查的 AI 實例
 */
const getSafeAI = () => {
  try {
    // Vite define 會替換 process.env.API_KEY
    const apiKey = process.env.API_KEY;
    
    // Debug 資訊 (僅在開發環境或 Key 缺失時顯示)
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      console.warn("Gemini API Key is currently: ", typeof apiKey, apiKey);
      return null;
    }
    
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("AI Initialization error:", err);
    return null;
  }
};

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  try {
    const ai = getSafeAI();
    if (!ai) return "（系統訊息：請在 Vercel 設定 API_KEY 並重新點擊 Redeploy 以套用變更。）";
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請為名為「${albumTitle}」的音樂專輯提供一段簡短、富有哲學詩意且神秘的專輯介紹。
      專輯的主題背景為：「${description}」。
      
      要求：
      1. 必須使用「繁體中文」。
      2. 語氣必須高端、具備藝術感且深邃。
      3. 字數約 120 字左右，分段優雅。`,
    });
    
    return response.text || "（無法生成內容）";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "（AI 暫時無法連線，請檢查 API Key 是否有權限。）";
  }
};

export const cleanTrackTitles = async (rawTitles: string[], albumTitle: string, albumDescription: string) => {
  try {
    const ai = getSafeAI();
    if (!ai) return rawTitles;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位享譽國際的音樂策展人。專輯標題：「${albumTitle}」。
      請根據專輯概念「${albumDescription}」，將曲目清單 ${JSON.stringify(rawTitles)} 轉換為極具藝術價值的正式中文曲名。
      請僅回傳 JSON 陣列。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      }
    });
    
    const jsonStr = response.text?.trim();
    if (!jsonStr) return rawTitles;
    
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : rawTitles;
  } catch (error) {
    console.error("Gemini Cleaning Error:", error);
    return rawTitles;
  }
};