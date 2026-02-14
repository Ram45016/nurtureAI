
import React, { useState, useEffect } from 'react';
import { Child, ActivityEvent, LiveStats, GrowthData, WaterEntry, FoodEntry, SmartAlarm } from '../types';
import { generateProactiveRecommendations } from '../services/gemini';
import { calculateAge, getHydrationGoal, getNextVaccineRecommendation } from '../utils/age';

interface DashboardProps {
  child: Child;
  events: ActivityEvent[];
  liveStats: LiveStats;
  growthData: GrowthData[];
  waterEntries: WaterEntry[];
  foodEntries: FoodEntry[];
  onSetAlarm: (type: SmartAlarm['type'], delay: number, label: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ child, events, liveStats, growthData, waterEntries, foodEntries, onSetAlarm }) => {
  const [aiRec, setAiRec] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const age = calculateAge(child.birthDate);
  const hydrationGoal = getHydrationGoal(age.decimal || age.years);
  const nextVax = getNextVaccineRecommendation(age.totalMonths);

  const dailyWater = waterEntries
    .filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString())
    .reduce((a, b) => a + b.amountMl, 0);

  const waterProgress = Math.min(100, (dailyWater / hydrationGoal) * 100);

  useEffect(() => {
    const fetchRec = async () => {
      setLoading(true);
      try {
        const lastMeal = foodEntries[0] ? new Date(foodEntries[0].timestamp).toLocaleTimeString() : null;
        const lastWater = waterEntries[0] ? new Date(waterEntries[0].timestamp).toLocaleTimeString() : null;
        const res = await generateProactiveRecommendations(child.name, age.display, lastMeal, lastWater, null);
        setAiRec(res);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchRec();
  }, [events.length, dailyWater, child.name]);

  const handleSmartAlarm = () => {
    // Basic heuristic to parse AI rec for time (e.g., "in 30 mins")
    // In a real app, we'd use a structured response, but for now we default to 30m or 60m.
    const delay = aiRec?.toLowerCase().includes('30') ? 30 : 60;
    const type = aiRec?.toLowerCase().includes('water') ? 'water' : 'meal';
    onSetAlarm(type, delay, `AI Remind: ${aiRec?.substring(0, 30)}...`);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* AI Smart Insight Card (Android MD3 Surface) */}
      <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse"></span>
             <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">AI Expert Analysis</p>
           </div>
           
           {loading ? (
             <div className="flex gap-2 py-2">
               {[0, 1, 2].map(i => (
                 <div key={i} className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
               ))}
             </div>
           ) : (
             <p className="text-xl font-bold leading-tight tracking-tight">{aiRec || "Observing child trends..."}</p>
           )}

           <button 
             onClick={handleSmartAlarm}
             className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl border border-white/20"
           >
             Set Smart Alarm ⏰
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Hydration MD3 Progress Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group active:bg-slate-50 transition-colors">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Hydration</p>
              <h3 className="text-2xl font-black text-slate-800">{dailyWater} <span className="text-sm text-slate-400 font-bold">/ {hydrationGoal}ml</span></h3>
              <p className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full inline-block">Goal for {age.display}</p>
           </div>
           <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * waterProgress) / 100} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-800">{Math.round(waterProgress)}%</div>
           </div>
        </div>

        {/* Vital Signs Row (Android MD3 Compact Cards) */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-emerald-50 p-6 rounded-[1.5rem] border border-emerald-100 space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-xs">💓</span>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Heart Rate</p>
              </div>
              <p className="text-2xl font-black text-emerald-900">{liveStats.heartRate} <span className="text-[10px] font-bold opacity-40 uppercase">bpm</span></p>
           </div>
           <div className="bg-amber-50 p-6 rounded-[1.5rem] border border-amber-100 space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-xs">⚖️</span>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Weight</p>
              </div>
              <p className="text-2xl font-black text-amber-900">{growthData[0]?.weight || child.weightKg} <span className="text-[10px] font-bold opacity-40 uppercase">kg</span></p>
           </div>
        </div>

        {/* Development & Vax Alerts */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Medical Milestones</h3>
           <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">🏥</div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-black text-slate-800 truncate">Upcoming Vaccine</p>
                 <p className="text-[10px] font-bold text-rose-600 leading-tight">{nextVax.name}</p>
              </div>
              <button 
                onClick={() => onSetAlarm('health', 1440, `Vaccination Appt: ${nextVax.name}`)}
                className="w-8 h-8 bg-white text-rose-500 rounded-full flex items-center justify-center border border-rose-100 shadow-sm text-xs font-bold"
              >
                ⏰
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
