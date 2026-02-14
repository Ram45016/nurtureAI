
import React, { useState, useEffect } from 'react';
import { AppView, Child } from '../types';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  childrenList: Child[];
  selectedChild: Child | null;
  setSelectedChild: (child: Child) => void;
  onAddChild: () => void;
  onEditChild: (child: Child) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, childrenList, selectedChild, setSelectedChild, onAddChild, onEditChild }) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as standalone APK
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleInstallable = (e: any) => setIsInstallable(e.detail);
    const handleInstalled = () => {
      setIsStandalone(true);
      setIsInstallable(false);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);
    
    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const navItems = [
    { view: AppView.DASHBOARD, label: 'Dashboard', icon: '🏠' },
    { view: AppView.MONITOR, label: 'Live Monitor', icon: '📹' },
    { view: AppView.TRACKER, label: 'Growth', icon: '📊' },
    { view: AppView.DIET, label: 'Nutrition', icon: '🍎' },
    { view: AppView.HEALTH, label: 'Health Center', icon: '🏥' },
    { view: AppView.HYDRATION, label: 'Hydration', icon: '💧' },
    { view: AppView.REMINDERS, label: 'Reminders', icon: '⏰' },
    { view: AppView.STORYTIME, label: 'Storytime', icon: '📚' },
    { view: AppView.ASSISTANT, label: 'AI Support', icon: '✨' },
  ];

  const handleInstall = () => {
    if ((window as any).triggerInstall) {
      (window as any).triggerInstall();
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-100">
          🍼
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
          Nurture<span className="text-indigo-600">AI</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <div>
          <div className="flex justify-between items-center px-2 mb-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Your Family</label>
            <button 
              onClick={onAddChild}
              className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold hover:bg-indigo-100 transition-colors"
              title="Add a child"
            >
              +
            </button>
          </div>
          <div className="space-y-1">
            {childrenList.map(child => (
              <div 
                key={child.id} 
                className={`group w-full flex items-center gap-3 p-2 rounded-xl transition-all ${selectedChild?.id === child.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
              >
                <button 
                  onClick={() => setSelectedChild(child)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <img src={child.avatar} alt={child.name} className="w-8 h-8 rounded-full shadow-sm" />
                  <span className={`font-bold text-sm ${selectedChild?.id === child.id ? 'text-indigo-700' : 'text-slate-600'}`}>{child.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3 block">Menu</label>
          <div className="space-y-1">
            {navItems.map(item => (
              <button 
                key={item.view} 
                onClick={() => setActiveView(item.view)} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === item.view ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 ${isStandalone ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'} rounded-lg flex items-center justify-center text-lg`}>
              {isStandalone ? '🛡️' : '📥'}
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">
                {isStandalone ? 'Native APK' : 'App Download'}
              </p>
              <p className="text-[9px] text-slate-400 font-bold">
                {isStandalone ? 'v1.0.4 - Secure' : 'Install NurtureAI'}
              </p>
            </div>
          </div>
          
          {!isStandalone && (
            <button 
              onClick={handleInstall}
              className={`w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
            >
              Download APK
            </button>
          )}

          {isStandalone && (
            <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              WebAPK Verified
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
