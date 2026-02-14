import React, { useState, useEffect } from 'react';
import { Child, ActivityEvent, LiveStats, GrowthData, WaterEntry, FoodEntry, SmartAlarm } from '../types';
import { generateProactiveRecommendations } from '../services/gemini';
import { calculateAge, getHydrationGoal } from '../utils/age';

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
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
  }, []);

  const age = calculateAge(child.birthDate);
  const hydrationGoal = getHydrationGoal(age.decimal || age.years);

  const dailyWater = waterEntries
    .filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString())
    .reduce((a, b) => a + b.amountMl, 0);

  const dailyTotal = dailyWater; 
  const waterProgress = Math.min(100, (dailyTotal / hydrationGoal) * 100);

  useEffect(() => {
    const fetchRec = async () => {
      setLoading(true);
      try {
        const lastMeal = foodEntries[0] ? new Date(foodEntries[0].timestamp).toLocaleTimeString() : null;
        const lastWater = waterEntries[0] ? new Date(waterEntries[0].timestamp).toLocaleTimeString() : null;
        const res = await generateProactiveRecommendations(child.name, age.display, lastMeal, lastWater, null);
        setAiRec(res);
      } catch (e) { 
        console.error("AI Insight Error:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchRec();
  }, [events.length, dailyWater, child.name, age.display]);

  const handleDownloadClick = () => {
    if ((window as any).triggerInstall) {
      (window as any).triggerInstall();
    }
  };

  const handleSmartAlarm = () => {
    const delay = aiRec?.toLowerCase().includes('30') ? 30 : 60;
    const type = aiRec?.toLowerCase().includes('water') ? 'water' : 'meal';
    onSetAlarm(type, delay, `Gemini Recommends: ${aiRec?.substring(0, 30)}...`);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!isStandalone && (
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl flex items-center justify-between border border-white/10 group active:scale-[0.98] transition-all cursor-pointer" onClick={handleDownloadClick}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">📲</div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Android Integration</p>
              <h4 className="text-lg font-bold">Download NurtureAI APK</h4>
              <p className="text-[10px] text-slate-400 font-bold">Install for background alerts & offline access</p>
            </div>
          </div>
          <button className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Install</button>
        </div>
      )}

      {/* AI Smart Insight Card with Gemini Badge */}
      <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10 space-y-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></span>
               <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">NurtureAI Expert Insight</p>
             </div>
             <span className="text-[9px] font-black text-indigo-700 bg-white/90 px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Gemini Intelligence ✨</span>
           </div>
           
           <div className="min-h-[60px]">
             {loading ? (
               <div className="flex gap-2 py-4">
                 {[0, 1, 2].map(i => (
                   <div key={i} className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                 ))}
               </div>
             ) : (
               <p className="text-xl font-bold leading-tight tracking-tight drop-shadow-sm">{aiRec || "Gemini is analyzing your child's data..."}</p>
             )}
           </div>

           <button 
             onClick={handleSmartAlarm}
             className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl border border-white/20 backdrop-blur-sm"
           >
             Set Gemini Smart Alarm ⏰
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-emerald-50 p-6 rounded-[1.5rem] border border-emerald-100 space-y-1 group active:bg-emerald-100 transition-colors">
              <div className="flex items-center gap-1">
                <span className="text-xs group-hover:scale-125 transition-transform">💓</span>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Heart Rate</p>
              </div>
              <p className="text-2xl font-black text-emerald-900">{liveStats.heartRate} <span className="text-[10px] font-bold opacity-40 uppercase">bpm</span></p>
           </div>
           <div className="bg-amber-50 p-6 rounded-[1.5rem] border border-amber-100 space-y-1 group active:bg-amber-100 transition-colors">
              <div className="flex items-center gap-1">
                <span className="text-xs group-hover:scale-125 transition-transform">⚖️</span>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Weight</p>
              </div>
              <p className="text-2xl font-black text-amber-900">{growthData[0]?.weight || child.weightKg} <span className="text-[10px] font-bold opacity-40 uppercase">kg</span></p>
           </div>
        </div>
      </div>

      <section className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Latest Logs</h3>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-slate-400 text-xs font-bold text-center py-4 italic">No recent events detected.</p>
          ) : (
            events.slice(0, 3).map(event => (
              <div key={event.id} className="flex gap-4 items-center p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  event.type === 'cry' ? 'bg-rose-50 text-rose-500' : 
                  event.type === 'feeding' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-500'
                }`}>
                  {event.type === 'cry' ? '📢' : event.type === 'feeding' ? '🥣' : '✨'}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-700">{event.description}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(event.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;