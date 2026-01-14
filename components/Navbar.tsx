
import React from 'react';

interface NavbarProps {
  onHome: () => void;
  onUpload: () => void;
  onExport: () => void;
  onImport: () => void;
  isCuratorMode: boolean;
  toggleCuratorMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onHome, onUpload, onExport, onImport, isCuratorMode, toggleCuratorMode }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div 
          onClick={onHome}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <div className="w-6 h-6 bg-black rounded-full"></div>
          </div>
          <span className="font-luxury text-xl tracking-widest uppercase">Suno Curator</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <button onClick={onHome} className="uppercase text-[10px] tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Archive</button>
          
          {isCuratorMode && (
            <div className="flex items-center gap-2 animate-fade-in">
              <button onClick={onUpload} className="uppercase text-[10px] tracking-[0.2em] text-white bg-blue-600/40 px-4 py-2 rounded-full border border-blue-500/30 hover:bg-blue-600/60 transition-all font-bold">
                Publish
              </button>
              <button onClick={onExport} className="uppercase text-[10px] tracking-[0.2em] text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-500/30 hover:bg-emerald-400/20 transition-all font-bold">
                Export
              </button>
              <button onClick={onImport} className="uppercase text-[10px] tracking-[0.2em] text-purple-400 bg-purple-400/10 px-4 py-2 rounded-full border border-purple-500/30 hover:bg-purple-400/20 transition-all font-bold">
                Import
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
             <button 
              onClick={toggleCuratorMode}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-500 relative ${isCuratorMode ? 'bg-blue-600' : 'bg-white/10'}`}
             >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-500 ${isCuratorMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
             </button>
             <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden lg:inline">
               {isCuratorMode ? 'Curator' : 'Listener'}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <a 
            href="https://vercel.com/docs/deployment-utils/environment-variables" 
            target="_blank" 
            rel="noreferrer"
            className="hidden lg:block text-[9px] text-gray-600 hover:text-white uppercase tracking-tighter transition-colors"
           >
             Deploy Guide
           </a>
           <button className="px-5 py-2 glass rounded-full text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
            Community
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
