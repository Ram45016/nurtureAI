
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
// Added HydrationTracker import
import HydrationTracker from './components/HydrationTracker';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
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
  
  const [vaccines, setVaccines] = useState<Vaccination[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_vaccines');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [doctorVisits, setDoctorVisits] = useState<DoctorVisit[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_visits');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nurture_water');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [liveStats] = useState<LiveStats>({ 
    temperature: 22.5, 
    humidity: 45, 
    noiseLevel: 30, 
    heartRate: 110, 
    isBreathingRegular: true 
  });

  useEffect(() => {
    localStorage.setItem('nurture_children', JSON.stringify(children));
    localStorage.setItem('nurture_events', JSON.stringify(events));
    localStorage.setItem('nurture_growth', JSON.stringify(growthData));
    localStorage.setItem('nurture_food', JSON.stringify(foodEntries));
    localStorage.setItem('nurture_vaccines', JSON.stringify(vaccines));
    localStorage.setItem('nurture_visits', JSON.stringify(doctorVisits));
    localStorage.setItem('nurture_water', JSON.stringify(waterEntries));
    localStorage.setItem('nurture_alarms', JSON.stringify(alarms));
    if (selectedChildId) localStorage.setItem('nurture_selected_child', selectedChildId);
  }, [children, events, growthData, foodEntries, vaccines, doctorVisits, waterEntries, alarms, selectedChildId]);

  // Alarm Check Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const triggering = alarms.find(a => a.isActive && a.time <= now);
      if (triggering) {
        if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
        alert(`⏰ SMART REMINDER: ${triggering.label}`);
        setAlarms(prev => prev.map(a => a.id === triggering.id ? { ...a, isActive: false } : a));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [alarms]);

  const selectedChild = useMemo(() => {
    const found = children.find(c => c.id === selectedChildId);
    if (!found && children.length > 0) return children[0];
    return found || null;
  }, [children, selectedChildId]);

  const addLog = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, data: any) => {
    const newItem = { 
      timestamp: Date.now(),
      ...data, 
      id: Math.random().toString(36).substr(2, 9)
    } as T;
    setter(prev => [newItem, ...prev]);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleAddAlarm = (type: SmartAlarm['type'], delayMinutes: number, label: string) => {
    const newAlarm: SmartAlarm = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      time: Date.now() + (delayMinutes * 60 * 1000),
      label,
      isActive: true
    };
    setAlarms(prev => [newAlarm, ...prev]);
    if (navigator.vibrate) navigator.vibrate([50, 50]);
  };

  if (children.length === 0) return <Onboarding onComplete={(c) => setChildren([c])} />;

  const renderView = () => {
    if (!selectedChild) return null;
    const props = { child: selectedChild };
    
    switch (activeView) {
      case AppView.DASHBOARD: return <Dashboard {...props} events={events} liveStats={liveStats} growthData={growthData} waterEntries={waterEntries} foodEntries={foodEntries} onSetAlarm={handleAddAlarm} />;
      case AppView.MONITOR: return <Monitor {...props} liveStats={liveStats} onNewEvent={(e) => addLog(setEvents, e)} />;
      case AppView.TRACKER: return <GrowthTracker {...props} growthData={growthData} onAddEntry={(e) => addLog(setGrowthData, e)} />;
      case AppView.DIET: return <DietTracker {...props} entries={foodEntries} onAddEntry={(e) => addLog(setFoodEntries, e)} />;
      case AppView.HEALTH: return <HealthLog {...props} vaccines={vaccines} visits={doctorVisits} onAddVaccine={(e) => addLog(setVaccines, e)} onAddVisit={(e) => addLog(setDoctorVisits, e)} />;
      case AppView.REMINDERS: return <Reminders {...props} alarms={alarms} onSetAlarm={handleAddAlarm} onRemoveAlarm={(id) => setAlarms(prev => prev.filter(a => a.id !== id))} />;
      case AppView.STORYTIME: return <AIStoryTime {...props} />;
      case AppView.ASSISTANT: return <AIAssistant {...props} />;
      // Added case for HYDRATION view
      case AppView.HYDRATION: return <HydrationTracker {...props} entries={waterEntries} onAddEntry={(e) => addLog(setWaterEntries, e)} />;
      default: return <Dashboard {...props} events={events} liveStats={liveStats} growthData={growthData} waterEntries={waterEntries} foodEntries={foodEntries} onSetAlarm={handleAddAlarm} />;
    }
  };

  const navItems = [
    { view: AppView.DASHBOARD, label: 'Home', icon: '🏠' },
    { view: AppView.MONITOR, label: 'Monitor', icon: '🎙️' },
    { view: AppView.REMINDERS, label: 'Reminders', icon: '⏰' },
    { view: AppView.ASSISTANT, label: 'Expert', icon: '✨' },
    { view: AppView.DIET, label: 'Nutrition', icon: '🍎' },
    // Added Hydration to main navigation
    { view: AppView.HYDRATION, label: 'Water', icon: '💧' },
  ];

  return (
    <div className="app-container bg-slate-50">
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0 safe-area-top">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm shadow-md">🍼</div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">NurtureAI</span>
        </div>
        <button 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 active:scale-95 transition-transform"
        >
          <img src={selectedChild?.avatar} className="w-6 h-6 rounded-full" />
          <span className="text-xs font-bold text-slate-700">{selectedChild?.name}</span>
        </button>
      </header>

      <div className="scroll-container custom-scrollbar">
        <div className="p-4 max-w-lg mx-auto md:max-w-4xl">
          {renderView()}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around items-center px-2 py-2 safe-area-bottom z-50 shadow-2xl">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => {
              setActiveView(item.view);
              if (navigator.vibrate) navigator.vibrate(10);
            }}
            className="flex flex-col items-center gap-1 min-w-[60px] md:min-w-[72px] transition-all relative py-2"
          >
            <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-all ${activeView === item.view ? 'bg-indigo-100' : 'bg-transparent'}`}>
              <span className={`text-xl ${activeView === item.view ? 'text-indigo-700' : 'text-slate-500'}`}>{item.icon}</span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${activeView === item.view ? 'text-indigo-700' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <ChildProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onSave={(c) => { 
          const existing = children.findIndex(child => child.id === c.id);
          if (existing > -1) {
            const updated = [...children];
            updated[existing] = c;
            setChildren(updated);
          } else {
            setChildren([...children, c]);
          }
          setSelectedChildId(c.id);
        }}
        editingChild={selectedChild}
      />
    </div>
  );
};

export default App;
