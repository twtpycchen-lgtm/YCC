
import React, { useState, useRef, useEffect } from 'react';
import { Album, Track } from '../types';
import { getAlbumInsights, cleanTrackTitles } from '../services/geminiService';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (album: Album) => void;
  albumToEdit?: Album;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, albumToEdit }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'cloud' | 'direct' | 'assets'>('assets');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [tracks, setTracks] = useState<Partial<Track>[]>([]);
  const [batchLinks, setBatchLinks] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [assetPaths, setAssetPaths] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isCleaningTitles, setIsCleaningTitles] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (albumToEdit) {
      setTitle(albumToEdit.title);
      setDescription(albumToEdit.description);
      setStory(albumToEdit.story);
      setCoverImage(albumToEdit.coverImage);
      setTracks(albumToEdit.tracks);
    }
  }, [albumToEdit]);

  const parseDriveLinks = (text: string) => {
    const driveIdPattern = /[-\w]{25,50}/g;
    const results: any[] = [];
    const seenIds = new Set<string>();
    const forbidden = ['view', 'usp', 'sharing', 'edit', 'open', 'file', 'folders', 'copy', 'drive', 'google', 'confirm', 'download', 'docs'];

    let match;
    while ((match = driveIdPattern.exec(text)) !== null) {
      const id = match[0];
      if (id.length < 25 || seenIds.has(id) || forbidden.some(word => id.toLowerCase() === word)) continue;
      
      seenIds.add(id);
      results.push({
        id: `drive-${id}-${Date.now()}`,
        title: `雲端音軌 ${id.substring(0, 4)}`,
        audioUrl: `https://drive.google.com/uc?id=${id}&export=download`,
        duration: '--:--',
        genre: 'Google Drive 雲端',
        mp3Url: `https://drive.google.com/file/d/${id}/view`,
        wavUrl: `https://drive.google.com/file/d/${id}/view`
      });
    }
    return results;
  };

  const handleBatchImport = () => {
    if (!batchLinks.trim()) return;
    setIsParsing(true);
    setTimeout(() => {
      const newTracks = parseDriveLinks(batchLinks);
      if (newTracks.length > 0) {
        setTracks(prev => [...prev, ...newTracks]);
        setBatchLinks('');
      } else {
        alert("未能辨識有效 ID。請貼上完整的 Google Drive 分享連結。");
      }
      setIsParsing(false);
    }, 800);
  };

  const handleAssetBatchImport = () => {
    if (!assetPaths.trim()) return;
    
    const lines = assetPaths.split(/\r?\n/).filter(line => line.trim() !== '');
    const newTracks: any[] = [];

    lines.forEach((line, idx) => {
      let rawPath = line.trim();
      rawPath = rawPath.replace(/^"(.*)"$/, '$1').replace(/\\/g, '/');

      const markers = ['/songs/', '/music/', '/public/', '/assets/', '/dist/'];
      for (const marker of markers) {
        const foundIdx = rawPath.toLowerCase().lastIndexOf(marker);
        if (foundIdx !== -1) {
          rawPath = rawPath.substring(foundIdx + 1);
          break;
        }
      }

      const fileName = rawPath.split('/').pop() || '未知資產';
      const cleanName = fileName.replace(/\.(mp3|wav|ogg|aac|m4a)$/i, '');
      const encodedPath = encodeURI(rawPath);

      newTracks.push({
        id: `asset-${Date.now()}-${idx}`,
        title: decodeURIComponent(cleanName),
        audioUrl: encodedPath,
        duration: '--:--',
        genre: '專案資產',
        mp3Url: encodedPath,
        wavUrl: encodedPath
      });
    });

    setTracks(prev => [...prev, ...newTracks]);
    setAssetPaths('');
  };

  const handleDirectUrlImport = () => {
    if (!directUrl.trim()) return;
    const fileName = directUrl.split('/').pop()?.split('?')[0] || '未知音軌';
    const cleanName = fileName.replace(/\.(mp3|wav|ogg|aac|m4a)$/i, '');
    
    const newTrack = {
      id: `url-${Date.now()}`,
      title: decodeURIComponent(cleanName),
      audioUrl: directUrl,
      duration: '--:--',
      genre: '外部串流直連',
      mp3Url: directUrl,
      wavUrl: directUrl
    };
    
    setTracks(prev => [...prev, newTrack]);
    setDirectUrl('');
  };

  const handleAICleanTitles = async () => {
    if (tracks.length === 0 || !title) {
      alert("請先輸入專輯標題。");
      return;
    }
    setIsCleaningTitles(true);
    try {
      const rawTitles = tracks.map(t => t.title || '');
      const cleaned = await cleanTrackTitles(rawTitles, title, description);
      if (cleaned && Array.isArray(cleaned)) {
        const updatedTracks = tracks.map((t, i) => ({
          ...t,
          title: cleaned[i] || t.title
        }));
        setTracks(updatedTracks);
      }
    } catch (err) {
      console.error("AI 命名失敗", err);
    } finally {
      setIsCleaningTitles(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCoverImage(url);
    }
  };

  const handleAudioFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newTracks = Array.from(e.target.files).map((file: File, idx) => ({
        id: `local-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        audioUrl: URL.createObjectURL(file),
        duration: '--:--',
        genre: '本地預覽',
        mp3Url: '#',
        wavUrl: '#'
      }));
      setTracks(prev => [...prev, ...newTracks]);
    }
  };

  const handleEnhanceStory = async () => {
    if (!title || !description) return;
    setIsGeneratingStory(true);
    const aiStory = await getAlbumInsights(title, description);
    if (aiStory) setStory(aiStory);
    setIsGeneratingStory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage || tracks.length === 0) {
      alert("請填寫必要資訊並上傳至少一首音軌。");
      return;
    }
    const newAlbum: Album = {
      id: albumToEdit ? albumToEdit.id : `album-${Date.now()}`,
      title,
      description,
      story,
      coverImage,
      releaseDate: albumToEdit ? albumToEdit.releaseDate : new Date().toLocaleDateString('zh-TW'),
      tracks: tracks as Track[]
    };
    onUpload(newAlbum);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
      <div className="glass w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[4rem] p-10 md:p-16 shadow-[0_0_150px_rgba(0,0,0,0.8)] animate-fade-in-up border border-white/10 relative">
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-4">
            <h2 className="text-6xl font-luxury tracking-[0.2em] uppercase text-white leading-tight">
              {albumToEdit ? '修改作品' : '作品典藏室'}
            </h2>
            <div className="flex flex-wrap gap-3">
              <button 
                type="button" 
                onClick={() => setActiveTab('assets')} 
                className={`text-[10px] uppercase tracking-[0.2em] px-6 py-3 rounded-full border transition-all duration-300 ${activeTab === 'assets' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/10 hover:border-white/30'}`}
              >
                專案資產
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('cloud')} 
                className={`text-[10px] uppercase tracking-[0.2em] px-6 py-3 rounded-full border transition-all duration-300 ${activeTab === 'cloud' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/10 hover:border-white/30'}`}
              >
                雲端匯入
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('direct')} 
                className={`text-[10px] uppercase tracking-[0.2em] px-6 py-3 rounded-full border transition-all duration-300 ${activeTab === 'direct' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/10 hover:border-white/30'}`}
              >
                直連網址
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('local')} 
                className={`text-[10px] uppercase tracking-[0.2em] px-6 py-3 rounded-full border transition-all duration-300 ${activeTab === 'local' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/10 hover:border-white/30'}`}
              >
                本地測試
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="group relative aspect-square w-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:border-white/30 transition-all">
              {coverImage ? (
                <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <p className="font-luxury uppercase tracking-widest text-xs text-gray-500">Upload Artwork</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {coverImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-white text-xs uppercase tracking-widest font-bold">Change Image</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Album Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="The Sound of Silence"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/40 transition-all font-luxury"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Vibe / Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Futuristic, Cyberpunk, Ethereal textures..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white h-32 focus:outline-none focus:border-white/40 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Track Management</h4>
                 {tracks.length > 0 && (
                   <button 
                    type="button" 
                    onClick={handleAICleanTitles}
                    disabled={isCleaningTitles}
                    className="text-[9px] uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                   >
                     {isCleaningTitles ? 'Processing...' : '✨ Optimize Titles'}
                   </button>
                 )}
              </div>

              <div className="mb-6">
                {activeTab === 'assets' && (
                  <div className="space-y-3">
                    <textarea 
                      value={assetPaths}
                      onChange={(e) => setAssetPaths(e.target.value)}
                      placeholder="Paste relative paths (one per line)...&#10;e.g. songs/track1.mp3"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 h-24 focus:outline-none"
                    />
                    <button type="button" onClick={handleAssetBatchImport} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] uppercase tracking-widest transition-all">Add Assets</button>
                  </div>
                )}
                {activeTab === 'cloud' && (
                  <div className="space-y-3">
                    <textarea 
                      value={batchLinks}
                      onChange={(e) => setBatchLinks(e.target.value)}
                      placeholder="Paste Google Drive links..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 h-24 focus:outline-none"
                    />
                    <button type="button" onClick={handleBatchImport} disabled={isParsing} className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-[10px] uppercase tracking-widest transition-all">{isParsing ? 'Parsing...' : 'Analyze Links'}</button>
                  </div>
                )}
                {activeTab === 'direct' && (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={directUrl}
                      onChange={(e) => setDirectUrl(e.target.value)}
                      placeholder="https://example.com/audio.mp3"
                      className="flex-grow bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 focus:outline-none"
                    />
                    <button type="button" onClick={handleDirectUrlImport} className="px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] uppercase tracking-widest transition-all">Add</button>
                  </div>
                )}
                {activeTab === 'local' && (
                  <div className="relative w-full py-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 transition-all">
                     <p className="text-[10px] uppercase tracking-widest text-gray-500">Drag & Drop Files</p>
                     <input type="file" multiple accept="audio/*" onChange={handleAudioFiles} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {tracks.length === 0 ? (
                  <div className="py-10 text-center text-gray-600 italic text-xs">No tracks added yet.</div>
                ) : (
                  tracks.map((track, idx) => (
                    <div key={track.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 group">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <span className="text-[9px] font-luxury text-gray-600">{idx + 1}</span>
                        <div className="overflow-hidden">
                          <p className="text-xs text-white truncate font-medium">{track.title}</p>
                          <p className="text-[8px] text-gray-500 uppercase tracking-tighter truncate">{track.genre}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))}
                        className="p-2 opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">The Story</h4>
                <button 
                  type="button" 
                  onClick={handleEnhanceStory}
                  disabled={isGeneratingStory}
                  className="text-[9px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
                >
                  {isGeneratingStory ? 'Dreaming...' : '✨ Enhance with AI'}
                </button>
              </div>
              <textarea 
                value={story} 
                onChange={(e) => setStory(e.target.value)} 
                placeholder="A narrative journey through the album's concept..."
                className="w-full bg-transparent border-none p-0 text-gray-400 text-sm italic font-light leading-relaxed focus:outline-none h-32 resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
               <button 
                type="submit"
                className="flex-grow py-5 bg-white text-black font-luxury uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"
               >
                 {albumToEdit ? 'Save Changes' : 'Publish to Library'}
               </button>
               <button 
                type="button" 
                onClick={onClose}
                className="px-10 py-5 glass border border-white/10 text-white font-luxury uppercase tracking-[0.2em] rounded-2xl hover:bg-white/5 transition-all"
               >
                 Cancel
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
