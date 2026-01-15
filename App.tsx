
import React, { useState, useEffect, useRef } from 'react';
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
  const [syncStats, setSyncStats] = useState<{count: number} | null>(null);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
    isAlbumMode: false,
  });

  useEffect(() => {
    if (isInitialized) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setAlbums(parsed);
        else setAlbums(MOCK_ALBUMS);
      } catch (e) { setAlbums(MOCK_ALBUMS); }
    } else {
      setAlbums(MOCK_ALBUMS);
    }
    setIsInitialized(true);
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && isCuratorMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(albums, null, 2));
    }
  }, [albums, isInitialized, isCuratorMode]);

  const handleSelectAlbum = (album: Album | null) => {
    setSelectedAlbum(album);
    window.location.hash = album ? `album-${album.id}` : '';
  };

  const handlePlayAll = (album: Album | null) => {
    if (album && album.tracks && album.tracks.length > 0) {
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
    setPlayerState({
      currentAlbum: album,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      isAlbumMode: false,
    });
  };

  const handleStopPlayer = () => {
    setPlayerState({
      currentTrack: null,
      currentAlbum: null,
      isPlaying: false,
      progress: 0,
      isAlbumMode: false,
    });
  };

  const handleTrackEnded = () => {
    setPlayerState(prev => {
      if (prev.isAlbumMode && prev.currentAlbum && prev.currentTrack) {
        const tracks = prev.currentAlbum.tracks;
        const currentIndex = tracks.findIndex(t => t.id === prev.currentTrack?.id);
        if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
          return {
            ...prev,
            currentTrack: tracks[currentIndex + 1],
            progress: 0,
            isPlaying: true,
          };
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
      const newAlbums = albums.filter(a => a.id !== albumToDelete.id);
      setAlbums(newAlbums);
      if (selectedAlbum?.id === albumToDelete.id) handleSelectAlbum(null);
      setAlbumToDelete(null);
    }
  };

  const handleImportData = () => {
    if (!importPreview) return alert("請先驗證數據");
    setAlbums(importPreview);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(importPreview));
    setIsImportOpen(false);
    setSyncStats({ count: importPreview.length });
    setTimeout(() => setSyncStats(null), 4000);
  };

  const generateFullCode = () => {
    return `import { Album } from './types';\n\nexport const MOCK_ALBUMS: Album[] = ${JSON.stringify(albums, null, 2)};`;
  };

  const handleCopyToClipboard = async () => {
    const code = generateFullCode();
    try {
      await navigator.clipboard.writeText(code);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) { alert("複製失敗"); }
  };

  const handleDownloadFile = () => {
    const code = generateFullCode();
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'constants.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasBase64Images = albums.some(a => a.coverImage?.startsWith('data:image'));

  return (
    <div className="min-h-screen flex flex-col relative bg-[#050508] selection:bg-[#d4af37] selection:text-black">
      <Navbar onHome={() => handleSelectAlbum(null)} onUpload={() => { setAlbumToEdit(undefined); setIsUploadOpen(true); }} onExport={() => setIsExportOpen(true)} onImport={() => { setIsImportOpen(true); setImportValue(''); setImportPreview(null); }} isCuratorMode={isCuratorMode} toggleCuratorMode={() => setIsCuratorMode(!isCuratorMode)} hasAdminAccess={hasAdminAccess} />

      {syncStats && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[1000] animate-reveal">
          <div className="glass bg-[#d4af37] text-black px-12 py-6 rounded-full shadow-2xl border-2 border-white/20">
            <span className="text-[10px] uppercase tracking-[0.4em] font-black leading-none">同步成功 Synchronized</span>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto px-6 md:px-20 pt-48 pb-64">
        {!selectedAlbum ? (
          <div className="animate-reveal">
            <header className="mb-44 max-w-6xl">
              <h1 className="text-[clamp(4rem,14vw,11rem)] font-black tracking-tighter uppercase font-luxury text-white mb-20 leading-[1.05] flex flex-col items-start gap-4">
                <span className="luxury-gold-text shimmer-effect">爵非</span>
                <span className="outline-text-luxury ml-6 md:ml-16">鼓狂</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 max-w-xl font-light border-l border-white/10 pl-10 italic">A sanctuary for AI-driven jazz masterpieces.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-32">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} onClick={() => handleSelectAlbum(album)} isJazzMode={true} onDelete={isCuratorMode ? (e) => setAlbumToDelete(album) : undefined} />
              ))}
            </div>
          </div>
        ) : (
          <AlbumDetailView album={selectedAlbum} onBack={() => handleSelectAlbum(null)} onPlayTrack={(track) => handlePlaySingle(track, selectedAlbum)} onPlayAll={() => handlePlayAll(selectedAlbum)} onDelete={() => setAlbumToDelete(selectedAlbum)} onEdit={() => { setAlbumToEdit(selectedAlbum); setIsUploadOpen(true); }} currentTrackId={playerState.currentTrack?.id} isPlaying={playerState.isPlaying} isCuratorMode={isCuratorMode} />
        )}
      </main>

      {isExportOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-3xl animate-reveal" onClick={() => setIsExportOpen(false)}>
          <div 
            className="glass w-full max-w-6xl rounded-[3rem] border border-white/10 relative flex flex-col md:flex-row overflow-hidden max-h-[90vh] shadow-[0_50px_100px_rgba(0,0,0,0.9)]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:w-5/12 p-8 md:p-14 border-b md:border-b-0 md:border-r border-white/5 flex flex-col shrink-0 bg-white/[0.01] overflow-y-auto scrollbar-custom">
              <div className="mb-10">
                <h2 className="text-3xl font-luxury text-white tracking-widest leading-tight">正式發布<br/><span className="text-[#d4af37]">數據同步手冊</span></h2>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-3">Sync local edits to your live website</p>
                <div className="h-1 w-12 bg-[#d4af37] mt-6"></div>
              </div>
              
              <div className="space-y-8 flex-grow">
                {/* 步驟 1 */}
                <div className="relative pl-10 border-l border-white/5 pb-8">
                  <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-[10px] font-black">1</span>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] text-white font-black mb-2">準備新數據</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed mb-4">系統已根據您的最新編輯生成了新的母帶代碼。</p>
                  <button onClick={handleCopyToClipboard} className="w-full py-4 bg-[#d4af37] text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-xl hover:scale-[1.02] transition-all shadow-lg active:scale-95">
                    {showCopySuccess ? "✔ 已成功複製到剪貼簿" : "點擊複製 constants.ts 代碼"}
                  </button>
                </div>

                {/* 步驟 2 */}
                <div className="relative pl-10 border-l border-white/5 pb-8">
                  <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-black">2</span>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] text-white font-black mb-2">前往 GitHub 編輯</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed mb-4">打開您的 GitHub 專案，找到並進入 <code className="text-[#d4af37] bg-white/5 px-2 py-0.5 rounded">constants.ts</code> 點擊右上角筆頭進入編輯。</p>
                </div>

                {/* 步驟 3 */}
                <div className="relative pl-10">
                  <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-black">3</span>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] text-white font-black mb-2">覆蓋並 Commit</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed mb-4">將舊內容全選刪除，貼上剛才複製的新內容，點擊綠色 <b>Commit Changes</b> 按鈕即發布完成！</p>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <h4 className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black mb-4">其它備份方案</h4>
                   <button onClick={handleDownloadFile} className="w-full py-3 border border-white/10 text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold rounded-xl hover:border-white/30 hover:text-white transition-all">
                      下載 constants.ts 文件 (本地存檔)
                   </button>
                </div>

                {hasBase64Images && (
                  <div className="p-5 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                    <p className="text-[9px] text-orange-400/80 leading-relaxed">
                      💡 <b>小提示：</b> 您目前的數據包含圖片代碼 (Base64)，這會讓右側預覽看起來非常冗長，這是正常的，請直接全選貼上即可。
                    </p>
                  </div>
                )}
              </div>

              <button onClick={() => setIsExportOpen(false)} className="mt-10 py-3 text-gray-700 hover:text-white text-[9px] uppercase tracking-widest transition-all">結束並返回網站</button>
            </div>

            <div className="flex-1 flex flex-col bg-[#08080a] min-w-0 border-l border-white/5">
               <div className="bg-white/5 px-8 py-4 flex justify-between items-center border-b border-white/5 shrink-0">
                 <div className="flex items-center gap-4">
                   <span className="text-[9px] uppercase tracking-widest text-gray-500 font-black">源碼預覽：constants.ts</span>
                 </div>
               </div>
               <div className="flex-1 overflow-auto p-10 scrollbar-custom bg-black/40">
                 <pre className="text-[10px] font-mono text-gray-700 whitespace-pre-wrap break-all leading-loose select-all">
                    {generateFullCode()}
                 </pre>
               </div>
            </div>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-reveal" onClick={() => setIsImportOpen(false)}>
          <div className="glass w-full max-w-2xl rounded-[3rem] p-12 border border-white/10 relative" onClick={(e) => e.stopPropagation()}>
             <h2 className="text-2xl font-luxury text-white mb-8 tracking-widest text-center">數據存檔同步</h2>
             <textarea value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder="貼上 JSON 數據..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-[10px] font-mono text-gray-400 h-64 outline-none mb-6 resize-none" />
             <div className="flex gap-4">
                <button onClick={() => { try { const p = JSON.parse(importValue); setImportPreview(p); } catch(e) { alert("解析失敗"); } }} className="flex-1 py-4 border border-[#d4af37]/40 text-[#d4af37] rounded-2xl text-[10px] uppercase font-black">驗證數據</button>
                <button onClick={handleImportData} disabled={!importPreview} className={`flex-1 py-4 rounded-2xl text-[10px] uppercase font-black ${importPreview ? 'bg-[#d4af37] text-black' : 'bg-gray-900 text-gray-700'}`}>授權同步</button>
             </div>
          </div>
        </div>
      )}

      {albumToDelete && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-10 bg-black/98 backdrop-blur-2xl animate-reveal" onClick={() => setAlbumToDelete(null)}>
          <div className="glass w-full max-w-lg rounded-[4rem] p-16 border border-white/10 text-center space-y-12" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-luxury text-white tracking-widest uppercase">Purge Archive</h2>
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
