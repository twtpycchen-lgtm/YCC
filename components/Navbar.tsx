
import React from 'react';

interface NavbarProps {
  onHome: () => void;
  onUpload: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onHome, onUpload }) => {
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
        
        <div className="hidden md:flex items-center gap-10">
          <button onClick={onHome} className="uppercase text-[10px] tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Archive</button>
          <button onClick={onUpload} className="uppercase text-[10px] tracking-[0.2em] text-white bg-blue-600/20 px-4 py-2 rounded-full border border-blue-500/30 hover:bg-blue-600/40 transition-all font-bold">
            Publish New Album
          </button>
          <div className="flex items-center gap-2 group cursor-help">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="uppercase text-[9px] tracking-[0.1em] text-gray-500 group-hover:text-green-400 transition-colors">Cloud Sync Active</span>
          </div>
        </div>

        <button className="px-5 py-2 glass rounded-full text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
          Connect Identity
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
