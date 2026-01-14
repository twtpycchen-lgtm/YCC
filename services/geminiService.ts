import { GoogleGenAI, Type } from "@google/genai";

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  try {
    // 初始化放在函式內，避免全域變數載入失敗導致整個 App 黑屏
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請為名為「${albumTitle}」的音樂專輯提供一段簡短、富有哲學詩意且神秘的專輯介紹。
      專輯的主題背景為：「${description}」。
      
      要求：
      1. 必須使用「繁體中文」。
      2. 語氣必須高端、具備藝術感且深邃，像是一位資深音樂評論家的筆觸。
      3. 字數約 120 字左右，分段優雅。`,
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "（敘事生成暫時無法使用，請確認 Vercel 的 API_KEY 設定是否正確。）";
  }
};

export const cleanTrackTitles = async (rawTitles: string[], albumTitle: string, albumDescription: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位享譽國際的音樂策展人。
      專輯標題：「${albumTitle}」
      專輯概念：「${albumDescription}」
      原始曲目識別資料：${JSON.stringify(rawTitles)}。
      
      任務指令：
      1. 將這些曲目轉換為極具藝術價值的正式中文曲名。
      2. 必須使用「繁體中文」。
      3. **關鍵：如果原始標題是檔案 ID（如 18E0k7wp...）或亂碼，請無視原始字串，完全根據上述的「專輯標題」與「專輯概念」，創作者充滿意象與詩意的全新曲名。**
      4. 所有的曲名風格必須統一，像是構成一個完整的音樂故事。
      5. 清除所有副檔名與多餘符號。
      
      請僅回傳一個純 JSON 字串陣列：["曲名一", "曲名二", ...]。不要包含 markdown 格式或任何解釋。`,
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
    if (Array.isArray(parsed)) return parsed;
    return rawTitles;
  } catch (error) {
    console.error("Gemini Cleaning Error:", error);
    return rawTitles;
  }
};