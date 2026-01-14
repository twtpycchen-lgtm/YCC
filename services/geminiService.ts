
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Generates poetic album insights using Gemini 3 Flash.
 * Suitable for basic text generation and summarization.
 */
export const getAlbumInsights = async (albumTitle: string, description: string) => {
  // Always initialize with named parameter and process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請為專輯「${albumTitle}」提供一段詩意的中文介紹。主題：${description}`,
    });
    // Access .text property directly
    return response.text || "（無法生成內容）";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "（AI 暫時無法回應，請檢查金鑰權限。）";
  }
};

/**
 * Optimizes track titles using Gemini 3 Pro.
 * Optimization is considered a complex text task requiring better reasoning.
 */
export const cleanTrackTitles = async (rawTitles: string[], albumTitle: string, albumDescription: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `你是一位專業音樂編輯。請根據專輯名稱「${albumTitle}」和描述「${albumDescription}」，優化以下音軌名稱列表。
      任務：移除檔名後綴（如 .mp3）、序號或不必要的雜訊，使其更具藝術感與一致性。
      原始名稱列表：${JSON.stringify(rawTitles)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      }
    });
    const text = response.text;
    return text ? JSON.parse(text) : rawTitles;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return rawTitles;
  }
};
