import { Album } from './types';

/**
 * 【全域發布數據中心】
 * 
 * 當您在管理模式下完成編輯後，點擊「Export」並將產生的 JSON 貼到下方的陣列中。
 * 這樣一來，所有「不帶 ?admin=true 參數」的普通用戶也能看到這些專輯。
 */
export const MOCK_ALBUMS: Album[] = [
  {
    id: "published-sample-01",
    title: "在午夜的裂縫中尋找月光的切分音",
    coverImage: "https://images.unsplash.com/photo-1514525253344-f814d0743b15?q=80&w=2000&auto=format&fit=crop",
    description: "這是一場關於機器與靈魂在藍調音階中碰撞的實驗。",
    story: "薩克斯風的嘶吼在電路板間迴盪，我們在數字的森林裡採擷最原始的律動。這不是計算，這是電訊號的即興。當第一聲鼓點敲響，邏輯便已退場，留下的是純粹的、金屬質感的憂鬱。",
    releaseDate: "2024.12.24",
    tracks: [
      {
        id: "t1",
        title: "煙霧繚繞的霓虹在琴鍵上破碎成影",
        originalTitle: "Midnight Drift v1",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        mp3Url: "",
        wavUrl: "",
        duration: "03:45",
        genre: "Noir Jazz",
        remarks: "靈魂的低語"
      }
    ]
  }
];