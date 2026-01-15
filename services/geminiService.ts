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
      model: 'gemini-3-pro-preview',
      contents: `任務：身為精通象徵主義與爵士靈魂的文字煉金術士，請將這些音軌轉化為優美、富有畫面感的繁體中文詞句。
      
      策展專輯：${albumTitle}
      藝術脈絡：${context}
      
      【極重要指令】：
      1. 長度與深度：不要提供簡短的名稱（如「午夜」），而是提供一段優美的「詞句」或「詩行」（約 8-15 字，例如：「在破碎的霓虹下尋找那段遺失的切分音」）。
      2. 優先權：請觀察 "humanClue" 欄位（這是使用者手動輸入的關鍵字）。請【務必】以該文字為核心意象進行詩意化重構。
      3. 去技術化：嚴格剔除任何數字編號、日期、版本號(v1, final)或副檔名。
      4. 詩意風格：運用爵士樂的高級感（如：粗糲的呼吸、碎裂的霓虹、月光下的切分音、煙霧繚繞的迴響）。
      5. 禁用符號：禁止包含任何括號、引號或標點。
      
      待處理數據：${JSON.stringify(inputData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              optimizedTitle: { type: Type.STRING, description: "一段富含爵士詩意的繁體中文詞句" }
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

    return finalTitles.map((t, i) => t || rawTracks[i].remarks || rawTracks[i].title);
  } catch (error) {
    console.error("AI Title Optimization Failed:", error);
    return rawTracks.map(t => t.remarks || t.title);
  }
};