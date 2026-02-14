
import React, { useState } from 'react';
import { Child } from '../types';

interface OnboardingProps {
  onComplete: (child: Child) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'boy'|'girl'|'other'>('boy');
  const [weight, setWeight] = useState('3.5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return;
    onComplete({
      id: Date.now().toString(),
      name,
      birthDate: dob,
      gender,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      weightKg: parseFloat(weight)
    });
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🍼</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Welcome to NurtureAI</h2>
          <p className="text-slate-500 mt-2 font-medium">Let's create your first child's profile to get started.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Child's Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Enter name"
              required 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Date of Birth</label>
              <input 
                type="date" 
                value={dob} 
                onChange={e => setDob(e.target.value)} 
                required 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 outline-none" 
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Birth Weight (kg)</label>
              <input 
                type="number" 
                step="0.1" 
                value={weight} 
                onChange={e => setWeight(e.target.value)} 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none" 
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Start Monitoring
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
