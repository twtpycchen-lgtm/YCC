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
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isCleaningTitles, setIsCleaningTitles] = useState(false);
  const [viewMode, setViewMode] = useState<'raw' | 'optimized'>('raw');

  useEffect(() => {
    if (albumToEdit) {
      setTitle(albumToEdit.title);
      setDescription(albumToEdit.description);
      setStory(albumToEdit.story || '');
      setCoverImage(albumToEdit.coverImage);
      setTracks(albumToEdit.tracks);
      if (albumToEdit.tracks.some(t => t.title.includes('<'))) setViewMode('optimized');
    }
  }, [albumToEdit]);

  /**
   * 精準提取中文檔名
   */
  const getRawFilename = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      let filename = url.pathname.split('/').pop() || "";
      if (!filename) filename = url.searchParams.get('title') || "未命名音軌";
      
      // 處理編碼與副檔名
      const decoded = decodeURIComponent(filename);
      return decoded.replace(/\.[^/.]+$/, "").trim();
    } catch (e) {
      // 容錯邏輯
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

      // Dropbox 深度優化
      if (finalUrl.includes('dropbox.com')) {
        genre = 'Dropbox 💎';
        // 替換主機名並確保帶有 raw=1
        finalUrl = finalUrl.replace(/www\.dropbox\.com/g, 'dl.dropboxusercontent.com');
        const urlObj = new URL(finalUrl);
        urlObj.searchParams.set('raw', '1');
        urlObj.searchParams.delete('dl');
        finalUrl = urlObj.toString();
      } 
      // Google Drive 優化
      else if (finalUrl.includes('drive.google.com')) {
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
        wavUrl: line.trim()
      };
    });

    setTracks(prev => [...prev, ...results]);
    setBatchLinks('');
  };

  const handleCleanTitles = async () => {
    if (tracks.length === 0) return;
    setIsCleaningTitles(true);
    try {
      const trackData = tracks.map(t => ({ id: t.id || '', title: t.originalTitle || t.title || '' }));
      const optimized = await cleanTrackTitles(trackData, title);
      setTracks(prev => prev.map((t, i) => ({ ...t, title: optimized[i] || t.title })));
      setViewMode('optimized');
    } catch (e) { alert("AI 優化暫時失敗"); }
    finally { setIsCleaningTitles(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage || tracks.length === 0) return alert("請完整填寫專輯資訊");
    
    const finalTracks = tracks.map(t => ({
      ...t,
      title: viewMode === 'raw' ? t.originalTitle : (t.title || t.originalTitle)
    })) as Track[];

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
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-y-auto animate-fade-in">
      <div className="glass w-full max-w-6xl my-auto rounded-[3.5rem] p-12 border border-white/10 shadow-2xl relative">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-luxury text-white uppercase tracking-widest">{albumToEdit ? '修復典藏' : '策展發佈'}</h2>
          <button onClick={onClose} className="p-3 text-gray-500 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden relative cursor-pointer group">
              {coverImage ? <img src={coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-600 uppercase tracking-widest text-sm">點擊上傳藝術封面</div>}
              <input type="file" accept="image/*" onChange={(e) => {
                if(e.target.files?.[0]) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setCoverImage(ev.target?.result as string);
                  reader.readAsDataURL(e.target.files[0]);
                }
              }} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="專輯標題" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-luxury text-2xl focus:border-[#d4af37]/50" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="簡短背景描述" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white h-28 text-sm focus:border-[#d4af37]/50" />
            <div className="relative">
              <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="點擊按鈕，讓 AI 為音樂注入靈魂故事..." className="w-full bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl p-6 text-[#d4af37] text-sm italic h-44 focus:outline-none" />
              <button type="button" onClick={async () => { setIsGeneratingStory(true); setStory(await getAlbumInsights(title, description)); setIsGeneratingStory(false); }} disabled={isGeneratingStory} className="absolute bottom-6 right-6 px-6 py-2 bg-[#d4af37] text-black text-[10px] uppercase font-black rounded-full shadow-lg">
                {isGeneratingStory ? '編寫中...' : '✨ 生成靈魂故事'}
              </button>
            </div>
          </div>

          <div className="space-y-10">
            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold">音軌批次管理</h4>
                {tracks.length > 0 && (
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setViewMode(viewMode === 'raw' ? 'optimized' : 'raw')} className="text-[10px] uppercase tracking-widest font-black border border-white/10 px-4 py-2 rounded-full text-gray-400">
                      🔄 {viewMode === 'raw' ? '顯示原始' : '顯示優化'}
                    </button>
                    <button type="button" onClick={handleCleanTitles} disabled={isCleaningTitles} className="text-[10px] uppercase tracking-widest font-black bg-[#d4af37]/20 text-[#d4af37] px-4 py-2 rounded-full">
                      {isCleaningTitles ? '策展中...' : '✨ AI 靈魂優化'}
                    </button>
                  </div>
                )}
              </div>
              <textarea value={batchLinks} onChange={(e) => setBatchLinks(e.target.value)} placeholder="貼上多行連結 (Dropbox / Google Drive)" className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xs font-mono text-gray-500 h-36 focus:outline-none mb-6" />
              <button type="button" onClick={handleBatchImport} className="w-full py-5 bg-white text-black rounded-2xl text-sm uppercase font-black shadow-xl hover:bg-[#d4af37] transition-all">導入批次音軌</button>
              
              <div className="mt-8 max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scroll">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-xs text-gray-700 font-mono w-6">{idx + 1}</span>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm text-white truncate font-bold tracking-wider">
                        {viewMode === 'raw' ? track.originalTitle : (track.title || track.originalTitle)}
                      </p>
                      <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">{track.genre}</span>
                    </div>
                    <button type="button" onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="text-gray-700 hover:text-red-500 p-2">×</button>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full py-8 bg-[#d4af37] text-black font-luxury uppercase tracking-[0.5em] rounded-[2.5rem] font-bold text-lg hover:scale-[1.01] transition-all shadow-2xl active:scale-95">完成並正式發佈</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;