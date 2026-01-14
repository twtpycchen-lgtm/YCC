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
  
  // 切換模式：'raw' 代表原始檔名, 'optimized' 代表 AI 優化
  const [viewMode, setViewMode] = useState<'raw' | 'optimized'>('raw');

  useEffect(() => {
    if (albumToEdit) {
      setTitle(albumToEdit.title);
      setDescription(albumToEdit.description);
      setStory(albumToEdit.story || '');
      setCoverImage(albumToEdit.coverImage);
      setTracks(albumToEdit.tracks);
      // 如果已經有帶括號的標題，預設顯示優化模式
      const hasOptimized = albumToEdit.tracks.some(t => t.title.startsWith('<'));
      if (hasOptimized) setViewMode('optimized');
    }
  }, [albumToEdit]);

  /**
   * 強化版檔名提取：完整支援中文與特殊符號
   */
  const getRawFilename = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      let filename = parts[parts.length - 1].split('?')[0] || "未命名音軌";
      // 移除副檔名
      return filename.replace(/\.[^/.]+$/, ""); 
    } catch (e) {
      return "解析失敗音軌";
    }
  };

  const handleGenerateStory = async () => {
    if (!title || !description) {
      alert("請先輸入專輯標題與描述，AI 才能撰寫故事。");
      return;
    }
    setIsGeneratingStory(true);
    try {
      const result = await getAlbumInsights(title, description);
      setStory(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleCleanTitles = async () => {
    if (tracks.length === 0) return;
    setIsCleaningTitles(true);
    try {
      // 使用原始檔名作為 AI 優化的輸入，確保最精準
      const trackData = tracks.map(t => ({ id: t.id || '', title: t.originalTitle || t.title || '' }));
      const optimizedTitles = await cleanTrackTitles(trackData, title);
      
      setTracks(prev => prev.map((t, idx) => ({ 
        ...t, 
        title: optimizedTitles[idx] || t.title 
      })));
      setViewMode('optimized'); // 自動切換到優化預覽
    } catch (err) {
      console.error("AI 標題優化失敗", err);
      alert("AI 標題優化暫時無法使用。");
    } finally {
      setIsCleaningTitles(false);
    }
  };

  const handleBatchImport = () => {
    const results: any[] = [];
    const lines = batchLinks.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    
    lines.forEach((link, idx) => {
      let finalAudioUrl = link;
      let genre = '雲端串流';
      const rawName = getRawFilename(link);

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
      } else if (link.includes('drive.google.com')) {
        const driveMatch = link.match(/[-\w]{25,50}/);
        if (driveMatch) {
          genre = 'Google Drive';
          finalAudioUrl = `https://docs.google.com/uc?export=download&id=${driveMatch[0]}`;
        }
      }

      results.push({
        id: `track-${Date.now()}-${idx}`,
        title: rawName, // 初始標題設為原始檔名
        originalTitle: rawName, // 永久存檔
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
      setViewMode('raw');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage || tracks.length === 0) {
      alert("請確保已填寫標題、封面並導入音軌。");
      return;
    }
    
    // 如果在原始模式提交，確保標題被正確保存
    const finalTracks = tracks.map(t => ({
      ...t,
      // 如果處於 raw 模式，我們依然將 title 存為當前顯示的內容
      title: viewMode === 'raw' ? t.originalTitle : t.title
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-y-auto">
      <div className="glass w-full max-w-6xl my-auto rounded-[3rem] p-10 md:p-14 shadow-2xl border border-white/10 relative">
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-luxury tracking-widest uppercase text-white">
              {albumToEdit ? '典藏修復' : '爵非策展'}
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-5 py-2 rounded-full text-xs uppercase tracking-widest bg-white text-black font-black">
                {viewMode === 'raw' ? '顯示原始檔名' : '顯示 AI 優化標題'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 左側：專輯基礎資訊 */}
          <div className="space-y-8">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group cursor-pointer shadow-inner">
              {coverImage ? <img src={coverImage} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600 uppercase tracking-[0.3em] text-center px-10">點擊上傳藝術封面</div>}
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
              placeholder="專輯標題" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-luxury text-xl focus:outline-none focus:border-[#d4af37]/40 transition-all" 
            />
            
            <div className="space-y-4">
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="專輯描述 (例如：2025 AI 爵士樂章)" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white h-28 focus:outline-none focus:border-[#d4af37]/40 resize-none transition-all text-sm" 
              />
              
              <div className="relative group">
                <textarea 
                  value={story} 
                  onChange={(e) => setStory(e.target.value)} 
                  placeholder="點擊下方按鈕，讓 AI 為您的音樂編寫靈魂故事..." 
                  className="w-full bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl p-6 text-[#d4af37]/90 text-sm italic leading-relaxed h-44 focus:outline-none focus:border-[#d4af37]/40 resize-none transition-all" 
                />
                <button 
                  type="button" 
                  onClick={handleGenerateStory} 
                  disabled={isGeneratingStory} 
                  className="absolute bottom-6 right-6 px-8 py-3 bg-[#d4af37] text-black text-sm uppercase tracking-[0.2em] rounded-full font-black hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                >
                  {isGeneratingStory ? '編寫中...' : '✨ 生成故事'}
                </button>
              </div>
            </div>
          </div>

          {/* 右側：音軌批次處理 */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold">音軌批次管理</h4>
                {tracks.length > 0 && (
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setViewMode(viewMode === 'raw' ? 'optimized' : 'raw')}
                      className="text-xs uppercase tracking-widest font-black border border-white/10 px-5 py-2 rounded-full hover:bg-white/5 transition-all text-gray-400"
                    >
                      🔄 切換檢視
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCleanTitles} 
                      disabled={isCleaningTitles}
                      className="text-xs uppercase tracking-widest font-black border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37] px-5 py-2 rounded-full hover:bg-[#d4af37]/20 transition-all"
                    >
                      {isCleaningTitles ? '優化中...' : '✨ AI 標題優化'}
                    </button>
                  </div>
                )}
              </div>

              <textarea 
                value={batchLinks} 
                onChange={(e) => setBatchLinks(e.target.value)} 
                placeholder="貼上音樂連結 (Dropbox / Google Drive)，每行一個。" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xs font-mono text-gray-400 h-36 focus:outline-none focus:border-[#d4af37]/20 transition-all mb-4" 
              />
              
              <button 
                type="button" 
                onClick={handleBatchImport} 
                className="w-full py-5 bg-white text-black rounded-2xl text-sm uppercase tracking-[0.2em] transition-all font-black shadow-lg hover:bg-[#d4af37]"
              >
                批量導入原始音軌
              </button>

              <div className="mt-8 max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-custom">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                    <span className="text-sm text-gray-600 font-mono w-6">{idx + 1}</span>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm text-white truncate font-bold tracking-wider">
                        {viewMode === 'raw' ? track.originalTitle : (track.title || track.originalTitle)}
                      </p>
                      <span className="text-[10px] text-gray-600 uppercase tracking-widest">{track.genre}</span>
                    </div>
                    <button type="button" onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="text-gray-500 hover:text-red-500 transition-colors p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-7 bg-[#d4af37] text-black font-luxury uppercase tracking-[0.5em] rounded-3xl font-bold text-base hover:scale-[1.02] transition-all shadow-2xl active:scale-95"
            >
              發佈並存檔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;