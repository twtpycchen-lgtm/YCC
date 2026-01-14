
import React, { useState, useEffect } from 'react';
import { MOCK_ALBUMS } from './constants';
import { Album, Track, PlayerState } from './types';
import Navbar from './components/Navbar';
import AlbumCard from './components/AlbumCard';
import AlbumDetailView from './components/AlbumDetailView';
import AudioPlayer from './components/AudioPlayer';
import UploadModal from './components/UploadModal';

const ITEMS_PER_PAGE = 6;
const STORAGE_KEY = 'suno_curator_albums';

const App: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [albumToEdit, setAlbumToEdit] = useState<Album | undefined>(undefined);
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
  });

  // 從 LocalStorage 載入資料
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAlbums(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load albums", e);
        setAlbums([]);
      }
    } else {
      setAlbums(MOCK_ALBUMS);
    }
  }, []);

  // 儲存到 LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
  }, [albums]);

  const totalPages = Math.max(1, Math.ceil(albums.length / ITEMS_PER_PAGE));
  const displayedAlbums = albums.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePlayTrack = (album: Album, track: Track) => {
    setPlayerState((prev) => ({
      ...prev,
      currentAlbum: album,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
    }));
  };

  const handleTogglePlay = () => {
    setPlayerState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSaveAlbum = (albumData: Album) => {
    if (albumToEdit) {
      const updatedAlbums = albums.map(a => a.id === albumToEdit.id ? albumData : a);
      setAlbums(updatedAlbums);
      if (selectedAlbum?.id === albumToEdit.id) setSelectedAlbum(albumData);
    } else {
      setAlbums([albumData, ...albums]);
    }
    setIsUploadOpen(false);
    setAlbumToEdit(undefined);
  };

  const handleDeleteAlbum = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("確定要刪除這張專輯嗎？此動作將永久移除資料。")) {
      const updated = albums.filter(a => a.id !== id);
      setAlbums(updated);
      
      // 如果正在檢視或播放該專輯，則回到主頁或停止播放
      if (selectedAlbum?.id === id) setSelectedAlbum(null);
      if (playerState.currentAlbum?.id === id) {
        setPlayerState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          currentTrack: null, 
          currentAlbum: null,
          progress: 0 
        }));
      }
    }
  };

  const handleOpenEdit = (album: Album) => {
    setAlbumToEdit(album);
    setIsUploadOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-white selection:text-black">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar 
        onHome={() => { setSelectedAlbum(null); setCurrentPage(1); }} 
        onUpload={() => { setAlbumToEdit(undefined); setIsUploadOpen(true); }}
      />

      <main className="flex-grow container mx-auto px-6 pt-28 pb-48">
        {!selectedAlbum ? (
          <div className="animate-fade-in">
            <section className="mb-16">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter uppercase font-luxury text-glow">
                Suno <span className="text-gray-500">Curator</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl font-light leading-relaxed">
                將您的 AI 音樂轉化為沉浸式的藝術典藏。支援 Google Drive 雲端串流，讓您的大型音樂作品能隨時隨地優雅撥放。
              </p>
            </section>

            {albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 glass rounded-[4rem] border-dashed border-white/10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-gray-500 font-luxury tracking-[0.4em] uppercase mb-10 text-sm">您的收藏庫目前空空如也</p>
                <button 
                  onClick={() => setIsUploadOpen(true)}
                  className="px-16 py-5 bg-white text-black font-luxury uppercase tracking-widest rounded-full hover:scale-110 hover:shadow-2xl transition-all font-bold"
                >
                  發佈首張專輯
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {displayedAlbums.map((album) => (
                  <AlbumCard 
                    key={album.id} 
                    album={album} 
                    onClick={() => setSelectedAlbum(album)} 
                    onDelete={(e) => handleDeleteAlbum(album.id, e)}
                  />
                ))}
              </div>
            )}

            {albums.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center items-center gap-6 mt-20">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 flex items-center justify-center glass rounded-full disabled:opacity-20 hover:bg-white/10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-gray-400 font-luxury tracking-widest text-sm">
                  {currentPage} <span className="mx-4 text-gray-700">/</span> {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 flex items-center justify-center glass rounded-full disabled:opacity-20 hover:bg-white/10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <AlbumDetailView 
            album={selectedAlbum} 
            onBack={() => setSelectedAlbum(null)} 
            onPlayTrack={(track) => handlePlayTrack(selectedAlbum, track)}
            onDelete={() => handleDeleteAlbum(selectedAlbum.id)}
            onEdit={() => handleOpenEdit(selectedAlbum)}
            currentTrackId={playerState.currentTrack?.id}
            isPlaying={playerState.isPlaying}
          />
        )}
      </main>

      {isUploadOpen && (
        <UploadModal 
          onClose={() => { setIsUploadOpen(false); setAlbumToEdit(undefined); }} 
          onUpload={handleSaveAlbum}
          albumToEdit={albumToEdit}
        />
      )}

      <AudioPlayer 
        state={playerState} 
        onTogglePlay={handleTogglePlay}
        onProgressChange={(p) => setPlayerState(prev => ({ ...prev, progress: p }))}
      />
    </div>
  );
};

export default App;
