
import React from 'react';
import { Child, SmartAlarm } from '../types';

interface RemindersProps {
  child: Child;
  alarms: SmartAlarm[];
  onSetAlarm: (type: SmartAlarm['type'], delay: number, label: string) => void;
  onRemoveAlarm: (id: string) => void;
}

const Reminders: React.FC<RemindersProps> = ({ child, alarms, onSetAlarm, onRemoveAlarm }) => {
  const activeAlarms = alarms.filter(a => a.isActive).sort((a, b) => a.time - b.time);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Smart Reminders</h2>
        <p className="text-sm font-bold text-slate-500">Gemini-suggested schedules for {child.name}</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {[
          { type: 'water' as const, icon: '💧', label: 'Water Top-up', minutes: 30, color: 'bg-blue-50 text-blue-600' },
          { type: 'meal' as const, icon: '🍎', label: 'Healthy Snack', minutes: 45, color: 'bg-amber-50 text-amber-600' },
          { type: 'routine' as const, icon: '🌙', label: 'Nap Time', minutes: 20, color: 'bg-indigo-50 text-indigo-600' },
          { type: 'health' as const, icon: '🏥', label: 'Check Vitals', minutes: 15, color: 'bg-rose-50 text-rose-600' },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={() => onSetAlarm(btn.type, btn.minutes, btn.label)}
            className={`${btn.color} p-4 rounded-[1.5rem] border border-current/10 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm`}
          >
            <span className="text-2xl">{btn.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{btn.label}</span>
            <span className="text-[9px] opacity-70">in {btn.minutes}m</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Reminders</p>
        </div>
        
        <div className="divide-y divide-slate-50">
          {activeAlarms.length === 0 ? (
            <div className="p-12 text-center text-slate-300">
               <span className="text-4xl mb-2 block">🔔</span>
               <p className="font-bold text-sm">No pending alarms.</p>
            </div>
          ) : (
            activeAlarms.map(alarm => {
              const remainingMs = alarm.time - Date.now();
              const remainingMins = Math.max(0, Math.ceil(remainingMs / 60000));
              
              return (
                <div key={alarm.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
                      {alarm.type === 'water' ? '💧' : alarm.type === 'meal' ? '🍲' : alarm.type === 'health' ? '🏥' : '✨'}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm leading-none mb-1">{alarm.label}</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase">Alert in {remainingMins} minutes</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveAlarm(alarm.id)}
                    className="w-10 h-10 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">✨</div>
          <div className="space-y-2">
            <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Smart Routine Logic</p>
            <p className="text-[11px] font-bold text-indigo-700 leading-relaxed italic">
              "Your Smart Guardian uses Gemini 3 Flash and Pro models to analyze feeding and hydration patterns. It proactively updates these reminders as developmental milestones are reached."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
