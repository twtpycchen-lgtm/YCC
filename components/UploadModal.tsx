
import React, { useState, useEffect } from 'react';
import { Album, Track } from '../types';
import { getAlbumInsights, cleanTrackTitles } from '../services/geminiService';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (album: Album) => void;
  albumToEdit?: Album;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, albumToEdit }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'cloud' | 'direct' | 'assets'>('cloud');
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
  const [showDriveGuide, setShowDriveGuide] = useState(false);

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
      alert("請先輸入標題和描述，讓 AI 捕捉音樂的靈魂。");
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
    const rawTitles = tracks.map(t => t.title || '');
    const optimizedTitles = await cleanTrackTitles(rawTitles, title, description);
    const updatedTracks = tracks.map((track, idx) => ({
      ...track,
      title: optimizedTitles[idx] || track.title
    }));
    setTracks(updatedTracks);
    setIsCleaningTitles(false);
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
    if (results.length > 0) {
      setTracks(prev => [...prev, ...results]);
      setBatchLinks('');
    } else {
      alert("找不到有效的 Google Drive ID，請確保連結已開啟「知道連結的人皆可查看」。");
    }
  };

  const handleAssetBatchImport = () => {
    if (!assetPaths.trim()) return;
    const lines = assetPaths.split(/\r?\n/).filter(line => line.trim() !== '');
    const newTracks: any[] = [];
    lines.forEach((line, idx) => {
      let rawPath = line.trim().replace(/^"(.*)"$/, '$1').replace(/\\/g, '/');
      const fileName = rawPath.split('/').pop() || 'Unknown Track';
      const cleanName = fileName.replace(/\.(mp3|wav|ogg|aac|m4a)$/i, '');
      newTracks.push({
        id: `asset-${Date.now()}-${idx}`,
        title: decodeURIComponent(cleanName),
        audioUrl: rawPath,
        duration: '--:--',
        genre: '專案資產',
        mp3Url: rawPath,
        wavUrl: rawPath
      });
    });
    setTracks(prev => [...prev, ...newTracks]);
    setAssetPaths('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage || tracks.length === 0) {
      alert("請填寫標題、封面圖並至少加入一首曲目。");
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
      <div className="glass w-full max-w-6xl my-auto rounded-[4rem] p-10 md:p-16 shadow-2xl border border-white/10 relative scrollbar-custom">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-4">
            <h2 className="text-5xl font-luxury tracking-widest uppercase text-white">
              {albumToEdit ? '編輯典藏' : '發佈新作'}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setActiveTab('cloud')} className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest border transition-all ${activeTab === 'cloud' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>雲端硬碟 (推薦)</button>
              <button type="button" onClick={() => setActiveTab('assets')} className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest border transition-all ${activeTab === 'assets' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>專案資產</button>
            </div>
          </div>
          <button onClick={onClose} className="p-4 text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Metadata */}
          <div className="space-y-6">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group cursor-pointer shadow-inner">
              {coverImage ? <img src={coverImage} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-600 uppercase tracking-[0.3em]">點擊上傳封面藝術</div>}
              <input type="file" accept="image/*" onChange={(e) => e.target.files && setCoverImage(URL.createObjectURL(e.target.files[0]))} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="音樂專輯標題" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-luxury focus:outline-none focus:border-white/30 transition-all" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="這張專輯的創作靈感是..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white h-32 focus:outline-none focus:border-white/30 resize-none transition-all" />
          </div>

          {/* Right Column: Audio & AI Story */}
          <div className="space-y-6">
            <div className="glass p-8 rounded-3xl border border-white/5 bg-white/[0.01]">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                  {activeTab === 'cloud' ? '☁️ 雲端匯入 (支援大檔案)' : '🔗 本地專案路徑'}
                  {activeTab === 'cloud' && (
                    <button type="button" onClick={() => setShowDriveGuide(!showDriveGuide)} className="text-blue-400 hover:underline lowercase font-normal italic">如何取得 ID?</button>
                  )}
                </h4>
                {tracks.length > 0 && (
                  <button type="button" onClick={handleCleanTitles} disabled={isCleaningTitles} className="text-[9px] uppercase tracking-widest text-blue-400 hover:text-white transition-all">
                    {isCleaningTitles ? '優化中...' : '✨ AI 潤飾曲名'}
                  </button>
                )}
              </div>

              {showDriveGuide && activeTab === 'cloud' && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[11px] text-blue-200 leading-relaxed animate-fade-in">
                  <p className="font-bold mb-1">解決 GitHub 超過 25MB 限制：</p>
                  1. 將 MP3 上傳至 Google Drive。<br/>
                  2. 點擊「分享」，將權限設為「知道連結的人皆可查看」。<br/>
                  3. 複製連結並貼在下方，系統會自動抓取檔案 ID。
                </div>
              )}

              {activeTab === 'cloud' ? (
                <div className="space-y-3">
                  <textarea value={batchLinks} onChange={(e) => setBatchLinks(e.target.value)} placeholder="貼上 Google Drive 分享連結 (可多筆)..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 h-28 focus:outline-none focus:border-white/30 shadow-inner" />
                  <button type="button" onClick={handleBatchImport} className="w-full py-4 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-xl text-[10px] uppercase tracking-widest transition-all border border-blue-500/30">同步雲端檔案</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[10px] text-orange-200 mb-2">
                    ⚠️ GitHub 限制單一檔案需小於 25MB。大檔案請改用「雲端硬碟」。
                  </div>
                  <textarea value={assetPaths} onChange={(e) => setAssetPaths(e.target.value)} placeholder="songs/my_song.mp3" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 h-28 focus:outline-none focus:border-white/30 shadow-inner" />
                  <button type="button" onClick={handleAssetBatchImport} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] uppercase tracking-widest transition-all border border-white/10">匯入專案路徑</button>
                </div>
              )}

              <div className="mt-6 max-h-[160px] overflow-y-auto space-y-2 pr-2 scrollbar-custom">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-[9px] text-gray-600 font-mono">{idx + 1}</span>
                      <p className="text-xs text-white truncate">{track.title}</p>
                    </div>
                    <button type="button" onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="text-gray-600 hover:text-red-500 transition-colors px-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Story Section */}
            <div className="glass p-8 rounded-3xl border border-white/5 bg-white/[0.01] relative group">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">AI 敘事故事</span>
                <button 
                  type="button" 
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                  className={`text-[9px] uppercase tracking-[0.2em] px-5 py-2 rounded-full border transition-all ${isGeneratingStory ? 'text-gray-500 border-white/5' : 'text-purple-400 border-purple-500/40 hover:text-white hover:bg-purple-600/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] animate-pulse'}`}
                >
                  {isGeneratingStory ? '🔮 正在編寫...' : '✨ 立即生成靈感故事'}
                </button>
              </div>
              <textarea 
                value={story} 
                onChange={(e) => setStory(e.target.value)} 
                placeholder="AI 將根據標題與描述，為您的音樂撰寫一段充滿藝術感的介紹文字..." 
                className="w-full bg-transparent border-none p-0 text-gray-300 text-sm italic font-light leading-relaxed focus:outline-none h-32 resize-none scrollbar-custom" 
              />
              {story && !isGeneratingStory && (
                <div className="absolute bottom-4 right-4 text-[8px] text-gray-700 uppercase tracking-widest">Story Locked</div>
              )}
            </div>

            <button type="submit" className="w-full py-6 bg-white text-black font-luxury uppercase tracking-[0.3em] rounded-2xl hover:bg-gray-200 transition-all shadow-2xl active:scale-95 text-sm font-bold">
              {albumToEdit ? '確認更新典藏' : '公開發佈典藏'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
