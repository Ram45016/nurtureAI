
import React, { useState } from 'react';
import { Child, FoodEntry } from '../types';
import { analyzeDiet, generateMealPlan } from '../services/gemini';
import { calculateAge } from '../utils/age';

interface DietTrackerProps {
  child: Child;
  entries: FoodEntry[];
  onAddEntry: (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => void;
}

const DietTracker: React.FC<DietTrackerProps> = ({ child, entries, onAddEntry }) => {
  const [food, setFood] = useState('');
  const [type, setType] = useState<'breakfast'|'lunch'|'dinner'|'snack'>('snack');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  
  const age = calculateAge(child.birthDate);

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await generateMealPlan(child.name, age.display);
      setMealPlan(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(false);
    }
  };

  const getAnalysis = async () => {
    if (entries.length === 0) return;
    setLoading(true);
    try {
      const result = await analyzeDiet(entries.slice(0, 10).map(e => e.description), age.display);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setAnalysis("AI Analysis temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Info */}
      <div className="bg-orange-50 p-6 rounded-[2rem] flex items-center gap-4 border border-orange-100 shadow-sm">
        <span className="text-3xl">🥕</span>
        <div>
          <h3 className="text-orange-900 font-black text-sm uppercase tracking-widest leading-none mb-1">Developmental Focus</h3>
          <p className="text-orange-800 text-xs font-bold">
            {age.years < 1 ? 'High-density micro-nutrients & Iron' : 
             age.years < 4 ? 'Fiber, Protein & Diverse Textures' : 
             'Balanced Macros for Brain & Energy'}
          </p>
        </div>
      </div>

      {/* Entry Form */}
      <div className="bg-white p-8 rounded-[2.5rem] elevation-1 space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Log Nutrition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 px-2 uppercase">Meal Description</label>
             <input 
                type="text" 
                value={food} 
                onChange={e => setFood(e.target.value)} 
                placeholder="e.g., Oatmeal with bananas" 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 font-bold outline-none" 
              />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 px-2 uppercase">Category</label>
             <select 
                value={type} 
                onChange={e => setType(e.target.value as any)} 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 font-bold outline-none"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
           </div>
        </div>
        <button 
          onClick={() => { if (food) { onAddEntry({ description: food, mealType: type }); setFood(''); } }} 
          className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl elevation-2 active:scale-95 transition-all"
        >
          Add to Daily Log
        </button>
      </div>

      {/* AI Features Tabs/Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={getAnalysis} 
          disabled={loading || entries.length === 0}
          className="flex-1 py-4 bg-emerald-100 text-emerald-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? '...' : '✨ Analyze Diet'}
        </button>
        <button 
          onClick={handleGeneratePlan}
          disabled={loadingPlan}
          className="flex-1 py-4 bg-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          {loadingPlan ? '...' : '🗓️ AI Meal Plan'}
        </button>
      </div>

      {/* AI Output Area */}
      {(analysis || mealPlan) && (
        <div className="bg-slate-900 text-indigo-100 p-8 rounded-[2.5rem] elevation-3 relative overflow-hidden animate-in zoom-in-95 duration-500">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">✨</div>
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                <h4 className="font-black uppercase tracking-widest text-[10px]">{analysis ? 'Nutritional Critique' : '3-Day AI Meal Plan'}</h4>
              </div>
              <div className="prose prose-invert prose-sm max-w-none font-medium leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: (analysis || mealPlan || '').replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
              <button 
                onClick={() => { setAnalysis(null); setMealPlan(null); }}
                className="text-[9px] font-black uppercase text-indigo-400 tracking-widest hover:text-white"
              >
                Dismiss Intelligence Report
              </button>
           </div>
        </div>
      )}

      {/* Recent History */}
      <div className="bg-white p-8 rounded-[2.5rem] elevation-1 space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
        <div className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-center py-10 text-slate-300 text-xs font-bold italic">No meals logged for today.</p>
          ) : (
            entries.slice(0, 5).map(e => (
              <div key={e.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    {e.mealType === 'breakfast' ? '🥣' : e.mealType === 'lunch' ? '🍱' : '🍲'}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{e.description}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{e.mealType}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-300">{new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DietTracker;
