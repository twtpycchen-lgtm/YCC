
import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_ALBUMS } from './constants';
import { Album, Track, PlayerState } from './types';
import Navbar from './components/Navbar';
import AlbumCard from './components/AlbumCard';
import AlbumDetailView from './components/AlbumDetailView';
import AudioPlayer from './components/AudioPlayer';
import UploadModal from './components/UploadModal';

const STORAGE_KEY = 'jazz_fei_v3_master_storage_prod'; 

const App: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [importPreview, setImportPreview] = useState<Album[] | null>(null);
  const [albumToEdit, setAlbumToEdit] = useState<Album | undefined>(undefined);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  
  // 核心邏輯：預設關閉且鎖定
  const [isCuratorMode, setIsCuratorMode] = useState(false); 
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false); // 是否解鎖管理開關

  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [syncStats, setSyncStats] = useState<{count: number} | null>(null);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
    isAlbumMode: false,
  });

  // 1. 初始化與解鎖檢查
  useEffect(() => {
    // 檢查 URL 參數，如果包含 ?admin=1 則解鎖開關
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') {
      setIsAdminUnlocked(true);
    }

    if (isInitialized) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    let currentAlbums = MOCK_ALBUMS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) currentAlbums = parsed;
      } catch (e) { }
    }
    setAlbums(currentAlbums);
    setIsInitialized(true);
  }, [isInitialized]);

  const handleHashChange = useCallback(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#album-')) {
      const albumId = hash.replace('#album-', '');
      const found = albums.find(a => a.id === albumId);
      if (found) setSelectedAlbum(found);
    } else if (!hash) {
      setSelectedAlbum(null);
    }
  }, [albums]);

  useEffect(() => {
    if (isInitialized) {
      handleHashChange();
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [isInitialized, handleHashChange]);

  // 只有在管理員模式下才寫入 localStorage，防止普通使用者意外覆蓋
  useEffect(() => {
    if (isInitialized && isCuratorMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
    }
  }, [albums, isInitialized, isCuratorMode]);

  const handleSelectAlbum = (album: Album | null) => {
    window.location.hash = album ? `album-${album.id}` : '';
  };

  const handlePlayAll = (album: Album | null) => {
    if (album?.tracks?.length) {
      setPlayerState({
        currentAlbum: album,
        currentTrack: album.tracks[0],
        isPlaying: true,
        progress: 0,
        isAlbumMode: true,
      });
    }
  };

  const handlePlaySingle = (track: Track, album: Album) => {
    setPlayerState({ currentAlbum: album, currentTrack: track, isPlaying: true, progress: 0, isAlbumMode: false });
  };

  const handleStopPlayer = () => {
    setPlayerState({ currentTrack: null, currentAlbum: null, isPlaying: false, progress: 0, isAlbumMode: false });
  };

  const handleTrackEnded = () => {
    setPlayerState(prev => {
      if (prev.isAlbumMode && prev.currentAlbum && prev.currentTrack) {
        const tracks = prev.currentAlbum.tracks;
        const idx = tracks.findIndex(t => t.id === prev.currentTrack?.id);
        if (idx !== -1 && idx < tracks.length - 1) {
          return { ...prev, currentTrack: tracks[idx + 1], progress: 0, isPlaying: true };
        }
      }
      return { ...prev, isPlaying: false };
    });
  };

  const handleSaveAlbum = (albumData: Album) => {
    setAlbums(prev => {
      const index = prev.findIndex(a => a.id === albumData.id);
      if (index !== -1) {
        const newAlbums = [...prev];
        newAlbums[index] = albumData;
        return newAlbums;
      }
      return [albumData, ...prev];
    });
    if (selectedAlbum?.id === albumData.id) setSelectedAlbum(albumData);
    setIsUploadOpen(false);
  };

  const handleDeleteAlbum = () => {
    if (albumToDelete) {
      setAlbums(albums.filter(a => a.id !== albumToDelete.id));
      if (selectedAlbum?.id === albumToDelete.id) handleSelectAlbum(null);
      setAlbumToDelete(null);
    }
  };

  const generateFullCode = () => `import { Album } from './types';\n\nexport const MOCK_ALBUMS: Album[] = ${JSON.stringify(albums, null, 2)};`;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateFullCode());
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) { alert("複製失敗"); }
  };

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-1000 ${isCuratorMode ? 'bg-[#05060b]' : 'bg-[#050508]'}`}>
      <div className="mesh-bg fixed inset-0 z-[-1] pointer-events-none">
        <div className={`mesh-blob blob-1 transition-all duration-1000 ${isCuratorMode ? 'opacity-20 scale-125 bg-blue-900/40' : 'opacity-10 bg-[#1a1b3b]'}`}></div>
        <div className={`mesh-blob blob-2 transition-all duration-1000 ${isCuratorMode ? 'opacity-15 bg-indigo-900/30' : 'opacity-10 bg-[#2e1065]'}`}></div>
        {isCuratorMode && <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#d4af37 0.5px, transparent 0.5px)', backgroundSize: '24px 24px'}}></div>}
      </div>

      <Navbar 
        onHome={() => handleSelectAlbum(null)} 
        onUpload={() => { setAlbumToEdit(undefined); setIsUploadOpen(true); }} 
        onExport={() => setIsExportOpen(true)} 
        onImport={() => { setIsImportOpen(true); setImportValue(''); setImportPreview(null); }} 
        isCuratorMode={isCuratorMode} 
        toggleCuratorMode={() => setIsCuratorMode(!isCuratorMode)}
        isAdminUnlocked={isAdminUnlocked} // 決定是否顯示開關
      />

      <main className="flex-grow container mx-auto px-6 md:px-20 pt-48 pb-64">
        {!selectedAlbum ? (
          <div className="animate-reveal">
            <header className="mb-44 max-w-6xl">
              <div className="flex items-center gap-6 mb-8">
                {isCuratorMode && <span className="px-4 py-1.5 rounded-full border border-indigo-400/40 text-indigo-300 text-[8px] uppercase tracking-[0.3em] font-black animate-pulse">Studio Active</span>}
              </div>
              <h1 className="text-[clamp(4rem,14vw,11rem)] font-black tracking-tighter uppercase font-luxury text-white mb-20 leading-[1.05] flex flex-col items-start gap-4">
                <span className={`luxury-gold-text shimmer-effect ${isCuratorMode ? 'grayscale-[0.5]' : ''}`}>爵非</span>
                <span className="outline-text-luxury ml-6 md:ml-16">鼓狂</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 max-w-xl font-light border-l border-white/10 pl-10 italic">
                {isCuratorMode ? "您已進入隱藏的工作室模式，更動將儲存至瀏覽器存檔。" : "沉浸在 AI 驅動的爵士樂章中。"}
              </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-32">
              {albums.map((album) => (
                <AlbumCard 
                  key={album.id} 
                  album={album} 
                  onClick={() => handleSelectAlbum(album)} 
                  isJazzMode={isCuratorMode} 
                  onDelete={isCuratorMode ? (e) => setAlbumToDelete(album) : undefined} 
                />
              ))}
            </div>
          </div>
        ) : (
          <AlbumDetailView 
            album={selectedAlbum} 
            onBack={() => handleSelectAlbum(null)} 
            onPlayTrack={(track) => handlePlaySingle(track, selectedAlbum)} 
            onPlayAll={() => handlePlayAll(selectedAlbum)} 
            onDelete={() => setAlbumToDelete(selectedAlbum)} 
            onEdit={() => { setAlbumToEdit(selectedAlbum); setIsUploadOpen(true); }} 
            currentTrackId={playerState.currentTrack?.id} 
            isPlaying={playerState.isPlaying} 
            isCuratorMode={isCuratorMode} 
          />
        )}
      </main>

      {/* 僅在管理模式下可能觸發的彈窗 */}
      {isExportOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-reveal" onClick={() => setIsExportOpen(false)}>
          <div className="glass w-full max-w-6xl rounded-[3rem] border border-white/10 flex flex-col md:flex-row overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="md:w-5/12 p-8 md:p-14 border-r border-white/5 bg-white/[0.01]">
              <h2 className="text-3xl font-luxury text-[#d4af37] tracking-widest">同步中心</h2>
              <div className="mt-10">
                <button onClick={handleCopyToClipboard} className="w-full py-4 bg-[#d4af37] text-black text-[10px] uppercase font-black rounded-xl">
                  {showCopySuccess ? "✔ 複製完成" : "複製 constants.ts 代碼"}
                </button>
              </div>
            </div>
            <div className="flex-1 bg-[#08080a] overflow-auto p-10 font-mono text-[10px] text-gray-700 select-all">
              <pre>{generateFullCode()}</pre>
            </div>
          </div>
        </div>
      )}

      {albumToDelete && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-10 bg-black/98 backdrop-blur-2xl animate-reveal" onClick={() => setAlbumToDelete(null)}>
          <div className="glass w-full max-w-lg rounded-[4rem] p-16 border border-white/10 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-luxury text-white mb-12">確認刪除?</h2>
            <button onClick={handleDeleteAlbum} className="w-full py-6 bg-red-600 text-white text-[10px] uppercase font-black rounded-3xl">PURGE</button>
          </div>
        </div>
      )}

      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} onUpload={handleSaveAlbum} albumToEdit={albumToEdit} />}
      <AudioPlayer state={playerState} onTogglePlay={() => setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))} onProgressChange={(p) => setPlayerState(prev => ({ ...prev, progress: p }))} onRemove={handleStopPlayer} onEnded={handleTrackEnded} />
    </div>
  );
};

export default App;
