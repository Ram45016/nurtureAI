
import React, { useState } from 'react';
import { Child, FoodEntry } from '../types';
import { analyzeDiet } from '../services/gemini';
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
  const [loading, setLoading] = useState(false);
  const age = calculateAge(child.birthDate);

  const getAnalysis = async () => {
    if (entries.length === 0) {
      alert("Please log some meals first for analysis.");
      return;
    }
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
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Nutrition Center</h2>
          <p className="text-slate-500 font-medium">Personalized diet tracking and AI diet recommendations for {age.display}.</p>
        </div>
        <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-2">
           <span className="text-emerald-500 text-xl">🥗</span>
           <div>
             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Dietary Phase</p>
             <p className="text-sm font-bold text-emerald-900">
               {age.years < 1 ? 'Early Nutrition' : 
                age.years < 3 ? 'Whole Food Introduction' : 
                'Energy & Growth Support'}
             </p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-4">
            <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs border-b border-slate-50 pb-4">Log Food Entry</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">What did they eat?</label>
                <input 
                  type="text" 
                  value={food} 
                  onChange={e => setFood(e.target.value)} 
                  placeholder="e.g., Avocado mash, pasta with peas" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value as any)} 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 outline-none"
                >
                  <option value="breakfast">Breakfast / Morning Milk</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Healthy Snack</option>
                </select>
              </div>
              <button 
                onClick={() => { if (food) { onAddEntry({ description: food, mealType: type }); setFood(''); } }} 
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Log Meal
              </button>
              
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button 
                  onClick={getAnalysis} 
                  disabled={loading} 
                  className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-lg shadow-emerald-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : `Analyze Current Diet ✨`}
                </button>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-3">AI evaluates nutritional balance</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Proactive Recommendation Block */}
          {!analysis && (
            <div className="bg-amber-50 p-10 rounded-[2.5rem] border border-amber-100 shadow-inner relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">🍲</div>
               <h4 className="font-black text-amber-900 uppercase tracking-widest text-xs mb-4">Recommended Foods for {age.display}</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { item: age.years < 1 ? "Sweet Potato Mash" : "Scrambled Eggs", desc: "Rich in vitamins & energy" },
                    { item: age.years < 1 ? "Greek Yogurt" : "Whole Grain Toast", desc: "For gut health & fiber" },
                    { item: "Seasonal Berries", desc: "Antioxidant support" }
                  ].map((rec, i) => (
                    <div key={i} className="bg-white/60 p-4 rounded-2xl">
                       <p className="font-black text-slate-800 text-sm mb-1">{rec.item}</p>
                       <p className="text-[10px] text-slate-500 font-bold">{rec.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {analysis && (
            <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-inner relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🍎</div>
              <h4 className="font-black text-indigo-900 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                AI Nutritional Feedback
              </h4>
              <div className="prose prose-indigo max-w-none text-indigo-900 font-medium">
                <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">Recent Meal Timeline</h3>
            <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="text-center py-16 text-slate-300">
                   <p className="text-4xl mb-4">🍽️</p>
                   <p className="font-bold">No meals recorded yet today.</p>
                </div>
              ) : (
                entries.map(e => (
                  <div key={e.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                        e.mealType === 'breakfast' ? 'bg-amber-100 text-amber-600' :
                        e.mealType === 'lunch' ? 'bg-blue-100 text-blue-600' :
                        e.mealType === 'dinner' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {e.mealType === 'breakfast' ? '🥣' : e.mealType === 'lunch' ? '🍱' : e.mealType === 'dinner' ? '🍲' : '🍎'}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{e.mealType}</span>
                        <p className="font-black text-slate-700">{e.description}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietTracker;
