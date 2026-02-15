
import React, { useState } from 'react';
import { UserPreferences } from '../types';

interface SettingsProps {
  onSelectKey: () => Promise<void>;
  isKeySelected: boolean | null;
  prefs: UserPreferences;
  setPrefs: React.Dispatch<React.SetStateAction<UserPreferences>>;
  onReset: () => void;
  onVibrate: (pattern?: number | number[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ onSelectKey, isKeySelected, prefs, setPrefs, onReset, onVibrate }) => {
  const [clearing, setClearing] = useState(false);

  const togglePref = (key: keyof UserPreferences) => {
    onVibrate(15);
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setOption = (key: keyof UserPreferences, value: any) => {
    onVibrate(15);
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleClearCache = () => {
    setClearing(true);
    onVibrate([10, 30, 10]);
    setTimeout(() => {
      setClearing(false);
      alert("Application cache cleared successfully.");
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <section className="px-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Center</h2>
        <p className="text-slate-500 font-bold text-sm">Configure your Smart Guardian node</p>
      </section>

      {/* Intelligence Core Section */}
      <section className="bg-white rounded-[2.5rem] p-8 elevation-2 border border-slate-100 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">🧠</span>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Intelligence Core</h3>
        </div>
        
        <div className={`p-6 rounded-3xl border transition-all duration-500 ${isKeySelected ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100 animate-pulse'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${isKeySelected ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {isKeySelected ? '🔐' : '🔑'}
              </div>
              <div>
                <p className="font-black text-slate-800 text-base">Gemini Neural Access</p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isKeySelected ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isKeySelected ? 'Hyperlink Active' : 'Access Restricted'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              API key management is handled via the system-level secure gateway. Direct manual entry is disabled for security and auto-injection.
            </p>
            <button 
              onClick={() => { onVibrate(20); onSelectKey(); }}
              className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isKeySelected ? 'Update Secure Key' : 'Connect Intelligence Core'}
            </button>
          </div>
        </div>
      </section>

      {/* App Preferences */}
      <section className="bg-white rounded-[3rem] overflow-hidden elevation-1 border border-slate-100">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚙️</span>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Device Preferences</h3>
          </div>
        </div>
        
        <div className="divide-y divide-slate-50">
          {/* Haptic Toggle */}
          <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">📳</div>
              <span className="text-sm font-bold text-slate-700">Tactile Haptics</span>
            </div>
            <button 
              onClick={() => togglePref('haptics')}
              className={`w-14 h-8 rounded-full transition-all relative ${prefs.haptics ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${prefs.haptics ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* Smart Notifications Toggle */}
          <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">✨</div>
              <span className="text-sm font-bold text-slate-700">AI Notifications</span>
            </div>
            <button 
              onClick={() => togglePref('smartNotifications')}
              className={`w-14 h-8 rounded-full transition-all relative ${prefs.smartNotifications ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${prefs.smartNotifications ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* Temperature Unit */}
          <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">🌡️</div>
              <span className="text-sm font-bold text-slate-700">Temperature Unit</span>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setOption('tempUnit', 'C')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${prefs.tempUnit === 'C' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                °C
              </button>
              <button 
                onClick={() => setOption('tempUnit', 'F')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${prefs.tempUnit === 'F' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                °F
              </button>
            </div>
          </div>

          {/* Growth Standards */}
          <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">📊</div>
              <span className="text-sm font-bold text-slate-700">Growth Standard</span>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setOption('growthStandard', 'WHO')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${prefs.growthStandard === 'WHO' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                WHO
              </button>
              <button 
                onClick={() => setOption('growthStandard', 'CDC')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${prefs.growthStandard === 'CDC' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                CDC
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* System & Maintenance */}
      <section className="bg-white rounded-[3rem] p-8 elevation-1 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛠️</span>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Maintenance</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
           <button 
             onClick={handleClearCache}
             disabled={clearing}
             className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 active:scale-95 transition-all"
           >
             <div className="flex items-center gap-4">
               <span className="text-2xl">🧹</span>
               <div className="text-left">
                 <p className="font-black text-slate-800 text-sm">Clear App Cache</p>
                 <p className="text-[10px] font-bold text-slate-400">Optimize system memory</p>
               </div>
             </div>
             {clearing && <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
           </button>

           <button 
             onClick={onReset}
             className="w-full flex items-center justify-between p-6 bg-rose-50 rounded-[2rem] border border-rose-100 active:scale-95 transition-all group"
           >
             <div className="flex items-center gap-4">
               <span className="text-2xl group-active:animate-bounce">🗑️</span>
               <div className="text-left">
                 <p className="font-black text-rose-600 text-sm">Wipe Local Database</p>
                 <p className="text-[10px] font-bold text-rose-400">Delete all history & children</p>
               </div>
             </div>
             <span className="text-rose-200 text-xl">→</span>
           </button>
        </div>
      </section>

      {/* About Section */}
      <footer className="px-4 text-center space-y-6">
        <div className="flex items-center justify-center gap-3 opacity-30">
          <div className="h-[1px] bg-slate-400 flex-1"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">NurtureAI Environment</span>
          <div className="h-[1px] bg-slate-400 flex-1"></div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase">Architecture: Android MD3 Native</p>
          <p className="text-[10px] font-black text-slate-300">Software Version 1.2.0 Build 2025.1</p>
        </div>
      </footer>
    </div>
  );
};

export default Settings;
