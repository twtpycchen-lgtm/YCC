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
 * Force wrapping with < >.
 * Example: "3_V1_摩天輪的告白_原始GK版_V1" -> "<摩天輪的告白>"
 */
export const cleanTrackTitles = async (rawTracks: {id: string, title: string}[], albumTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inputData = rawTracks.map((t, index) => ({ index, originalTitle: t.title }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `任務：從雜亂的音檔名稱中精準提取「核心歌名標題」。
      
      優化規則：
      1. 移除前綴數字（如 3_, 01.）。
      2. 移除版本與技術標籤（如 V1, V2, 原始GK版, 正式版, Remix, Mix）。
      3. 移除副檔名或路徑資訊。
      4. 只保留具備情感的核心文字。
      5. **強制格式**：將最終標題用角括號包裹，例如 <摩天輪的告白>。
      
      輸入數據：${JSON.stringify(inputData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              optimizedTitle: { type: Type.STRING, description: "必須包含 < > 的純淨標題" }
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
        let t = res.optimizedTitle.trim();
        // 二次檢查確保格式
        if (!t.startsWith('<')) t = '<' + t;
        if (!t.endsWith('>')) t = t + '>';
        finalTitles[res.index] = t;
      }
    });

    return finalTitles.map((t, i) => t || rawTracks[i].title);
  } catch (error) {
    console.error("Gemini Title Cleaning Error:", error);
    return rawTracks.map(t => t.title);
  }
};