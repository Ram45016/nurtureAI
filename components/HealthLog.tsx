
import React, { useState } from 'react';
import { Child, Vaccination, DoctorVisit } from '../types';
import { summarizeMedicalNote } from '../services/gemini';

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
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleAISummary = async (note: string) => {
    setLoadingSummary(true);
    try {
      const res = await summarizeMedicalNote(note);
      setSummary(res || '');
    } catch (e) {
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Health Center</h2>
          <p className="text-slate-500 font-medium">Manage immunizations and medical records for {child.name}.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner w-full md:w-auto">
          <button 
            onClick={() => setTab('vax')} 
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'vax' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Vaccinations
          </button>
          <button 
            onClick={() => setTab('doctor')} 
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'doctor' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Doctor Visits
          </button>
        </div>
      </header>

      {tab === 'vax' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 h-fit shadow-sm">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8 border-b border-slate-50 pb-4">Log Immunization</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Vaccine Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., MMR, Hepatitis B" 
                  value={vName} 
                  onChange={e => setVName(e.target.value)} 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date Administered</label>
                <input 
                  type="date" 
                  value={vDate} 
                  onChange={e => setVDate(e.target.value)} 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 outline-none" 
                />
              </div>
              <button 
                onClick={() => { if (vName) { onAddVaccine({ name: vName, date: vDate, status: 'completed' }); setVName(''); } }} 
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Save Record
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
             {vaccines.length === 0 ? (
               <div className="bg-white p-20 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-slate-300">
                  <span className="text-6xl mb-6 opacity-30">🛡️</span>
                  <p className="font-black text-lg">No records found.</p>
               </div>
             ) : (
               vaccines.map(v => (
                 <div key={v.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm hover:border-indigo-100 transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl shadow-inner">💉</div>
                      <div>
                        <h4 className="font-black text-slate-800 text-lg">{v.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date: {v.date}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-5 py-2 rounded-full">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified</span>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 h-fit shadow-sm">
             <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8 border-b border-slate-50 pb-4">New Doctor's Note</h3>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Visit Reason</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Annual Check-up" 
                    value={dReason} 
                    onChange={e => setDReason(e.target.value)} 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Notes & Observations</label>
                  <textarea 
                    placeholder="Details about height, weight, concerns..." 
                    value={dNotes} 
                    onChange={e => setDNotes(e.target.value)} 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 outline-none h-48 resize-none" 
                  />
                </div>
                <button 
                  onClick={() => { if (dReason && dNotes) { onAddVisit({ reason: dReason, notes: dNotes, doctorName: 'Pediatrician', date: new Date().toLocaleDateString() }); setDReason(''); setDNotes(''); } }} 
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Log Check-up
                </button>
             </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
             {summary && (
               <div className="bg-indigo-50 p-10 rounded-[2.5rem] border border-indigo-100 relative overflow-hidden animate-in zoom-in-95 duration-300">
                 <div className="absolute -top-4 -right-4 text-7xl opacity-5">📋</div>
                 <h4 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
                   AI Health Summary
                 </h4>
                 <p className="text-indigo-900 text-lg leading-relaxed font-bold whitespace-pre-wrap">{summary}</p>
               </div>
             )}
             
             <div className="space-y-4">
              {visits.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-slate-300">
                  <span className="text-6xl mb-6 opacity-30">🏥</span>
                  <p className="font-black text-lg">No visits logged.</p>
                </div>
              ) : (
                visits.map(visit => (
                  <div key={visit.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="font-black text-slate-800 text-2xl tracking-tight">{visit.reason}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{visit.date} • {visit.doctorName}</p>
                        </div>
                        <button 
                          onClick={() => handleAISummary(visit.notes)} 
                          disabled={loadingSummary}
                          className="text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-6 py-2.5 rounded-full uppercase tracking-widest transition-all shadow-sm"
                        >
                          {loadingSummary ? '...' : 'AI Summary'}
                        </button>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border-l-8 border-indigo-500 text-slate-700">
                        <p className="text-lg font-medium leading-relaxed italic">"{visit.notes}"</p>
                      </div>
                  </div>
                ))
              )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthLog;
