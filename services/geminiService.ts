import { GoogleGenAI, Type } from "@google/genai";

/**
 * Generates poetic album insights using Gemini 3 Flash.
 */
export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位資深音樂策展人。請為「爵非鼓狂 (Jazz Fei Drum Madness)」專輯「${albumTitle}」提供一段極具藝術感且高端的中文介紹（約 120 字）。
      專輯主題：${description}
      風格要求：優雅、充滿節奏張力、帶有爵士即興靈魂的引言。請直接輸出介紹內容，不要有其他廢話，也不要使用引號。`,
    });
    return response.text || "（無法生成內容）";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "（AI 暫時無法回應，請檢查 API Key 設置）";
  }
};

/**
 * Optimizes track titles with aggressive semantic extraction.
 * Example: "3_V1_摩天輪的告白_原始GK版_V1" -> "摩天輪的告白"
 */
export const cleanTrackTitles = async (rawTracks: {id: string, title: string}[], albumTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inputData = rawTracks.map((t, index) => ({ index, originalTitle: t.title }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `任務：從音檔名稱中提取「核心情感標題」。
      
      優化規則（絕對執行）：
      1. 移除開頭的數字序號（如 3_, 01.）。
      2. 移除所有版本標籤（如 V1, V2, V3.2, Final, Version）。
      3. 移除技術性後綴與 Metadata（如 原始GK版, 正式版, Remix, Mix, GK版, suno, grok）。
      4. 僅保留最具備「歌曲靈魂」的核心文字。
      5. **重要**：輸出的標題必須是「純文字」，不要有角括號或其他包裹符號。
      6. 嚴格保持輸入的原始順序。

      輸入數據：${JSON.stringify(inputData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              optimizedTitle: { type: Type.STRING }
            },
            required: ["index", "optimizedTitle"]
          }
        },
      }
    });

    const text = response.text;
    if (!text) return rawTracks.map(t => t.title);

    const results: {index: number, optimizedTitle: string}[] = JSON.parse(text);
    const finalTitles = new Array(rawTracks.length);
    results.forEach(res => {
      if (res.index >= 0 && res.index < finalTitles.length) {
        finalTitles[res.index] = res.optimizedTitle.trim();
      }
    });

    return finalTitles.map((t, i) => t || rawTracks[i].title);
  } catch (error) {
    console.error("Gemini Title Cleaning Error:", error);
    return rawTracks.map(t => t.title);
  }
};