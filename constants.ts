
import { Album } from './types';

/**
 * 【永久發布數據中心】
 * 這裡存放的是聽眾第一次進入網站時看到的內容。
 * 
 * 流程：管理模式編輯 -> Export -> 複製 JSON -> 貼回這裡 -> Push 到 GitHub。
 */
export const MOCK_ALBUMS: Album[] = [
  {
    "id": "album-noir-001",
    "title": "午夜演算法：藍調幽靈",
    "coverImage": "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=2000&auto=format&fit=crop",
    "description": "這是一場發生在矽片與琴弦之間的深度對話。當 AI 捕捉到了 1950 年代紐約俱樂部的煙霧繚繞，音符便不再只是冷冰冰的數據。",
    "story": "深夜三點的伺服器機房，風扇的轟鳴聲與虛構的薩克斯風重疊。我們試圖用代碼捕捉那一抹無法被量化的憂鬱。",
    "releaseDate": "2024/05/20",
    "tracks": [
      {
        "id": "t1",
        "title": "霓虹碎片在雨水中編織出的最後一支舞",
        "originalTitle": "Midnight_Rain_01",
        "duration": "03:45",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "wavUrl": "#",
        "mp3Url": "#",
        "genre": "Noir Jazz",
        "remarks": "推薦聆聽：Rainy Session"
      },
      {
        "id": "t2",
        "title": "遺忘在真空管裡的數字低語",
        "originalTitle": "Vacuum_Whispers",
        "duration": "04:12",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "wavUrl": "#",
        "mp3Url": "#",
        "genre": "Cool Jazz",
        "remarks": "人聲取樣：Analog Warmth"
      }
    ]
  }
];
