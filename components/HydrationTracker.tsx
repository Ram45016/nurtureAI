
import React from 'react';
import { Child, WaterEntry } from '../types';
import { calculateAge, getHydrationGoal } from '../utils/age';

interface HydrationTrackerProps {
  child: Child;
  entries: WaterEntry[];
  onAddEntry: (e: Omit<WaterEntry, 'id' | 'timestamp'>) => void;
}

const HydrationTracker: React.FC<HydrationTrackerProps> = ({ child, entries, onAddEntry }) => {
  const dailyTotal = entries
    .filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString())
    .reduce((acc, curr) => acc + curr.amountMl, 0);

  const age = calculateAge(child.birthDate);
  const goalMl = getHydrationGoal(age.decimal || age.years);
  const progress = Math.min(100, (dailyTotal / goalMl) * 100);

  return (
    <div className="space-y-6 pb-24">
      <header className="px-1 space-y-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hydration</h2>
        <p className="text-slate-500 font-bold text-sm">Target: {goalMl}ml for {child.name}</p>
      </header>

      {/* Hero Comparison Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col items-center">
        <div className="relative w-48 h-48 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="88" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
            <circle 
              cx="96" 
              cy="96" 
              r="88" 
              fill="transparent" 
              stroke="#3b82f6" 
              strokeWidth="16" 
              strokeDasharray={552.92} 
              strokeDashoffset={552.92 - (552.92 * progress) / 100} 
              strokeLinecap="round" 
              className="transition-all duration-1000" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-slate-800">{Math.round(progress)}%</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Goal Achieved</span>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-4xl font-black text-slate-800">{dailyTotal}<span className="text-lg text-slate-300 ml-1">/ {goalMl}ml</span></h3>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-5 py-1.5 rounded-full inline-block shadow-sm">
            {progress >= 100 ? 'Hydration Target Reached ✨' : `${goalMl - dailyTotal}ml remaining today`}
          </p>
        </div>
      </div>

      {/* Quick Add Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[100, 150, 250].map(amt => (
          <button 
            key={amt} 
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(20);
              onAddEntry({ amountMl: amt });
            }} 
            className="flex flex-col items-center justify-center gap-2 bg-white text-slate-900 py-6 rounded-[2rem] font-black shadow-sm border border-slate-100 active:bg-blue-600 active:text-white active:scale-95 transition-all"
          >
            <span className="text-3xl">💧</span>
            <span className="text-xs">+{amt}ml</span>
          </button>
        ))}
      </div>

      {/* Intake Timeline */}
      <section className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Today's Intake Log</h3>
        <div className="space-y-4">
          {entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length === 0 ? (
            <p className="text-center text-slate-300 text-xs font-bold py-10 italic">No logs today.</p>
          ) : (
            entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).map(e => (
              <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">💧</div>
                  <div>
                    <p className="text-sm font-black text-slate-700">{e.amountMl}ml logged</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HydrationTracker;
