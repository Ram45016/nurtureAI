
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
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Hydration Monitor</h2>
        <p className="text-slate-500 font-medium">Tracking daily water intake goals for {child.name} ({age.display}).</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center">
          <div className="relative w-64 h-64 mb-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="115" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
              <circle 
                cx="128" 
                cy="128" 
                r="115" 
                fill="transparent" 
                stroke="#3b82f6" 
                strokeWidth="18" 
                strokeDasharray={722.56} 
                strokeDashoffset={722.56 - (722.56 * progress) / 100} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-800 tracking-tighter">{Math.round(progress)}%</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Status</span>
            </div>
          </div>
          
          <div className="space-y-2 mb-10">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{dailyTotal} <span className="text-xl text-slate-300 font-bold">/ {goalMl}ml</span></h3>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Today's Consumption</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 w-full">
             {[100, 200, 250].map(amt => (
               <button 
                 key={amt} 
                 onClick={() => onAddEntry({ amountMl: amt })} 
                 className="flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-600 p-6 rounded-3xl font-black hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-50 border border-blue-100"
               >
                 <span className="text-xl">💧</span>
                 <span className="text-sm">+{amt}ml</span>
               </button>
             ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8 flex items-center gap-3 border-b border-slate-50 pb-4">
             <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
             Intake Log
           </h3>
           <div className="flex-1 space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length === 0 ? (
                <div className="text-center py-20 text-slate-300">
                   <p className="text-5xl mb-6">🏜️</p>
                   <p className="font-black text-lg">No intake recorded today.</p>
                </div>
              ) : (
                entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).map(e => (
                  <div key={e.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-blue-100 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🧊</div>
                      <div>
                        <p className="font-black text-slate-800 text-lg">{e.amountMl}ml <span className="text-xs text-slate-300 font-bold uppercase ml-1">Water</span></p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Logged: {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default HydrationTracker;
