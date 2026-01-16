
import React from 'react';

interface NavbarProps {
  onHome: () => void;
  onUpload: () => void;
  onExport: () => void;
  onImport: () => void;
  isCuratorMode: boolean;
  toggleCuratorMode: () => void;
  isAdminUnlocked: boolean; // 是否解鎖管理開關
}

const Navbar: React.FC<NavbarProps> = ({ 
  onHome, 
  onUpload, 
  onExport, 
  onImport, 
  isCuratorMode, 
  toggleCuratorMode,
  isAdminUnlocked
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-10 py-10 pointer-events-none">
      <div className={`container mx-auto flex justify-between items-center glass px-8 md:px-12 py-6 rounded-[3rem] transition-all duration-1000 border-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto ${isCuratorMode ? 'border-indigo-400/20' : ''}`}>
        <div 
          onClick={onHome}
          className="flex items-center gap-4 md:gap-8 cursor-pointer group"
        >
          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-[1.5s] border border-white/10 group-hover:border-[#d4af37]/40 group-hover:rotate-[360deg]">
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] ${isCuratorMode ? 'bg-indigo-500' : 'bg-[#d4af37]'}`}>
              <div className={`w-[1px] h-3 md:h-4 rounded-full animate-pulse ${isCuratorMode ? 'bg-white' : 'bg-black/80'}`}></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-luxury text-xl md:text-2xl tracking-[0.4em] text-white">爵非鼓狂</span>
            <span className="text-[7px] md:text-[8px] uppercase tracking-[0.8em] text-gray-600 mt-1 font-black">Archive Experience</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 md:gap-12">
          {/* 管理按鈕：僅在解鎖且開啟模式時顯示 */}
          {isAdminUnlocked && isCuratorMode && (
            <div className="hidden lg:flex items-center gap-8 animate-reveal">
              <button onClick={onUpload} className="uppercase text-[9px] tracking-[0.4em] text-white/60 hover:text-[#d4af37] transition-all font-bold">Studio</button>
              <button onClick={onExport} className="uppercase text-[9px] tracking-[0.4em] text-white/60 hover:text-[#d4af37] transition-all font-bold">Sync</button>
            </div>
          )}

          {/* 模式切換器：僅在解鎖後顯示 */}
          {isAdminUnlocked && (
            <div className="flex items-center gap-6 pl-6 md:pl-12 border-l border-white/5">
              <div className="flex flex-col items-end gap-1 group/mode">
                <span className={`text-[7px] uppercase tracking-[0.5em] font-black mb-1 transition-colors ${isCuratorMode ? 'text-indigo-400' : 'text-gray-700'}`}>
                  {isCuratorMode ? 'Studio Mode' : 'Gallery Mode'}
                </span>
                <button 
                  onClick={toggleCuratorMode}
                  className={`w-10 md:w-12 h-5 md:h-6 rounded-full p-1 transition-all duration-700 relative border ${isCuratorMode ? 'border-indigo-400 bg-indigo-900/20' : 'bg-white/5 border-white/10'}`}
                >
                    <div className={`w-3 md:w-3.5 h-3 md:h-3.5 rounded-full transition-all duration-700 ${isCuratorMode ? 'translate-x-5 bg-white shadow-[0_0_10px_white]' : 'translate-x-0 bg-white/20'}`}></div>
                </button>
              </div>
            </div>
          )}
          
          {!isAdminUnlocked && (
            <button onClick={onHome} className="uppercase text-[10px] tracking-[0.5em] text-gray-500 hover:text-white transition-all font-black py-2 relative group">
              Discover
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#d4af37] transition-all duration-700 group-hover:w-full"></span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
