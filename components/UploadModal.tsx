
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

  useEffect(() => {
    if (albumToEdit) {
      setTitle(albumToEdit.title);
      setDescription(albumToEdit.description);
      setStory(albumToEdit.story);
      setCoverImage(albumToEdit.coverImage);
      setTracks(albumToEdit.tracks);
    }
  }, [albumToEdit]);

  // Use Gemini to generate poetic insights/story
  const handleGenerateStory = async () => {
    if (!title || !description) {
      alert("請先輸入標題和描述，以便 AI 捕捉靈感。");
      return;
    }
    setIsGeneratingStory(true);
    const result = await getAlbumInsights(title, description);
    setStory(result);
    setIsGeneratingStory(false);
  };

  // Use Gemini to optimize track titles
  const handleCleanTitles = async () => {
    if (tracks.length === 0) return;
    setIsCleaningTitles(true);
    const rawTitles = tracks.map(t => t.title || '');
    const optimizedTitles = await cleanTrackTitles(rawTitles, title, description);
    
    const updatedTracks = tracks.map((track, idx) => ({
      ...track,
      title: optimizedTitles[idx] || track.title
    }));
    
    setTracks(updatedTracks);
    setIsCleaningTitles(false);
  };

  const handleAssetBatchImport = () => {
    if (!assetPaths.trim()) return;
    
    const lines = assetPaths.split(/\r?\n/).filter(line => line.trim() !== '');
    const newTracks: any[] = [];

    lines.forEach((line, idx) => {
      let rawPath = line.trim();
      // 移除引號，修正斜線
      rawPath = rawPath.replace(/^"(.*)"$/, '$1').replace(/\\/g, '/');

      // 智慧清理：如果使用者不小心貼了 Windows 絕對路徑，嘗試從 songs/ 或 public/ 之後切斷
      const markers = ['/songs/', '/public/', '/assets/', '/dist/', '/audio/'];
      let isLocalPath = /^[a-zA-Z]:\//.test(rawPath);
      
      if (isLocalPath) {
        let foundMarker = false;
        for (const marker of markers) {
          const foundIdx = rawPath.toLowerCase().lastIndexOf(marker);
          if (foundIdx !== -1) {
            rawPath = rawPath.substring(foundIdx + 1);
            foundMarker = true;
            break;
          }
        }
        if (!foundMarker) {
          // 如果真的沒有標記，只取檔名
          rawPath = rawPath.split('/').pop() || rawPath;
        }
      }

      // 移除開頭斜線以符合 GitHub Pages 相對路徑規則
      if (rawPath.startsWith('/')) rawPath = rawPath.substring(1);

      const fileName = rawPath.split('/').pop() || 'Unknown Track';
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

  const handleBatchImport = () => {
    const driveIdPattern = /[-\w]{25,50}/g;
    const results: any[] = [];
    const seenIds = new Set<string>();
    let match;
    while ((match = driveIdPattern.exec(batchLinks)) !== null) {
      const id = match[0];
      if (id.length < 25 || seenIds.has(id)) continue;
      seenIds.add(id);
      results.push({
        id: `drive-${id}-${Date.now()}`,
        title: `雲端音軌 ${id.substring(0, 4)}`,
        audioUrl: `https://drive.google.com/uc?id=${id}&export=download`,
        duration: '--:--',
        genre: 'Google Drive',
        mp3Url: `https://drive.google.com/file/d/${id}/view`,
        wavUrl: `https://drive.google.com/file/d/${id}/view`
      });
    }
    setTracks(prev => [...prev, ...results]);
    setBatchLinks('');
  };

  const handleDirectUrlImport = () => {
    if (!directUrl.trim()) return;
    const fileName = directUrl.split('/').pop()?.split('?')[0] || 'Unknown';
    setTracks(prev => [...prev, {
      id: `url-${Date.now()}`,
      title: decodeURIComponent(fileName.replace(/\.[^/.]+$/, "")),
      audioUrl: directUrl,
      duration: '--:--',
      genre: '外部直連',
      mp3Url: directUrl,
      wavUrl: directUrl
    }]);
    setDirectUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage || tracks.length === 0) {
      alert("請確保已輸入標題、封面圖並加入音軌。");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
      <div className="glass w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[4rem] p-10 md:p-16 shadow-2xl border border-white/10 relative scrollbar-custom">
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-4">
            <h2 className="text-5xl font-luxury tracking-widest uppercase text-white">
              {albumToEdit ? '編輯作品' : '發佈新作'}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setActiveTab('assets')} className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest border transition-all ${activeTab === 'assets' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>專案資產</button>
              <button type="button" onClick={() => setActiveTab('cloud')} className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest border transition-all ${activeTab === 'cloud' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>雲端硬碟</button>
              <button type="button" onClick={() => setActiveTab('direct')} className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest border transition-all ${activeTab === 'direct' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>外部網址</button>
            </div>
          </div>
          <button onClick={onClose} className="p-4 text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group cursor-pointer">
              {coverImage ? <img src={coverImage} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600 uppercase tracking-widest">點擊上傳封面圖</div>}
              <input type="file" accept="image/*" onChange={(e) => e.target.files && setCoverImage(URL.createObjectURL(e.target.files[0]))} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="專輯標題" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-luxury focus:outline-none" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="簡短描述這份靈感..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white h-24 focus:outline-none resize-none" />
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  {activeTab === 'assets' ? '🔗 匯入專案路徑' : activeTab === 'cloud' ? '☁️ 匯入雲端 ID' : '🌐 匯入直連網址'}
                </h4>
                {tracks.length > 0 && (
                  <button 
                    type="button" 
                    onClick={handleCleanTitles}
                    disabled={isCleaningTitles}
                    className="text-[9px] uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                  >
                    {isCleaningTitles ? '優化中...' : '✨ AI 優化曲名'}
                  </button>
                )}
              </div>
              
              {activeTab === 'assets' && (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-[11px] text-blue-300 leading-relaxed">
                      💡 <strong>提示：</strong>請先將歌曲檔案上傳到 GitHub 的 <code>songs/</code> 資料夾內。<br/>
                      在這裡輸入相對路徑，如：<code>songs/my_music.mp3</code>
                    </p>
                  </div>
                  <textarea 
                    value={assetPaths} 
                    onChange={(e) => setAssetPaths(e.target.value)} 
                    placeholder="可一次貼上多行路徑..." 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 h-32 focus:outline-none focus:border-white/30" 
                  />
                  <button type="button" onClick={handleAssetBatchImport} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] uppercase tracking-widest transition-all">解析並加入清單</button>
                </div>
              )}

              {activeTab === 'cloud' && (
                <div className="space-y-3">
                  <textarea value={batchLinks} onChange={(e) => setBatchLinks(e.target.value)} placeholder="貼上 Google Drive 分享網址..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 h-24 focus:outline-none" />
                  <button type="button" onClick={handleBatchImport} className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-[10px] uppercase tracking-widest transition-all">同步雲端資料</button>
                </div>
              )}

              {activeTab === 'direct' && (
                <div className="flex gap-2">
                  <input type="text" value={directUrl} onChange={(e) => setDirectUrl(e.target.value)} placeholder="https://..." className="flex-grow bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 focus:outline-none" />
                  <button type="button" onClick={handleDirectUrlImport} className="px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] uppercase tracking-widest transition-all">加入</button>
                </div>
              )}

              <div className="mt-6 max-h-[200px] overflow-y-auto space-y-2 scrollbar-custom">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-[9px] text-gray-600 font-luxury">{idx + 1}</span>
                      <div className="overflow-hidden">
                        <p className="text-xs text-white truncate">{track.title}</p>
                        <p className="text-[8px] text-gray-500 font-mono truncate">{track.audioUrl}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="text-red-500/50 hover:text-red-500 transition-colors px-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/5 relative group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">作品故事</span>
                <button 
                  type="button" 
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                  className="text-[9px] uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                >
                  {isGeneratingStory ? '編寫中...' : '🪄 AI 生成故事'}
                </button>
              </div>
              <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="寫下這份靈感的背後故事，或使用 AI 協助..." className="w-full bg-transparent border-none p-0 text-gray-400 text-sm italic font-light leading-relaxed focus:outline-none h-24 resize-none" />
            </div>

            <button type="submit" className="w-full py-5 bg-white text-black font-luxury uppercase tracking-widest rounded-2xl hover:scale-[1.01] transition-all shadow-xl active:scale-95">
              {albumToEdit ? '儲存變更' : '公開典藏'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
