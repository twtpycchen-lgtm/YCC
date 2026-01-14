
import React, { useState, useEffect } from 'react';
import { Album, Track } from '../types';
import { getAlbumInsights, cleanTrackTitles } from '../services/geminiService';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (album: Album) => void;
  albumToEdit?: Album;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, albumToEdit }) => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'assets'>('cloud');
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

  const handleGenerateStory = async () => {
    if (!title || !description) {
      alert("請輸入資訊。");
      return;
    }
    setIsGeneratingStory(true);
    try {
      const result = await getAlbumInsights(title, description);
      setStory(result);
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
      setTracks(prev => prev.map((t, idx) => ({ ...t, title: optimizedTitles[idx] || t.title })));
    } finally {
      setIsCleaningTitles(false);
    }
  };

  const handleBatchImport = () => {
    const results: any[] = [];
    // 嚴格按行分割，避免網址中間的符號導致錯誤切分
    const lines = batchLinks.split('\n').map(l => l.trim()).filter(l => l.length > 10);
    
    lines.forEach((link, idx) => {
      let finalAudioUrl = link;
      let genre = '雲端串流';

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
        title: `音軌 ${tracks.length + results.length + 1}`,
        audioUrl: finalAudioUrl,
        duration: '--:--',
        genre: genre,
        mp3Url: link, // 保留原始連結供參考
        wavUrl: link
      });
    });

    if (results.length > 0) {
      setTracks(prev => [...prev, ...results]);
      setBatchLinks('');
    } else {
      alert("未偵測到有效的連結。請確保每行一個連結。");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage || tracks.length === 0) {
      alert("請填寫專輯標題、封面並匯入至少一首歌曲。");
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
              {albumToEdit ? '典藏修復' : '公開新作'}
            </h2>
            <div className="flex gap-3">
              <button type="button" onClick={() => setActiveTab('cloud')} className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest border transition-all ${activeTab === 'cloud' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>雲端硬碟匯入</button>
              <button type="button" onClick={() => setActiveTab('assets')} className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest border transition-all ${activeTab === 'assets' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>手動設定</button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group cursor-pointer shadow-inner">
              {coverImage ? <img src={coverImage} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-600 uppercase tracking-[0.3em]">點擊上傳封面藝術</div>}
              <input type="file" accept="image/*" onChange={(e) => e.target.files && setCoverImage(URL.createObjectURL(e.target.files[0]))} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="專輯標題" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-luxury focus:outline-none" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述靈魂..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white h-24 focus:outline-none resize-none" />
          </div>

          <div className="space-y-6">
            <div className="glass p-8 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">匯入音軌</h4>
                {tracks.length > 0 && <button type="button" onClick={handleCleanTitles} className="text-[9px] uppercase tracking-widest text-blue-400">{isCleaningTitles ? 'AI 命名中...' : '✨ AI 潤飾歌名'}</button>}
              </div>

              {activeTab === 'cloud' ? (
                <div className="space-y-3">
                  <textarea value={batchLinks} onChange={(e) => setBatchLinks(e.target.value)} placeholder="請輸入 Dropbox 或 Google Drive 連結，每行一個..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 h-32 focus:outline-none focus:border-white/30" />
                  <button type="button" onClick={handleBatchImport} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] uppercase tracking-widest transition-all border border-white/10 font-bold">同步連結</button>
                </div>
              ) : (
                <div className="space-y-3">
                   <p className="text-[10px] text-gray-500 uppercase">請先切換至「雲端硬碟匯入」模式進行批次操作。</p>
                </div>
              )}

              <div className="mt-6 max-h-[120px] overflow-y-auto space-y-2 pr-2 scrollbar-custom">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group">
                    <span className="text-[10px] text-gray-600 font-mono w-4">{idx + 1}</span>
                    <div className="flex-grow min-w-0">
                      <p className="text-[10px] text-white truncate font-bold">{track.title}</p>
                      <p className="text-[8px] text-gray-500 truncate font-mono">{track.mp3Url?.substring(0, 50)}...</p>
                    </div>
                    <button type="button" onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="text-gray-600 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">AI 故事導讀</span>
                <button type="button" onClick={handleGenerateStory} disabled={isGeneratingStory} className="text-[9px] uppercase tracking-widest text-purple-400">{isGeneratingStory ? '撰寫中...' : '重新生成'}</button>
              </div>
              <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="AI 將根據標題生成這張專輯的靈魂故事..." className="w-full bg-transparent border-none p-0 text-gray-300 text-sm italic focus:outline-none h-20 resize-none leading-relaxed" />
            </div>

            <button type="submit" className="w-full py-6 bg-white text-black font-luxury uppercase tracking-[0.3em] rounded-2xl font-bold text-xs hover:bg-gray-200 transition-all shadow-2xl">正式發佈專輯</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
