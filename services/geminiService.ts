import { GoogleGenAI, Type } from "@google/genai";

/**
 * 取得經過安全檢查的 AI 實例
 */
const getSafeAI = () => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("Critical: API_KEY is missing in the bundle.");
    return null;
  }
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("AI Initialization error:", err);
    return null;
  }
};

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = getSafeAI();
  if (!ai) return "（系統訊息：API 串接失效。請在 Vercel Redeploy 並關閉 Build Cache 以套用 Key。）";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請為名為「${albumTitle}」的音樂專輯提供一段簡短、富有哲學詩意且神秘的專輯介紹。
      專輯的主題背景為：「${description}」。
      要求：必須使用繁體中文，語氣高端藝術，字數約 120 字。`,
    });
    return response.text || "（無法生成內容）";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "（AI 目前無法回應，請確認 API Key 權限。）";
  }
};

export const cleanTrackTitles = async (rawTitles: string[], albumTitle: string, albumDescription: string) => {
  const ai = getSafeAI();
  if (!ai) return rawTitles;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位享譽國際的音樂策展人。專輯標題：「${albumTitle}」。曲目：${JSON.stringify(rawTitles)}。
      請優化為極具藝術感的中文曲名，僅回傳 JSON 陣列。`,
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