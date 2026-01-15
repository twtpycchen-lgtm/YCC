
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  
  const [isCuratorMode, setIsCuratorMode] = useState(true); 
  const [hasAdminAccess, setHasAdminAccess] = useState(true);
  
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const isProcessingHash = useRef(false);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
    isAlbumMode: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExportOpen(false);
        setIsImportOpen(false);
        setIsUploadOpen(false);
        setAlbumToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isInitialized) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    let localData: Album[] = [];
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      localData = Array.isArray(parsed) ? parsed : [];
    } catch (e) { localData = []; }
    
    const combined = [...localData];
    MOCK_ALBUMS.forEach(ma => {
      if (!combined.find(a => a.id === ma.id)) combined.push(ma);
    });
    setAlbums(combined);
    setIsInitialized(true);
    const hash = window.location.hash;
    if (hash.startsWith('#album-')) {
      const id = hash.replace('#album-', '');
      const album = combined.find(a => a.id === id);
      if (album) setSelectedAlbum(album);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && isCuratorMode) {
      const toSave = albums.filter(a => {
        const original = MOCK_ALBUMS.find(ma => ma.id === a.id);
        return !original || JSON.stringify(original) !== JSON.stringify(a);
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }
  }, [albums, isInitialized, isCuratorMode]);

  const handleSelectAlbum = (album: Album | null) => {
    isProcessingHash.current = true;
    setSelectedAlbum(album);
    window.location.hash = album ? `album-${album.id}` : '';
    setTimeout(() => { isProcessingHash.current = false; }, 100);
  };

  // 全部播放：啟動專輯模式
  const handlePlayAll = (album: Album | null) => {
    if (album && album.tracks && album.tracks.length > 0) {
      setPlayerState({
        currentAlbum: album,
        currentTrack: album.tracks[0],
        isPlaying: true,
        progress: 0,
        isAlbumMode: true, // 開啟專輯模式
      });
    }
  };

  // 單曲播放：關閉專輯模式，播完即止
  const handlePlaySingle = (track: Track, album: Album) => {
    setPlayerState({
      currentAlbum: album,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      isAlbumMode: false, // 關閉專輯模式，維持單曲獨立撥放
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
    setAlbumToEdit(undefined);
  };

  const handleDeleteAlbum = () => {
    if (albumToDelete) {
      setAlbums(prev => prev.filter(a => a.id !== albumToDelete.id));
      if (selectedAlbum?.id === albumToDelete.id) handleSelectAlbum(null);
      setAlbumToDelete(null);
    }
  };

  const handleStopPlayer = () => {
    setPlayerState({ currentTrack: null, currentAlbum: null, isPlaying: false, progress: 0, isAlbumMode: false });
  };

  const handleTrackEnded = useCallback(() => {
    setPlayerState(prev => {
      // 如果不是專輯模式，播完就停止
      if (!prev.isAlbumMode) {
        return { ...prev, isPlaying: false };
      }
      
      // 專輯模式：尋找下一首
      if (!prev.currentAlbum || !prev.currentTrack) return { ...prev, isPlaying: false };
      const tracks = prev.currentAlbum.tracks || [];
      const idx = tracks.findIndex(t => t.id === prev.currentTrack?.id);
      
      if (idx !== -1 && idx < tracks.length - 1) {
        return { ...prev, currentTrack: tracks[idx+1], isPlaying: true, progress: 0 };
      }
      
      return { ...prev, isPlaying: false };
    });
  }, []);

  const handleImportData = () => {
    if (!importPreview) return alert("無效數據");
    if (confirm("這將取代所有本地草稿，確定同步？")) {
      setAlbums(importPreview);
      setIsImportOpen(false);
      setImportValue('');
      setImportPreview(null);
    }
  };

  const handleCopyToClipboard = async () => {
    const json = JSON.stringify(albums, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) { alert("請手動選取代碼複製。"); }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#050508] selection:bg-[#d4af37] selection:text-black">
      <Navbar 
        onHome={() => handleSelectAlbum(null)} 
        onUpload={() => { setAlbumToEdit(undefined); setIsUploadOpen(true); }}
        onExport={() => setIsExportOpen(true)}
        onImport={() => setIsImportOpen(true)}
        isCuratorMode={isCuratorMode}
        toggleCuratorMode={() => setIsCuratorMode(!isCuratorMode)}
        hasAdminAccess={hasAdminAccess}
      />

      <main className="flex-grow container mx-auto px-6 md:px-20 pt-48 pb-64">
        {!selectedAlbum ? (
          <div className="animate-reveal">
            <header className="mb-44 max-w-6xl">
              <div className="flex items-center gap-6 mb-16">
                <span className="h-[1px] w-12 bg-[#d4af37]/60"></span>
                <span className="text-[10px] uppercase tracking-[0.8em] font-black text-[#d4af37]">Archive Management</span>
              </div>
              <h1 className="text-[clamp(4rem,14vw,11rem)] font-black tracking-tighter uppercase font-luxury text-white mb-20 leading-[1.05] select-none flex flex-col items-start gap-4">
                <span className="luxury-gold-text shimmer-effect">爵非</span>
                <span className="outline-text-luxury ml-6 md:ml-16">鼓狂</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 max-w-xl font-light leading-relaxed tracking-wider border-l border-white/10 pl-10 italic">
                A sanctuary for AI-driven jazz masterpieces. Refined, curated, and eternalized in code.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 md:gap-x-16 gap-y-24 md:gap-y-32">
              {albums.map((album) => (
                <AlbumCard 
                  key={album.id} 
                  album={album} 
                  onClick={() => handleSelectAlbum(album)} 
                  isJazzMode={true} 
                  onDelete={isCuratorMode ? (e) => { e.stopPropagation(); setAlbumToDelete(album); } : undefined} 
                />
              ))}
              {albums.length === 0 && (
                <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
                   <p className="text-gray-600 uppercase tracking-[0.5em] text-xs font-black">Waiting for Synchronization / 等待同步資料</p>
                </div>
              )}
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

      {/* --- Export Modal --- */}
      {isExportOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 md:p-12 bg-black/95 backdrop-blur-3xl animate-reveal overflow-y-auto" onClick={() => setIsExportOpen(false)}>
          <div className="glass w-full max-w-6xl rounded-[4rem] p-10 md:p-20 border border-white/10 shadow-2xl relative flex flex-col md:flex-row gap-12 my-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsExportOpen(false)} className="absolute top-10 right-10 w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-[#d4af37] transition-all z-20 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="md:w-1/3 space-y-10">
              <h2 className="text-4xl font-luxury text-white mb-4 tracking-widest">Global Publish<br/><span className="text-[#d4af37]">全域發布</span></h2>
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 text-xs text-gray-400">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-black">發布指南</p>
                  <ol className="space-y-4 list-decimal pl-4">
                    <li>點擊 <span className="text-white">Copy JSON</span>。</li>
                    <li>打開 <span className="text-white font-mono">constants.ts</span>。</li>
                    <li>將內容完整覆蓋至 <span className="text-white">MOCK_ALBUMS</span> 中。</li>
                  </ol>
              </div>
              <button onClick={handleCopyToClipboard} className="w-full py-6 bg-[#d4af37] text-black text-[10px] uppercase tracking-[0.5em] font-black rounded-3xl hover:scale-105 transition-all shadow-xl">
                {showCopySuccess ? "COPIED TO CLIPBOARD" : "COPY JSON DATA"}
              </button>
            </div>
            <div className="md:w-2/3 h-[400px] md:h-auto rounded-[3rem] bg-black/60 border border-white/5 p-8 relative overflow-hidden">
               <pre className="text-[10px] font-mono text-gray-500 overflow-y-auto h-full scrollbar-custom p-4 select-all">
                  {JSON.stringify(albums, null, 2)}
               </pre>
            </div>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-reveal" onClick={() => setIsImportOpen(false)}>
          <div className="glass w-full max-w-2xl rounded-[3rem] p-12 border border-white/10 relative" onClick={(e) => e.stopPropagation()}>
             <h2 className="text-2xl font-luxury text-white mb-8 tracking-widest text-center">Sync Archive</h2>
             <textarea value={importValue} onChange={(e) => { setImportValue(e.target.value); try { const p = JSON.parse(e.target.value); setImportPreview(Array.isArray(p) ? p : null); } catch { setImportPreview(null); } }} placeholder="貼上 JSON 數據..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-[10px] font-mono text-gray-400 h-64 outline-none mb-8" />
             <button onClick={handleImportData} disabled={!importPreview} className={`w-full py-5 rounded-2xl font-black text-[10px] tracking-[0.5em] uppercase transition-all ${importPreview ? 'bg-[#d4af37] text-black hover:scale-105' : 'bg-gray-900 text-gray-700 cursor-not-allowed'}`}>Authorize Sync</button>
          </div>
        </div>
      )}

      {albumToDelete && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-10 bg-black/98 backdrop-blur-2xl animate-reveal" onClick={() => setAlbumToDelete(null)}>
          <div className="glass w-full max-w-lg rounded-[4rem] p-16 border border-white/10 shadow-2xl text-center space-y-12" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-luxury text-white tracking-widest uppercase">Purge Archive</h2>
            <p className="text-gray-500">確定要將此專輯移除嗎？</p>
            <button onClick={handleDeleteAlbum} className="w-full py-6 bg-red-600 text-white text-[10px] uppercase tracking-[0.5em] font-black rounded-3xl hover:bg-red-500 transition-all">PERMANENT DELETE</button>
          </div>
        </div>
      )}

      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} onUpload={handleSaveAlbum} albumToEdit={albumToEdit} />}
      <AudioPlayer state={playerState} onTogglePlay={() => setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))} onProgressChange={(p) => setPlayerState(prev => ({ ...prev, progress: p }))} onRemove={handleStopPlayer} onEnded={handleTrackEnded} />
    </div>
  );
};

export default App;
