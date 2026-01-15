
export interface Track {
  id: string;
  title: string;         // 當前顯示的標題（AI 生成的優美詩句）
  originalTitle: string; // 原始檔名
  duration: string;
  audioUrl: string;
  wavUrl: string;
  mp3Url: string;
  genre: string;
  remarks?: string;      // 自行輸入的備註/靈感
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
  isAlbumMode: boolean; // 新增：是否為專輯連續播放模式
}
