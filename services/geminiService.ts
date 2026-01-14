
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Generates poetic album insights using Gemini 3 Flash.
 */
export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位資深音樂評論家與策展人。請為專輯「${albumTitle}」提供一段極具畫面感、詩意且引人入勝的中文介紹（約 100 字）。
      專輯核心主題：${description}
      請讓文字讀起來像是一場聽覺盛宴的開場白。`,
    });
    return response.text || "（無法生成內容）";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "（AI 暫時無法回應，請檢查金鑰權限。）";
  }
};

/**
 * Optimizes track titles using Gemini 3 Pro with strict index matching.
 */
export const cleanTrackTitles = async (rawTracks: {id: string, title: string}[], albumTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const inputData = rawTracks.map((t, index) => ({ index, originalTitle: t.title }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `你是一位專業的串流音樂編輯（如 Spotify 或 Apple Music 編輯）。
      現在有一張名為「${albumTitle}」的專輯，以下是原始的音軌名稱列表（可能包含 .mp3、序號或隨機字串）。
      
      任務：
      1. 優化標題，使其具有藝術感且符合專輯語境。
      2. **絕對不可改變音軌的原始順序**。
      3. 必須傳回與輸入數量完全一致的結果。

      輸入數據：${JSON.stringify(inputData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER, description: "輸入時的原始索引編號" },
              optimizedTitle: { type: Type.STRING, description: "美化後的歌曲名稱" }
            },
            required: ["index", "optimizedTitle"]
          }
        },
      }
    });

    const text = response.text;
    if (!text) return rawTracks.map(t => t.title);

    const results: {index: number, optimizedTitle: string}[] = JSON.parse(text);
    
    // 根據 index 排序回正確位置，確保不會錯亂
    const finalTitles = new Array(rawTracks.length);
    results.forEach(res => {
      if (res.index >= 0 && res.index < finalTitles.length) {
        finalTitles[res.index] = res.optimizedTitle;
      }
    });

    // 填充缺失值
    return finalTitles.map((t, i) => t || rawTracks[i].title);
  } catch (error) {
    console.error("Gemini Title Cleaning Error:", error);
    return rawTracks.map(t => t.title);
  }
};
