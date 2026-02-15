
import React from 'react';
import { AppView, Child } from '../types';

interface TopBarProps {
  activeView: AppView;
  selectedChild: Child | null;
  onProfileClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ activeView, selectedChild, onProfileClick }) => {
  const titles: Record<AppView, string> = {
    [AppView.DASHBOARD]: 'Dashboard',
    [AppView.MONITOR]: 'Live Guard',
    [AppView.TRACKER]: 'Growth',
    [AppView.DIET]: 'Nutrition',
    [AppView.HEALTH]: 'Health Center',
    [AppView.REMINDERS]: 'Reminders',
    [AppView.STORYTIME]: 'Storytime',
    [AppView.ASSISTANT]: 'Intelligence',
    [AppView.HYDRATION]: 'Hydration',
    [AppView.SETTINGS]: 'System'
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-50/80 backdrop-blur-md z-[90] px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-4 flex items-center justify-between border-b border-slate-100/50">
      <div className="space-y-0.5">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
          {titles[activeView] || 'NurtureAI'}
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Active</span>
        </div>
      </div>

      <button 
        onClick={onProfileClick}
        className="relative md3-clickable"
      >
        <img 
          src={selectedChild?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Nurture`} 
          alt="Child Avatar" 
          className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-lg flex items-center justify-center text-[10px] border-2 border-white">
          ✨
        </div>
      </button>
    </header>
  );
};

export default TopBar;
