import React, { useState, useEffect } from 'react';
import { Album, Track } from '../types';
import { getAlbumInsights, cleanTrackTitles } from '../services/geminiService';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (album: Album) => void;
  albumToEdit?: Album;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, albumToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [tracks, setTracks] = useState<Partial<Track>[]>([]);
  const [batchLinks, setBatchLinks] = useState('');
  const [batchNames, setBatchNames] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isCleaningTitles, setIsCleaningTitles] = useState(false);
  const [viewMode, setViewMode] = useState<'raw' | 'optimized'>('optimized');
  const [batchTab, setBatchTab] = useState<'links' | 'names'>('links');

  useEffect(() => {
    if (albumToEdit) {
      setTitle(albumToEdit.title);
      setDescription(albumToEdit.description);
      setStory(albumToEdit.story || '');
      setCoverImage(albumToEdit.coverImage);
      setTracks(albumToEdit.tracks);
    }
  }, [albumToEdit]);

  const getRawFilename = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      let filename = url.pathname.split('/').pop() || "";
      if (!filename) filename = url.searchParams.get('title') || "未命名音軌";
      const decoded = decodeURIComponent(filename);
      return decoded.replace(/\.[^/.]+$/, "").trim();
    } catch (e) {
      const base = urlStr.split('/').pop()?.split('?')[0] || "音軌";
      try { return decodeURIComponent(base).replace(/\.[^/.]+$/, ""); } catch { return base; }
    }
  };

  const handleBatchImport = () => {
    const lines = batchLinks.split('\n').filter(l => l.trim().length > 10);
    const results = lines.map((line, idx) => {
      let finalUrl = line.trim();
      let genre = '雲端串流';
      const rawName = getRawFilename(finalUrl);

      if (finalUrl.includes('dropbox.com')) {
        genre = 'Dropbox 💎';
        finalUrl = finalUrl.replace(/www\.dropbox\.com/g, 'dl.dropboxusercontent.com');
        const urlObj = new URL(finalUrl);
        urlObj.searchParams.set('raw', '1');
        urlObj.searchParams.delete('dl');
        finalUrl = urlObj.toString();
      } else if (finalUrl.includes('drive.google.com')) {
        const idMatch = finalUrl.match(/[-\w]{25,50}/);
        if (idMatch) {
          genre = 'Google Drive';
          finalUrl = `https://docs.google.com/uc?export=download&id=${idMatch[0]}`;
        }
      }

      return {
        id: `track-${Date.now()}-${idx}`,
        title: rawName,
        originalTitle: rawName,
        audioUrl: finalUrl,
        duration: '--:--',
        genre: genre,
        mp3Url: line.trim(),
        wavUrl: line.trim(),
        remarks: ''
      };
    });

    setTracks(prev => [...prev, ...results]);
    setBatchLinks('');
  };

  const handleBatchNamesImport = () => {
    if (tracks.length === 0) return alert("請先匯入音軌連結");
    const nameLines = batchNames.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (nameLines.length === 0) return;

    setTracks(prev => prev.map((track, idx) => {
      if (nameLines[idx]) {
        return { ...track, remarks: nameLines[idx] };
      }
      return track;
    }));
    setBatchNames('');
    alert(`已分配 ${nameLines.length} 個曲名`);
  };

  const handleCleanTitles = async () => {
    if (tracks.length === 0) return;
    setIsCleaningTitles(true);
    try {
      const trackData = tracks.map(t => ({ id: t.id || '', title: t.originalTitle || t.title || '' }));
      const optimized = await cleanTrackTitles(trackData, title, description);
      setTracks(prev => prev.map((t, i) => ({ ...t, title: optimized[i] || t.title })));
      setViewMode('optimized');
    } catch (e) { alert("AI 暫時失敗"); }
    finally { setIsCleaningTitles(false); }
  };

  const updateTrackRemarks = (id: string, remarks: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, remarks } : t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage || tracks.length === 0) return alert("資訊不完整");
    const finalTracks = tracks.map(t => ({ ...t, title: viewMode === 'raw' ? t.originalTitle : (t.title || t.originalTitle) })) as Track[];
    onUpload({
      id: albumToEdit ? albumToEdit.id : `album-${Date.now()}`,
      title,
      description,
      story, 
      coverImage,
      releaseDate: albumToEdit ? albumToEdit.releaseDate : new Date().toLocaleDateString('zh-TW'),
      tracks: finalTracks
    });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-3xl overflow-y-auto animate-fade-in">
      <div className="glass w-full max-w-7xl my-auto rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-luxury text-white uppercase tracking-widest">{albumToEdit ? '典藏更新' : '策展策劃'}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          <div className="space-y-6">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden relative group">
              {coverImage ? <img src={coverImage} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-700 uppercase tracking-widest text-xs">藝術封面</div>}
              <input type="file" accept="image/*" onChange={(e) => {
                if(e.target.files?.[0]) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setCoverImage(ev.target?.result as string);
                  reader.readAsDataURL(e.target.files[0]);
                }
              }} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="專輯標題" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-luxury text-xl" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="背景描述" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white h-24 text-sm" />
            <div className="relative">
              <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="AI 編寫靈魂故事..." className="w-full bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl p-4 text-[#d4af37] text-sm italic h-36" />
              <button type="button" onClick={async () => { setIsGeneratingStory(true); setStory(await getAlbumInsights(title, description)); setIsGeneratingStory(false); }} disabled={isGeneratingStory} className="absolute bottom-4 right-4 px-4 py-2 bg-[#d4af37] text-black text-[9px] uppercase font-black rounded-full shadow-lg">
                {isGeneratingStory ? '編寫中' : '✨ 生成故事'}
              </button>
            </div>
          </div>

          <div className="space-y-8 flex flex-col h-full">
            <div className="glass p-6 rounded-[2rem] border border-white/5 flex-grow overflow-hidden flex flex-col">
              {/* Batch Import Area with Tabs */}
              <div className="flex gap-4 mb-4 border-b border-white/5 pb-2">
                <button 
                  type="button" 
                  onClick={() => setBatchTab('links')} 
                  className={`text-[10px] uppercase tracking-widest font-black transition-all ${batchTab === 'links' ? 'text-[#d4af37]' : 'text-gray-600'}`}
                >
                  匯入連結
                </button>
                <button 
                  type="button" 
                  onClick={() => setBatchTab('names')} 
                  className={`text-[10px] uppercase tracking-widest font-black transition-all ${batchTab === 'names' ? 'text-[#d4af37]' : 'text-gray-600'}`}
                >
                  匯入歌名
                </button>
              </div>

              {batchTab === 'links' ? (
                <>
                  <textarea 
                    value={batchLinks} 
                    onChange={(e) => setBatchLinks(e.target.value)} 
                    placeholder="每行一個音軌連結 (Dropbox/Drive)..." 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[10px] font-mono text-gray-500 h-28 mb-4 shrink-0 focus:border-[#d4af37]/40 outline-none" 
                  />
                  <button type="button" onClick={handleBatchImport} className="w-full py-4 bg-white text-black rounded-xl text-xs uppercase font-black shrink-0 mb-6 hover:bg-[#d4af37] transition-all">導入音軌連結</button>
                </>
              ) : (
                <>
                  <textarea 
                    value={batchNames} 
                    onChange={(e) => setBatchNames(e.target.value)} 
                    placeholder="每行一個歌曲名稱，將按順序分配給音軌..." 
                    className="w-full bg-black/40 border border-[#d4af37]/10 rounded-xl p-4 text-[10px] font-mono text-[#d4af37]/60 h-28 mb-4 shrink-0 focus:border-[#d4af37]/40 outline-none" 
                  />
                  <button type="button" onClick={handleBatchNamesImport} className="w-full py-4 bg-[#d4af37] text-black rounded-xl text-xs uppercase font-black shrink-0 mb-6 hover:bg-[#d4af37]/80 transition-all">依序分配歌名</button>
                </>
              )}
              
              <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-custom">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[8px] uppercase tracking-[0.3em] text-gray-600 font-black">當前音軌清單 ({tracks.length})</span>
                   <button type="button" onClick={handleCleanTitles} disabled={isCleaningTitles} className="text-[8px] uppercase tracking-[0.2em] text-[#d4af37] hover:underline">
                     {isCleaningTitles ? '優化中...' : '✨ AI 標題優化'}
                   </button>
                </div>
                {tracks.map((track, idx) => (
                  <div key={track.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 transition-all hover:border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-700 font-mono w-4">{idx + 1}</span>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs text-white truncate font-bold uppercase tracking-wider">{viewMode === 'raw' ? track.originalTitle : (track.title || track.originalTitle)}</p>
                      </div>
                      <button type="button" onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="text-gray-700 hover:text-red-500 text-lg transition-colors">×</button>
                    </div>
                    <input 
                      type="text" 
                      value={track.remarks || ''} 
                      onChange={(e) => updateTrackRemarks(track.id!, e.target.value)} 
                      placeholder="人工歌名 (Remarks)"
                      className="w-full bg-black/30 border border-white/5 rounded-lg p-2.5 text-xs text-[#d4af37] font-luxury tracking-widest uppercase focus:border-[#d4af37]/30 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full py-6 bg-[#d4af37] text-black font-luxury uppercase tracking-[0.4em] rounded-[2rem] font-bold text-base shadow-2xl hover:scale-[1.02] transition-all active:scale-95">正式發佈典藏</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;