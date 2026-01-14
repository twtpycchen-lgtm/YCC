import { GoogleGenAI, Type } from "@google/genai";

/**
 * 使用 Gemini 3 Flash 生成詩意的專輯介紹。
 */
export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位資深音樂策展人。請為「爵非鼓狂 (Jazz Fei Drum Madness)」的作品集「${albumTitle}」提供一段充滿藝術感與靈魂溫度的中文介紹（約 120 字）。
      主題內容：${description}
      風格要求：優雅、專業、帶有高級感。請直接輸出介紹內容，不要有引號或贅字。`,
    });
    return response.text || "（無法生成內容）";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "（AI 暫時無法回應，請檢查 API 設置）";
  }
};

/**
 * 優化音軌標題：從原始檔名中提取乾淨的中文歌名。
 * 規則：去除數字、版本、技術後綴，並包裹在 < > 中。
 */
export const cleanTrackTitles = async (rawTracks: {id: string, title: string}[], albumTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inputData = rawTracks.map((t, index) => ({ index, originalTitle: t.title }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `任務：將原始音檔名稱轉換為藝術標題。
      
      規則：
      1. 移除前綴數字與符號（如 01., 3_）。
      2. 移除版本標籤（如 V1, V2, Final, GK版, 原始版）。
      3. 移除副檔名。
      4. 提取核心的「中文歌名」。
      5. 格式要求：最終標題必須包裹在角括號中，如 <歌名>。
      
      輸入數據：${JSON.stringify(inputData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              optimizedTitle: { type: Type.STRING, description: "包含 < > 的純淨中文標題" }
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
        finalTitles[res.index] = res.optimizedTitle;
      }
    });

    return finalTitles.map((t, i) => t || rawTracks[i].title);
  } catch (error) {
    console.error("AI 標題處理異常:", error);
    return rawTracks.map(t => t.title);
  }
};