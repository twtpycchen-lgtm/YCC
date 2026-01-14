
export interface Track {
  id: string;
  title: string;         // 當前顯示的標題（可能是優化後的）
  originalTitle: string; // 永久保存的原始檔名
  duration: string;
  audioUrl: string;
  wavUrl: string;
  mp3Url: string;
  genre: string;
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
}