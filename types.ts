
export interface Track {
  id: string;
  title: string;
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
