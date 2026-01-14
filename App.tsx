
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

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let loadedAlbums: Album[] = [];
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 如果 localStorage 有資料且非空陣列，就用它；否則用靜態配置
        loadedAlbums = (parsed && parsed.length > 0) ? parsed : MOCK_ALBUMS;
      } catch (e) {
        loadedAlbums = MOCK_ALBUMS;
      }
    } else {
      loadedAlbums = MOCK_ALBUMS;
    }
    
    setAlbums(loadedAlbums);

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
    handleHashChange();

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
    }
  };

  const handleImportData = () => {
    try {
      const parsed = JSON.parse(importValue);
      if (Array.isArray(parsed)) {
        setAlbums(parsed);
        setIsImportOpen(false);
        setImportValue('');
        alert("導入成功！");
      } else {
        alert("資料格式不正確，應為一個陣列。");
      }
    } catch (e) {
      alert("解析 JSON 失敗，請檢查格式。");
    }
  };

  const displayedAlbums = albums.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-white selection:text-black">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
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
                  ? "管理您的 AI 音樂典藏。點擊 Export 並更新 constants.ts 以發佈全球。"
                  : "沉浸在 AI 創作的音樂宇宙。每一張專輯都是一段獨特的感官旅程。"}
              </p>
            </section>

            {albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 glass rounded-[4rem] border-dashed border-white/10">
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="glass w-full max-w-2xl rounded-[2rem] p-10 border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-luxury mb-4 text-emerald-400">Step 1: 導出數據</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              請複製下方代碼，並貼到您的 <code className="text-white">constants.ts</code> 檔案中。這將使您的作品永久公開。
            </p>
            <textarea 
              readOnly 
              value={JSON.stringify(albums, null, 2)} 
              className="w-full h-64 bg-black/50 rounded-xl p-4 text-xs font-mono text-gray-500 focus:outline-none border border-white/5 mb-6"
            />
            <div className="flex gap-4">
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(albums, null, 2)); alert("代碼已複製！請前往 constants.ts 修改。"); }} className="flex-grow py-4 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded-xl">複製並準備發佈</button>
              <button onClick={() => setIsExportOpen(false)} className="px-8 py-4 border border-white/10 text-white rounded-xl text-[10px] uppercase tracking-widest">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="glass w-full max-w-2xl rounded-[2rem] p-10 border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-luxury mb-4 text-purple-400">導入配置</h3>
            <p className="text-gray-400 text-sm mb-6">請貼上先前導出的 JSON 數據以回復您的專輯庫。</p>
            <textarea 
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder='貼上 [{ "id": ... }] 格式的資料'
              className="w-full h-64 bg-black/50 rounded-xl p-4 text-xs font-mono text-white focus:outline-none border border-white/10 mb-6"
            />
            <div className="flex gap-4">
              <button onClick={handleImportData} className="flex-grow py-4 bg-purple-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-purple-500 transition-colors">確認導入</button>
              <button onClick={() => { setIsImportOpen(false); setImportValue(''); }} className="px-8 py-4 border border-white/10 text-white rounded-xl text-[10px] uppercase tracking-widest">取消</button>
            </div>
          </div>
        </div>
      )}

      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} onUpload={handleSaveAlbum} albumToEdit={albumToEdit} />}
      <AudioPlayer state={playerState} onTogglePlay={() => setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))} onProgressChange={(p) => setPlayerState(prev => ({ ...prev, progress: p }))} />

      <footer className="py-12 flex flex-col items-center opacity-30 hover:opacity-100 transition-opacity">
        <button onClick={() => setIsCuratorMode(!isCuratorMode)} className="text-[9px] uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-colors">
          &copy; {new Date().getFullYear()} Suno Curator Studio &mdash; {isCuratorMode ? 'Exit Management' : 'Creator Entry'}
        </button>
      </footer>
    </div>
  );
};

export default App;
