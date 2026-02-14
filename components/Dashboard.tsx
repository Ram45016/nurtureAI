
import React, { useState, useEffect, useMemo } from 'react';
import { Child, ActivityEvent, LiveStats, GrowthData, WaterEntry, FoodEntry } from '../types';
import { analyzeMood, generateProactiveRecommendations } from '../services/gemini';
import { calculateAge, getHydrationGoal, getNextVaccineRecommendation, getDailyScheduleTemplate } from '../utils/age';

interface DashboardProps {
  child: Child;
  events: ActivityEvent[];
  liveStats: LiveStats;
  growthData: GrowthData[];
  waterEntries: WaterEntry[];
  foodEntries?: FoodEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ child, events, liveStats, growthData, waterEntries, foodEntries = [] }) => {
  const [aiRec, setAiRec] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const age = calculateAge(child.birthDate);
  const hydrationGoal = getHydrationGoal(age.decimal || age.years);
  const nextVax = getNextVaccineRecommendation(age.totalMonths);
  const schedule = getDailyScheduleTemplate(age.decimal || age.years);

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

  return (
    <div className="space-y-6 pb-20">
      {/* AI Notification Card */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10">
           <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-3">Next Best Action • AI Powered</p>
           {loading ? (
             <div className="flex gap-2 py-2">
               <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
               <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
             </div>
           ) : (
             <p className="text-xl font-bold leading-tight">{aiRec || "Monitoring your child's schedule for next recommendation..."}</p>
           )}
        </div>
      </div>

      {/* Main Grid for Android Vitals */}
      <div className="grid grid-cols-1 gap-4">
        {/* Hydration Card - FIXED DYNAMIC LEVELS */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydration Progress</p>
              <h3 className="text-2xl font-black text-blue-600">{dailyWater} <span className="text-sm text-slate-300">/ {hydrationGoal}ml</span></h3>
              <p className="text-[10px] font-bold text-slate-500">Goal for {age.display}</p>
           </div>
           <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * waterProgress) / 100} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800">{Math.round(waterProgress)}%</div>
           </div>
        </div>

        {/* Schedule & Vaccination Roadmap */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Development Roadmap</h3>
           <div className="space-y-6">
              {/* Vaccination Alert */}
              <div className="flex gap-4 items-center">
                 <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-xl">🏥</div>
                 <div className="flex-1">
                    <p className="text-xs font-black text-slate-800">Next Recommended Vaccine</p>
                    <p className="text-xs font-bold text-rose-500 leading-tight">{nextVax.name}</p>
                 </div>
              </div>
              {/* Diet Next Step */}
              <div className="flex gap-4 items-center">
                 <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-xl">🥗</div>
                 <div className="flex-1">
                    <p className="text-xs font-black text-slate-800">Suggested Next Meal</p>
                    <p className="text-xs font-bold text-amber-600 leading-tight">
                      {age.years < 1 ? 'Iron-fortified Cereal' : age.years < 3 ? 'Soft Fruit Pieces' : 'Whole Grain Snack'}
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Vital Signs Row */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Vitals</p>
              <p className="text-2xl font-black text-emerald-900">{liveStats.heartRate} <span className="text-[10px] opacity-40">BPM</span></p>
           </div>
           <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Growth</p>
              <p className="text-2xl font-black text-slate-800">{growthData[0]?.weight || child.weightKg} <span className="text-[10px] opacity-40">KG</span></p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
