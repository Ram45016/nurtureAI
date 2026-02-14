
import React, { useState } from 'react';
import { Child } from '../types';

interface OnboardingProps {
  onComplete: (child: Child) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | 'other'>('boy');
  const [birthWeight, setBirthWeight] = useState('3.5');
  const [currentWeight, setCurrentWeight] = useState('3.5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return;
    onComplete({
      id: Date.now().toString(),
      name,
      birthDate: dob,
      gender,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      birthWeightKg: parseFloat(birthWeight),
      weightKg: parseFloat(currentWeight)
    });
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6 safe-area-top safe-area-bottom">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🍼</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome to NurtureAI</h2>
          <p className="text-slate-500 mt-2 font-medium leading-relaxed">Let's create your first child's profile to get started.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Child's Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Enter name"
              required 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Date of Birth</label>
            <input 
              type="date" 
              value={dob} 
              onChange={e => setDob(e.target.value)} 
              required 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Birth Weight (kg)</label>
              <input 
                type="number" 
                step="0.1" 
                value={birthWeight} 
                onChange={e => setBirthWeight(e.target.value)} 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Current Weight (kg)</label>
              <input 
                type="number" 
                step="0.1" 
                value={currentWeight} 
                onChange={e => setCurrentWeight(e.target.value)} 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Gender</label>
            <div className="flex gap-3">
              {(['boy', 'girl', 'other'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-4 rounded-2xl font-black capitalize border-2 transition-all ${
                    gender === g 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Start Monitoring
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
