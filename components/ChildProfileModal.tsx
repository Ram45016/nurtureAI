
import React, { useState, useEffect } from 'react';
import { Child } from '../types';

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (child: Child) => void;
  onDelete?: (id: string) => void;
  editingChild: Child | null;
}

const ChildProfileModal: React.FC<ChildProfileModalProps> = ({ isOpen, onClose, onSave, onDelete, editingChild }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | 'other'>('boy');
  const [birthWeight, setBirthWeight] = useState('3.5');
  const [currentWeight, setCurrentWeight] = useState('3.5');

  useEffect(() => {
    if (editingChild) {
      setName(editingChild.name);
      setDob(editingChild.birthDate);
      setGender(editingChild.gender);
      setBirthWeight(editingChild.birthWeightKg?.toString() || editingChild.weightKg.toString());
      setCurrentWeight(editingChild.weightKg.toString());
    } else {
      setName('');
      setDob('');
      setGender('boy');
      setBirthWeight('3.5');
      setCurrentWeight('3.5');
    }
  }, [editingChild, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return;
    onSave({
      id: editingChild ? editingChild.id : Date.now().toString(),
      name,
      birthDate: dob,
      gender,
      avatar: editingChild ? editingChild.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      birthWeightKg: parseFloat(birthWeight),
      weightKg: parseFloat(currentWeight)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {editingChild ? 'Edit Profile' : 'Add New Child'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2">
              <span className="text-2xl leading-none">✕</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Child's Name</label>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Date of Birth</label>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Birth Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={birthWeight} 
                  onChange={e => setBirthWeight(e.target.value)} 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Current Weight (kg)</label>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Gender</label>
              <div className="flex gap-3">
                {(['boy', 'girl', 'other'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-3 rounded-xl font-bold capitalize border-2 transition-all ${
                      gender === g 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button 
                type="submit" 
                className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {editingChild ? 'Update Profile' : 'Create Profile'}
              </button>
              
              {editingChild && onDelete && (
                <button 
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove ${editingChild.name}'s profile? All local history will be kept, but the profile will be hidden.`)) {
                      onDelete(editingChild.id);
                    }
                  }}
                  className="w-full py-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition-all"
                >
                  Remove Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChildProfileModal;
