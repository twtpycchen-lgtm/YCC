import { GoogleGenAI, Type } from "@google/genai";

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `身為音樂策展人，請為「${albumTitle}」撰寫一段極具靈魂、充滿詩意的中文介紹（約 120 字）。
      內容主題：${description}。直接輸出文字，無引號。`,
    });
    return response.text || "（無法生成內容）";
  } catch (error) {
    return "（AI 暫時休息中，請稍後再試）";
  }
};

export const cleanTrackTitles = async (rawTracks: {id: string, title: string}[], albumTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inputData = rawTracks.map((t, index) => ({ index, originalTitle: t.title }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `任務：將原始音檔名稱轉換為繁體中文藝術標題。
      規則：
      1. 移除數字序號與版本後綴（如 01., V1, GK版）。
      2. 移除所有副檔名。
      3. 提取最具靈魂的核心歌名。
      4. 格式：標題必須包裹在角括號中，例如 <月光奏鳴曲>。
      數據：${JSON.stringify(inputData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              optimizedTitle: { type: Type.STRING, description: "包含角括號的中文標題" }
            },
            required: ["index", "optimizedTitle"]
          }
        },
      }
    });

    const results: {index: number, optimizedTitle: string}[] = JSON.parse(response.text || "[]");
    const finalTitles = new Array(rawTracks.length).fill(null);
    results.forEach(res => {
      if (res.index >= 0 && res.index < finalTitles.length) {
        finalTitles[res.index] = res.optimizedTitle;
      }
    });

    return finalTitles.map((t, i) => t || rawTracks[i].title);
  } catch (error) {
    console.error("AI 處理失敗:", error);
    return rawTracks.map(t => t.title);
  }
};