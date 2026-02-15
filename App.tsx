
import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Child, ActivityEvent, LiveStats, GrowthData, FoodEntry, Vaccination, DoctorVisit, WaterEntry, SmartAlarm } from './types';
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

  const [liveStats] = useState<LiveStats>({
    temperature: 24.5,
    humidity: 45,
    noiseLevel: 32,
    heartRate: 115,
    isBreathingRegular: true
  });

  // Persistence Effects
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
      } catch (e) { console.error(e); }
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

  if (isKeySelected === false) {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white">
        <div className="bg-white text-slate-800 p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto text-5xl">🔑</div>
          <h2 className="text-2xl font-black">Connection Required</h2>
          <button onClick={handleSelectKey} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl">Select API Key</button>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return <Onboarding onComplete={(c) => { setChildren([c]); setSelectedChildId(c.id); }} />;
  }

  const renderView = () => {
    if (!selectedChild && activeView !== AppView.SETTINGS) return null;
    switch (activeView) {
      case AppView.DASHBOARD:
        return <Dashboard child={selectedChild!} events={events} liveStats={liveStats} growthData={growthData} waterEntries={waterEntries} foodEntries={foodEntries} onSetAlarm={handleSetAlarm} />;
      case AppView.MONITOR:
        return <Monitor child={selectedChild!} liveStats={liveStats} onNewEvent={handleAddEvent} />;
      case AppView.TRACKER:
        return <GrowthTracker child={selectedChild!} growthData={growthData} onAddEntry={(e) => setGrowthData([{...e, id: Date.now().toString()}, ...growthData])} />;
      case AppView.DIET:
        return <DietTracker child={selectedChild!} entries={foodEntries} onAddEntry={(e) => setFoodEntries([{...e, id: Date.now().toString(), timestamp: Date.now()}, ...foodEntries])} />;
      case AppView.HEALTH:
        return <HealthLog child={selectedChild!} vaccines={vaccines} visits={visits} onAddVaccine={(v) => setVaccines([{...v, id: Date.now().toString()}, ...vaccines])} onAddVisit={(v) => setVisits([{...v, id: Date.now().toString()}, ...visits])} />;
      case AppView.HYDRATION:
        return <HydrationTracker child={selectedChild!} entries={waterEntries} onAddEntry={(e) => setWaterEntries([{...e, id: Date.now().toString(), timestamp: Date.now()}, ...waterEntries])} />;
      case AppView.REMINDERS:
        return <Reminders child={selectedChild!} alarms={alarms} onSetAlarm={handleSetAlarm} onRemoveAlarm={handleRemoveAlarm} />;
      case AppView.STORYTIME:
        return <AIStoryTime child={selectedChild!} />;
      case AppView.ASSISTANT:
        return <AIAssistant child={selectedChild!} />;
      case AppView.SETTINGS:
        return <Settings onSelectKey={handleSelectKey} isKeySelected={isKeySelected} />;
      default:
        return <Dashboard child={selectedChild!} events={events} liveStats={liveStats} growthData={growthData} waterEntries={waterEntries} foodEntries={foodEntries} onSetAlarm={handleSetAlarm} />;
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

      <BottomBar activeView={activeView} setActiveView={setActiveView} />

      {/* Profile/Add Sheet Simulation */}
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
