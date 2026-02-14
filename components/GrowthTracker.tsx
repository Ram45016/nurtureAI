
import React, { useState } from 'react';
import { Child, GrowthData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateAge, getExpectedWeightRange } from '../utils/age';

interface GrowthTrackerProps {
  child: Child;
  growthData: GrowthData[];
  onAddEntry: (entry: Omit<GrowthData, 'id'>) => void;
}

const GrowthTracker: React.FC<GrowthTrackerProps> = ({ child, growthData, onAddEntry }) => {
  const [newHeight, setNewHeight] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  
  const age = calculateAge(child.birthDate);
  const currentWeight = growthData[0]?.weight || child.weightKg;
  const expectedRange = getExpectedWeightRange(age.decimal || age.years, child.gender);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeight || !newWeight) return;
    onAddEntry({
      date: newDate,
      height: parseFloat(newHeight),
      weight: parseFloat(newWeight)
    });
    setNewHeight('');
    setNewWeight('');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Developmental Tracking</h2>
          <p className="text-slate-500 font-medium">Monitoring milestones for {age.display}.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Weight</p>
            <p className="text-2xl font-black text-indigo-600">{currentWeight} kg</p>
          </div>
          <div className="bg-indigo-600 px-6 py-4 rounded-3xl text-white shadow-lg shadow-indigo-100 text-center">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Expected Range</p>
            <p className="text-2xl font-black">{expectedRange.min}-{expectedRange.max} kg</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm sticky top-4">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">📏</span>
              Log Progress
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-1 block">Date of Measurement</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-1 block">Height (cm)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={newHeight} 
                  onChange={e => setNewHeight(e.target.value)}
                  placeholder="e.g. 62.5" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-1 block">Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={newWeight} 
                  onChange={e => setNewWeight(e.target.value)}
                  placeholder="e.g. 4.8" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Save Record
              </button>
            </form>
            
            <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Development Status</p>
               <p className="text-sm font-bold text-emerald-800">
                 {currentWeight >= expectedRange.min && currentWeight <= expectedRange.max 
                   ? `Healthy growth detected for ${age.display}. Weight is within standard WHO percentiles.` 
                   : currentWeight < expectedRange.min 
                   ? `Slightly below average weight for ${age.display}. Consider consulting pediatric nutritional support.`
                   : `Above average weight for ${age.display}. Monitoring consistent development.`}
               </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Height Trend (cm)</h3>
                 <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip />
                        <Line type="monotone" dataKey="height" stroke="#6366f1" strokeWidth={4} dot={{r: 6, fill: '#6366f1', strokeWidth: 4, stroke: '#fff'}} activeDot={{r: 8}} />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Weight Trend (kg)</h3>
                 <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip />
                        <Line type="monotone" dataKey="weight" stroke="#ec4899" strokeWidth={4} dot={{r: 6, fill: '#ec4899', strokeWidth: 4, stroke: '#fff'}} activeDot={{r: 8}} />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6">Historical Log</h3>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="pb-4">Date</th>
                          <th className="pb-4">Height</th>
                          <th className="pb-4">Weight</th>
                          <th className="pb-4">Assessment</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {growthData.slice().reverse().map(data => (
                         <tr key={data.id} className="text-sm">
                            <td className="py-4 font-bold text-slate-700">{data.date}</td>
                            <td className="py-4 text-slate-500 font-medium">{data.height} cm</td>
                            <td className="py-4 text-slate-500 font-medium">{data.weight} kg</td>
                            <td className="py-4 text-emerald-500 font-bold">Standard Track</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthTracker;
