
import React, { useState } from 'react';
import { Child, GrowthData } from '../types';
import { calculateAge, getExpectedWeightRange, getExpectedHeightRange } from '../utils/age';

interface GrowthTrackerProps {
  child: Child;
  growthData: GrowthData[];
  onAddEntry: (entry: Omit<GrowthData, 'id'>) => void;
}

const GrowthTracker: React.FC<GrowthTrackerProps> = ({ child, growthData, onAddEntry }) => {
  const [newHeight, setNewHeight] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  
  const age = calculateAge(child.birthDate);
  const decimalAge = age.decimal || age.years;
  const currentWeight = growthData[0]?.weight || child.weightKg;
  const currentHeight = growthData[0]?.height || (decimalAge < 0.5 ? 50 : 70);

  const expWeight = getExpectedWeightRange(decimalAge, child.gender);
  const expHeight = getExpectedHeightRange(decimalAge, child.gender);

  const StatusBadge = ({ actual, min, max }: any) => {
    const status = actual < min ? 'Below' : actual > max ? 'Above' : 'Normal';
    const color = status === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600';
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${color}`}>
        {status} Standard
      </span>
    );
  };

  const ProgressTrack = ({ actual, min, max, colorClass }: any) => {
    const progress = Math.min(100, (actual / max) * 100);
    const minMarker = (min / max) * 100;
    return (
      <div className="w-full h-3 bg-slate-50 rounded-full relative overflow-hidden mt-4">
        <div className={`h-full ${colorClass} transition-all duration-1000`} style={{ width: `${progress}%` }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-200" style={{ left: `${minMarker}%` }} />
      </div>
    );
  };

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
    setShowForm(false);
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="px-1 space-y-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Growth Center</h2>
        <p className="text-slate-500 font-bold text-sm">WHO Percentile Comparison</p>
      </header>

      {/* Weight Card */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Weight Status</h3>
            <p className="text-4xl font-black text-slate-800">{currentWeight}<span className="text-lg text-slate-300 ml-1">kg</span></p>
          </div>
          <StatusBadge actual={currentWeight} min={expWeight.min} max={expWeight.max} />
        </div>
        <p className="text-[10px] font-bold text-slate-400">Range for {age.display}: {expWeight.min}-{expWeight.max}kg</p>
        <ProgressTrack actual={currentWeight} min={expWeight.min} max={expWeight.max} colorClass="bg-indigo-500" />
      </div>

      {/* Height Card */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Height / Stature</h3>
            <p className="text-4xl font-black text-slate-800">{currentHeight}<span className="text-lg text-slate-300 ml-1">cm</span></p>
          </div>
          <StatusBadge actual={currentHeight} min={expHeight.min} max={expHeight.max} />
        </div>
        <p className="text-[10px] font-bold text-slate-400">Range for {age.display}: {expHeight.min}-{expHeight.max}cm</p>
        <ProgressTrack actual={currentHeight} min={expHeight.min} max={expHeight.max} colorClass="bg-blue-500" />
      </div>

      {/* History */}
      <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Measurement History</h3>
        <div className="space-y-3">
          {growthData.length === 0 ? (
            <p className="text-center text-slate-300 text-xs font-bold py-10 italic">No historical data recorded yet.</p>
          ) : (
            growthData.map(d => (
              <div key={d.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div>
                  <p className="text-sm font-black text-slate-700">{new Date(d.date).toLocaleDateString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Growth Check</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-indigo-600">{d.weight}kg</p>
                  <p className="text-xs font-bold text-slate-400">{d.height}cm</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* FAB Add */}
      <div className="fixed bottom-28 right-6 z-[60]">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center text-4xl hover:scale-110 active:scale-95 transition-all"
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-x-4 bottom-48 z-[70] bg-white p-8 rounded-[3rem] border border-slate-200 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
          <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">New Measurement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} 
                placeholder="Weight (kg)" className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold outline-none border-2 border-transparent focus:border-indigo-500" 
              />
              <input 
                type="number" step="0.1" value={newHeight} onChange={e => setNewHeight(e.target.value)} 
                placeholder="Height (cm)" className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold outline-none border-2 border-transparent focus:border-indigo-500" 
              />
            </div>
            <input 
              type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold outline-none border-2 border-transparent focus:border-indigo-500" 
            />
            <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl">
              Save Statistics
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default GrowthTracker;
