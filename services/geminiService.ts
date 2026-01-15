
import { GoogleGenAI, Type } from "@google/genai";

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  // 直接從 process.env 讀取，並告知 TS 這是一個字串
  const apiKey = (process.env as any).API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位精通爵士魂的當代詩人。請為專輯「${albumTitle}」撰寫一段極具電影張力的繁體中文策展引言。
      
      背景：${description}。
      
      要求：
      1. 語氣優雅冷靜。
      2. 運用爵士樂意象。
      3. 約 150 字，直接輸出正文。`,
    });
    return response.text || "音符在深夜的裂縫中生長。";
  } catch (error) {
    return "在即興的節奏中，我們觸碰到了靈魂的邊界。";
  }
};

export const cleanTrackTitles = async (rawTracks: {id: string, title: string, remarks?: string}[], albumTitle: string, context: string = "") => {
  const apiKey = (process.env as any).API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  const inputData = rawTracks.map((t, index) => ({ 
    index, 
    originalTitle: t.title,
    humanClue: t.remarks || "" 
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `【任務：爵士魂之詩】
      請為專輯《${albumTitle}》中的曲目，創作一段優美的「感官敘事詩句」作為標題。
      
      【藝術脈絡】：${context}
      
      【核心指令】：
      1. 嚴格限制：每一首曲目「只能輸出一句」完整的話。
      2. 絕對禁止分段、分行或使用任何換行符號。
      3. 長度 12-22 個繁體中文。
      4. 必須包含爵士意象（如：微醺、破碎霓虹、午夜琴弦）。
      5. 嚴禁數字、版本號或檔案後綴。
      
      【數據】：${JSON.stringify(inputData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              optimizedTitle: { type: Type.STRING, description: "一句完整且優美的繁體中文短句" }
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
    return rawTracks.map(t => t.title);
  }
};
