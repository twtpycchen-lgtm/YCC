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
      const hasOptimized = albumToEdit.tracks.some(t => t.title.startsWith('<'));
      if (hasOptimized) setViewMode('optimized');
    }
  }, [albumToEdit]);

  const getRawFilename = (url: string) => {
    try {
      // 確保針對 Dropbox 等 URL 中的中文進行正確解碼
      const urlObject = new URL(url);
      const pathParts = urlObject.pathname.split('/');
      let filename = pathParts[pathParts.length - 1];
      filename = decodeURIComponent(filename);
      return filename.replace(/\.[^/.]+$/, ""); // 移除副檔名
    } catch (e) {
      // 備用方案：簡單切分
      try {
        const simpleName = url.split('/').pop()?.split('?')[0] || "未命名音軌";
        return decodeURIComponent(simpleName).replace(/\.[^/.]+$/, "");
      } catch {
        return "解析失敗音軌";
      }
    }
  };

  const handleCleanTitles = async () => {
    if (tracks.length === 0) return;
    setIsCleaningTitles(true);
    try {
      const trackData = tracks.map(t => ({ id: t.id || '', title: t.originalTitle || t.title || '' }));
      const optimizedTitles = await cleanTrackTitles(trackData, title);
      
      setTracks(prev => prev.map((t, idx) => ({ 
        ...t, 
        title: optimizedTitles[idx] || t.title 
      })));
      setViewMode('optimized');
    } catch (err) {
      alert("AI 標題優化暫時無法使用。");
    } finally {
      setIsCleaningTitles(false);
    }
  };

  const handleBatchImport = () => {
    const lines = batchLinks.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const results = lines.map((link, idx) => {
      let finalUrl = link;
      let genre = '雲端音訊';
      const rawName = getRawFilename(link);

      if (link.includes('dropbox.com')) {
        genre = 'Dropbox 💎';
        finalUrl = link.replace('www.dropbox.com', 'dl.dropboxusercontent.com').split('?')[0] + '?raw=1';
      } else if (link.includes('drive.google.com')) {
        const match = link.match(/[-\w]{25,50}/);
        if (match) {
          genre = 'Google Drive';
          finalUrl = `https://docs.google.com/uc?export=download&id=${match[0]}`;
        }
      }

      return {
        id: `track-${Date.now()}-${idx}`,
        title: rawName,
        originalTitle: rawName,
        audioUrl: finalUrl,
        duration: '--:--',
        genre: genre,
        mp3Url: link,
        wavUrl: link
      };
    });

    setTracks(prev => [...prev, ...results]);
    setBatchLinks('');
    setViewMode('raw');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage || tracks.length === 0) return alert("資訊不完整");
    
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-y-auto animate-fade-in">
      <div className="glass w-full max-w-6xl my-auto rounded-[3rem] p-10 md:p-14 border border-white/10 shadow-2xl relative">
        <div className="flex justify-between items-start mb-10">
          <h2 className="text-4xl font-luxury tracking-widest uppercase text-white">{albumToEdit ? '典藏修復' : '爵非策展'}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group cursor-pointer">
              {coverImage ? <img src={coverImage} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600 uppercase tracking-widest text-center px-10">點擊上傳封面</div>}
              <input type="file" accept="image/*" onChange={(e) => {
                if(e.target.files?.[0]) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setCoverImage(ev.target?.result as string);
                  reader.readAsDataURL(e.target.files[0]);
                }
              }} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="專輯標題" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-luxury text-xl focus:outline-none focus:border-[#d4af37]/40 transition-all" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="簡短描述" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white h-24 focus:outline-none focus:border-[#d4af37]/40 text-sm" />
            <div className="relative">
              <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="AI 將在此為您撰寫動人故事..." className="w-full bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl p-6 text-[#d4af37]/90 text-sm italic h-40 focus:outline-none" />
              <button type="button" onClick={async () => { setIsGeneratingStory(true); setStory(await getAlbumInsights(title, description)); setIsGeneratingStory(false); }} disabled={isGeneratingStory} className="absolute bottom-6 right-6 px-6 py-2 bg-[#d4af37] text-black text-xs uppercase tracking-widest rounded-full font-black shadow-xl hover:scale-105 transition-all">
                {isGeneratingStory ? '編寫中...' : '✨ 生成故事'}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass p-8 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold">音軌批次處理</h4>
                {tracks.length > 0 && (
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setViewMode(viewMode === 'raw' ? 'optimized' : 'raw')} className="text-xs uppercase tracking-widest font-black border border-white/10 px-4 py-2 rounded-full text-gray-400">
                      🔄 {viewMode === 'raw' ? '原始模式' : 'AI 模式'}
                    </button>
                    <button type="button" onClick={handleCleanTitles} disabled={isCleaningTitles} className="text-xs uppercase tracking-widest font-black bg-[#d4af37]/20 text-[#d4af37] px-4 py-2 rounded-full">
                      {isCleaningTitles ? '優化中...' : '✨ AI 優化'}
                    </button>
                  </div>
                )}
              </div>
              <textarea value={batchLinks} onChange={(e) => setBatchLinks(e.target.value)} placeholder="貼上音訊連結 (Dropbox / Drive)" className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xs font-mono text-gray-400 h-32 focus:outline-none mb-4" />
              <button type="button" onClick={handleBatchImport} className="w-full py-4 bg-white text-black rounded-2xl text-sm uppercase tracking-widest transition-all font-black shadow-lg hover:bg-[#d4af37]">批量導入音軌</button>
              
              <div className="mt-8 max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-custom">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <span className="text-xs text-gray-600 font-mono">{idx + 1}</span>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm text-white truncate font-bold">
                        {viewMode === 'raw' ? track.originalTitle : (track.title || track.originalTitle)}
                      </p>
                      <span className="text-[10px] text-gray-600 uppercase tracking-widest">{track.genre}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full py-6 bg-[#d4af37] text-black font-luxury uppercase tracking-widest rounded-3xl font-bold text-sm hover:scale-[1.02] transition-all shadow-2xl">發佈作品集</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;