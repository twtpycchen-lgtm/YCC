
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
    // 精確匹配 ID，無論連結包含 view, drive_link 還是 uc?id=
    const driveIdPattern = /[-\w]{25,50}/g;
    const results: any[] = [];
    const seenIds = new Set<string>();
    let match;
    while ((match = driveIdPattern.exec(batchLinks)) !== null) {
      const id = match[0];
      if (id.length < 25 || seenIds.has(id)) continue;
      seenIds.add(id);
      results.push({
        id: `drive-${id}-${Date.now()}-${results.length}`,
        title: `音軌 #${results.length + 1}`,
        audioUrl: `https://drive.google.com/uc?export=download&id=${id}`,
        duration: '--:--',
        genre: '雲端串流',
        mp3Url: `https://drive.google.com/file/d/${id}/view`,
        wavUrl: `https://drive.google.com/file/d/${id}/view`
      });
    }
    if (results.length > 0) {
      setTracks(prev => [...prev, ...results]);
      setBatchLinks('');
    } else {
      alert("找不到有效的 Google Drive ID。請確認您貼入的是完整連結且包含檔案 ID。");
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
        genre: '資產',
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
      alert("請填寫標題、封面並加入曲目。");
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
              {albumToEdit ? '編輯典藏' : '發佈新作'}
            </h2>
            <div className="flex gap-3">
              <button type="button" onClick={() => setActiveTab('cloud')} className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest border transition-all ${activeTab === 'cloud' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>Google Drive 雲端</button>
              <button type="button" onClick={() => setActiveTab('assets')} className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest border transition-all ${activeTab === 'assets' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>GitHub 專案資產</button>
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
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="專輯標題" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-luxury focus:outline-none focus:border-white/30 transition-all" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="這張專輯的靈魂是..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white h-24 focus:outline-none focus:border-white/30 resize-none transition-all" />
          </div>

          <div className="space-y-6">
            <div className="glass p-8 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                  {activeTab === 'cloud' ? '☁️ 雲端匯入' : '🔗 資產匯入'}
                  {activeTab === 'cloud' && <button type="button" onClick={() => setShowDriveGuide(!showDriveGuide)} className="text-blue-400 hover:underline lowercase font-normal italic">權限教學?</button>}
                </h4>
                {tracks.length > 0 && <button type="button" onClick={handleCleanTitles} className="text-[9px] uppercase tracking-widest text-blue-400 hover:text-white transition-colors">{isCleaningTitles ? '正在優化...' : '✨ AI 潤飾曲名'}</button>}
              </div>

              {showDriveGuide && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] text-blue-200 leading-relaxed animate-fade-in">
                  <p className="font-bold mb-1 underline">如何避開 Google 播放限制：</p>
                  1. 確保 Drive 檔案權限設為「知道連結的人皆可查看」。<br/>
                  2. 如果檔案超過 100MB，Google 有時會攔截外部播放。<br/>
                  3. 建議將音訊轉為 128kbps MP3 以獲得最佳兼容性。
                </div>
              )}

              {activeTab === 'cloud' ? (
                <div className="space-y-3">
                  <textarea value={batchLinks} onChange={(e) => setBatchLinks(e.target.value)} placeholder="一次貼入所有 Google Drive 連結..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 h-28 focus:outline-none focus:border-white/30 shadow-inner" />
                  <button type="button" onClick={handleBatchImport} className="w-full py-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-[10px] uppercase tracking-widest transition-all border border-blue-500/30">確認匯入連結</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[10px] text-orange-200 mb-2">⚠️ GitHub 網頁上傳限制單檔 25MB，大檔案請用雲端分頁。</div>
                  <textarea value={assetPaths} onChange={(e) => setAssetPaths(e.target.value)} placeholder="例如: songs/my_track.mp3" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-400 h-28 focus:outline-none focus:border-white/30 shadow-inner" />
                  <button type="button" onClick={handleAssetBatchImport} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] uppercase tracking-widest transition-all border border-white/10">匯入路徑</button>
                </div>
              )}

              <div className="mt-6 max-h-[120px] overflow-y-auto space-y-2 pr-2 scrollbar-custom">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[9px] text-gray-500 font-mono">{idx + 1}</span>
                    <p className="text-xs text-white truncate px-3 flex-grow">{track.title}</p>
                    <button type="button" onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="text-gray-600 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-[2rem] border border-white/5 relative">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">🪄 AI 故事敘事</span>
                <button type="button" onClick={handleGenerateStory} disabled={isGeneratingStory} className={`text-[9px] uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${isGeneratingStory ? 'text-gray-500 border-white/5' : 'text-purple-400 border-purple-500/30 hover:border-purple-500/60 animate-pulse'}`}>{isGeneratingStory ? '編寫中...' : '生成靈感故事'}</button>
              </div>
              <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="AI 將根據描述撰寫..." className="w-full bg-transparent border-none p-0 text-gray-300 text-sm italic font-light leading-relaxed focus:outline-none h-24 resize-none" />
            </div>

            <button type="submit" className="w-full py-6 bg-white text-black font-luxury uppercase tracking-[0.3em] rounded-2xl hover:bg-gray-200 transition-all shadow-2xl font-bold text-xs">
              {albumToEdit ? '儲存變更' : '公開發佈典藏'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
