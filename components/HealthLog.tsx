
import React, { useState } from 'react';
import { Child, Vaccination, DoctorVisit } from '../types';
import { summarizeMedicalNote, forecastVaccinations } from '../services/gemini';
import { calculateAge } from '../utils/age';

interface HealthLogProps {
  child: Child;
  vaccines: Vaccination[];
  visits: DoctorVisit[];
  onAddVaccine: (v: Omit<Vaccination, 'id'>) => void;
  onAddVisit: (v: Omit<DoctorVisit, 'id'>) => void;
}

const HealthLog: React.FC<HealthLogProps> = ({ child, vaccines, visits, onAddVaccine, onAddVisit }) => {
  const [tab, setTab] = useState<'vax' | 'doctor'>('vax');
  const [vName, setVName] = useState('');
  const [vDate, setVDate] = useState(new Date().toISOString().split('T')[0]);
  const [dReason, setDReason] = useState('');
  const [dNotes, setDNotes] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [vaxForecast, setVaxForecast] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);

  const age = calculateAge(child.birthDate);

  const handleForecast = async () => {
    setLoadingForecast(true);
    try {
      const res = await forecastVaccinations(child.name, age.display);
      setVaxForecast(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleAISummary = async (note: string) => {
    setLoadingSummary(true);
    try {
      const res = await summarizeMedicalNote(note);
      setSummary(res || '');
    } catch (e) {
      setSummary("Failed to generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex bg-slate-100 p-1.5 rounded-3xl elevation-1">
        <button 
          onClick={() => setTab('vax')} 
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'vax' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
        >
          Immunizations
        </button>
        <button 
          onClick={() => setTab('doctor')} 
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'doctor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
        >
          Doctor Notes
        </button>
      </div>

      {tab === 'vax' ? (
        <div className="space-y-6">
          {/* AI Forecast Card */}
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] elevation-3 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 text-7xl">🗓️</div>
             <div className="relative z-10 space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">AI Health Forecast</h4>
               {vaxForecast ? (
                 <div className="space-y-4">
                    <div className="prose prose-invert prose-sm font-medium leading-relaxed">
                       <div dangerouslySetInnerHTML={{ __html: vaxForecast.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                    <button 
                      onClick={() => setVaxForecast(null)}
                      className="text-[9px] font-black uppercase text-indigo-300 hover:text-white"
                    >
                      Clear Forecast
                    </button>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <p className="text-xl font-black leading-snug">Predict upcoming vaccinations for age {age.display}.</p>
                   <button 
                    onClick={handleForecast}
                    disabled={loadingForecast}
                    className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest elevation-1 active:scale-95 transition-all"
                   >
                     {loadingForecast ? 'Scanning Guidelines...' : 'Generate AI Forecast ✨'}
                   </button>
                 </div>
               )}
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] elevation-1 space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Log Administered Vaccine</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Vaccine Name (e.g. MMR)" 
                value={vName} 
                onChange={e => setVName(e.target.value)} 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 font-bold outline-none" 
              />
              <input 
                type="date" 
                value={vDate} 
                onChange={e => setVDate(e.target.value)} 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 font-bold outline-none" 
              />
            </div>
            <button 
              onClick={() => { if (vName) { onAddVaccine({ name: vName, date: vDate, status: 'completed' }); setVName(''); } }} 
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl elevation-2 active:scale-95 transition-all"
            >
              Update Medical File
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] elevation-1">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Historical Record</h3>
             <div className="space-y-3">
               {vaccines.length === 0 ? (
                 <p className="text-center py-10 text-slate-300 font-bold text-xs italic">No vaccination history recorded.</p>
               ) : (
                 vaccines.map(v => (
                   <div key={v.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl border border-slate-100">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl">💉</div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{v.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{v.date}</p>
                        </div>
                     </div>
                     <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Verified</span>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] elevation-1 space-y-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Consultation Notes</h3>
             <input 
                type="text" 
                placeholder="Visit Reason (e.g. 1-Year Checkup)" 
                value={dReason} 
                onChange={e => setDReason(e.target.value)} 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 font-bold outline-none" 
              />
              <textarea 
                placeholder="Pediatrician's summary, weight, height, concerns..." 
                value={dNotes} 
                onChange={e => setDNotes(e.target.value)} 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 font-bold outline-none h-40 resize-none" 
              />
              <button 
                onClick={() => { if (dReason && dNotes) { onAddVisit({ reason: dReason, notes: dNotes, doctorName: 'Clinic', date: new Date().toLocaleDateString() }); setDReason(''); setDNotes(''); } }} 
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl elevation-2 active:scale-95 transition-all"
              >
                Save Clinic Record
              </button>
          </div>

          {visits.map(visit => (
            <div key={visit.id} className="bg-white p-8 rounded-[2.5rem] elevation-1 space-y-4">
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{visit.reason}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{visit.date}</p>
                  </div>
                  <button 
                    onClick={() => handleAISummary(visit.notes)}
                    className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase"
                  >
                    AI Summarize
                  </button>
               </div>
               <div className="p-5 bg-slate-50 rounded-3xl border-l-4 border-indigo-400">
                  <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{visit.notes}"</p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthLog;
