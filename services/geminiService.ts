import { GoogleGenAI, Type } from "@google/genai";

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位極具藝術品味的音樂策展詩人。請為專輯「${albumTitle}」撰寫一段充滿靈魂深度與即興感的繁體中文引言（約 130 字）。
      專輯背景：${description}。
      要求：語言要優雅、具有爵士樂的流動感，直接輸出內容，不要帶引號。`,
    });
    return response.text || "音樂在靜默中升起，靈魂在節奏中覺醒。";
  } catch (error) {
    return "音符是靈魂的語言，在不經意間訴說著永恆的故事。";
  }
};

export const cleanTrackTitles = async (rawTracks: {id: string, title: string}[], albumTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inputData = rawTracks.map((t, index) => ({ index, originalTitle: t.title }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `你是一位音樂策展師。請將原始檔名轉換為具有「藝術意境」的繁體中文標題。
      
      規則：
      1. 移除所有編號、版本（如 V1, GK, Final）、日期與技術後綴。
      2. 根據專輯主題「${albumTitle}」與檔名含義，提取出最優雅的核心名稱。
      3. 如果原名過於技術化，請賦予它一個具有詩意的同義中文名。
      4. 格式：所有標題必須包裹在角括號中，如 <微醺深夜>。
      
      原始數據：${JSON.stringify(inputData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              optimizedTitle: { type: Type.STRING, description: "包含 < > 的優雅中文標題" }
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
    console.error("AI Title Error:", error);
    return rawTracks.map(t => t.title);
  }
};