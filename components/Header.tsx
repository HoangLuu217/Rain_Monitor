import React from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const getTabClass = (view: ViewMode) => {
    // Style matching the screenshot: Boxy, border, specific active colors
    const base = "px-6 py-2 text-sm font-medium border border-slate-300 transition-colors";
    
    // Screenshot shows 'Map View' is Yellow when active
    if (currentView === view) {
      return `${base} bg-yellow-400 text-slate-900 border-yellow-500 relative z-10`;
    }
    return `${base} bg-slate-50 text-slate-600 hover:bg-white`;
  };

  return (
    <header className="bg-white border-b border-slate-300 sticky top-0 z-50">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center md:justify-start items-center h-14 relative">
           {/* Center tabs like screenshot or keep left? Screenshot suggests grouped tabs */}
           <div className="flex shadow-sm">
             <button onClick={() => setView('map')} className={getTabClass('map')}>
               Map view
             </button>
             <button onClick={() => setView('combined')} className={`${getTabClass('combined')} border-l-0`}>
               Combined view
             </button>
             <button onClick={() => setView('list')} className={`${getTabClass('list')} border-l-0`}>
               List view
             </button>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;