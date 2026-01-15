
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
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  
  // 修正：使用確定的 Track 類型，避免 Partial 導致的編譯錯誤
  const [tracks, setTracks] = useState<Track[]>([]);
  
  const [batchLinks, setBatchLinks] = useState('');
  const [batchNames, setBatchNames] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isCleaningTitles, setIsCleaningTitles] = useState(false);
  const [batchTab, setBatchTab] = useState<'links' | 'names'>('links');
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('url');

  useEffect(() => {
    if (albumToEdit) {
      setTitle(albumToEdit.title);
      setDescription(albumToEdit.description);
      setStory(albumToEdit.story || '');
      if (albumToEdit.coverImage?.startsWith('http')) {
        setCoverImageUrl(albumToEdit.coverImage);
        setImageTab('url');
      } else {
        setCoverImage(albumToEdit.coverImage);
        setImageTab('upload');
      }
      setTracks(albumToEdit.tracks);
    }
  }, [albumToEdit]);

  const getRawFilename = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      let filename = url.pathname.split('/').pop() || "";
      if (!filename) filename = url.searchParams.get('title') || "Track";
      return decodeURIComponent(filename).replace(/\.[^/.]+$/, "").trim();
    } catch (e) {
      return "Session Track";
    }
  };

  const handleBatchImport = () => {
    const lines = batchLinks.split('\n').filter(l => l.trim().length > 10);
    const results: Track[] = lines.map((line) => {
      let finalUrl = line.trim();
      const rawName = getRawFilename(finalUrl);
      if (finalUrl.includes('dropbox.com')) {
        finalUrl = finalUrl.replace(/www\.dropbox\.com/g, 'dl.dropboxusercontent.com').replace(/\?dl=0/g, '?raw=1');
      } else if (finalUrl.includes('drive.google.com')) {
        const idMatch = finalUrl.match(/[-\w]{25,50}/);
        if (idMatch) finalUrl = `https://docs.google.com/uc?export=download&id=${idMatch[0]}`;
      }
      return {
        id: `track-${Math.random().toString(36).substr(2, 9)}`,
        title: rawName,
        originalTitle: rawName,
        audioUrl: finalUrl,
        wavUrl: "#",
        mp3Url: "#",
        duration: '--:--',
        genre: 'Jazz',
        remarks: ''
      };
    });
    setTracks(prev => [...prev, ...results]);
    setBatchLinks('');
  };

  const handleBatchNamesImport = () => {
    const nameLines = batchNames.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (nameLines.length === 0) return;
    setTracks(prev => prev.map((track, idx) => ({ 
      ...track, 
      remarks: nameLines[idx] || track.remarks 
    })));
    setBatchNames('');
  };

  const handleCleanTitles = async () => {
    if (tracks.length === 0) return;
    if (!title) return alert("請先輸入專輯標題。");
    setIsCleaningTitles(true);
    try {
      const trackData = tracks.map(t => ({ id: t.id, title: t.originalTitle || t.title, remarks: t.remarks || '' }));
      const optimized = await cleanTrackTitles(trackData, title, description);
      setTracks(prev => prev.map((t, i) => ({ ...t, title: optimized[i] || t.title })));
    } catch (e) { alert("AI 生成失敗"); }
    finally { setIsCleaningTitles(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCover = imageTab === 'url' ? coverImageUrl : coverImage;
    if (!title || !finalCover || tracks.length === 0) return alert("請填寫完整資訊（標題、封面與歌曲）。");
    
    onUpload({
      id: albumToEdit?.id || `album-${Date.now()}`,
      title,
      description,
      story, 
      coverImage: finalCover,
      releaseDate: albumToEdit?.releaseDate || new Date().toLocaleDateString('zh-TW'),
      tracks: tracks
    });
  };

  return (
    <div className="fixed inset-0 z-[650] flex items-center justify-center p-4 md:p-10 bg-black/98 backdrop-blur-3xl overflow-y-auto animate-reveal" onClick={onClose}>
      <div className="glass w-full max-w-7xl my-auto rounded-[3rem] p-8 md:p-16 border border-white/10 relative" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-10 right-10 p-4 text-gray-500 hover:text-white transition-all group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <h2 className="text-3xl font-luxury text-white tracking-widest uppercase">{albumToEdit ? 'Edit Archive' : 'New Session'}</h2>
            <div className="space-y-6">
               <div className="flex gap-4 border-b border-white/5 pb-2">
                 <button type="button" onClick={() => setImageTab('url')} className={`text-[9px] uppercase tracking-widest font-black ${imageTab === 'url' ? 'text-[#d4af37]' : 'text-gray-600'}`}>Image URL</button>
                 <button type="button" onClick={() => setImageTab('upload')} className={`text-[9px] uppercase tracking-widest font-black ${imageTab === 'upload' ? 'text-[#d4af37]' : 'text-gray-600'}`}>Local Upload</button>
               </div>
               <div className="aspect-square bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden relative group shadow-2xl">
                  { (imageTab === 'url' ? coverImageUrl : coverImage) ? (
                    <img src={imageTab === 'url' ? coverImageUrl : coverImage} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-[10px] uppercase tracking-[0.5em] font-black">Archive Artwork</div>
                  )}
                  {imageTab === 'upload' && (
                    <input type="file" accept="image/*" onChange={(e) => {
                      if(e.target.files?.[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setCoverImage(ev.target?.result as string);
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  )}
               </div>
               {imageTab === 'url' && (
                 <input type="text" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="封面圖片網址" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-gray-400 outline-none focus:border-[#d4af37]/40" />
               )}
            </div>
            <div className="space-y-6">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Album Title / 專輯標題" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-luxury text-2xl outline-none focus:border-[#d4af37]/40" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Context / 藝術脈絡背景..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white h-32 text-sm outline-none resize-none" />
              <div className="relative">
                <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="AI Narrating Soul..." className="w-full bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl p-6 text-[#d4af37] text-sm italic h-44 outline-none resize-none font-serif" />
                <button type="button" onClick={async () => { setIsGeneratingStory(true); setStory(await getAlbumInsights(title, description)); setIsGeneratingStory(false); }} className="absolute bottom-6 right-6 px-6 py-3 bg-[#d4af37] text-black text-[10px] uppercase font-black rounded-full shadow-xl">
                  {isGeneratingStory ? 'Writing...' : '✨ Create Narrative'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-10 flex flex-col h-full">
            <div className="glass p-8 rounded-[3rem] border border-white/10 flex-grow flex flex-col min-h-0 bg-black/40">
               <div className="flex gap-6 mb-6 border-b border-white/5 pb-2 shrink-0">
                  <button type="button" onClick={() => setBatchTab('links')} className={`text-[10px] uppercase tracking-widest font-black ${batchTab === 'links' ? 'text-[#d4af37]' : 'text-gray-700'}`}>Session Links</button>
                  <button type="button" onClick={() => setBatchTab('names')} className={`text-[10px] uppercase tracking-widest font-black ${batchTab === 'names' ? 'text-[#d4af37]' : 'text-gray-700'}`}>Batch Titles</button>
               </div>

               <div className="shrink-0 space-y-4 mb-8">
                 {batchTab === 'links' ? (
                   <>
                    <textarea value={batchLinks} onChange={(e) => setBatchLinks(e.target.value)} placeholder="每行輸入一個連結 (Dropbox/Drive/mp3)..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-[10px] font-mono text-gray-500 h-24 outline-none focus:border-[#d4af37]/40" />
                    <button type="button" onClick={handleBatchImport} className="w-full py-4 bg-white/10 text-white rounded-xl text-[9px] uppercase font-black hover:bg-white hover:text-black transition-all">Import All Links</button>
                   </>
                 ) : (
                   <>
                    <textarea value={batchNames} onChange={(e) => setBatchNames(e.target.value)} placeholder="每行輸入一個標題，將自動填入「備註」作為人工歌名..." className="w-full bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl p-6 text-[10px] text-[#d4af37] h-24 outline-none focus:border-[#d4af37]/40" />
                    <button type="button" onClick={handleBatchNamesImport} className="w-full py-4 bg-[#d4af37]/20 text-[#d4af37] rounded-xl text-[9px] uppercase font-black hover:bg-[#d4af37] hover:text-black transition-all">Map to Remarks (Real Names)</button>
                   </>
                 )}
               </div>

               <div className="flex-grow overflow-y-auto pr-4 scrollbar-custom space-y-4">
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-gray-700 font-black">Track Listing ({tracks.length})</span>
                    <button type="button" onClick={handleCleanTitles} disabled={isCleaningTitles} className="text-[9px] uppercase tracking-[0.2em] text-[#d4af37] hover:underline font-black">{isCleaningTitles ? 'WRITING...' : '✨ 生成詩意標題'}</button>
                  </div>
                  {tracks.map((track, idx) => (
                    <div key={track.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 relative group">
                       <button type="button" onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="absolute top-4 right-4 text-gray-800 hover:text-red-500 transition-colors">×</button>
                       <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-mono text-gray-800">{String(idx + 1).padStart(2, '0')}</span>
                          <input 
                            type="text" 
                            value={track.title} 
                            onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, title: e.target.value } : t))} 
                            placeholder="Poetical Title / 詩意標題..." 
                            className="w-full bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 text-xs text-white tracking-wider outline-none focus:border-[#d4af37]"
                          />
                          <input 
                            type="text" 
                            value={track.remarks || ''} 
                            onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, remarks: e.target.value } : t))} 
                            placeholder="Real Name (Manual Key-in) / 人工歌名..." 
                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-2 text-[9px] text-gray-500 tracking-widest outline-none focus:border-[#d4af37]/20"
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <button type="submit" className="w-full py-8 bg-[#d4af37] text-black font-luxury uppercase tracking-[0.5em] rounded-[3rem] font-bold text-xl shadow-2xl mt-8 hover:scale-[1.01] transition-transform">Confirm Release</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
