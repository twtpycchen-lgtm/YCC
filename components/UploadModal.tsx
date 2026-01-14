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

  useEffect(() => {
    if (albumToEdit) {
      setTitle(albumToEdit.title);
      setDescription(albumToEdit.description);
      setStory(albumToEdit.story || '');
      setCoverImage(albumToEdit.coverImage);
      setTracks(albumToEdit.tracks);
    }
  }, [albumToEdit]);

  /**
   * 原始檔名提取：僅移除路徑與副檔名
   * 輸入：3_V1_摩天輪的告白_原始GK版_V1.mp3
   * 輸出：3_V1_摩天輪的告白_原始GK版_V1
   */
  const getRawFilename = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const filename = decodedUrl.split('/').pop()?.split('?')[0] || "未命名";
      return filename.replace(/\.[^/.]+$/, ""); 
    } catch (e) {
      return "音軌解析失敗";
    }
  };

  const handleGenerateStory = async () => {
    if (!title || !description) {
      alert("請先輸入標題與描述，AI 才能根據主題編撰故事。");
      return;
    }
    setIsGeneratingStory(true);
    try {
      const result = await getAlbumInsights(title, description);
      setStory(result);
    } catch (err) {
      console.error(err);
      alert("AI 生成故事失敗。");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleCleanTitles = async () => {
    if (tracks.length === 0) return;
    setIsCleaningTitles(true);
    try {
      const trackData = tracks.map(t => ({ id: t.id || '', title: t.title || '' }));
      const optimizedTitles = await cleanTrackTitles(trackData, title);
      // 確保最終格式強制包裹角括號
      const finalFormatted = optimizedTitles.map(t => {
        let clean = t.trim();
        if (clean.startsWith('<') && clean.endsWith('>')) return clean;
        return `<${clean.replace(/[<>]/g, '')}>`;
      });
      setTracks(prev => prev.map((t, idx) => ({ ...t, title: finalFormatted[idx] || t.title })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsCleaningTitles(false);
    }
  };

  const handleBatchImport = () => {
    const results: any[] = [];
    const lines = batchLinks.split('\n').map(l => l.trim()).filter(l => l.length > 10);
    
    lines.forEach((link, idx) => {
      let finalAudioUrl = link;
      let genre = '雲端串流';
      let originalTitle = getRawFilename(link); 

      if (link.includes('dropbox.com')) {
        genre = 'Dropbox 💎';
        let direct = link.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
        if (direct.includes('?')) {
          direct = direct.replace(/dl=[01]/g, 'raw=1');
          if (!direct.includes('raw=1')) direct += '&raw=1';
        } else {
          direct += '?raw=1';
        }
        finalAudioUrl = direct;
      } 
      else if (link.includes('drive.google.com')) {
        const driveMatch = link.match(/[-\w]{25,50}/);
        if (driveMatch) {
          genre = 'Google Drive';
          finalAudioUrl = `https://docs.google.com/uc?export=download&id=${driveMatch[0]}`;
        }
      }

      results.push({
        id: `track-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        title: originalTitle, 
        audioUrl: finalAudioUrl,
        duration: '--:--',
        genre: genre,
        mp3Url: link,
        wavUrl: link
      });
    });

    if (results.length > 0) {
      setTracks(prev => [...prev, ...results]);
      setBatchLinks('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage || tracks.length === 0) {
      alert("請完成所有必要資訊（封面、標題、至少一首歌曲）。");
      return;
    }
    
    onUpload({
      id: albumToEdit ? albumToEdit.id : `album-${Date.now()}`,
      title,
      description,
      story, 
      coverImage,
      releaseDate: albumToEdit ? albumToEdit.releaseDate : new Date().toLocaleDateString('zh-TW'),
      tracks: tracks as Track[]
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-y-auto">
      <div className="glass w-full max-w-6xl my-auto rounded-[3rem] p-10 md:p-14 shadow-2xl border border-white/10 relative">
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-luxury tracking-widest uppercase text-white">
              {albumToEdit ? '典藏修復' : '爵非策展'}
            </h2>
            <div className="flex gap-3">
              <span className="px-5 py-2 rounded-full text-xs uppercase tracking-widest bg-white text-black font-black">原始檔名模式已啟動</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 左側：專輯資訊 */}
          <div className="space-y-6">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group cursor-pointer shadow-inner">
              {coverImage ? <img src={coverImage} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600 uppercase tracking-[0.3em] text-center px-10">點擊上傳封面藝術</div>}
              <input type="file" accept="image/*" onChange={(e) => {
                if(e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (event) => setCoverImage(event.target?.result as string);
                  reader.readAsDataURL(e.target.files[0]);
                }
              }} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="典藏專輯標題" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-luxury focus:outline-none focus:border-[#d4af37]/40 transition-all" 
            />
            
            <div className="space-y-4">
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="描述此段音軌的靈魂主題..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white h-24 focus:outline-none focus:border-[#d4af37]/40 resize-none transition-all text-sm" 
              />
              
              <div className="relative group">
                <textarea 
                  value={story} 
                  onChange={(e) => setStory(e.target.value)} 
                  placeholder="AI Session Story..." 
                  className="w-full bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl p-6 text-[#d4af37]/90 text-sm italic leading-relaxed h-36 focus:outline-none focus:border-[#d4af37]/40 resize-none transition-all" 
                />
                <button 
                  type="button" 
                  onClick={handleGenerateStory} 
                  disabled={isGeneratingStory} 
                  className="absolute bottom-4 right-4 px-6 py-2 bg-[#d4af37] text-black text-xs uppercase tracking-[0.2em] rounded-full font-black hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                >
                  {isGeneratingStory ? '編撰中...' : '✨ 生成故事'}
                </button>
              </div>
            </div>
          </div>

          {/* 右側：音軌導入 */}
          <div className="space-y-6">
            <div className="glass p-8 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold">批次導入音檔</h4>
                {tracks.length > 0 && (
                  <button 
                    type="button" 
                    onClick={handleCleanTitles} 
                    className={`text-xs uppercase tracking-widest font-black border px-5 py-2 rounded-full transition-all ${isCleaningTitles ? 'bg-white text-black' : 'text-[#d4af37] border-[#d4af37]/20 hover:bg-[#d4af37]/10'}`}
                  >
                    {isCleaningTitles ? '提取中...' : '✨ 標題優化 < >'}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <textarea 
                  value={batchLinks} 
                  onChange={(e) => setBatchLinks(e.target.value)} 
                  placeholder="每行一個連結。導入時將顯示原始檔名..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 h-32 focus:outline-none focus:border-[#d4af37]/20 transition-all" 
                />
                <button 
                  type="button" 
                  onClick={handleBatchImport} 
                  className="w-full py-4 bg-[#d4af37] hover:bg-[#b8952d] text-black rounded-xl text-xs uppercase tracking-widest transition-all font-black shadow-lg"
                >
                  批量導入原始音軌
                </button>
              </div>

              <div className="mt-8 max-h-[220px] overflow-y-auto space-y-2 pr-2 scrollbar-custom">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-xs text-gray-600 font-mono w-4">{idx + 1}</span>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm text-white truncate font-bold tracking-wider">{track.title}</p>
                    </div>
                    <button type="button" onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="text-gray-600 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-6 bg-white text-black font-luxury uppercase tracking-[0.4em] rounded-2xl font-bold text-sm hover:bg-[#d4af37] transition-all shadow-2xl active:scale-95"
            >
              發佈至策展典藏
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;