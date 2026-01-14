
import React, { useState, useEffect } from 'react';
import { MOCK_ALBUMS } from './constants';
import { Album, Track, PlayerState } from './types';
import Navbar from './components/Navbar';
import AlbumCard from './components/AlbumCard';
import AlbumDetailView from './components/AlbumDetailView';
import AudioPlayer from './components/AudioPlayer';
import UploadModal from './components/UploadModal';

const ITEMS_PER_PAGE = 6;
// 使用 V4 Key 強制瀏覽器重置為 constants.ts 的空狀態
const STORAGE_KEY = 'suno_curator_v4_ultra_clean'; 

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
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
  });

  // 1. 初始載入
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let initialAlbums: Album[] = [];
    
    if (saved !== null) {
      try {
        initialAlbums = JSON.parse(saved);
      } catch (e) {
        initialAlbums = MOCK_ALBUMS;
      }
    } else {
      initialAlbums = MOCK_ALBUMS; // 現在這會是 []
    }
    
    setAlbums(initialAlbums);
    setIsInitialized(true);

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#album-')) {
        const id = hash.replace('#album-', '');
        const album = initialAlbums.find(a => a.id === id);
        if (album) setSelectedAlbum(album);
      } else {
        setSelectedAlbum(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. 持久化儲存
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
    }
  }, [albums, isInitialized]);

  const handleSelectAlbum = (album: Album | null) => {
    setSelectedAlbum(album);
    window.location.hash = album ? `album-${album.id}` : '';
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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.confirm(`確定要刪除這張專輯嗎？`)) {
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
      }
    } catch (e) {
      alert("JSON 格式不正確");
    }
  };

  const handleResetToStatic = () => {
    if (window.confirm("將重設為初始空白狀態。")) {
      setAlbums(MOCK_ALBUMS);
      setIsImportOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-white selection:text-black">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/5 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar 
        onHome={() => handleSelectAlbum(null)} 
        onUpload={() => { setAlbumToEdit(undefined); setIsUploadOpen(true); }}
        onExport={() => setIsExportOpen(true)}
        onImport={() => setIsImportOpen(true)}
        isCuratorMode={isCuratorMode}
        toggleCuratorMode={() => setIsCuratorMode(!isCuratorMode)}
      />

      <main className="flex-grow container mx-auto px-6 pt-28 pb-48">
        {!selectedAlbum ? (
          <div className="animate-fade-in">
            <section className="mb-20 text-center md:text-left">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase font-luxury text-glow mb-4">
                Suno <span className="text-gray-800">Curator</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl font-light tracking-wide">
                {isCuratorMode ? "Curator Management Mode &mdash; Ready to publish." : "Premium AI Music Showcase Platform."}
              </p>
            </section>

            {albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-48 opacity-20">
                <div className="w-24 h-24 mb-8 border border-white/20 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
                <p className="text-[10px] font-luxury tracking-[0.5em] uppercase text-white">No Curations Found</p>
                {isCuratorMode && (
                  <button onClick={() => setIsUploadOpen(true)} className="mt-8 px-10 py-3 border border-white/20 rounded-full text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Start Creating</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {albums.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((album) => (
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
            onPlayTrack={(track) => setPlayerState(prev => ({ ...prev, currentAlbum: selectedAlbum, currentTrack: track, isPlaying: true, progress: 0 }))}
            onDelete={() => handleDeleteAlbum(selectedAlbum.id)}
            onEdit={() => { setAlbumToEdit(selectedAlbum); setIsUploadOpen(true); }}
            currentTrackId={playerState.currentTrack?.id}
            isPlaying={playerState.isPlaying}
            isCuratorMode={isCuratorMode}
          />
        )}
      </main>

      {/* Modals remain the same logic but ultra-clean */}
      {isExportOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl">
          <div className="w-full max-w-2xl p-10 bg-white/5 border border-white/10 rounded-[2rem]">
            <h3 className="text-xl font-luxury mb-6 uppercase tracking-widest text-emerald-400">Export Data</h3>
            <textarea readOnly value={JSON.stringify(albums, null, 2)} className="w-full h-80 bg-black/50 rounded-2xl p-6 text-[10px] font-mono text-gray-400 focus:outline-none border border-white/5 mb-8 scrollbar-custom" />
            <div className="flex gap-4">
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(albums, null, 2)); alert("Copied!"); }} className="flex-grow py-5 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded-xl hover:scale-[1.02] transition-transform">Copy JSON</button>
              <button onClick={() => setIsExportOpen(false)} className="px-10 py-5 text-white/40 uppercase text-[10px] tracking-widest hover:text-white transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl">
          <div className="w-full max-w-2xl p-10 bg-white/5 border border-white/10 rounded-[2rem]">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-luxury uppercase tracking-widest text-purple-400">Import Data</h3>
               <button onClick={handleResetToStatic} className="text-[9px] text-gray-500 hover:text-red-400 underline uppercase tracking-widest">Wipe & Reset</button>
            </div>
            <textarea value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder='Paste your JSON here...' className="w-full h-80 bg-black/50 rounded-2xl p-6 text-[10px] font-mono text-white focus:outline-none border border-white/10 mb-8 scrollbar-custom" />
            <div className="flex gap-4">
              <button onClick={handleImportData} className="flex-grow py-5 bg-purple-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-purple-500 transition-colors">Confirm Import</button>
              <button onClick={() => { setIsImportOpen(false); setImportValue(''); }} className="px-10 py-5 text-white/40 uppercase text-[10px] tracking-widest hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} onUpload={handleSaveAlbum} albumToEdit={albumToEdit} />}
      <AudioPlayer state={playerState} onTogglePlay={() => setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))} onProgressChange={(p) => setPlayerState(prev => ({ ...prev, progress: p }))} />

      <footer className="py-20 flex flex-col items-center opacity-20 hover:opacity-100 transition-opacity">
        <button onClick={() => setIsCuratorMode(!isCuratorMode)} className="text-[9px] uppercase tracking-[0.6em] text-gray-600 hover:text-white transition-colors">
          ADMIN ACCESS &mdash; {isCuratorMode ? 'LOCKED' : 'UNLOCKED'}
        </button>
      </footer>
    </div>
  );
};

export default App;
