
import { Album } from './types';

/**
 * 這裡是您的「公開展覽館」數據中心。
 * 當您在管理模式點擊「Export」後，請將產生的 JSON 內容貼到下方的陣列中。
 * 重新部署後，全世界的使用者都能看到您更新的內容！
 */
export const MOCK_ALBUMS: Album[] = [
  {
    id: "welcome-album",
    title: "星際迴響 Galactic Echoes",
    coverImage: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1000&auto=format&fit=crop",
    description: "一段穿梭於星雲與黑洞之間的聽覺史詩。AI 探索宇宙深處的孤寂與輝煌。",
    story: "這是一張在虛擬實驗室中誕生的專輯。我們利用 Gemini 賦予了每一顆星辰靈魂，並透過 Suno 將引力波轉化為和弦。當您按下播放鍵，您不只是在聽音樂，而是在漫遊銀河。",
    releaseDate: "2025/03/01",
    tracks: [
      {
        id: "t1",
        title: "超新星序曲 Supernova Overture",
        duration: "3:45",
        audioUrl: "https://dl.dropboxusercontent.com/scl/fi/8y9q1f1a1a1a1a1a1a1a1/sample.mp3?rlkey=sample&raw=1", // 這裡只是佔位，您之後可以用 Export 取代
        wavUrl: "",
        mp3Url: "",
        genre: "Cinematic Sci-Fi"
      },
      {
        id: "t2",
        title: "遺忘的航向 Forgotten Vector",
        duration: "4:12",
        audioUrl: "https://dl.dropboxusercontent.com/scl/fi/8y9q1f1a1a1a1a1a1a1a1/sample.mp3?rlkey=sample&raw=1",
        wavUrl: "",
        mp3Url: "",
        genre: "Deep Ambient"
      }
    ]
  }
];
