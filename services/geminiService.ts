import { GoogleGenAI, Type } from "@google/genai";

const getSafeAI = () => {
  // 這裡的 process.env.API_KEY 在編譯後會變成字串常量
  const apiKey = process.env.API_KEY;
  
  console.log(`[V7] Runtime Check - Key Length: ${apiKey?.length || 0}`);

  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey.length < 10) {
    console.error("[V7] 錯誤：API 金鑰未能在運行時取得。");
    return null;
  }
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("[V7] AI 初始化異常:", err);
    return null;
  }
};

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = getSafeAI();
  if (!ai) return "（系統訊息：AI 服務未啟動。請確認 Vercel 後台已設定名稱為 API_KEY 的環境變數並重新部署。）";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請為名為「${albumTitle}」的音樂專輯提供一段簡短、富有哲學詩意且神秘的專輯介紹。
      專輯的主題背景為：「${description}」。
      要求：必須使用繁體中文，語氣高端藝術，字數約 120 字。`,
    });
    return response.text || "（無法生成內容）";
  } catch (error) {
    console.error("[V7] Gemini Error:", error);
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