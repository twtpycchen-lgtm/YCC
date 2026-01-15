import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [albumToEdit, setAlbumToEdit] = useState<Album | undefined>(undefined);
  const [isCuratorMode, setIsCuratorMode] = useState(false); 
  const [isJazzMode, setIsJazzMode] = useState(false); 
  
  const isProcessingHash = useRef(false);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
  });

  // 1. 初始化資料
  useEffect(() => {
    if (isInitialized) return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    let initialAlbums: Album[] = [];
    try {
      initialAlbums = saved ? JSON.parse(saved) : MOCK_ALBUMS;
    } catch (e) {
      initialAlbums = MOCK_ALBUMS;
    }
    
    setAlbums(initialAlbums);
    setIsInitialized(true);

    // 解析初始 Hash
    const hash = window.location.hash;
    if (hash.startsWith('#share-')) {
      try {
        const base64 = hash.replace('#share-', '');
        const json = decodeURIComponent(escape(atob(base64)));
        const sharedAlbum: Album = JSON.parse(json);
        if (!initialAlbums.find(a => a.id === sharedAlbum.id)) {
          const updated = [sharedAlbum, ...initialAlbums];
          setAlbums(updated);
        }
        setSelectedAlbum(sharedAlbum);
      } catch (e) { console.error("Hash Error", e); }
    } else if (hash.startsWith('#album-')) {
      const id = hash.replace('#album-', '');
      const album = initialAlbums.find(a => a.id === id);
      if (album) setSelectedAlbum(album);
    }
  }, [isInitialized]);

  // 2. 監聽 Hash 變化 (單向流動，避免閃動)
  useEffect(() => {
    const handleHashChange = () => {
      if (isProcessingHash.current) return;
      const hash = window.location.hash;
      if (!hash) {
        setSelectedAlbum(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 3. 持久化儲存
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
    }
  }, [albums, isInitialized]);

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

  const handleImportData = () => {
    try {
      const parsed = JSON.parse(importValue);
      if (Array.isArray(parsed)) {
        setAlbums(parsed);
        setIsImportOpen(false);
        setImportValue('');
        alert("資料已成功同步。");
      }
    } catch (e) { alert("JSON 格式無效。"); }
  };

  return (
    <div className={`min-h-screen flex flex-col relative selection:bg-[#d4af37] transition-colors duration-700 ${isJazzMode ? 'bg-[#0a0a0c]' : 'bg-[#0d0d0f]'}`}>
      <Navbar 
        onHome={() => handleSelectAlbum(null)} 
        onUpload={() => { setAlbumToEdit(undefined); setIsUploadOpen(true); }}
        onExport={() => setIsExportOpen(true)}
        onImport={() => setIsImportOpen(true)}
        isCuratorMode={isCuratorMode}
        toggleCuratorMode={() => setIsCuratorMode(!isCuratorMode)}
        isJazzMode={isJazzMode}
        onJazzToggle={() => setIsJazzMode(!isJazzMode)}
      />

      <main className="flex-grow container mx-auto px-6 md:px-12 pt-36 pb-48">
        {!selectedAlbum ? (
          <div className="animate-fade-in">
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter uppercase font-luxury text-white mb-24">
              爵非 <br/> <span className="outline-text">鼓狂</span>
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} onClick={() => handleSelectAlbum(album)} onDelete={isCuratorMode ? () => {
                  if(confirm("確定刪除？")) setAlbums(prev => prev.filter(a => a.id !== album.id));
                } : undefined} />
              ))}
            </div>
          </div>
        ) : (
          <AlbumDetailView 
            album={selectedAlbum} 
            onBack={() => handleSelectAlbum(null)} 
            onPlayTrack={(track) => setPlayerState(prev => ({ ...prev, currentAlbum: selectedAlbum, currentTrack: track, isPlaying: true, progress: 0 }))}
            onDelete={() => { setAlbums(prev => prev.filter(a => a.id !== selectedAlbum.id)); handleSelectAlbum(null); }}
            onEdit={() => { setAlbumToEdit(selectedAlbum); setIsUploadOpen(true); }}
            currentTrackId={playerState.currentTrack?.id}
            isPlaying={playerState.isPlaying}
            isCuratorMode={isCuratorMode}
          />
        )}
      </main>

      {/* 匯出視窗 */}
      {isExportOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
          <div className="glass w-full max-w-2xl rounded-[3rem] p-10 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-luxury text-white mb-6 tracking-widest uppercase">數據匯出中心</h2>
            <textarea readOnly value={JSON.stringify(albums)} className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-xs font-mono text-gray-500 h-64 focus:outline-none" />
            <div className="flex gap-4 mt-8">
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(albums)); alert("已複製"); }} className="flex-grow py-4 bg-white text-black text-sm uppercase font-black rounded-xl">複製數據</button>
              <button onClick={() => setIsExportOpen(false)} className="px-8 py-4 text-white text-sm uppercase font-bold border border-white/10 rounded-xl">關閉</button>
            </div>
          </div>
        </div>
      )}

      {/* 匯入視窗 */}
      {isImportOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
          <div className="glass w-full max-w-2xl rounded-[3rem] p-10 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-luxury text-white mb-6 tracking-widest uppercase">數據匯入中心</h2>
            <textarea value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder='貼上 JSON 數據...' className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-xs font-mono text-gray-400 h-64 focus:outline-none" />
            <div className="flex gap-4 mt-8">
              <button onClick={handleImportData} className="flex-grow py-4 bg-[#d4af37] text-black text-sm uppercase font-black rounded-xl">確認匯入</button>
              <button onClick={() => setIsImportOpen(false)} className="px-8 py-4 text-white text-sm uppercase font-bold border border-white/10 rounded-xl">取消</button>
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