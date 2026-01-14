
import { Album } from './types';

/**
 * 【公開展覽館數據中心】
 * 
 * 這裡存放的是「全世界聽眾」進入網站後會看到的內容。
 * 當您在管理模式編輯完畢並點擊「Export」後，請將產生的 JSON 內容貼到下方的陣列中。
 * 重新部署 (Git Push) 後，全球聽眾看到的內容就會同步更新。
 */
export const MOCK_ALBUMS: Album[] = [
 [
  {
    "id": "album-1768393310878",
    "title": "微醺都市：深夜的靈魂私語 Legendary Selection",
    "description": "「這張專輯以「都會深夜的浪漫與感性」為核心主題，精選了多首具備 Contemporary R&B、Neo-Soul 與 Jazz-Pop 風格的高分曲目。開場曲《爵放靈魂》以強烈的 Funk 律動奠定專輯的都市基調；隨後透過《摩天輪的告白》與《從影走向你》等絲滑 R&B 旋律，營造出深夜漫步的氛圍。專輯中段加入《流光塵騷》與《放克舞動》增加節奏起伏，並在《南山TOWER》與《令琛姐新年快樂》兩首 9.6 分的巔峰之作中展現極致的浪漫情懷。最後以具備強烈敘事感與懷舊餘韻的《回不去的青春》收尾，完成了一場從繁華律動到內心獨白的完整敘事。」",
    "story": "當霓虹沒入薄霧，整座城市才開始溫柔地呼吸。\n\n這張專輯是一場在月色下鋪展開的感性漫遊：從《爵放靈魂》強悍的放克心跳出發，揉合了 Neo-Soul 的絲滑與 Jazz-Pop 的優雅。我們在《南山TOWER》的極致浪漫裡低迴迷失，最終於《回不去的青春》那抹懷舊餘韻中，與深夜的自我達成和解。這是一杯調入都市光影的醇酒，獻給每一段在寂靜中獨自盛開的靈魂私語。",
    "coverImage": "blob:https://28zzst73hpd6s3atsseujeq53sbjjxtfbw0ufz5awqqbk7jbzv-h852644758.scf.usercontent.goog/bd7c52cd-f044-4dca-a1a0-3821a0ca791f",
    "releaseDate": "2026/1/14",
    "tracks": [
      {
        "id": "track-1768393255462-0-3a4jl",
        "title": "Intro：霓虹初醒 (Intro: Neon Awakening)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/nycl0zyhfknxst77d63zn/1_V2_-GROK_V3-2-Remix.mp3?rlkey=65usk1543tdsdshmce728i0jk&st=8qczg23g&raw=1",
        "duration": "--:--",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/nycl0zyhfknxst77d63zn/1_V2_-GROK_V3-2-Remix.mp3?rlkey=65usk1543tdsdshmce728i0jk&st=8qczg23g&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/nycl0zyhfknxst77d63zn/1_V2_-GROK_V3-2-Remix.mp3?rlkey=65usk1543tdsdshmce728i0jk&st=8qczg23g&dl=0"
      },
      {
        "id": "track-1768393255462-1-fqofi",
        "title": "流光公路的殘影 (Afterimage on the Highway)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/ew707897vl667vk3wr2lg/2_2_V2_-_-_G5-_V1.mp3?rlkey=my13771q5oairqxmdowr73tx4&st=xq6uch7b&raw=1",
        "duration": "--:--",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/ew707897vl667vk3wr2lg/2_2_V2_-_-_G5-_V1.mp3?rlkey=my13771q5oairqxmdowr73tx4&st=xq6uch7b&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/ew707897vl667vk3wr2lg/2_2_V2_-_-_G5-_V1.mp3?rlkey=my13771q5oairqxmdowr73tx4&st=xq6uch7b&dl=0"
      },
      {
        "id": "track-1768393255462-2-ujgvu",
        "title": "加冰的琥珀色心事 (Iced Amber Thoughts)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/wyxsippuxvvavmh6ql6dn/3_V1_-_-GK-_V1.mp3?rlkey=kkaipzf5aq4m2m4gskeq17zi4&st=nhh60rvt&raw=1",
        "duration": "--:--",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/wyxsippuxvvavmh6ql6dn/3_V1_-_-GK-_V1.mp3?rlkey=kkaipzf5aq4m2m4gskeq17zi4&st=nhh60rvt&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/wyxsippuxvvavmh6ql6dn/3_V1_-_-GK-_V1.mp3?rlkey=kkaipzf5aq4m2m4gskeq17zi4&st=nhh60rvt&dl=0"
      },
      {
        "id": "track-1768393255462-3-lz6bp",
        "title": "煙圈與舊藍調 (Smoke Rings & Old Blues)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/km47ha1xjw7vzl97gb4f0/4_V1_-_G52-_V2.mp3?rlkey=7tvvs7ve2jivkqv6lfj6tjij5&st=384cfznf&raw=1",
        "duration": "--:--",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/km47ha1xjw7vzl97gb4f0/4_V1_-_G52-_V2.mp3?rlkey=7tvvs7ve2jivkqv6lfj6tjij5&st=384cfznf&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/km47ha1xjw7vzl97gb4f0/4_V1_-_G52-_V2.mp3?rlkey=7tvvs7ve2jivkqv6lfj6tjij5&st=384cfznf&dl=0"
      },
      {
        "id": "track-1768393255462-4-92fmd",
        "title": "半夢半醒的頻率 (Frequency Between Dream and Awake)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/pu8nq6s5gu1z4o1csqflh/5_V2_-_GK_2_V2_YT.mp3?rlkey=48umt5nre0fmta55egan9926c&st=gbcfdnh6&raw=1",
        "duration": "--:--",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/pu8nq6s5gu1z4o1csqflh/5_V2_-_GK_2_V2_YT.mp3?rlkey=48umt5nre0fmta55egan9926c&st=gbcfdnh6&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/pu8nq6s5gu1z4o1csqflh/5_V2_-_GK_2_V2_YT.mp3?rlkey=48umt5nre0fmta55egan9926c&st=gbcfdnh6&dl=0"
      },
      {
        "id": "track-1768393255462-5-dcith",
        "title": "凌晨三點的雨聲 (Sound of Rain at 3 AM)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/9q3oprhwq1ihbii61appj/6_V4_-_V1-2.mp3?rlkey=1cfirzv9e28n7p7x8izkal5sx&st=6gcyiaep&raw=1",
        "duration": "--:--",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/9q3oprhwq1ihbii61appj/6_V4_-_V1-2.mp3?rlkey=1cfirzv9e28n7p7x8izkal5sx&st=6gcyiaep&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/9q3oprhwq1ihbii61appj/6_V4_-_V1-2.mp3?rlkey=1cfirzv9e28n7p7x8izkal5sx&st=6gcyiaep&dl=0"
      },
      {
        "id": "track-1768393255462-6-69f95",
        "title": "街燈下的獨舞 (Solo Dance Under Streetlights)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/ftk0lzrpamjjamknfz906/7_6_V1_-GE_V2.mp3?rlkey=wymmdpkc45drrl5felvcesrpl&st=bxcip8v4&raw=1",
        "duration": "--:--",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/ftk0lzrpamjjamknfz906/7_6_V1_-GE_V2.mp3?rlkey=wymmdpkc45drrl5felvcesrpl&st=bxcip8v4&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/ftk0lzrpamjjamknfz906/7_6_V1_-GE_V2.mp3?rlkey=wymmdpkc45drrl5felvcesrpl&st=bxcip8v4&dl=0"
      },
      {
        "id": "track-1768393255462-7-8taa1",
        "title": "微醺濾鏡 (Tipsy Filter)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/ljirbrpo33xob7coofgpo/8_V12-TOWER-Remix.mp3?rlkey=lzzs8uvvybtnvmm43bxz9r9uc&st=q3z3ptuo&raw=1",
        "duration": "--:--",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/ljirbrpo33xob7coofgpo/8_V12-TOWER-Remix.mp3?rlkey=lzzs8uvvybtnvmm43bxz9r9uc&st=q3z3ptuo&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/ljirbrpo33xob7coofgpo/8_V12-TOWER-Remix.mp3?rlkey=lzzs8uvvybtnvmm43bxz9r9uc&st=q3z3ptuo&dl=0"
      },
      {
        "id": "track-1768393255462-8-0p984",
        "title": "褪色的喧囂 (Fading Hustle)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/tfi2upbeael7lylo43o9x/9_V3_V3_-_-_V1-Cover-_V2.mp3?rlkey=u5wwf5zs81xxooknjd82t8oeq&st=potj6g2b&raw=1",
        "duration": "--:--",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/tfi2upbeael7lylo43o9x/9_V3_V3_-_-_V1-Cover-_V2.mp3?rlkey=u5wwf5zs81xxooknjd82t8oeq&st=potj6g2b&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/tfi2upbeael7lylo43o9x/9_V3_V3_-_-_V1-Cover-_V2.mp3?rlkey=u5wwf5zs81xxooknjd82t8oeq&st=potj6g2b&dl=0"
      },
      {
        "id": "track-1768393255462-9-a2koa",
        "title": "Outro：黎明前的最後一支煙 (Outro: Last Cigarette Before Dawn)",
        "audioUrl": "https://dl.dropboxusercontent.com/scl/fi/pf3ez32pwhrxjt9hqnaga/10_10_V2_-_GK_V1-Cover.mp3?rlkey=6xefn8ydf0tev29b6raff1uvd&st=o95hxlui&raw=1",
        "duration": "--:--",
        "genre": "Dropbox 💎",
        "mp3Url": "https://www.dropbox.com/scl/fi/pf3ez32pwhrxjt9hqnaga/10_10_V2_-_GK_V1-Cover.mp3?rlkey=6xefn8ydf0tev29b6raff1uvd&st=o95hxlui&dl=0",
        "wavUrl": "https://www.dropbox.com/scl/fi/pf3ez32pwhrxjt9hqnaga/10_10_V2_-_GK_V1-Cover.mp3?rlkey=6xefn8ydf0tev29b6raff1uvd&st=o95hxlui&dl=0"
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
  },
  {
    "id": "neon-zen-2025",
    "title": "霓虹禪意 Neon Zen",
    "coverImage": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    "description": "2077 年的深夜雨後，在繁華與寧靜的交界點尋找靈魂的頻率。",
    "story": "如果機器人會做夢，那夢境中一定充滿了雨水的氣息與電漿的嗡鳴。Neon Zen 試圖捕捉這種矛盾：在高科技的冷冽中，依然跳動著人類原始的情感節奏。這是在賽博龐克世界裡的一抹翠綠。",
    "releaseDate": "2025/03/15",
    "tracks": [
      {
        "id": "nz-1",
        "title": "雨後的仿生人 Androids in the Rain",
        "duration": "3:20",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "wavUrl": "",
        "mp3Url": "",
        "genre": "Lofi Cyberpunk"
      },
      {
        "id": "nz-2",
        "title": "電路板上的櫻花 Sakura Circuits",
        "duration": "5:05",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "wavUrl": "",
        "mp3Url": "",
        "genre": "Chillstep"
      }
    ]
  }
]
    ]
  },
  