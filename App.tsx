
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
  const [isCuratorMode, setIsCuratorMode] = useState(false); 
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
  });

  // 載入資料並處理 URL 路由
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let loadedAlbums: Album[] = [];
    if (saved) {
      try {
        loadedAlbums = JSON.parse(saved);
        setAlbums(loadedAlbums);
      } catch (e) {
        setAlbums(MOCK_ALBUMS);
        loadedAlbums = MOCK_ALBUMS;
      }
    } else {
      setAlbums(MOCK_ALBUMS);
      loadedAlbums = MOCK_ALBUMS;
    }

    // 處理 URL Hash (例如: #album-123)
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#album-')) {
        const id = hash.replace('#album-', '');
        const album = loadedAlbums.find(a => a.id === id);
        if (album) setSelectedAlbum(album);
      } else if (hash === '' || hash === '#') {
        setSelectedAlbum(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // 初次載入執行一次

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
  }, [albums]);

  const handleSelectAlbum = (album: Album | null) => {
    setSelectedAlbum(album);
    if (album) {
      window.location.hash = `album-${album.id}`;
    } else {
      window.location.hash = '';
    }
  };

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
      if (selectedAlbum?.id === id) {
        setSelectedAlbum(null);
        window.location.hash = '';
      }
      if (playerState.currentAlbum?.id === id) {
        setPlayerState(prev => ({ ...prev, isPlaying: false, currentTrack: null, currentAlbum: null }));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-white selection:text-black">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar 
        onHome={() => handleSelectAlbum(null)} 
        onUpload={() => { setAlbumToEdit(undefined); setIsUploadOpen(true); }}
        isCuratorMode={isCuratorMode}
        toggleCuratorMode={() => setIsCuratorMode(!isCuratorMode)}
      />

      <main className="flex-grow container mx-auto px-6 pt-28 pb-48">
        {!selectedAlbum ? (
          <div className="animate-fade-in">
            <section className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                 <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase font-luxury text-glow">
                  Suno <span className="text-gray-500">Curator</span>
                </h1>
                {isCuratorMode && (
                  <span className="px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-md animate-pulse">
                    Curator Mode
                  </span>
                )}
              </div>
              <p className="text-xl text-gray-400 max-w-2xl font-light leading-relaxed">
                {isCuratorMode 
                  ? "管理您的 AI 音樂典藏。您可以新增專輯、編輯內容或潤飾 AI 故事。"
                  : "沉浸在 AI 創作的音樂宇宙。每一張專輯都是一段獨特的感官旅程。"}
              </p>
            </section>

            {albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 glass rounded-[4rem] border-dashed border-white/10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-gray-500 font-luxury tracking-[0.4em] uppercase mb-10 text-sm">目前尚無公開作品</p>
                {isCuratorMode && <button onClick={() => setIsUploadOpen(true)} className="px-16 py-5 bg-white text-black font-luxury uppercase tracking-widest rounded-full hover:scale-110 hover:shadow-2xl transition-all font-bold">發佈首張專輯</button>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {displayedAlbums.map((album) => (
                  <AlbumCard 
                    key={album.id} 
                    album={album} 
                    onClick={() => handleSelectAlbum(album)} 
                    onDelete={isCuratorMode ? (e) => handleDeleteAlbum(album.id, e) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <AlbumDetailView 
            album={selectedAlbum} 
            onBack={() => handleSelectAlbum(null)} 
            onPlayTrack={(track) => handlePlayTrack(selectedAlbum, track)}
            onDelete={() => handleDeleteAlbum(selectedAlbum.id)}
            onEdit={() => { setAlbumToEdit(selectedAlbum); setIsUploadOpen(true); }}
            currentTrackId={playerState.currentTrack?.id}
            isPlaying={playerState.isPlaying}
            isCuratorMode={isCuratorMode}
          />
        )}
      </main>

      {isUploadOpen && <UploadModal onClose={() => { setIsUploadOpen(false); setAlbumToEdit(undefined); }} onUpload={handleSaveAlbum} albumToEdit={albumToEdit} />}
      <AudioPlayer state={playerState} onTogglePlay={handleTogglePlay} onProgressChange={(p) => setPlayerState(prev => ({ ...prev, progress: p }))} />

      <footer className="py-12 flex flex-col items-center opacity-30 hover:opacity-100 transition-opacity">
        <button onClick={() => setIsCuratorMode(!isCuratorMode)} className="text-[9px] uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-colors">
          &copy; {new Date().getFullYear()} Suno Curator Studio &mdash; {isCuratorMode ? 'Exit Management' : 'Creator Entry'}
        </button>
      </footer>
    </div>
  );
};

export default App;
