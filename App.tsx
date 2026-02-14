
import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Child, ActivityEvent, LiveStats, GrowthData, FoodEntry, Vaccination, DoctorVisit, WaterEntry } from './types';
import Dashboard from './components/Dashboard';
import Monitor from './components/Monitor';
import GrowthTracker from './components/GrowthTracker';
import AIStoryTime from './components/AIStoryTime';
import AIAssistant from './components/AIAssistant';
import DietTracker from './components/DietTracker';
import HealthLog from './components/HealthLog';
import HydrationTracker from './components/HydrationTracker';
import Onboarding from './components/Onboarding';
import ChildProfileModal from './components/ChildProfileModal';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  
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
    if (selectedChildId) localStorage.setItem('nurture_selected_child', selectedChildId);
  }, [children, events, growthData, foodEntries, vaccines, doctorVisits, waterEntries, selectedChildId]);

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
    // Trigger vibration for new entries on Android
    if (navigator.vibrate) navigator.vibrate(50);
  };

  if (children.length === 0) return <Onboarding onComplete={(c) => setChildren([c])} />;

  const renderView = () => {
    if (!selectedChild) return null;
    const props = { child: selectedChild };
    
    switch (activeView) {
      case AppView.DASHBOARD: return <Dashboard {...props} events={events} liveStats={liveStats} growthData={growthData} waterEntries={waterEntries} foodEntries={foodEntries} />;
      case AppView.MONITOR: return <Monitor {...props} liveStats={liveStats} onNewEvent={(e) => addLog(setEvents, e)} />;
      case AppView.TRACKER: return <GrowthTracker {...props} growthData={growthData} onAddEntry={(e) => addLog(setGrowthData, e)} />;
      case AppView.DIET: return <DietTracker {...props} entries={foodEntries} onAddEntry={(e) => addLog(setFoodEntries, e)} />;
      case AppView.HEALTH: return <HealthLog {...props} vaccines={vaccines} visits={doctorVisits} onAddVaccine={(e) => addLog(setVaccines, e)} onAddVisit={(e) => addLog(setDoctorVisits, e)} />;
      case AppView.HYDRATION: return <HydrationTracker {...props} entries={waterEntries} onAddEntry={(e) => addLog(setWaterEntries, e)} />;
      case AppView.STORYTIME: return <AIStoryTime {...props} />;
      case AppView.ASSISTANT: return <AIAssistant {...props} />;
      default: return <Dashboard {...props} events={events} liveStats={liveStats} growthData={growthData} waterEntries={waterEntries} foodEntries={foodEntries} />;
    }
  };

  const navItems = [
    { view: AppView.DASHBOARD, label: 'Home', icon: '🏠' },
    { view: AppView.MONITOR, label: 'Monitor', icon: '🎙️' },
    { view: AppView.DIET, label: 'Diet', icon: '🍎' },
    { view: AppView.ASSISTANT, label: 'AI Support', icon: '✨' },
    { view: AppView.HEALTH, label: 'Health', icon: '🏥' },
  ];

  return (
    <div className="app-container">
      {/* Top App Bar */}
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">🍼</div>
          <span className="font-bold text-lg text-slate-800">NurtureAI</span>
        </div>
        <button 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100"
        >
          <img src={selectedChild?.avatar} className="w-6 h-6 rounded-full" />
          <span className="text-xs font-bold text-slate-600">{selectedChild?.name}</span>
        </button>
      </header>

      {/* Main Scrollable Content */}
      <div className="scroll-container custom-scrollbar">
        <div className="p-4 md:p-8 max-w-lg mx-auto md:max-w-7xl">
          {renderView()}
        </div>
      </div>

      {/* Android Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center px-2 py-3 safe-area-bottom z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => {
              setActiveView(item.view);
              if (navigator.vibrate) navigator.vibrate(10);
            }}
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-all ${activeView === item.view ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${activeView === item.view ? 'bg-indigo-50' : 'bg-transparent'}`}>
              <span className="text-xl">{item.icon}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>

      <ChildProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onSave={(c) => { setChildren([c]); setSelectedChildId(c.id); }}
        editingChild={selectedChild}
      />
    </div>
  );
};

export default App;
