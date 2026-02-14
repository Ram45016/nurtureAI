
import React, { useState, useEffect } from 'react';
import { Child, ActivityEvent, LiveStats, GrowthData, WaterEntry, FoodEntry, SmartAlarm } from '../types';
import { generateProactiveRecommendations } from '../services/gemini';
import { calculateAge, getHydrationGoal, getExpectedWeightRange, getExpectedHeightRange, getRecommendedMealFrequency } from '../utils/age';

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
  const decimalAge = age.decimal || age.years;

  // Comparison Calculations
  const weightRange = getExpectedWeightRange(decimalAge, child.gender);
  const heightRange = getExpectedHeightRange(decimalAge, child.gender);
  const waterGoal = getHydrationGoal(decimalAge);
  const foodGoal = getRecommendedMealFrequency(decimalAge);

  const currentWeight = growthData[0]?.weight || child.weightKg;
  const currentHeight = growthData[0]?.height || (decimalAge < 0.5 ? 50 : 70); // Fallback estimate

  const todayWater = waterEntries
    .filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.amountMl, 0);

  const todayMeals = foodEntries
    .filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length;

  useEffect(() => {
    const fetchRec = async () => {
      setLoading(true);
      try {
        const lastMeal = foodEntries[0] ? new Date(foodEntries[0].timestamp).toLocaleTimeString() : null;
        const lastWater = waterEntries[0] ? new Date(waterEntries[0].timestamp).toLocaleTimeString() : null;
        const res = await generateProactiveRecommendations(child.name, age.display, lastMeal, lastWater, null);
        setAiRec(res);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchRec();
  }, [events.length, todayWater, child.name, age.display]);

  const ComparisonBar = ({ label, actual, min, max, unit, icon }: any) => {
    const isNormal = actual >= min && actual <= max;
    const progress = Math.min(100, (actual / max) * 100);
    const minMarker = (min / max) * 100;

    return (
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${isNormal ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {actual < min ? 'Low' : actual > max ? 'High' : 'Normal'}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-black text-slate-800">{actual}<span className="text-xs text-slate-300 ml-1">{unit}</span></p>
          <p className="text-[10px] font-bold text-slate-400">Target: {min}-{max}{unit}</p>
        </div>
        <div className="h-2 bg-slate-50 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-100/50"></div>
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isNormal ? 'bg-indigo-500' : 'bg-amber-500'}`}
            style={{ width: `${progress}%` }}
          />
          <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-200" style={{ left: `${minMarker}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Comparison Pulse */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Growth Hub</h2>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">WHO Standards</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <ComparisonBar label="Weight" actual={currentWeight} min={weightRange.min} max={weightRange.max} unit="kg" icon="⚖️" />
          <ComparisonBar label="Height" actual={currentHeight} min={heightRange.min} max={heightRange.max} unit="cm" icon="📏" />
        </div>
      </section>

      {/* Intake Comparison */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daily Intake</h2>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Goal Tracking</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Water Intake Card */}
          <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3">
             <div className="relative w-20 h-20">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="40" cy="40" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                 <circle 
                   cx="40" cy="40" r="36" fill="transparent" stroke="#3b82f6" strokeWidth="8" 
                   strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * Math.min(100, (todayWater/waterGoal)*100)) / 100} 
                   strokeLinecap="round" className="transition-all duration-1000" 
                 />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-800">
                 {Math.round((todayWater/waterGoal)*100)}%
               </div>
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-slate-400">Hydration</p>
               <p className="font-black text-slate-800">{todayWater}ml</p>
               <p className="text-[9px] font-bold text-slate-300">Target {waterGoal}ml</p>
             </div>
          </div>

          {/* Food Intake Card */}
          <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3">
             <div className="relative w-20 h-20">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="40" cy="40" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                 <circle 
                   cx="40" cy="40" r="36" fill="transparent" stroke="#f59e0b" strokeWidth="8" 
                   strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * Math.min(100, (todayMeals/foodGoal)*100)) / 100} 
                   strokeLinecap="round" className="transition-all duration-1000" 
                 />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-800">
                 {Math.round((todayMeals/foodGoal)*100)}%
               </div>
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-slate-400">Meals</p>
               <p className="font-black text-slate-800">{todayMeals} entries</p>
               <p className="text-[9px] font-bold text-slate-300">Target {foodGoal}/day</p>
             </div>
          </div>
        </div>
      </section>

      {/* AI Smart Insight */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10 space-y-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></span>
               <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">NurtureAI Analysis</p>
             </div>
             <span className="text-[8px] font-black text-indigo-700 bg-white/90 px-2 py-1 rounded-full uppercase tracking-widest">Gemini ✨</span>
           </div>
           
           <div className="min-h-[60px]">
             {loading ? (
               <div className="flex gap-2 py-3">
                 {[0, 1, 2].map(i => (
                   <div key={i} className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                 ))}
               </div>
             ) : (
               <p className="text-xl font-bold leading-tight tracking-tight">{aiRec || "Collecting latest growth data..."}</p>
             )}
           </div>

           <button 
             onClick={() => onSetAlarm('routine', 15, 'Gemini Smart Check-in')}
             className="w-full bg-white/20 hover:bg-white/30 transition-all text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl border border-white/20 backdrop-blur-sm"
           >
             Set Suggested Action ⏰
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
