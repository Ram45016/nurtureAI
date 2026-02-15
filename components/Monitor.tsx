
import React, { useRef, useEffect, useState } from 'react';
import { Child, ActivityEvent, LiveStats } from '../types';
import { analyzeAudioBuffer, analyzeEnvironment } from '../services/gemini';
import { calculateAge } from '../utils/age';

interface MonitorProps {
  child: Child;
  liveStats: LiveStats;
  onNewEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
}

const Monitor: React.FC<MonitorProps> = ({ child, liveStats, onNewEvent }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('System Ready');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const cycleIntervalRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startMonitor = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMonitoring(true);
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      startAudioCycle(stream);
    } catch (err) {
      alert("Microphone Access Required");
    }
  };

  const stopMonitor = () => {
    if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsMonitoring(false);
    setAudioLevel(0);
  };

  const startAudioCycle = (stream: MediaStream) => {
    const runCycle = () => {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setAnalyzing(true);
          try {
            const result = await analyzeAudioBuffer(base64);
            setAiInsight(result.details);
            if (result.isAlert) {
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
              onNewEvent({ type: 'cry', description: result.detectedActivity, severity: 'high' });
            }
          } catch (e) { console.error(e); } finally { setAnalyzing(false); }
        };
      };
      recorder.start();
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), 4000);
    };
    runCycle();
    cycleIntervalRef.current = setInterval(runCycle, 15000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-[3rem] p-10 min-h-[450px] flex flex-col items-center justify-center relative overflow-hidden elevation-3 border-4 border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)] animate-pulse"></div>

        {isMonitoring ? (
          <div className="relative z-10 w-full flex flex-col items-center space-y-12">
            <div className="flex flex-col items-center">
               <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center elevation-3 animate-pulse">
                  <span className="text-5xl text-white">🎙️</span>
               </div>
               <div className="mt-4 flex gap-1">
                 {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 bg-indigo-500 rounded-full animate-ping" style={{animationDelay: `${i*0.2}s`}}></div>)}
               </div>
            </div>
            
            <div className="text-center space-y-4">
               <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em]">Acoustic Guard Active</p>
               <h3 className="text-white text-2xl font-bold px-4 leading-snug">
                 {analyzing ? 'Thinking...' : aiInsight}
               </h3>
            </div>
            
            <button 
              onClick={stopMonitor}
              className="bg-white/10 text-white/60 border border-white/20 px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest active:bg-rose-500 active:text-white transition-all"
            >
              Secure System
            </button>
          </div>
        ) : (
          <div className="relative z-10 text-center space-y-10">
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10">
               <span className="text-4xl opacity-50">🔒</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-white text-3xl font-black">Shield Idle</h3>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Activate Core Monitoring</p>
            </div>
            <button 
              onClick={startMonitor}
              className="bg-indigo-600 text-white px-14 py-6 rounded-[2rem] font-black text-xl elevation-3 hover:scale-105 active:scale-95 transition-all"
            >
              Start Guard
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white p-8 rounded-[2.5rem] elevation-1 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ambient Noise</p>
            <p className="text-4xl font-black text-slate-800">{liveStats.noiseLevel} <span className="text-sm text-slate-300">dB</span></p>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] elevation-1 flex flex-col justify-center border-l-8 border-orange-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Temperature</p>
            <p className="text-4xl font-black text-orange-500">{liveStats.temperature}°</p>
         </div>
      </div>
    </div>
  );
};

export default Monitor;
