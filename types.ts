
export interface Track {
  id: string;
  title: string;         // 當前顯示的標題（AI 生成的優美詩句）
  audioUrl: string;
  originalTitle?: string; // 原始檔名改為可選
  duration?: string;      // 時長改為可選
  wavUrl?: string;        // URL 改為可選
  mp3Url?: string;        // URL 改為可選
  genre?: string;        // 流派改為可選
  remarks?: string;      // 自行輸入的備註
}

export interface Album {
  id: string;
  title: string;
  coverImage: string;
  description: string;
  story: string;
  releaseDate: string;
  tracks: Track[];
}

export interface PlayerState {
  currentTrack: Track | null;
  currentAlbum: Album | null;
  isPlaying: boolean;
  progress: number;
  isAlbumMode: boolean;
}
