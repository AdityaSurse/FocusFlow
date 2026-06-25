import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Settings, Session } from './types';
import { db } from './lib/firebase';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AppContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  sessions: Session[];
  addSession: (session: Session) => void;
  activeView: 'timer' | 'stats' | 'settings';
  setActiveView: (view: 'timer' | 'stats' | 'settings') => void;
  syncCode: string | null;
  linkSyncCode: (code: string) => Promise<boolean>;
}

const defaultSettings: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  alarmSound: 'Chime',
  volume: 75,
  autoStartBreaks: false,
  autoStartFocus: false,
  notifications: true,
  theme: 'dark',
  accentColor: '#4f46e5', // indigo-600
  dailyTarget: 8,
  weeklyTarget: 40,
  monthlyTarget: 160,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeView, setActiveView] = useState<'timer' | 'stats' | 'settings'>('timer');
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Ref to prevent echo loops when receiving firebase updates
  const isUpdatingFromFirebase = useRef(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('focusflow_settings');
    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } catch (e) {
        console.error(e);
      }
    }
    const savedSessions = localStorage.getItem('focusflow_sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error(e);
      }
    }
    const savedCode = localStorage.getItem('focusflow_synccode');
    if (savedCode) {
      setSyncCode(savedCode);
    } else {
      const newCode = generateCode();
      setSyncCode(newCode);
      localStorage.setItem('focusflow_synccode', newCode);
    }
    setIsLoaded(true);
  }, []);

  // Set up Firebase listener
  useEffect(() => {
    if (!isLoaded || !syncCode) return;

    const docRef = doc(db, 'syncProfiles', syncCode);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        isUpdatingFromFirebase.current = true;
        
        if (data.settings) {
          setSettings((prev) => {
            const merged = { ...prev, ...data.settings };
            localStorage.setItem('focusflow_settings', JSON.stringify(merged));
            return merged;
          });
        }
        
        if (data.sessions) {
          setSessions(data.sessions);
          localStorage.setItem('focusflow_sessions', JSON.stringify(data.sessions));
        }
        
        setTimeout(() => {
          isUpdatingFromFirebase.current = false;
        }, 100);
      } else {
        // Document doesn't exist yet, we should initialize it with our local data
        setDoc(docRef, {
          createdAt: serverTimestamp(),
          settings,
          sessions
        }, { merge: true }).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [syncCode, isLoaded]); // Intentionally omitting settings/sessions to avoid re-triggering listener

  // Push local changes to Firebase
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('focusflow_settings', JSON.stringify(settings));
      if (!isUpdatingFromFirebase.current && syncCode) {
        const docRef = doc(db, 'syncProfiles', syncCode);
        setDoc(docRef, { settings }, { merge: true }).catch(console.error);
      }
    }
  }, [settings, isLoaded, syncCode]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('focusflow_sessions', JSON.stringify(sessions));
      if (!isUpdatingFromFirebase.current && syncCode) {
        const docRef = doc(db, 'syncProfiles', syncCode);
        setDoc(docRef, { sessions }, { merge: true }).catch(console.error);
      }
    }
  }, [sessions, isLoaded, syncCode]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addSession = (session: Session) => {
    setSessions((prev) => [...prev, session]);
  };

  const linkSyncCode = async (code: string) => {
    const uppercaseCode = code.toUpperCase();
    try {
      const docRef = doc(db, 'syncProfiles', uppercaseCode);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSyncCode(uppercaseCode);
        localStorage.setItem('focusflow_synccode', uppercaseCode);
        
        // Immediately apply data to prevent race conditions
        if (data.settings) setSettings({ ...defaultSettings, ...data.settings });
        if (data.sessions) setSessions(data.sessions);
        
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  if (!isLoaded) return null;

  return (
    <AppContext.Provider value={{ settings, updateSettings, sessions, addSession, activeView, setActiveView, syncCode, linkSyncCode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
