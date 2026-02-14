
import React, { useState } from 'react';
import { Child, GrowthData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const currentWeight = growthData[0]?.weight || child.weightKg;
  const currentHeight = growthData[0]?.height || 50; // default for new profiles

  const expWeight = getExpectedWeightRange(age.decimal || age.years, child.gender);
  const expHeight = getExpectedHeightRange(age.decimal || age.years, child.gender);

  const weightStatus = currentWeight < expWeight.min ? 'Below' : currentWeight > expWeight.max ? 'Above' : 'Normal';
  const heightStatus = currentHeight < expHeight.min ? 'Below' : currentHeight > expHeight.max ? 'Above' : 'Normal';

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
    <div className="space-y-6 pb-10">
      <header className="px-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Growth Stats</h2>
        <p className="text-slate-500 font-bold text-sm">WHO standards vs Actual growth</p>
      </header>

      {/* Mobile-Friendly Growth Scorecards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Weight Comparison Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚖️</span>
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Body Weight</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              weightStatus === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {weightStatus} Standard
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-4xl font-black text-slate-800">{currentWeight}<span className="text-lg text-slate-300 ml-1">kg</span></p>
              <p className="text-[10px] font-bold text-slate-400">Target: {expWeight.min} - {expWeight.max} kg</p>
            </div>
            <div className="w-1/2 h-2 bg-slate-100 rounded-full overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-1000 ${weightStatus === 'Normal' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (currentWeight / expWeight.max) * 100)}%` }}
              ></div>
              <div className="absolute top-0 bottom-0 border-r-2 border-indigo-300" style={{ left: `${(expWeight.min / expWeight.max) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Height Comparison Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">📏</span>
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Height / Stature</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              heightStatus === 'Normal' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {heightStatus} Standard
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-4xl font-black text-slate-800">{currentHeight}<span className="text-lg text-slate-300 ml-1">cm</span></p>
              <p className="text-[10px] font-bold text-slate-400">Target: {expHeight.min} - {expHeight.max} cm</p>
            </div>
            <div className="w-1/2 h-2 bg-slate-100 rounded-full overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-1000 ${heightStatus === 'Normal' ? 'bg-indigo-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (currentHeight / expHeight.max) * 100)}%` }}
              ></div>
              <div className="absolute top-0 bottom-0 border-r-2 border-indigo-300" style={{ left: `${(expHeight.min / expHeight.max) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Growth Analysis */}
      <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 text-6xl opacity-20">📊</div>
        <div className="relative z-10 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Gemini Insight</p>
          <p className="text-sm font-bold leading-relaxed">
            {child.name}'s current {weightStatus.toLowerCase()} weight trend and {heightStatus.toLowerCase()} height is 
            {weightStatus === 'Normal' && heightStatus === 'Normal' ? ' ideal for their age.' : ' being monitored for standard deviation.'} 
            Continue logging to refine standard WHO percentile mapping.
          </p>
        </div>
      </div>

      {/* Floating Action Button for Adding Data */}
      <div className="fixed bottom-24 right-6 z-[60]">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-90 transition-all"
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
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
            <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100">
              Save Entry
            </button>
          </form>
        </div>
      )}

      {/* History List */}
      <section className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Historical Records</h3>
        <div className="space-y-3">
          {growthData.length === 0 ? (
            <p className="text-center text-slate-400 text-xs font-bold py-8">No historical data found.</p>
          ) : (
            growthData.map(d => (
              <div key={d.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-black text-slate-700">{new Date(d.date).toLocaleDateString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Logged at {new Date(d.date).getFullYear()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-indigo-600">{d.weight}kg</p>
                  <p className="text-sm font-black text-indigo-400">{d.height}cm</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default GrowthTracker;
