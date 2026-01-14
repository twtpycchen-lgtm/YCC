
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
    "id": "album-1768393310878",
    "title": "微醺都市：深夜的靈魂私語 Legendary Selection",
    "description": "這張專輯以「都會深夜的浪漫與感性」為核心主題，精選了多首具備 Contemporary R&B、Neo-Soul 與 Jazz-Pop 風格的高分曲目。",
    "story": "當霓虹沒入薄霧，整座城市才開始溫柔地呼吸。\n\n這張專輯是一場在月色下鋪展開的感性漫遊：從《爵放靈魂》強悍的放克心跳出發，揉合了 Neo-Soul 的絲滑與 Jazz-Pop 的優雅。我們在《南山TOWER》的極致浪漫裡低迴迷失，最終於《回不去的青春》那抹懷舊餘韻中，與深夜的自我達成和解。這是一杯調入都市光影的醇酒，獻給每一段在寂靜中獨自盛開的靈魂私語。",
    "coverImage": "https://images.unsplash.com/photo-1514525253361-bee8718a342b?q=80&w=1000&auto=format&fit=crop",
    "releaseDate": "2026/1/14",
    "tracks": [
      {
        "id": "track-1768393255462-0-3a4jl",
        "title": "Intro：霓虹初醒 (Intro: Neon Awakening)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/nycl0zyhfknxst77d63zn/1_V2_-GROK_V3-2-Remix.mp3?rlkey=65usk1543tdsdshmce728i0jk&st=8qczg23g&raw=1",
        "duration": "3:12",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/nycl0zyhfknxst77d63zn/1_V2_-GROK_V3-2-Remix.mp3?rlkey=65usk1543tdsdshmce728i0jk&st=8qczg23g&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/nycl0zyhfknxst77d63zn/1_V2_-GROK_V3-2-Remix.mp3?rlkey=65usk1543tdsdshmce728i0jk&st=8qczg23g&dl=0"
      },
      {
        "id": "track-1768393255462-1-fqofi",
        "title": "流光公路的殘影 (Afterimage on the Highway)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/ew707897vl667vk3wr2lg/2_2_V2_-_-_G5-_V1.mp3?rlkey=my13771q5oairqxmdowr73tx4&st=xq6uch7b&raw=1",
        "duration": "4:05",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/ew707897vl667vk3wr2lg/2_2_V2_-_-_G5-_V1.mp3?rlkey=my13771q5oairqxmdowr73tx4&st=xq6uch7b&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/ew707897vl667vk3wr2lg/2_2_V2_-_-_G5-_V1.mp3?rlkey=my13771q5oairqxmdowr73tx4&st=xq6uch7b&dl=0"
      },
      {
        "id": "track-1768393255462-7-8taa1",
        "title": "微醺濾鏡 (Tipsy Filter)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/ljirbrpo33xob7coofgpo/8_V12-TOWER-Remix.mp3?rlkey=lzzs8uvvybtnvmm43bxz9r9uc&st=q3z3ptuo&raw=1",
        "duration": "3:58",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/ljirbrpo33xob7coofgpo/8_V12-TOWER-Remix.mp3?rlkey=lzzs8uvvybtnvmm43bxz9r9uc&st=q3z3ptuo&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/ljirbrpo33xob7coofgpo/8_V12-TOWER-Remix.mp3?rlkey=lzzs8uvvybtnvmm43bxz9r9uc&st=q3z3ptuo&dl=0"
      }
    ]
  },
  {
    "id": "galactic-echoes-2025",
    "title": "星際迴響 Galactic Echoes",
    "coverImage": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1000&auto=format&fit=crop",
    "description": "一段穿梭於星雲與黑洞之間的聽覺史詩。AI 探索宇宙深處的孤寂與輝煌。",
    "story": "這是一張在虛擬實驗室中誕生的專輯。我們利用 Gemini 賦予了每一顆星辰靈魂，並透過 Suno 將引力波轉化為和弦。當您按下播放鍵，您不只是在聽音樂，而是在漫遊銀河。這不僅僅是聲音，這是光的迴響。",
    "releaseDate": "2025/03/01",
    "tracks": [
      {
        "id": "ge-1",
        "title": "超新星序曲 Supernova Overture",
        "duration": "3:45",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "wavUrl": "",
        "mp3Url": "",
        "genre": "Cinematic Sci-Fi"
      },
      {
        "id": "ge-2",
        "title": "遺忘的航向 Forgotten Vector",
        "duration": "4:12",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "wavUrl": "",
        "mp3Url": "",
        "genre": "Deep Ambient"
      }
    ]
  }
];
