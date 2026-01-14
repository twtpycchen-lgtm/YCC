import React from 'react';

interface NavbarProps {
  onHome: () => void;
  onUpload: () => void;
  onExport: () => void;
  onImport: () => void;
  isCuratorMode: boolean;
  toggleCuratorMode: () => void;
  isJazzMode: boolean;
  onJazzToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onHome, 
  onUpload, 
  onExport, 
  onImport, 
  isCuratorMode, 
  toggleCuratorMode,
  isJazzMode,
  onJazzToggle
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-8">
      <div className={`container mx-auto flex justify-between items-center glass px-10 py-5 rounded-[2.5rem] border transition-all duration-[1000ms] ${isJazzMode ? 'border-indigo-500/20 shadow-[0_0_40px_rgba(79,70,229,0.08)]' : 'border-white/[0.05] shadow-[0_0_40px_rgba(212,175,55,0.03)]'}`}>
        <div 
          onClick={onHome}
          className="flex items-center gap-6 cursor-pointer group"
        >
          <div className={`relative w-11 h-11 rounded-full flex items-center justify-center group-hover:rotate-180 transition-all duration-1000 shadow-xl ${isJazzMode ? 'bg-indigo-500' : 'bg-[#d4af37]'}`}>
            <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
              <div className={`w-[2px] h-3 rounded-full animate-pulse ${isJazzMode ? 'bg-indigo-300' : 'bg-[#d4af37]'}`}></div>
            </div>
          </div>
          <span className={`font-luxury text-2xl tracking-[0.3em] uppercase transition-colors duration-[1000ms] ${isJazzMode ? 'text-indigo-100 text-glow' : 'text-white text-glow'}`}>爵非鼓狂</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-12">
          <button onClick={onHome} className="uppercase text-xs tracking-[0.4em] text-gray-500 hover:text-white transition-all font-bold">Archives</button>
          
          {isCuratorMode && (
            <div className="flex items-center gap-8 animate-fade-in pl-12 border-l border-white/5">
              <button onClick={onUpload} className="uppercase text-xs tracking-[0.3em] text-white hover:text-amber-400 transition-colors font-bold">Publish</button>
              <button onClick={onExport} className="uppercase text-xs tracking-[0.3em] text-white hover:text-blue-400 transition-colors font-bold">Export</button>
              <button onClick={onImport} className="uppercase text-xs tracking-[0.3em] text-white hover:text-purple-400 transition-colors font-bold">Import</button>
            </div>
          )}

          <div className="flex items-center gap-6 pl-12 border-l border-white/5">
             <button 
              onClick={toggleCuratorMode}
              className={`w-12 h-6 rounded-full p-1 transition-all duration-700 relative ${isCuratorMode ? (isJazzMode ? 'bg-indigo-500' : 'bg-[#d4af37]') : 'bg-white/5 border border-white/10'}`}
             >
                <div className={`w-4 h-4 rounded-full transition-all duration-700 ${isCuratorMode ? 'translate-x-6 bg-black' : 'translate-x-0 bg-white/20'}`}></div>
             </button>
             <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">
               {isCuratorMode ? 'Curator' : 'Visitor'}
             </span>
          </div>
        </div>

        <div className="flex items-center">
           <button 
            onClick={onJazzToggle}
            className={`px-10 py-3.5 rounded-full text-xs uppercase tracking-[0.4em] font-black transition-all relative overflow-hidden group/jazz ${
              isJazzMode 
              ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)]' 
              : 'bg-white text-black hover:bg-[#d4af37] hover:text-white shadow-xl'
            }`}
           >
            <span className="relative z-10 flex items-center gap-3">
              {isJazzMode && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>}
              沈浸模式 {isJazzMode ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;