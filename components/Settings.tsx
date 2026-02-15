
import React, { useState } from 'react';

interface SettingsProps {
  onSelectKey: () => Promise<void>;
  isKeySelected: boolean | null;
}

const Settings: React.FC<SettingsProps> = ({ onSelectKey, isKeySelected }) => {
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <header className="px-1 space-y-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Settings</h2>
        <p className="text-slate-500 font-bold text-sm">Configure NurtureAI Intelligence & Units</p>
      </header>

      {/* AI Key Management Section */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-100">
            🔑
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">Gemini AI Configuration</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Model: Gemini 3 Pro Enabled</p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">Intelligence Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isKeySelected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isKeySelected ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isKeySelected ? 'Connected & Active' : 'Key Missing'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            To update or change your API key project, use the selection tool below. This ensures all AI features like crying analysis and proactive recommendations remain active.
          </p>
          <button 
            onClick={onSelectKey}
            className="w-full py-4 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 font-black rounded-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🔄</span> Change API Project / Key
          </button>
        </div>
        
        <div className="px-2">
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
            View Billing & Project Docs ↗
          </a>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Measurement Units</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Temperature</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setTempUnit('C')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${tempUnit === 'C' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Celsius</button>
                <button onClick={() => setTempUnit('F')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${tempUnit === 'F' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Fahrenheit</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Weight</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setWeightUnit('kg')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${weightUnit === 'kg' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Kilograms</button>
                <button onClick={() => setWeightUnit('lb')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${weightUnit === 'lb' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Pounds</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">System Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Crying Alerts</span>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between opacity-50">
              <span className="font-bold text-slate-700">Nap Reminders</span>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-not-allowed">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center py-6">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">NurtureAI v1.0.4-Stable • Privacy Verified</p>
      </div>
    </div>
  );
};

export default Settings;
