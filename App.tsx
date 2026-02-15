
import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Child, ActivityEvent, LiveStats, GrowthData, FoodEntry, Vaccination, DoctorVisit, WaterEntry, SmartAlarm, UserPreferences } from './types';
import Dashboard from './components/Dashboard';
import Monitor from './components/Monitor';
import GrowthTracker from './components/GrowthTracker';
import AIStoryTime from './components/AIStoryTime';
import AIAssistant from './components/AIAssistant';
import DietTracker from './components/DietTracker';
import HealthLog from './components/HealthLog';
import Reminders from './components/Reminders';
import Onboarding from './components/Onboarding';
import ChildProfileModal from './components/ChildProfileModal';
import HydrationTracker from './components/HydrationTracker';
import BottomBar from './components/BottomBar';
import TopBar from './components/TopBar';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);
  
  // User Preferences
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('nurture_prefs');
      return saved ? JSON.parse(saved) : {
        haptics: true,
        tempUnit: 'C',
        growthStandard: 'WHO',
        smartNotifications: true
      };
    } catch {
      return { haptics: true, tempUnit: 'C', growthStandard: 'WHO', smartNotifications: true };
    }
  });

  // Data Persistence
  const [children, setChildren] = useState<Child[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_children');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [selectedChildId, setSelectedChildId] = useState<string | null>(() => 
    localStorage.getItem('nurture_selected_child')
  );
  
  const [alarms, setAlarms] = useState<SmartAlarm[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_alarms');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [events, setEvents] = useState<ActivityEvent[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_events');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [growthData, setGrowthData] = useState<GrowthData[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_growth');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_food');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_water');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [vaccines, setVaccines] = useState<Vaccination[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_vaccines');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [visits, setVisits] = useState<DoctorVisit[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_visits');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persistence Effects
  useEffect(() => localStorage.setItem('nurture_prefs', JSON.stringify(prefs)), [prefs]);
  useEffect(() => localStorage.setItem('nurture_children', JSON.stringify(children)), [children]);
  useEffect(() => localStorage.setItem('nurture_selected_child', selectedChildId || ''), [selectedChildId]);
  useEffect(() => localStorage.setItem('nurture_alarms', JSON.stringify(alarms)), [alarms]);
  useEffect(() => localStorage.setItem('nurture_events', JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem('nurture_growth', JSON.stringify(growthData)), [growthData]);
  useEffect(() => localStorage.setItem('nurture_food', JSON.stringify(foodEntries)), [foodEntries]);
  useEffect(() => localStorage.setItem('nurture_water', JSON.stringify(waterEntries)), [waterEntries]);
  useEffect(() => localStorage.setItem('nurture_vaccines', JSON.stringify(vaccines)), [vaccines]);
  useEffect(() => localStorage.setItem('nurture_visits', JSON.stringify(visits)), [visits]);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        try {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setIsKeySelected(hasKey);
        } catch (e) {
          setIsKeySelected(false);
        }
      } else {
        setIsKeySelected(true); 
      }
    };
    checkKey();
    const handleError = () => {
      setIsKeySelected(false);
      setActiveView(AppView.SETTINGS);
    };
    window.addEventListener('gemini-key-error', handleError);
    return () => window.removeEventListener('gemini-key-error', handleError);
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setIsKeySelected(true);
      } catch (e) { 
        console.error("Key selection failed:", e); 
      }
    }
  };

  const selectedChild = useMemo(() => 
    children.find(c => c.id === selectedChildId) || children[0] || null
  , [children, selectedChildId]);

  const handleSaveChild = (child: Child) => {
    if (children.find(c => c.id === child.id)) {
      setChildren(children.map(c => c.id === child.id ? child : c));
    } else {
      setChildren([...children, child]);
    }
    if (!selectedChildId) setSelectedChildId(child.id);
  };

  const handleDeleteChild = (id: string) => {
    setChildren(children.filter(c => c.id !== id));
    if (selectedChildId === id) setSelectedChildId(null);
  };

  const handleAddEvent = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = { ...event, id: Date.now().toString(), timestamp: Date.now() };
    setEvents([newEvent, ...events]);
  };

  const handleSetAlarm = (type: SmartAlarm['type'], delay: number, label: string) => {
    const newAlarm: SmartAlarm = { id: Date.now().toString(), type, label, time: Date.now() + (delay * 60000), isActive: true };
    setAlarms([...alarms, newAlarm]);
  };

  const handleRemoveAlarm = (id: string) => setAlarms(alarms.filter(a => a.id !== id));

  const handleResetApp = () => {
    if (window.confirm("CRITICAL ACTION: This will delete all local data, history, and profiles. This cannot be undone. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleVibrate = (pattern: number | number[] = 10) => {
    if (prefs.haptics && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  if (isKeySelected === false) {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white">
        <div className="bg-white text-slate-800 p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto text-5xl">🔑</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black">Authentication Required</h2>
            <p className="text-slate-500 text-sm font-bold">To activate the Smart Guardian intelligence, please connect your API Key via the Secure System Dialog.</p>
          </div>
          <button onClick={() => { handleVibrate(30); handleSelectKey(); }} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">Select Secure Key</button>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">Billing Documentation</a>
          </p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return <Onboarding onComplete={(c) => { setChildren([c]); setSelectedChildId(c.id); }} />;
  }

  const renderView = () => {
    if (!selectedChild && activeView !== AppView.SETTINGS) return null;
    const commonProps = { child: selectedChild!, onVibrate: handleVibrate };
    
    switch (activeView) {
      case AppView.DASHBOARD:
        return <Dashboard {...commonProps} events={events} liveStats={{ temperature: 24, humidity: 45, noiseLevel: 32, heartRate: 115, isBreathingRegular: true }} growthData={growthData} waterEntries={waterEntries} foodEntries={foodEntries} onSetAlarm={handleSetAlarm} />;
      case AppView.MONITOR:
        return <Monitor {...commonProps} liveStats={{ temperature: 24, humidity: 45, noiseLevel: 32, heartRate: 115, isBreathingRegular: true }} onNewEvent={handleAddEvent} />;
      case AppView.TRACKER:
        return <GrowthTracker {...commonProps} growthData={growthData} onAddEntry={(e) => setGrowthData([{...e, id: Date.now().toString()}, ...growthData])} />;
      case AppView.DIET:
        return <DietTracker {...commonProps} entries={foodEntries} onAddEntry={(e) => setFoodEntries([{...e, id: Date.now().toString(), timestamp: Date.now()}, ...foodEntries])} />;
      case AppView.HEALTH:
        return <HealthLog {...commonProps} vaccines={vaccines} visits={visits} onAddVaccine={(v) => setVaccines([{...v, id: Date.now().toString()}, ...vaccines])} onAddVisit={(v) => setVisits([{...v, id: Date.now().toString()}, ...visits])} />;
      case AppView.HYDRATION:
        return <HydrationTracker {...commonProps} entries={waterEntries} onAddEntry={(e) => setWaterEntries([{...e, id: Date.now().toString(), timestamp: Date.now()}, ...waterEntries])} />;
      case AppView.REMINDERS:
        return <Reminders {...commonProps} alarms={alarms} onSetAlarm={handleSetAlarm} onRemoveAlarm={handleRemoveAlarm} />;
      case AppView.STORYTIME:
        return <AIStoryTime child={selectedChild!} />;
      case AppView.ASSISTANT:
        return <AIAssistant child={selectedChild!} />;
      case AppView.SETTINGS:
        return <Settings 
          onSelectKey={handleSelectKey} 
          isKeySelected={isKeySelected} 
          prefs={prefs} 
          setPrefs={setPrefs}
          onReset={handleResetApp}
          onVibrate={handleVibrate}
        />;
      default:
        return <Dashboard {...commonProps} events={events} liveStats={{ temperature: 24, humidity: 45, noiseLevel: 32, heartRate: 115, isBreathingRegular: true }} growthData={growthData} waterEntries={waterEntries} foodEntries={foodEntries} onSetAlarm={handleSetAlarm} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Quicksand'] selection:bg-indigo-100">
      <TopBar 
        activeView={activeView} 
        selectedChild={selectedChild} 
        onProfileClick={() => {
          setEditingChild(selectedChild);
          setIsProfileModalOpen(true);
        }}
      />
      
      <main className="android-scroll flex-1 px-4 md:px-8">
        <div className="max-w-xl mx-auto">
          {renderView()}
        </div>
      </main>

      <BottomBar activeView={activeView} setActiveView={(v) => { handleVibrate(5); setActiveView(v); }} />

      <ChildProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveChild}
        onDelete={handleDeleteChild}
        editingChild={editingChild}
      />
    </div>
  );
};

export default App;
