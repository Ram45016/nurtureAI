
export interface Child {
  id: string;
  name: string;
  birthDate: string;
  gender: 'boy' | 'girl' | 'other';
  avatar: string;
  weightKg: number; // Current weight
  birthWeightKg: number; // Weight at birth
}

export interface ActivityEvent {
  id: string;
  timestamp: number;
  type: 'cry' | 'sleep' | 'wake' | 'move' | 'laugh' | 'feeding' | 'diaper' | 'medical';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface FoodEntry {
  id: string;
  timestamp: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories?: number;
}

export interface SmartAlarm {
  id: string;
  type: 'meal' | 'water' | 'health' | 'routine';
  time: number;
  label: string;
  isActive: boolean;
}

export interface Vaccination {
  id: string;
  name: string;
  date: string;
  status: 'completed' | 'pending';
  notes?: string;
}

export interface DoctorVisit {
  id: string;
  date: string;
  reason: string;
  notes: string;
  doctorName: string;
}

export interface WaterEntry {
  id: string;
  timestamp: number;
  amountMl: number;
}

export interface GrowthData {
  id: string;
  date: string;
  weight: number;
  height: number;
}

export interface LiveStats {
  temperature: number;
  humidity: number;
  noiseLevel: number;
  heartRate: number;
  isBreathingRegular: boolean;
}

export interface UserPreferences {
  haptics: boolean;
  tempUnit: 'C' | 'F';
  growthStandard: 'WHO' | 'CDC';
  smartNotifications: boolean;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  MONITOR = 'MONITOR',
  TRACKER = 'TRACKER',
  DIET = 'DIET',
  HEALTH = 'HEALTH',
  REMINDERS = 'REMINDERS',
  STORYTIME = 'STORYTIME',
  ASSISTANT = 'ASSISTANT',
  HYDRATION = 'HYDRATION',
  SETTINGS = 'SETTINGS'
}
