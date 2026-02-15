
import React from 'react';

interface SettingsProps {
  onSelectKey: () => Promise<void>;
  isKeySelected: boolean | null;
}

const Settings: React.FC<SettingsProps> = ({ onSelectKey, isKeySelected }) => {
  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-white rounded-[2.5rem] p-10 elevation-2 space-y-8 border border-slate-50">
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-5xl elevation-3">
            🔑
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">System Identity</h3>
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isKeySelected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isKeySelected ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isKeySelected ? 'Cloud Engine Active' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100/50 space-y-6">
          <p className="text-xs text-slate-500 leading-relaxed font-bold text-center uppercase tracking-tight">
            Authentication with Google Gemini 3
          </p>
          
          <button 
            onClick={() => { if(navigator.vibrate) navigator.vibrate(20); onSelectKey(); }}
            className="w-full py-6 bg-slate-900 text-white font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Update Security Key
          </button>
        </div>
      </section>

      <div className="bg-white rounded-[2.5rem] p-8 elevation-1 space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Device Diagnostics</h4>
        {[
          { label: 'Guardian Version', value: '1.0.4 Native' },
          { label: 'OS Integration', value: 'Android MD3' },
          { label: 'Safety Protocol', value: 'Enabled' }
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
            <span className="text-xs font-bold text-slate-500">{item.label}</span>
            <span className="text-xs font-black text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] pt-8">
        Designed for Modern Parenting
      </p>
    </div>
  );
};

export default Settings;
