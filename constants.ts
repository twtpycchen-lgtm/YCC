
import { Album } from './types';

/**
 * 【公開展覽館數據中心】
 * 
 * 這裡存放的是「全世界聽眾」進入網站後會看到的內容。
 * 當您在管理模式編輯完畢並點擊「Export」後，請將產生的 JSON 內容貼到下方的陣列中。
 * 重新部署 (Git Push) 後，全球聽眾看到的內容就會同步更新。
 */
export const MOCK_ALBUMS: Album[] = [
  {
    id: "galactic-echoes-2025",
    title: "星際迴響 Galactic Echoes",
    coverImage: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1000&auto=format&fit=crop",
    description: "一段穿梭於星雲與黑洞之間的聽覺史詩。AI 探索宇宙深處的孤寂與輝煌。",
    story: "這是一張在虛擬實驗室中誕生的專輯。我們利用 Gemini 賦予了每一顆星辰靈魂，並透過 Suno 將引力波轉化為和弦。當您按下播放鍵，您不只是在聽音樂，而是在漫遊銀河。這不僅僅是聲音，這是光的迴響。",
    releaseDate: "2025/03/01",
    tracks: [
      {
        id: "ge-1",
        title: "超新星序曲 Supernova Overture",
        duration: "3:45",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        wavUrl: "",
        mp3Url: "",
        genre: "Cinematic Sci-Fi"
      },
      {
        id: "ge-2",
        title: "遺忘的航向 Forgotten Vector",
        duration: "4:12",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        wavUrl: "",
        mp3Url: "",
        genre: "Deep Ambient"
      }
    ]
  },
  {
    id: "neon-zen-2025",
    title: "霓虹禪意 Neon Zen",
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    description: "2077 年的深夜雨後，在繁華與寧靜的交界點尋找靈魂的頻率。",
    story: "如果機器人會做夢，那夢境中一定充滿了雨水的氣息與電漿的嗡鳴。Neon Zen 試圖捕捉這種矛盾：在高科技的冷冽中，依然跳動著人類原始的情感節奏。這是在賽博龐克世界裡的一抹翠綠。",
    releaseDate: "2025/03/15",
    tracks: [
      {
        id: "nz-1",
        title: "雨後的仿生人 Androids in the Rain",
        duration: "3:20",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        wavUrl: "",
        mp3Url: "",
        genre: "Lofi Cyberpunk"
      },
      {
        id: "nz-2",
        title: "電路板上的櫻花 Sakura Circuits",
        duration: "5:05",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        wavUrl: "",
        mp3Url: "",
        genre: "Chillstep"
      }
    ]
  }
];
