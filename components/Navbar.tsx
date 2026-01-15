
import React from 'react';

interface NavbarProps {
  onHome: () => void;
  onUpload: () => void;
  onExport: () => void;
  onImport: () => void;
  isCuratorMode: boolean;
  toggleCuratorMode: () => void;
  hasAdminAccess: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onHome, 
  onUpload, 
  onExport, 
  onImport, 
  isCuratorMode, 
  toggleCuratorMode,
  hasAdminAccess
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-10 py-10 pointer-events-none">
      <div className={`container mx-auto flex justify-between items-center glass px-8 md:px-12 py-6 rounded-[3rem] transition-all duration-1000 border-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto`}>
        <div 
          onClick={onHome}
          className="flex items-center gap-4 md:gap-8 cursor-pointer group"
        >
          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-[1.5s] border border-white/10 group-hover:border-[#d4af37]/40 group-hover:rotate-[360deg]">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <div className="w-[1px] h-3 md:h-4 bg-black/80 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-luxury text-xl md:text-2xl tracking-[0.4em] text-white">爵非鼓狂</span>
            <span className="text-[7px] md:text-[8px] uppercase tracking-[0.8em] text-gray-600 mt-1 font-black">Noir Drum Sessions</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 md:gap-12">
          <div className="hidden lg:flex items-center gap-12">
            <button onClick={onHome} className="uppercase text-[10px] tracking-[0.5em] text-gray-500 hover:text-white transition-all font-black py-2 relative group">
              Archives
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#d4af37] transition-all duration-700 group-hover:w-full"></span>
            </button>
            
            {hasAdminAccess && isCuratorMode && (
              <div className="flex items-center gap-8 animate-reveal pl-12 border-l border-white/5">
                <button onClick={onUpload} className="uppercase text-[10px] tracking-[0.4em] text-white/60 hover:text-[#d4af37] transition-all font-bold">New Album</button>
                <button onClick={onExport} className="uppercase text-[10px] tracking-[0.4em] text-white/60 hover:text-[#d4af37] transition-all font-bold">Export</button>
                <button onClick={onImport} className="uppercase text-[10px] tracking-[0.4em] text-white/60 hover:text-[#d4af37] transition-all font-bold">Import</button>
              </div>
            )}
          </div>

          {hasAdminAccess && (
            <div className="flex items-center gap-6 pl-6 md:pl-12 border-l border-white/5">
               <div className="flex flex-col items-end gap-1">
                 <span className="text-[7px] uppercase tracking-[0.5em] text-gray-700 font-black mb-1">Curator Mode</span>
                 <button 
                  onClick={toggleCuratorMode}
                  className={`w-10 md:w-12 h-5 md:h-6 rounded-full p-1 transition-all duration-700 relative border ${isCuratorMode ? 'border-[#d4af37]/40 bg-[#d4af37]/5' : 'bg-white/5 border-white/10'}`}
                 >
                    <div className={`w-3 md:w-3.5 h-3 md:h-3.5 rounded-full transition-all duration-700 ${isCuratorMode ? 'translate-x-5 bg-[#d4af37]' : 'translate-x-0 bg-white/20'}`}></div>
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
