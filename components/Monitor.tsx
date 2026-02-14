
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
  const [aiInsight, setAiInsight] = useState<string>('Standby...');
  const [envInsight, setEnvInsight] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const cycleIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const age = calculateAge(child.birthDate);

  const startMonitor = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMonitoring(true);
      if (navigator.vibrate) navigator.vibrate(100);
      setupAudioVisualizer(stream);
      startAudioCycle(stream);
      fetchEnvAnalysis();
    } catch (err) {
      alert("Microphone permission required for Android Audio Guard.");
    }
  };

  const fetchEnvAnalysis = async () => {
    try {
      const result = await analyzeEnvironment(liveStats.temperature, liveStats.humidity, liveStats.noiseLevel, age.display);
      setEnvInsight(result);
    } catch (e) { console.error(e); }
  };

  const setupAudioVisualizer = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    audioContextRef.current = audioContext;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const update = () => {
      if (!isMonitoring) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = dataArray.reduce((a, b) => a + b, 0);
      setAudioLevel(sum / dataArray.length);
      animationFrameRef.current = requestAnimationFrame(update);
    };
    update();
  };

  const stopMonitor = () => {
    if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (audioContextRef.current) audioContextRef.current.close();
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
              // Heavy Android Vibration for baby crying
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
              onNewEvent({
                type: 'cry',
                description: `Acoustic Alert: ${result.detectedActivity}`,
                severity: 'high'
              });
            }
          } catch (e) { console.error(e); } finally { setAnalyzing(false); }
        };
      };
      recorder.start();
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), 5000);
    };
    runCycle();
    cycleIntervalRef.current = setInterval(runCycle, 20000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-[100px]"></div>
        </div>

        {isMonitoring ? (
          <>
            <div className="relative mb-12">
               <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)] z-10 animate-pulse">
                  <span className="text-4xl">🎙️</span>
               </div>
               <div className="absolute top-0 left-0 w-full h-full rounded-full border border-indigo-500 animate-ping opacity-20"></div>
            </div>
            
            <div className="text-center space-y-4 max-w-xs">
               <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">AI Acoustic Analysis</p>
               <h3 className="text-white text-xl font-bold leading-tight">
                 {analyzing ? 'Processing baby sounds...' : aiInsight}
               </h3>
               <div className="flex justify-center gap-1.5 h-6 items-center">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1.5 bg-indigo-500/40 rounded-full" style={{ height: `${Math.random() * 100}%` }}></div>
                  ))}
               </div>
            </div>
            
            <button 
              onClick={stopMonitor}
              className="mt-12 bg-rose-500/10 text-rose-500 border border-rose-500/20 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest"
            >
              Disable Monitor
            </button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
               <span className="text-4xl opacity-40">📴</span>
            </div>
            <h3 className="text-white text-2xl font-black mb-4 tracking-tight">System Offline</h3>
            <p className="text-slate-500 text-sm text-center max-w-[250px] mb-10 leading-relaxed">
              Enable the Smart Guardian to start real-time emotional and environment tracking.
            </p>
            <button 
              onClick={startMonitor}
              className="bg-indigo-600 text-white px-12 py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              Start Monitoring
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Noise Level</p>
            <p className="text-2xl font-black text-slate-800">{liveStats.noiseLevel} <span className="text-xs text-slate-300">dB</span></p>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Temp</p>
            <p className="text-2xl font-black text-orange-500">{liveStats.temperature}°C</p>
         </div>
      </div>

      {envInsight && (
        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex gap-4 items-start">
           <span className="text-2xl">🧸</span>
           <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Room Advice</p>
              <p className="text-sm font-bold text-amber-900 leading-relaxed">{envInsight}</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Monitor;
