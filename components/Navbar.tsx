import React from 'react';

interface NavbarProps {
  onHome: () => void;
  onUpload: () => void;
  onExport: () => void;
  onImport: () => void;
  isCuratorMode: boolean;
  toggleCuratorMode: () => void;
  isJazzMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onHome, 
  onUpload, 
  onExport, 
  onImport, 
  isCuratorMode, 
  toggleCuratorMode,
  isJazzMode
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-10 py-10">
      <div className={`container mx-auto flex justify-between items-center glass px-12 py-6 rounded-[3rem] transition-all duration-1000 border-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
        <div 
          onClick={onHome}
          className="flex items-center gap-8 cursor-pointer group"
        >
          <div className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-[1.5s] border border-white/10 group-hover:border-[#d4af37]/40 group-hover:rotate-[360deg]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isJazzMode ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'bg-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.4)]'}`}>
              <div className="w-[1px] h-4 bg-black/80 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute inset-[-4px] border border-white/5 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
          </div>
          <div className="flex flex-col">
            <span className={`font-luxury text-2xl tracking-[0.4em] transition-colors duration-1000 ${isJazzMode ? 'text-indigo-100' : 'text-white'}`}>爵非鼓狂</span>
            <span className="text-[8px] uppercase tracking-[0.8em] text-gray-600 mt-1 font-black">Noir Drum Sessions</span>
          </div>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="hidden lg:flex items-center gap-12">
            <button onClick={onHome} className="uppercase text-[10px] tracking-[0.5em] text-gray-500 hover:text-white transition-all font-black py-2 relative group">
              Archives
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#d4af37] transition-all duration-700 group-hover:w-full"></span>
            </button>
            
            {isCuratorMode && (
              <div className="flex items-center gap-8 animate-reveal pl-12 border-l border-white/5">
                <button onClick={onUpload} className="uppercase text-[10px] tracking-[0.4em] text-white/60 hover:text-[#d4af37] transition-all font-bold">Publish</button>
                <button onClick={onExport} className="uppercase text-[10px] tracking-[0.4em] text-white/60 hover:text-[#d4af37] transition-all font-bold">Export</button>
                <button onClick={onImport} className="uppercase text-[10px] tracking-[0.4em] text-white/60 hover:text-[#d4af37] transition-all font-bold">Import</button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 pl-12 border-l border-white/5">
             <div className="flex flex-col items-end gap-1">
               <span className="text-[7px] uppercase tracking-[0.5em] text-gray-700 font-black mb-1">Curator Mode</span>
               <button 
                onClick={toggleCuratorMode}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-700 relative border ${isCuratorMode ? 'border-[#d4af37]/40 bg-[#d4af37]/5' : 'bg-white/5 border-white/10'}`}
               >
                  <div className={`w-3.5 h-3.5 rounded-full transition-all duration-700 ${isCuratorMode ? 'translate-x-5 bg-[#d4af37]' : 'translate-x-0 bg-white/20'}`}></div>
               </button>
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;