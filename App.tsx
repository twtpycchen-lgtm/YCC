
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
  const [importPreview, setImportPreview] = useState<Album[] | null>(null);
  const [albumToEdit, setAlbumToEdit] = useState<Album | undefined>(undefined);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [isCuratorMode, setIsCuratorMode] = useState(false); 
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  
  const isProcessingHash = useRef(false);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
  });

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
    
    const combined = [...MOCK_ALBUMS];
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

  useEffect(() => {
    if (isInitialized && isCuratorMode) {
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
    setTimeout(() => {
      setPlayerState(prev => {
        if (!prev.currentAlbum || !prev.currentTrack) return { ...prev, isPlaying: false };
        const tracks = prev.currentAlbum.tracks;
        const currentIndex = tracks.findIndex(t => t.id === prev.currentTrack?.id);
        if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
          return { ...prev, currentTrack: tracks[currentIndex + 1], isPlaying: true, progress: 0 };
        }
        return { ...prev, isPlaying: false };
      });
    }, 3000);
  }, []);

  const handlePlayAll = (album: Album) => {
    if (album.tracks.length > 0) {
      setPlayerState({ currentAlbum: album, currentTrack: album.tracks[0], isPlaying: true, progress: 0 });
    }
  };

  const handleImportValueChange = (val: string) => {
    setImportValue(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        setImportPreview(parsed);
      } else {
        setImportPreview(null);
      }
    } catch (e) {
      setImportPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      handleImportValueChange(content);
    };
    reader.readAsText(file);
  };

  const handleImportData = () => {
    if (!importPreview) return alert("請提供有效的 JSON 存檔數據。");
    if (confirm("匯入將完全覆蓋目前的本地草稿，確定要繼續嗎？")) {
      setAlbums(importPreview);
      setIsImportOpen(false);
      setImportValue('');
      setImportPreview(null);
      alert("數據同步成功。");
    }
  };

  const handleCopyToClipboard = async () => {
    const json = JSON.stringify(albums, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      alert("複製失敗，請手動複製。");
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

  const totalTracks = albums.reduce((acc, curr) => acc + curr.tracks.length, 0);

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
                  onDelete={isCuratorMode ? (e) => { e.stopPropagation(); setAlbumToDelete(album); } : undefined} 
                />
              ))}
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

      {/* --- 改良後的 Export Modal --- */}
      {isExportOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 md:p-12 bg-black/95 backdrop-blur-3xl animate-reveal overflow-y-auto" onClick={() => setIsExportOpen(false)}>
          <div className="glass w-full max-w-6xl rounded-[4rem] p-10 md:p-20 border border-white/10 shadow-2xl relative flex flex-col md:flex-row gap-12 my-auto" onClick={(e) => e.stopPropagation()}>
            {/* 右上角退出鍵 */}
            <button onClick={() => setIsExportOpen(false)} className="absolute top-10 right-10 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-[#d4af37]/40 transition-all z-20 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="md:w-1/3 space-y-10">
              <h2 className="text-4xl font-luxury text-white mb-4 tracking-widest">Master Archive<br/><span className="text-[#d4af37]">典藏導出</span></h2>
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-black mb-2">Current Statistics</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Albums</span><span className="text-white font-mono font-bold">{albums.length}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Total Tracks</span><span className="text-white font-mono font-bold">{totalTracks}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Export Date</span><span className="text-white font-mono font-bold text-xs">{new Date().toLocaleDateString()}</span></div>
                  </div>
                </div>
                <div className="p-6 rounded-3xl border border-[#d4af37]/20 bg-[#d4af37]/5">
                   <p className="text-[#d4af37] text-xs leading-relaxed italic">"複製下方的 JSON 並更新到檔案 <code className="bg-black/40 px-1.5 py-0.5 rounded">constants.ts</code> 即可完成全域發布。"</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={handleCopyToClipboard} className="w-full py-5 bg-[#d4af37] text-black text-[10px] uppercase tracking-[0.5em] font-black rounded-3xl hover:scale-105 transition-all relative">
                  {showCopySuccess ? "Successfully Copied" : "Copy to Clipboard"}
                </button>
                <button onClick={handleDownloadArchive} className="w-full py-5 bg-white/5 border border-white/10 text-white text-[10px] uppercase tracking-[0.5em] font-black rounded-3xl hover:bg-white/10 transition-all">
                  Download JSON File
                </button>
                <button onClick={() => setIsExportOpen(false)} className="w-full py-5 text-gray-600 text-[10px] uppercase tracking-[0.5em] font-black hover:text-white transition-all">Close Window</button>
              </div>
            </div>
            <div className="md:w-2/3 relative flex flex-col h-[500px] md:h-auto">
               <div className="flex-grow rounded-[2.5rem] bg-black/60 border border-white/5 p-8 overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10"></div>
                  <pre className="text-[10px] font-mono text-gray-500 overflow-y-auto h-full scrollbar-custom selection:bg-[#d4af37] selection:text-black p-4">
                    {JSON.stringify(albums, null, 2)}
                  </pre>
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10"></div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 改良後的 Import Modal --- */}
      {isImportOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 md:p-12 bg-black/95 backdrop-blur-3xl animate-reveal overflow-y-auto" onClick={() => { setIsImportOpen(false); setImportPreview(null); setImportValue(''); }}>
          <div className="glass w-full max-w-6xl rounded-[4rem] p-10 md:p-20 border border-white/10 shadow-2xl relative my-auto flex flex-col md:flex-row gap-12" onClick={(e) => e.stopPropagation()}>
            {/* 右上角退出鍵 */}
            <button onClick={() => { setIsImportOpen(false); setImportPreview(null); setImportValue(''); }} className="absolute top-10 right-10 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-[#d4af37]/40 transition-all z-20 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="md:w-1/2 space-y-10">
              <h2 className="text-4xl font-luxury text-white mb-4 tracking-widest">Archive Sync<br/><span className="text-[#d4af37]">同步中心</span></h2>
              <div className="relative group">
                <input type="file" accept=".json" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" title="拖放 JSON 檔案於此" />
                <div className="border-2 border-dashed border-white/10 group-hover:border-[#d4af37]/40 rounded-[2.5rem] p-16 text-center transition-all bg-white/[0.01]">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                   </div>
                   <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black group-hover:text-white transition-colors">Drag or Click to Upload JSON</p>
                </div>
              </div>
              <div className="relative">
                <textarea 
                  value={importValue} 
                  onChange={(e) => handleImportValueChange(e.target.value)} 
                  placeholder="Or paste the archive payload here..." 
                  className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-8 text-[10px] font-mono text-gray-400 h-48 focus:border-[#d4af37]/30 outline-none resize-none"
                />
              </div>
              <div className="flex gap-4">
                <button onClick={handleImportData} disabled={!importPreview} className={`flex-grow py-5 text-[10px] uppercase tracking-[0.5em] font-black rounded-3xl transition-all ${importPreview ? 'bg-[#d4af37] text-black hover:scale-105 shadow-[0_15px_30px_rgba(212,175,55,0.2)]' : 'bg-gray-900 text-gray-700 cursor-not-allowed'}`}>
                  Authorize Synchronization
                </button>
                <button onClick={() => { setIsImportOpen(false); setImportPreview(null); setImportValue(''); }} className="px-10 py-5 text-gray-600 text-[10px] uppercase tracking-[0.5em] font-black hover:text-white transition-all">Cancel</button>
              </div>
            </div>
            
            <div className="md:w-1/2 flex flex-col h-[400px] md:h-auto">
              <div className="flex-grow rounded-[2.5rem] bg-black/60 border border-white/5 p-10 overflow-y-auto scrollbar-custom">
                <h4 className="font-luxury text-[10px] text-gray-600 tracking-[0.4em] mb-8 border-b border-white/5 pb-4 uppercase">Import Preview</h4>
                {importPreview ? (
                  <div className="space-y-6">
                    {importPreview.map((alb) => (
                      <div key={alb.id} className="flex gap-5 items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 group/alb">
                        <img src={alb.coverImage} className="w-16 h-16 rounded-xl object-cover border border-white/10 group-hover/alb:border-[#d4af37]/40 transition-all" />
                        <div className="overflow-hidden">
                          <p className="text-white text-sm font-bold truncate">{alb.title}</p>
                          <p className="text-[#d4af37] text-[10px] tracking-widest mt-1 uppercase font-bold">{alb.tracks.length} Sessions Record</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                    <div className="w-1.5 h-1.5 bg-gray-600 rounded-full mb-4 animate-pulse"></div>
                    <p className="text-[9px] uppercase tracking-[0.5em] text-gray-600 font-black">Waiting for Data Payload</p>
                  </div>
                )}
              </div>
              <div className="mt-6 p-6 rounded-3xl bg-red-950/10 border border-red-900/20 text-center">
                 <p className="text-red-500/80 text-[10px] font-black uppercase tracking-[0.3em]">Warning: Existing drafts will be purged upon sync.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {albumToDelete && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-10 bg-black/95 backdrop-blur-2xl animate-reveal" onClick={() => setAlbumToDelete(null)}>
          <div className="glass w-full max-w-lg rounded-[4rem] p-16 border border-white/10 shadow-2xl text-center space-y-12" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-luxury text-white mb-4 tracking-widest">Confirm Deletion</h2>
            <div className="flex flex-col gap-5 pt-4">
              <button onClick={handleDeleteAlbum} className="w-full py-6 bg-red-600 text-white text-[10px] uppercase tracking-[0.5em] font-black rounded-3xl hover:bg-red-500 transition-all">Permanently Purge</button>
              <button onClick={() => setAlbumToDelete(null)} className="w-full py-6 text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black hover:text-white transition-all">Retain Archive</button>
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
