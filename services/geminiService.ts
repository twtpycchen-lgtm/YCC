import { GoogleGenAI, Type } from "@google/genai";

const getSafeAI = () => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey.length < 10) {
    console.error("[V8 Diagnostic] CRITICAL: API_KEY is missing. If you see this in Vercel, check Environment Variables.");
    return null;
  }
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("[V8 Diagnostic] Initialization Error:", err);
    return null;
  }
};

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = getSafeAI();
  if (!ai) return "（系統訊息：AI 服務未啟動。請確認 Vercel 後台已設定 API_KEY。）";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請為專輯「${albumTitle}」提供一段詩意的中文介紹。主題：${description}`,
    });
    return response.text || "（無法生成內容）";
  } catch (error) {
    return "（AI 暫時無法回應，請檢查金鑰權限。）";
  }
};

export const cleanTrackTitles = async (rawTitles: string[], albumTitle: string, albumDescription: string) => {
  const ai = getSafeAI();
  if (!ai) return rawTitles;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `優化曲名：${JSON.stringify(rawTitles)}，專輯：${albumTitle}`,
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