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
  const [isJazzMode] = useState(true); 
  
  const isProcessingHash = useRef(false);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
  });

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

    const hash = window.location.hash;
    if (hash.startsWith('#album-')) {
      const id = hash.replace('#album-', '');
      const album = initialAlbums.find(a => a.id === id);
      if (album) setSelectedAlbum(album);
    }
  }, [isInitialized]);

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

  const handleImportData = (rawJson?: string) => {
    const jsonToParse = rawJson || importValue;
    try {
      const parsed = JSON.parse(jsonToParse);
      setAlbums(parsed);
      setIsImportOpen(false);
      setImportValue('');
      alert("Archives synchronized successfully.");
    } catch (e) { 
      alert("Invalid data format."); 
    }
  };

  // Fix: Added handleDownloadArchive function to resolve "Cannot find name 'handleDownloadArchive'" error.
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
    <div className={`min-h-screen flex flex-col relative selection:bg-[#d4af37] transition-all duration-1000 ${isJazzMode ? 'bg-[#050508]' : 'bg-[#08080a]'}`}>
      <Navbar 
        onHome={() => handleSelectAlbum(null)} 
        onUpload={() => { setAlbumToEdit(undefined); setIsUploadOpen(true); }}
        onExport={() => setIsExportOpen(true)}
        onImport={() => setIsImportOpen(true)}
        isCuratorMode={isCuratorMode}
        toggleCuratorMode={() => setIsCuratorMode(!isCuratorMode)}
        isJazzMode={isJazzMode}
      />

      <main className="flex-grow container mx-auto px-6 md:px-20 pt-48 pb-64">
        {!selectedAlbum ? (
          <div className="animate-reveal">
            <header className="mb-40 max-w-5xl">
              <div className="flex items-center gap-6 mb-12">
                <span className={`h-[1px] w-16 bg-[#d4af37]`}></span>
                <span className={`text-[10px] uppercase tracking-[0.8em] font-black text-[#d4af37]`}>
                  Curated Audio Collection
                </span>
              </div>
              <h1 className="text-[clamp(3.5rem,12vw,10rem)] font-black tracking-tighter uppercase font-luxury text-white mb-12 leading-[0.85]">
                爵非 <br/> <span className="outline-text">鼓狂</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl font-light leading-relaxed tracking-wide">
                A premium sanctuary for avant-garde AI jazz compositions and immersive sonic storytelling. Experience the rhythm of the future.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 md:gap-x-16 gap-y-24 md:gap-y-28">
              {albums.map((album) => (
                <AlbumCard 
                  key={album.id} 
                  album={album} 
                  onClick={() => handleSelectAlbum(album)} 
                  isJazzMode={isJazzMode} 
                  onDelete={isCuratorMode ? (e) => {
                    e.stopPropagation();
                    setAlbumToDelete(album);
                  } : undefined} 
                />
              ))}
              
              {albums.length === 0 && (
                <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-8 glass rounded-[4rem] border-dashed border-white/5">
                  <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                  </div>
                  <p className="text-gray-700 uppercase tracking-[0.5em] text-xs font-black">The gallery is currently silent</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <AlbumDetailView 
            album={selectedAlbum} 
            onBack={() => handleSelectAlbum(null)} 
            onPlayTrack={(track) => setPlayerState(prev => ({ ...prev, currentAlbum: selectedAlbum, currentTrack: track, isPlaying: true, progress: 0 }))}
            onDelete={() => setAlbumToDelete(selectedAlbum)}
            onEdit={() => { setAlbumToEdit(selectedAlbum); setIsUploadOpen(true); }}
            currentTrackId={playerState.currentTrack?.id}
            isPlaying={playerState.isPlaying}
            isCuratorMode={isCuratorMode}
          />
        )}
      </main>

      {albumToDelete && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-10 bg-black/90 backdrop-blur-xl animate-reveal">
          <div className="glass w-full max-w-lg rounded-[3.5rem] p-16 border border-white/10 shadow-2xl text-center space-y-10">
            <h2 className="text-2xl font-luxury text-white mb-4">Confirm Deletion</h2>
            <p className="text-gray-500 text-sm italic">"{albumToDelete.title}" will be lost in the void.</p>
            <div className="flex flex-col gap-4 pt-4">
              <button onClick={handleDeleteAlbum} className="w-full py-5 bg-red-600 text-white text-[10px] uppercase tracking-[0.5em] font-black rounded-2xl hover:bg-red-500 transition-all">Permanently Delete</button>
              <button onClick={() => setAlbumToDelete(null)} className="w-full py-5 text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black hover:text-white transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isExportOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-10 bg-black/95 backdrop-blur-3xl animate-reveal">
          <div className="glass w-full max-w-3xl rounded-[4rem] p-16 border-white/5 shadow-2xl space-y-12 text-center">
            <h2 className="text-3xl font-luxury text-white mb-4">Data Export</h2>
            <textarea readOnly value={JSON.stringify(albums, null, 2)} className="w-full bg-black/50 border border-white/5 rounded-[2rem] p-8 text-[10px] font-mono text-gray-500 h-80 scrollbar-custom" />
            <div className="flex gap-6">
              <button onClick={handleDownloadArchive} className="flex-grow py-5 bg-white text-black text-[10px] uppercase tracking-[0.4em] font-black rounded-2xl">Download Archive</button>
              <button onClick={() => setIsExportOpen(false)} className="px-12 py-5 text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black border border-white/5 rounded-2xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-10 bg-black/95 backdrop-blur-3xl animate-reveal">
          <div className="glass w-full max-w-3xl rounded-[4rem] p-16 border-white/5 shadow-2xl space-y-12 text-center">
            <h2 className="text-3xl font-luxury text-white mb-4">Data Injection</h2>
            <textarea value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder='Paste JSON payload here...' className="w-full bg-black/50 border border-white/10 rounded-[2rem] p-8 text-[10px] font-mono text-gray-400 h-60" />
            <div className="flex gap-6">
              <button onClick={() => handleImportData()} className="flex-grow py-5 bg-[#d4af37] text-black text-[10px] uppercase tracking-[0.4em] font-black rounded-2xl">Sync Payload</button>
              <button onClick={() => setIsImportOpen(false)} className="px-12 py-5 text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black border border-white/5 rounded-2xl">Cancel</button>
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
      />
    </div>
  );
};

export default App;