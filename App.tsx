import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MOCK_ALBUMS } from './constants';
import { Album, Track, PlayerState } from './types';
import Navbar from './components/Navbar';
import AlbumCard from './components/AlbumCard';
import AlbumDetailView from './components/AlbumDetailView';
import AudioPlayer from './components/AudioPlayer';
import UploadModal from './components/UploadModal';

const STORAGE_KEY = 'jazz_fei_v3_storage'; 

const App: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [albumToEdit, setAlbumToEdit] = useState<Album | undefined>(undefined);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [isCuratorMode, setIsCuratorMode] = useState(false); 
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  
  const isProcessingHash = useRef(false);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
  });

  // 權限檢查：檢查 URL 是否包含 ?admin=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setHasAdminAccess(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    let localDrafts: Album[] = [];
    try {
      localDrafts = saved ? JSON.parse(saved) : [];
    } catch (e) {
      localDrafts = [];
    }
    
    // 合併全域發布 (constants.ts) 與本地草稿 (localStorage)
    // 只有管理員模式會看到本地草稿，普通用戶只看 MOCK_ALBUMS
    const combined = [...MOCK_ALBUMS];
    
    // 如果是管理員，將草稿加入列表（避免重複 id）
    if (hasAdminAccess || localDrafts.length > 0) {
      localDrafts.forEach(draft => {
        if (!combined.find(a => a.id === draft.id)) {
          combined.push(draft);
        }
      });
    }
    
    setAlbums(combined);
    setIsInitialized(true);

    const hash = window.location.hash;
    if (hash.startsWith('#album-')) {
      const id = hash.replace('#album-', '');
      const album = combined.find(a => a.id === id);
      if (album) setSelectedAlbum(album);
    }
  }, [isInitialized, hasAdminAccess]);

  useEffect(() => {
    const handleHashChange = () => {
      if (isProcessingHash.current) return;
      const hash = window.location.hash;
      if (!hash) setSelectedAlbum(null);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 只有在 CuratorMode 開啟時才存檔到 LocalStorage
  useEffect(() => {
    if (isInitialized && isCuratorMode) {
      // 只儲存非 MOCK_ALBUMS 的部分作為草稿
      const drafts = albums.filter(a => !MOCK_ALBUMS.find(ma => ma.id === a.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    }
  }, [albums, isInitialized, isCuratorMode]);

  const handleSelectAlbum = (album: Album | null) => {
    isProcessingHash.current = true;
    setSelectedAlbum(album);
    window.location.hash = album ? `album-${album.id}` : '';
    setTimeout(() => { isProcessingHash.current = false; }, 100);
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

  const handleDeleteAlbum = () => {
    if (albumToDelete) {
      setAlbums(prev => prev.filter(a => a.id !== albumToDelete.id));
      if (selectedAlbum?.id === albumToDelete.id) {
        handleSelectAlbum(null);
      }
      setAlbumToDelete(null);
    }
  };

  const handleStopPlayer = () => {
    setPlayerState({
      currentTrack: null,
      currentAlbum: null,
      isPlaying: false,
      progress: 0,
    });
  };

  const handleTrackEnded = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: false, progress: 0 }));
    
    // 設定 3 秒的「靈魂呼吸」間隔
    setTimeout(() => {
      setPlayerState(prev => {
        if (!prev.currentAlbum || !prev.currentTrack) return { ...prev, isPlaying: false };
        
        const tracks = prev.currentAlbum.tracks;
        const currentIndex = tracks.findIndex(t => t.id === prev.currentTrack?.id);
        
        if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
          return {
            ...prev,
            currentTrack: tracks[currentIndex + 1],
            isPlaying: true,
            progress: 0
          };
        }
        return { ...prev, isPlaying: false };
      });
    }, 3000);
  }, []);

  const handlePlayAll = (album: Album) => {
    if (album.tracks.length > 0) {
      setPlayerState({
        currentAlbum: album,
        currentTrack: album.tracks[0],
        isPlaying: true,
        progress: 0
      });
    }
  };

  const handleImportData = (rawJson?: string) => {
    const jsonToParse = rawJson || importValue;
    try {
      const parsed = JSON.parse(jsonToParse);
      setAlbums(parsed);
      setIsImportOpen(false);
      setImportValue('');
    } catch (e) { 
      alert("Invalid data format."); 
    }
  };

  const handleDownloadArchive = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(albums, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `jazz_fei_archive_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className={`min-h-screen flex flex-col relative selection:bg-[#d4af37] transition-all duration-1000 bg-[#050508]`}>
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
                <span className="text-[10px] uppercase tracking-[0.8em] font-black text-[#d4af37]">
                  The Premium AI Jazz Archive
                </span>
              </div>
              <h1 className="text-[clamp(4rem,14vw,11rem)] font-black tracking-tighter uppercase font-luxury text-white mb-20 leading-[1.05] select-none flex flex-col items-start gap-4">
                <span className="luxury-gold-text shimmer-effect">爵非</span>
                <span className="outline-text-luxury ml-6 md:ml-16">鼓狂</span>
              </h1>
              <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                <p className="text-lg md:text-xl text-gray-500 max-w-xl font-light leading-relaxed tracking-wider border-l border-white/10 pl-10 italic">
                  A sanctuary where avant-garde machine intelligence meets the raw soul of jazz. Immerse yourself in the syncopated rhythms of the future.
                </p>
                <div className="flex gap-4">
                  <div className="w-12 h-[1px] bg-white/5 mt-4"></div>
                  <span className="text-[8px] uppercase tracking-[0.4em] text-gray-800 font-black rotate-90 origin-left whitespace-nowrap">Est. 2024 Archive</span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 md:gap-x-16 gap-y-24 md:gap-y-32">
              {albums.map((album) => (
                <AlbumCard 
                  key={album.id} 
                  album={album} 
                  onClick={() => handleSelectAlbum(album)} 
                  isJazzMode={true} 
                  onDelete={isCuratorMode ? (e) => {
                    e.stopPropagation();
                    setAlbumToDelete(album);
                  } : undefined} 
                />
              ))}
              
              {albums.length === 0 && (
                <div className="col-span-full py-52 flex flex-col items-center justify-center text-center space-y-10 glass rounded-[5rem] border-dashed border-white/5">
                  <p className="text-gray-700 uppercase tracking-[0.6em] text-[9px] font-black">Archive is currently empty</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <AlbumDetailView 
            album={selectedAlbum} 
            onBack={() => handleSelectAlbum(null)} 
            onPlayTrack={(track) => setPlayerState(prev => ({ ...prev, currentAlbum: selectedAlbum, currentTrack: track, isPlaying: true, progress: 0 }))}
            onPlayAll={() => handlePlayAll(selectedAlbum)}
            onDelete={() => setAlbumToDelete(selectedAlbum)}
            onEdit={() => { setAlbumToEdit(selectedAlbum); setIsUploadOpen(true); }}
            currentTrackId={playerState.currentTrack?.id}
            isPlaying={playerState.isPlaying}
            isCuratorMode={isCuratorMode}
          />
        )}
      </main>

      {albumToDelete && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-10 bg-black/95 backdrop-blur-2xl animate-reveal">
          <div className="glass w-full max-w-lg rounded-[4rem] p-16 border border-white/10 shadow-2xl text-center space-y-12">
            <h2 className="text-3xl font-luxury text-white mb-4 tracking-widest">Confirm Deletion</h2>
            <div className="flex flex-col gap-5 pt-4">
              <button onClick={handleDeleteAlbum} className="w-full py-6 bg-red-600 text-white text-[10px] uppercase tracking-[0.5em] font-black rounded-3xl hover:bg-red-500 transition-all">Permanently Purge</button>
              <button onClick={() => setAlbumToDelete(null)} className="w-full py-6 text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black hover:text-white transition-all">Retain Archive</button>
            </div>
          </div>
        </div>
      )}

      {isExportOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-10 bg-black/95 backdrop-blur-3xl animate-reveal">
          <div className="glass w-full max-w-4xl rounded-[5rem] p-20 border-white/5 shadow-2xl space-y-12 text-center">
            <h2 className="text-4xl font-luxury text-white mb-4 tracking-[0.3em]">Export for Global Launch</h2>
            <p className="text-gray-500 text-sm">Copy this JSON and update <code className="text-[#d4af37]">constants.ts</code> to publish globally.</p>
            <textarea readOnly value={JSON.stringify(albums, null, 2)} className="w-full bg-black/50 border border-white/5 rounded-[2.5rem] p-10 text-[10px] font-mono text-gray-500 h-96 focus:outline-none" />
            <div className="flex gap-8">
              <button onClick={handleDownloadArchive} className="flex-grow py-6 bg-white text-black text-[10px] uppercase tracking-[0.5em] font-black rounded-3xl hover:bg-[#d4af37] transition-all">Download Master Archive</button>
              <button onClick={() => setIsExportOpen(false)} className="px-16 py-6 text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black border border-white/5 rounded-3xl hover:text-white transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-10 bg-black/95 backdrop-blur-3xl animate-reveal">
          <div className="glass w-full max-w-4xl rounded-[5rem] p-20 border-white/5 shadow-2xl space-y-12 text-center">
            <h2 className="text-4xl font-luxury text-white mb-4 tracking-[0.3em]">Archive Sync</h2>
            <textarea value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder='Inject the JSON payload...' className="w-full bg-black/50 border border-white/10 rounded-[2.5rem] p-10 text-[10px] font-mono text-gray-400 h-72 focus:outline-none" />
            <div className="flex gap-8">
              <button onClick={() => handleImportData()} className="flex-grow py-6 bg-[#d4af37] text-black text-[10px] uppercase tracking-[0.5em] font-black rounded-3xl">Synchronize Payload</button>
              <button onClick={() => setIsImportOpen(false)} className="px-16 py-6 text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black border border-white/5 rounded-3xl hover:text-white transition-all">Abort</button>
            </div>
          </div>
        </div>
      )}

      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} onUpload={handleSaveAlbum} albumToEdit={albumToEdit} />}
      <AudioPlayer 
        state={playerState} 
        onTogglePlay={() => setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))} 
        onProgressChange={(p) => setPlayerState(prev => ({ ...prev, progress: p }))}
        onRemove={handleStopPlayer}
        onEnded={handleTrackEnded}
      />
    </div>
  );
};

export default App;