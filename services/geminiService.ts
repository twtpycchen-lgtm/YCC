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

export const cleanTrackTitles = async (rawTracks: {id: string, title: string}[], albumTitle: string, context: string = "") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inputData = rawTracks.map((t, index) => ({ index, originalTitle: t.title }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `任務：身為精通象徵主義、爵士靈魂與「聯覺（Synesthesia）」的文字煉金術士，請將這些原始音軌名稱轉化為具備「深夜詩學」與「抽象張力」的繁體中文藝術標題。
      
      策展核心主題：${albumTitle}
      藝術脈絡：${context}
      
      轉化規則（優先級排序）：
      1. 【靈魂感應】：若原名是技術性的（如 v1_final, output_audio, 2024_mix）或無意義的亂碼，請徹底無視字面意思。請從專輯主題與脈絡中「通靈」出契合的音樂情緒與藝術意圖。
      2. 【去技術化】：嚴格剔除任何數字編號、日期、版本號、採樣率或文件後綴。
      3. 【詩意重構】：
         - 運用「觸覺」與「視覺」的錯位：例如「粗糲的藍色呼吸」、「被雨水浸透的切分音」。
         - 運用「空間感」：例如「不存在的地下室迴響」、「走廊盡頭的薩克斯風」。
         - 運用「哲學意象」：例如「即興的虛無主義」、「在節拍邊緣墜落」。
      4. 【風格導向】：標題應具備 Blue Note, ECM 或 Impulse! 唱片公司的文學高級感。語氣要破碎、孤獨、高雅且帶有電影感。
      5. 【禁用符號】：標題中禁止包含任何括號（如 < >, [ ], ( )）、角括號、引號或多餘標點。直接輸出純文字標題。
      
      待處理數據：${JSON.stringify(inputData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              optimizedTitle: { type: Type.STRING, description: "富有爵士詩意與聯覺感官的繁體中文標題，不含括號" }
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
    console.error("AI Title Optimization Failed:", error);
    return rawTracks.map(t => t.title);
  }
};