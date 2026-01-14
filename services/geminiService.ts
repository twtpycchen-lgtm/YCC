import { GoogleGenAI, Type } from "@google/genai";

/**
 * 取得經過安全檢查的 AI 實例
 * 防止因為環境變數未設定導致整個前端 App 在啟動時崩潰
 */
const getSafeAI = () => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      console.warn("Gemini API Key is missing. AI features will be disabled.");
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
    if (!ai) return "（系統訊息：請在 Vercel 後台設定 API_KEY 以啟用此功能。）";
    
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
    return "（AI 暫時無法連線，請稍後再試。）";
  }
};

export const cleanTrackTitles = async (rawTitles: string[], albumTitle: string, albumDescription: string) => {
  try {
    const ai = getSafeAI();
    if (!ai) return rawTitles;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位享譽國際的音樂策展人。
      專輯標題：「${albumTitle}」
      專輯概念：「${albumDescription}」
      原始曲目識別資料：${JSON.stringify(rawTitles)}。
      
      任務指令：
      1. 將這些曲目轉換為極具藝術價值的正式中文曲名。
      2. 必須使用「繁體中文」。
      3. 清除所有副檔名與多餘符號。
      
      請僅回傳一個純 JSON 字串陣列：["曲名一", "曲名二", ...]。`,
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