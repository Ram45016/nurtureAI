
import React from 'react';
import { AppView } from '../types';

interface BottomBarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Home', icon: '🏠' },
    { view: AppView.MONITOR, label: 'Guard', icon: '📹' },
    { view: AppView.ASSISTANT, label: 'Intel', icon: '✨' },
    { view: AppView.HEALTH, label: 'Care', icon: '🏥' },
    { view: AppView.SETTINGS, label: 'System', icon: '⚙️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 z-[100] elevation-3 rounded-t-[2.5rem]">
      {navItems.map((item) => {
        const isActive = activeView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(5);
              setActiveView(item.view);
            }}
            className="flex flex-col items-center gap-1 group relative transition-all duration-300"
          >
            <div className={`w-16 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-indigo-100' : 'group-hover:bg-slate-50'}`}>
              <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomBar;
