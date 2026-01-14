import React, { useState, useRef } from 'react';
import { Album, Track } from '../types';
import { getAlbumInsights, cleanTrackTitles } from '../services/geminiService';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (album: Album) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'cloud'>('local');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [tracks, setTracks] = useState<Partial<Track>[]>([]);
  const [batchLinks, setBatchLinks] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isCleaningTitles, setIsCleaningTitles] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const parseDriveLinks = (text: string) => {
    // 支援格式: /file/d/ID/view, /id=ID, /d/ID
    const driveIdPattern = /[-\w]{25,50}/g;
    const results: any[] = [];
    const seenIds = new Set<string>();
    const forbidden = ['view', 'usp', 'sharing', 'edit', 'open', 'file', 'folders', 'copy', 'drive', 'google', 'confirm', 'download', 'docs'];

    let match;
    while ((match = driveIdPattern.exec(text)) !== null) {
      const id = match[0];
      if (id.length < 25 || seenIds.has(id) || forbidden.some(word => id.toLowerCase() === word)) continue;
      
      seenIds.add(id);
      results.push({
        id: `drive-${id}-${Date.now()}`,
        title: `雲端音軌 ${id.substring(0, 4)}`,
        audioUrl: `https://drive.google.com/uc?id=${id}&export=download`, // 基礎網址，由 AudioPlayer 做 V12 穿透處理
        duration: '--:--',
        genre: '雲端串流',
        mp3Url: `https://drive.google.com/file/d/${id}/view`,
        wavUrl: `https://drive.google.com/file/d/${id}/view`
      });
    }
    return results;
  };

  const handleBatchImport = () => {
    if (!batchLinks.trim()) return;
    setIsParsing(true);
    setTimeout(() => {
      const newTracks = parseDriveLinks(batchLinks);
      if (newTracks.length > 0) {
        setTracks(prev => [...prev, ...newTracks]);
        setBatchLinks('');
      } else {
        alert("未能辨識有效 ID。請貼上完整的 Google Drive 分享連結。");
      }
      setIsParsing(false);
    }, 800);
  };

  const handleAICleanTitles = async () => {
    if (tracks.length === 0 || !title) {
      alert("請先輸入專輯標題。");
      return;
    }
    setIsCleaningTitles(true);
    try {
      const rawTitles = tracks.map(t => t.title || '');
      const cleaned = await cleanTrackTitles(rawTitles, title, description);
      if (cleaned && Array.isArray(cleaned)) {
        const updatedTracks = tracks.map((t, i) => ({
          ...t,
          title: cleaned[i] || t.title
        }));
        setTracks(updatedTracks);
      }
    } catch (err) {
      console.error("AI 命名失敗", err);
    } finally {
      setIsCleaningTitles(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCoverImage(url);
    }
  };

  const handleAudioFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newTracks = Array.from(e.target.files).map((file: File, idx) => ({
        id: `local-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        audioUrl: URL.createObjectURL(file), // 本地連結
        duration: '--:--',
        genre: '錄音室音軌',
        mp3Url: '#',
        wavUrl: '#'
      }));
      setTracks(prev => [...prev, ...newTracks]);
    }
  };

  const handleEnhanceStory = async () => {
    if (!title || !description) return;
    setIsGeneratingStory(true);
    const aiStory = await getAlbumInsights(title, description);
    if (aiStory) setStory(aiStory);
    setIsGeneratingStory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coverImage || tracks.length === 0) return;
    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      title,
      description,
      story,
      coverImage,
      releaseDate: new Date().toLocaleDateString('zh-TW'),
      tracks: tracks as Track[]
    };
    onUpload(newAlbum);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
      <div className="glass w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[4rem] p-10 md:p-16 shadow-[0_0_150px_rgba(0,0,0,0.8)] animate-fade-in-up border border-white/10 relative">
        <div className="flex justify-between items-start mb-16">
          <div className="space-y-4">
            <h2 className="text-6xl font-luxury tracking-[0.2em] uppercase text-white leading-tight">作品典藏室</h2>
            <div className="flex gap-4">
               <button type="button" onClick={() => setActiveTab('local')} className={`text-[10px] uppercase tracking-[0.4em] px-10 py-4 rounded-full border transition-all duration-700 ${activeTab === 'local' ? 'bg-white text-black border-white' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>本地匯入</button>
               <button type="button" onClick={() => setActiveTab('cloud')} className={`text-[10px] uppercase tracking-[0.4em] px-10 py-4 rounded-full border transition-all duration-700 ${activeTab === 'cloud' ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'text-gray-500 border-white/5 hover:border-white/20'}`}>雲端同步 (Drive)</button>
            </div>
          </div>
          <button onClick={onClose} className="p-6 text-gray-700 hover:text-white transition-all bg-white/5 rounded-full hover:rotate-90 duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-5 space-y-16">
            <div onClick={() => fileInputRef.current?.click()} className="aspect-square w-full rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all overflow-hidden relative group shadow-inner">
              {coverImage ? <img src={coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="text-center group-hover:scale-110 transition-transform"><span className="text-gray-600 uppercase text-[10px] tracking-[0.6em] font-bold">上傳視覺藝術</span></div>}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>

            <div className="space-y-10">
              <div className="flex justify-between items-center p-2">
                <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-bold">曲目清單</span>
                {tracks.length > 0 && (
                  <button type="button" onClick={handleAICleanTitles} disabled={isCleaningTitles} className={`text-[10px] px-8 py-3 rounded-full transition-all uppercase tracking-[0.3em] font-bold flex items-center gap-3 ${isCleaningTitles ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl active:scale-95'}`}>
                    {isCleaningTitles ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '✨'}
                    {isCleaningTitles ? '正在構思曲名...' : 'AI 藝術命名'}
                  </button>
                )}
              </div>
              
              {activeTab === 'local' ? (
                <div className="space-y-6">
                  <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20 mb-2">
                    <p className="text-[10px] text-amber-500 uppercase tracking-widest leading-relaxed font-bold">
                      ⚠️ 本地匯入說明：
                    </p>
                    <p className="text-[9px] text-gray-400 mt-2 leading-relaxed">
                      檔案僅暫存於您的瀏覽器記憶體中。刷新網頁後檔案會消失，且他人無法透過連結聽到您的音樂。
                    </p>
                  </div>
                  <div onClick={() => audioInputRef.current?.click()} className="p-16 rounded-[3rem] glass border border-dashed border-white/10 text-center group cursor-pointer hover:border-white/30 transition-all">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-blue-400 font-bold">選擇音訊檔案</span>
                    <input type="file" ref={audioInputRef} onChange={handleAudioFiles} className="hidden" accept="audio/*" multiple />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20 mb-2">
                    <p className="text-[10px] text-blue-400 uppercase tracking-widest leading-relaxed font-bold">
                      🚀 雲端同步說明：
                    </p>
                    <p className="text-[9px] text-gray-400 mt-2 leading-relaxed">
                      使用 Google Drive 連結可實現永久發佈。我們採用 V12 穿透技術自動繞過 Google 的安全警告頁面。
                    </p>
                  </div>
                  <textarea value={batchLinks} onChange={(e) => setBatchLinks(e.target.value)} placeholder="在此貼上 Google Drive 檔案連結..." className="w-full h-48 bg-white/[0.02] border border-white/5 rounded-[2.5rem] px-10 py-10 text-xs focus:border-blue-500 outline-none transition-all resize-none shadow-inner text-gray-400 leading-relaxed" />
                  <button type="button" onClick={handleBatchImport} disabled={isParsing || !batchLinks} className={`w-full py-6 rounded-[2rem] text-[10px] uppercase tracking-[0.4em] font-bold transition-all ${isParsing ? 'bg-gray-900 text-gray-700' : 'bg-white text-black hover:bg-gray-100 shadow-2xl'}`}>
                    {isParsing ? '解析 ID 中...' : '同步雲端音軌'}
                  </button>
                </div>
              )}

              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-4 scrollbar-custom">
                {tracks.map((t, i) => (
                  <div key={t.id} className="flex justify-between items-center p-8 glass rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                    <div className="flex flex-col flex-grow truncate mr-6">
                      <input className="bg-transparent border-none outline-none font-luxury text-base tracking-[0.15em] text-white w-full" value={t.title} onChange={(e) => {
                        const newTracks = [...tracks];
                        newTracks[i].title = e.target.value;
                        setTracks(newTracks);
                      }} />
                      <span className="text-[9px] uppercase tracking-widest text-gray-600 mt-2">{t.audioUrl?.startsWith('blob:') ? '本地快取' : '雲端同步'} · Track #{i + 1}</span>
                    </div>
                    <button type="button" onClick={() => setTracks(tracks.filter((_, idx) => idx !== i))} className="text-gray-800 hover:text-red-500/60 transition-colors p-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 008,21H16A2,2 0 0018,19V7H6V19Z" /></svg></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-20">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-6">專輯名錄</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ENTER ALBUM TITLE" className="w-full bg-transparent border-b border-white/10 py-10 text-6xl font-luxury focus:border-white transition-all outline-none uppercase placeholder:text-gray-900" required />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold mb-6">藝術氛圍描述</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="例如：在賽博龐克城市的雨夜中，一段關於自我意識覺醒的冥想..." className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] px-12 py-10 text-sm italic text-gray-400 focus:border-white/20 outline-none" />
            </div>
            <div className="relative group">
              <div className="absolute -top-12 left-0 flex items-center gap-3">
                 <label className="text-[10px] uppercase tracking-[0.6em] text-gray-600 font-bold">作品敘事</label>
                 {title && <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>}
              </div>
              <button type="button" onClick={handleEnhanceStory} disabled={isGeneratingStory || !title} className="absolute right-0 top-[-55px] text-[10px] bg-white/5 hover:bg-white text-gray-500 hover:text-black px-8 py-3 rounded-full transition-all uppercase font-bold tracking-[0.3em] border border-white/5 shadow-lg active:scale-95">{isGeneratingStory ? '正在編織故事...' : '✨ 生成中文敘事'}</button>
              <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={12} className="w-full bg-white/[0.01] border border-white/5 rounded-[3.5rem] px-14 py-14 focus:border-white/10 transition-all outline-none text-xl italic leading-[1.8] text-gray-400 font-light scrollbar-custom" placeholder="點擊按鈕，讓 AI 為您的音樂宇宙編寫一段專屬的繁體中文故事..." />
            </div>
            <button type="submit" disabled={!title || !coverImage || tracks.length === 0} className="w-full py-12 bg-white text-black rounded-[3rem] font-luxury text-3xl uppercase tracking-[0.8em] hover:bg-gray-100 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-10 group relative overflow-hidden">
               <span className="relative z-10">正式發佈</span>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;