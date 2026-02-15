
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

  const weightRange = getExpectedWeightRange(decimalAge, child.gender);
  const heightRange = getExpectedHeightRange(decimalAge, child.gender);
  const waterGoal = getHydrationGoal(decimalAge);
  const foodGoal = getRecommendedMealFrequency(decimalAge);

  const currentWeight = growthData[0]?.weight || child.weightKg;
  const currentHeight = growthData[0]?.height || (decimalAge < 0.5 ? 50 : 70);

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
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchRec();
  }, [events.length, todayWater, child.name, age.display]);

  const ComparisonBar = ({ label, actual, min, max, unit, icon, color }: any) => {
    const isNormal = actual >= min && actual <= max;
    const progress = Math.min(100, (actual / max) * 100);
    return (
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100/50 elevation-1 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
          </div>
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${isNormal ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {isNormal ? 'Healthy' : 'Check Range'}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-black text-slate-800">{actual}<span className="text-sm text-slate-300 ml-1">{unit}</span></p>
          <p className="text-[10px] font-bold text-slate-400">Target: {min}-{max}{unit}</p>
        </div>
        <div className="h-4 bg-slate-50 rounded-2xl relative overflow-hidden">
          <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* AI Smart Insight MD3 Style */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white elevation-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="relative z-10 space-y-5">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></div>
               <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.3em]">AI Synthesis</p>
             </div>
             <span className="text-[9px] font-black text-indigo-700 bg-white px-3 py-1 rounded-full uppercase">Gemini 3 ✨</span>
           </div>
           
           <div className="min-h-[70px]">
             {loading ? (
               <div className="flex gap-2 py-4">
                 {[0, 1, 2].map(i => <div key={i} className="w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
               </div>
             ) : (
               <p className="text-2xl font-black leading-tight tracking-tight">{aiRec || "Analyzing patterns..."}</p>
             )}
           </div>

           <button 
             onClick={() => { if(navigator.vibrate) navigator.vibrate(10); onSetAlarm('routine', 15, 'Smart Check-in'); }}
             className="w-full bg-white/10 hover:bg-white/20 transition-all text-white text-xs font-black uppercase tracking-widest py-4 rounded-2xl border border-white/20 backdrop-blur-sm active:scale-95"
           >
             Action Suggestion ⏰
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ComparisonBar label="Current Weight" actual={currentWeight} min={weightRange.min} max={weightRange.max} unit="kg" icon="⚖️" color="bg-indigo-500" />
        <ComparisonBar label="Standing Height" actual={currentHeight} min={heightRange.min} max={heightRange.max} unit="cm" icon="📏" color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] elevation-1 text-center space-y-3">
          <p className="text-[10px] font-black uppercase text-slate-400">Hydration</p>
          <div className="text-3xl font-black text-slate-800">{todayWater}<span className="text-xs text-slate-300 ml-1">ml</span></div>
          <div className="h-1 bg-slate-100 rounded-full">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(todayWater/waterGoal)*100}%` }}></div>
          </div>
          <p className="text-[9px] font-bold text-slate-400">Target {waterGoal}ml</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] elevation-1 text-center space-y-3">
          <p className="text-[10px] font-black uppercase text-slate-400">Daily Meals</p>
          <div className="text-3xl font-black text-slate-800">{todayMeals}</div>
          <div className="h-1 bg-slate-100 rounded-full">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(todayMeals/foodGoal)*100}%` }}></div>
          </div>
          <p className="text-[9px] font-bold text-slate-400">Target {foodGoal}/day</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
