
import { GoogleGenAI, Type } from "@google/genai";

export const getAlbumInsights = async (albumTitle: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位深諳爵士樂靈魂的當代詩人與樂評大師。請為這場名為「${albumTitle}」的音樂饗宴撰寫一段極具電影感、黑色電影（Noir）氛圍且富有即興張力的繁體中文策展引言（約 150 字）。
      
      背景主題：${description}。
      
      寫作要求：
      1. 語氣要優雅而冷靜，彷彿在煙霧繚繞的深夜俱對部低語。
      2. 運用爵士樂相關的意象（如：切分音的呼吸、微醺的銅管、破碎的節奏、午夜的薩克斯風）。
      3. 探討靈魂與律動的深層連結。
      4. 直接輸出正文，不需引號或標題。`,
    });
    return response.text || "當音符撕開深夜的寂靜，律動便成為唯一的信仰。";
  } catch (error) {
    return "在即興的裂縫中，我們找到了靈魂最真實的震顫。";
  }
};

export const cleanTrackTitles = async (rawTracks: {id: string, title: string, remarks?: string}[], albumTitle: string, context: string = "") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const inputData = rawTracks.map((t, index) => ({ 
    index, 
    originalTitle: t.title,
    humanClue: t.remarks || "" 
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `【任務：爵士魂之詩】
      你是一位精通文字美學與爵士靈魂的文學大師。
      請為專輯《${albumTitle}》中的每一首曲目，創作一段獨立且優美的「感官敘事詩句」作為歌名。
      
      【藝術脈絡】：${context}
      
      【核心指令】：
      1. 不要只給歌名，要給出「一句優美的話」，這句話描述了音樂在午夜發生的瞬間。
      2. 每一句長度控制在 10-22 個繁體中文。
      3. 必須包含爵士樂的高級意象（例如：切分音、微醺的銅管、破碎的霓虹、月色下的低音提琴）。
      4. 如果有提供 "humanClue" (使用者備註)，請將其轉化為詩句的核心意象。
      5. 絕對不要出現數字、日期、版本號、副檔名或括號。
      
      【待處理數據集】：${JSON.stringify(inputData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              optimizedTitle: { type: Type.STRING, description: "一段充滿爵士詩意的優美敘事短句" }
            },
            required: ["index", "optimizedTitle"]
          }
        },
      }
    });

    const text = response.text || "[]";
    const results: {index: number, optimizedTitle: string}[] = JSON.parse(text);
    const finalTitles = new Array(rawTracks.length).fill(null);
    
    results.forEach(res => {
      if (res.index >= 0 && res.index < finalTitles.length) {
        finalTitles[res.index] = res.optimizedTitle;
      }
    });

    return finalTitles.map((t, i) => t || rawTracks[i].remarks || rawTracks[i].title);
  } catch (error) {
    console.error("AI Title Optimization Failed:", error);
    return rawTracks.map(t => t.remarks || t.title);
  }
};
