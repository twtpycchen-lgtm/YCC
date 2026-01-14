import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_ALBUMS } from './constants';
import { Album, Track, PlayerState } from './types';
import Navbar from './components/Navbar';
import AlbumCard from './components/AlbumCard';
import AlbumDetailView from './components/AlbumDetailView';
import AudioPlayer from './components/AudioPlayer';
import UploadModal from './components/UploadModal';

const ITEMS_PER_PAGE = 6;
const STORAGE_KEY = 'jazz_fei_v3_storage'; 

const App: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [albumToEdit, setAlbumToEdit] = useState<Album | undefined>(undefined);
  const [isCuratorMode, setIsCuratorMode] = useState(false); 
  const [isJazzMode, setIsJazzMode] = useState(false); 
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
  });

  // 檢查分享數據的邏輯，抽離出來避免迴圈
  const checkSharedData = useCallback((initialAlbums: Album[]) => {
    const hash = window.location.hash;
    if (hash.startsWith('#share-')) {
      try {
        const base64 = hash.replace('#share-', '');
        const json = decodeURIComponent(escape(atob(base64)));
        const sharedAlbum: Album = JSON.parse(json);
        const exists = initialAlbums.some(a => a.id === sharedAlbum.id);
        if (!exists) {
          const updated = [sharedAlbum, ...initialAlbums];
          setAlbums(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        setSelectedAlbum(sharedAlbum);
      } catch (e) {
        console.error("解析分享數據失敗", e);
      }
    } else if (hash.startsWith('#album-')) {
      const id = hash.replace('#album-', '');
      const album = initialAlbums.find(a => a.id === id);
      if (album) setSelectedAlbum(album);
    }
  }, []);

  // 1. 僅在掛載時執行一次初始化
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let initialAlbums: Album[] = [];
    try {
      initialAlbums = saved ? JSON.parse(saved) : MOCK_ALBUMS;
    } catch (e) {
      initialAlbums = MOCK_ALBUMS;
    }
    setAlbums(initialAlbums);
    setIsInitialized(true);
    checkSharedData(initialAlbums);
  }, [checkSharedData]);

  // 2. 監聽 Hash 變化 (不依賴 albums 變動以防止閃動)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#share-') && !hash.startsWith('#album-')) {
        setSelectedAlbum(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 3. 數據變動時保存
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
    }
  }, [albums, isInitialized]);

  const toggleJazzMode = () => {
    const nextMode = !isJazzMode;
    setIsJazzMode(nextMode);
    
    if (nextMode && !playerState.isPlaying) {
      let jazzTrack: Track | null = null;
      let jazzAlbum: Album | null = null;

      for (const album of albums) {
        const found = album.tracks.find(t => t.genre.toLowerCase().includes('爵士') || t.genre.toLowerCase().includes('jazz'));
        if (found) {
          jazzTrack = found;
          jazzAlbum = album;
          break;
        }
      }

      if (jazzTrack && jazzAlbum) {
        setPlayerState(prev => ({
          ...prev,
          currentAlbum: jazzAlbum,
          currentTrack: jazzTrack,
          isPlaying: true,
          progress: 0
        }));
      }
    }
  };

  const handleSelectAlbum = (album: Album | null) => {
    setSelectedAlbum(album);
    window.location.hash = album ? `album-${album.id}` : '';
  };

  const handleSaveAlbum = (albumData: Album) => {
    if (albumToEdit) {
      setAlbums(prev => prev.map(a => a.id === albumToEdit.id ? albumData : a));
      if (selectedAlbum?.id === albumToEdit.id) setSelectedAlbum(albumData);
    } else {
      setAlbums(prev => [albumData, ...prev]);
    }
    setIsUploadOpen(false);
    setAlbumToEdit(undefined);
  };

  const handleDeleteAlbum = (id: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (window.confirm(`確定要移除此項典藏嗎？`)) {
      if (playerState.currentAlbum?.id === id) {
        setPlayerState({ currentTrack: null, currentAlbum: null, isPlaying: false, progress: 0 });
      }
      setAlbums(prev => prev.filter(a => a.id !== id));
      if (selectedAlbum?.id === id) handleSelectAlbum(null);
    }
  };

  const handleImportData = () => {
    try {
      const parsed = JSON.parse(importValue);
      if (Array.isArray(parsed)) {
        setAlbums(parsed);
        setIsImportOpen(false);
        setImportValue('');
        alert("匯入成功！已更新典藏。");
      }
    } catch (e) {
      alert("JSON 格式不正確。");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative selection:bg-[#d4af37] selection:text-black transition-colors duration-[1000ms] ${isJazzMode ? 'bg-[#0a0a0c]' : 'bg-[#0d0d0f]'}`}>
      <div className={`fixed inset-0 pointer-events-none -z-10 transition-opacity duration-[1000ms] ${isJazzMode ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-950/20 via-transparent to-amber-900/5"></div>
      </div>

      <Navbar 
        onHome={() => handleSelectAlbum(null)} 
        onUpload={() => { setAlbumToEdit(undefined); setIsUploadOpen(true); }}
        onExport={() => setIsExportOpen(true)}
        onImport={() => setIsImportOpen(true)}
        isCuratorMode={isCuratorMode}
        toggleCuratorMode={() => setIsCuratorMode(!isCuratorMode)}
        isJazzMode={isJazzMode}
        onJazzToggle={toggleJazzMode}
      />

      <main className="flex-grow container mx-auto px-6 md:px-12 pt-36 pb-48">
        {!selectedAlbum ? (
          <div className="animate-fade-in">
            <section className="mb-24 text-center md:text-left relative">
              <h1 className={`text-7xl md:text-[10rem] font-black tracking-tighter uppercase font-luxury leading-[0.85] mb-6 transition-all duration-[1000ms] ${isJazzMode ? 'text-indigo-100/90 text-glow' : 'text-white text-glow'}`}>
                爵非 <br/> <span className={`outline-text ${isJazzMode ? 'text-indigo-900/50' : 'text-white/20'}`}>鼓狂</span>
              </h1>
              <p className={`text-xl max-w-xl font-extralight tracking-[0.2em] leading-relaxed uppercase ${isJazzMode ? 'text-indigo-300/60' : 'text-gray-400'}`}>
                {isJazzMode ? "Noir Session: 當鼓點撕開夜幕，靈魂即興而生。" : "頂級 AI 爵士樂藝術典藏與展示平台。"}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {albums.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((album) => (
                <AlbumCard 
                  key={album.id} 
                  album={album} 
                  onClick={() => handleSelectAlbum(album)} 
                  onDelete={isCuratorMode ? (e) => handleDeleteAlbum(album.id, e) : undefined}
                  isJazzMode={isJazzMode}
                />
              ))}
            </div>
          </div>
        ) : (
          <AlbumDetailView 
            album={selectedAlbum} 
            onBack={() => handleSelectAlbum(null)} 
            onPlayTrack={(track) => setPlayerState(prev => ({ ...prev, currentAlbum: selectedAlbum, currentTrack: track, isPlaying: true, progress: 0 }))}
            onDelete={() => handleDeleteAlbum(selectedAlbum.id)}
            onEdit={() => { setAlbumToEdit(selectedAlbum); setIsUploadOpen(true); }}
            currentTrackId={playerState.currentTrack?.id}
            isPlaying={playerState.isPlaying}
            isCuratorMode={isCuratorMode}
          />
        )}
      </main>

      {/* Export Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="glass w-full max-w-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl space-y-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-luxury text-white tracking-widest uppercase">數據匯出</h2>
            <textarea readOnly value={JSON.stringify(albums, null, 2)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xs font-mono text-gray-400 h-64 focus:outline-none" />
            <div className="flex gap-4">
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(albums)); alert("已複製"); }} className="flex-grow py-4 bg-white text-black text-sm uppercase tracking-widest font-black rounded-xl hover:bg-[#d4af37] transition-all">複製數據</button>
              <button onClick={() => setIsExportOpen(false)} className="px-8 py-4 bg-white/5 text-white text-sm uppercase tracking-widest font-bold rounded-xl hover:bg-white/10 border border-white/5">關閉</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="glass w-full max-w-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl space-y-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-luxury text-white tracking-widest uppercase">數據匯入</h2>
            <textarea value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder='貼上 JSON 數據...' className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xs font-mono text-gray-400 h-64 focus:outline-none" />
            <div className="flex gap-4">
              <button onClick={handleImportData} className="flex-grow py-4 bg-[#d4af37] text-black text-sm uppercase tracking-widest font-black rounded-xl hover:bg-[#b8952d] transition-all shadow-lg">確認匯入</button>
              <button onClick={() => setIsImportOpen(false)} className="px-8 py-4 bg-white/5 text-white text-sm uppercase tracking-widest font-bold rounded-xl border border-white/5">取消</button>
            </div>
          </div>
        </div>
      )}

      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} onUpload={handleSaveAlbum} albumToEdit={albumToEdit} />}
      <AudioPlayer state={playerState} onTogglePlay={() => setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))} onProgressChange={(p) => setPlayerState(prev => ({ ...prev, progress: p }))} />
    </div>
  );
};

export default App;