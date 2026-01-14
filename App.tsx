import React, { useState, useEffect } from 'react';
import { MOCK_ALBUMS } from './constants';
import { Album, Track, PlayerState } from './types';
import Navbar from './components/Navbar';
import AlbumCard from './components/AlbumCard';
import AlbumDetailView from './components/AlbumDetailView';
import AudioPlayer from './components/AudioPlayer';
import UploadModal from './components/UploadModal';

const ITEMS_PER_PAGE = 6;
const STORAGE_KEY = 'annual_curation_v1_storage'; 

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

  const checkSharedData = (initialAlbums: Album[]) => {
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
        return true;
      } catch (e) {
        console.error("解析分享數據失敗", e);
        return false;
      }
    }
    if (hash.startsWith('#album-')) {
      const id = hash.replace('#album-', '');
      const album = initialAlbums.find(a => a.id === id);
      if (album) setSelectedAlbum(album);
      return true;
    }
    return false;
  };

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
      initialAlbums = MOCK_ALBUMS;
    }
    setAlbums(initialAlbums);
    setIsInitialized(true);
    checkSharedData(initialAlbums);

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#share-') && !hash.startsWith('#album-')) {
        setSelectedAlbum(null);
      } else if (hash.startsWith('#album-')) {
        const id = hash.replace('#album-', '');
        const album = albums.find(a => a.id === id);
        if (album) setSelectedAlbum(album);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [albums.length]);

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

      if (!jazzTrack && albums.length > 0 && albums[0].tracks.length > 0) {
        jazzTrack = albums[0].tracks[0];
        jazzAlbum = albums[0];
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
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (window.confirm(`確定要將此項典藏從您的數據庫中移除嗎？`)) {
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
        alert("數據匯入成功！已更新典藏庫。");
      } else {
        alert("格式錯誤，請提供正確的專輯陣列 JSON。");
      }
    } catch (e) {
      alert("解析失敗，請確認 JSON 格式是否正確。");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative selection:bg-[#d4af37] selection:text-black transition-colors duration-[2000ms] ${isJazzMode ? 'bg-[#0a0a0c]' : 'bg-[#0d0d0f]'}`}>
      
      {/* 沉浸模式：深藍紫色微光 */}
      <div className={`fixed inset-0 pointer-events-none -z-10 transition-opacity duration-[2000ms] ${isJazzMode ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-950/20 via-transparent to-amber-900/5"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_70%)] animate-pulse"></div>
      </div>

      {/* 標準高級微光層：古銅與灰藍 */}
      <div className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-opacity duration-[2000ms] ${isJazzMode ? 'opacity-30' : 'opacity-100'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-900/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#d4af37]/[0.02] blur-[150px] rounded-full"></div>
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
              <div className={`absolute -left-10 top-0 w-[2px] h-32 bg-gradient-to-b hidden md:block transition-all duration-[2000ms] ${isJazzMode ? 'from-indigo-500/60 to-transparent' : 'from-[#d4af37]/30 to-transparent'}`}></div>
              <h1 className={`text-7xl md:text-[10rem] font-black tracking-tighter uppercase font-luxury leading-[0.85] mb-6 transition-all duration-[2000ms] ${isJazzMode ? 'text-indigo-100/90 text-glow' : 'text-white text-glow'}`}>
                爵非 <br/> <span className={`outline-text transition-all duration-[2000ms] ${isJazzMode ? 'text-indigo-900/50' : 'text-white/20'}`}>鼓狂</span>
              </h1>
              <div className="flex flex-col md:flex-row items-center gap-10">
                <p className={`text-xl max-w-xl font-extralight tracking-[0.2em] leading-relaxed uppercase transition-colors duration-[2000ms] ${isJazzMode ? 'text-indigo-300/60' : 'text-gray-400'}`}>
                  {isJazzMode ? "Noir Session: 當鼓點撕開夜幕，靈魂即興而生。" : "頂級 AI 爵士樂藝術典藏與展示平台。"}
                </p>
                <div className="h-[1px] flex-grow bg-white/[0.03] hidden md:block"></div>
                <div className="hidden lg:block text-xs uppercase tracking-[0.5em] text-white/20 whitespace-nowrap">Premium Audio Collection v3.1</div>
              </div>
            </section>

            {albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-48 opacity-20">
                <div className="w-40 h-40 border border-white/5 rounded-full flex items-center justify-center mb-10">
                  <div className={`w-3 h-3 rounded-full animate-ping ${isJazzMode ? 'bg-indigo-400' : 'bg-[#d4af37]'}`}></div>
                </div>
                <p className="text-xs font-luxury tracking-[1.5em] uppercase text-white/30">Archives Silence</p>
              </div>
            ) : (
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

      <footer className="py-24 flex flex-col items-center opacity-20 hover:opacity-100 transition-opacity duration-[2s]">
        <div className={`w-px h-20 bg-gradient-to-b mb-10 transition-all duration-[2s] ${isJazzMode ? 'from-transparent to-indigo-500/40' : 'from-transparent to-[#d4af37]/20'}`}></div>
        <button onClick={() => setIsCuratorMode(!isCuratorMode)} className={`text-xs uppercase tracking-[1em] transition-all font-light ${isJazzMode ? 'text-indigo-400' : 'text-white'}`}>
          JAZZ FEI DRUM MADNESS &mdash; EST. 2025
        </button>
      </footer>

      {/* 所有的 Modal 視窗 */}
      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} onUpload={handleSaveAlbum} albumToEdit={albumToEdit} />}

      {/* Export Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="glass w-full max-w-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl space-y-8 animate-fade-in-up">
            <h2 className="text-3xl font-luxury text-white tracking-widest uppercase">數據匯出</h2>
            <p className="text-gray-400 text-sm leading-relaxed tracking-wide font-light">
              將下方的 JSON 複製並備份至您的 constants.ts 或個人紀錄。重新載入後即可快速恢復。
            </p>
            <textarea 
              readOnly 
              value={JSON.stringify(albums, null, 2)} 
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xs font-mono text-gray-400 h-64 focus:outline-none" 
            />
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(albums));
                  alert("已複製至剪貼簿");
                }} 
                className="flex-grow py-4 bg-white text-black text-xs uppercase tracking-widest font-black rounded-xl hover:bg-[#d4af37] transition-all"
              >
                複製數據
              </button>
              <button 
                onClick={() => setIsExportOpen(false)} 
                className="px-8 py-4 bg-white/5 text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-white/10 transition-all border border-white/5"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="glass w-full max-w-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl space-y-8 animate-fade-in-up">
            <h2 className="text-3xl font-luxury text-white tracking-widest uppercase">數據匯入</h2>
            <p className="text-gray-400 text-sm leading-relaxed tracking-wide font-light">
              請貼上您之前備份的 JSON 專輯陣列數據。這將覆蓋您目前的本地存儲。
            </p>
            <textarea 
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder='[ { "id": "album-...", ... } ]'
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xs font-mono text-gray-400 h-64 focus:outline-none focus:border-[#d4af37]/40 transition-all" 
            />
            <div className="flex gap-4">
              <button 
                onClick={handleImportData}
                className="flex-grow py-4 bg-[#d4af37] text-black text-xs uppercase tracking-widest font-black rounded-xl hover:bg-[#b8952d] transition-all shadow-lg"
              >
                確認匯入
              </button>
              <button 
                onClick={() => { setIsImportOpen(false); setImportValue(''); }} 
                className="px-8 py-4 bg-white/5 text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-white/10 transition-all border border-white/5"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <AudioPlayer state={playerState} onTogglePlay={() => setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))} onProgressChange={(p) => setPlayerState(prev => ({ ...prev, progress: p }))} />
    </div>
  );
};

export default App;