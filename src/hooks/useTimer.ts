import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../store';
import { Mode } from '../types';

export function useTimer() {
  const { settings, addSession } = useAppContext();
  
  const [mode, setMode] = useState<Mode>('focus');
  const [sessionCount, setSessionCount] = useState(1);
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Sound
  const playAlarm = useCallback(() => {
    // In a real app we'd play audio here
    // For now we just use the browser notification
    if (settings.notifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('FocusFlow', {
          body: `${mode === 'focus' ? 'Focus session' : 'Break'} complete!`,
        });
      }
    }
  }, [settings.notifications, mode]);

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    endTimeRef.current = null;
    
    let nextDuration = settings.focusDuration;
    if (newMode === 'shortBreak') nextDuration = settings.shortBreakDuration;
    if (newMode === 'longBreak') nextDuration = settings.longBreakDuration;
    
    setTimeLeft(nextDuration * 60);
  }, [settings]);

  const handleComplete = useCallback(() => {
    playAlarm();
    
    // Save session
    const duration = mode === 'focus' ? settings.focusDuration * 60 : 
                    mode === 'shortBreak' ? settings.shortBreakDuration * 60 : 
                    settings.longBreakDuration * 60;
                    
    addSession({
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString().split('T')[0],
      type: mode,
      duration,
      timestamp: Date.now(),
    });

    let nextMode: Mode = 'focus';
    let newSessionCount = sessionCount;

    if (mode === 'focus') {
      if (sessionCount % settings.longBreakInterval === 0) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'shortBreak';
      }
    } else {
      nextMode = 'focus';
      newSessionCount += 1;
      setSessionCount(newSessionCount);
    }

    switchMode(nextMode);

    if ((nextMode === 'focus' && settings.autoStartFocus) || 
        (nextMode !== 'focus' && settings.autoStartBreaks)) {
      setIsActive(true);
      endTimeRef.current = Date.now() + (nextMode === 'focus' ? settings.focusDuration : nextMode === 'shortBreak' ? settings.shortBreakDuration : settings.longBreakDuration) * 60 * 1000;
    }
  }, [mode, settings, sessionCount, addSession, switchMode, playAlarm]);

  const toggleTimer = () => {
    if (isActive) {
      setIsActive(false);
      endTimeRef.current = null;
    } else {
      // Request notification permission on first play
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      setIsActive(true);
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    endTimeRef.current = null;
    
    let duration = settings.focusDuration;
    if (mode === 'shortBreak') duration = settings.shortBreakDuration;
    if (mode === 'longBreak') duration = settings.longBreakDuration;
    
    setTimeLeft(duration * 60);
  };

  const skipTimer = () => {
    handleComplete();
  };

  useEffect(() => {
    if (isActive && endTimeRef.current) {
      intervalRef.current = window.setInterval(() => {
        const remaining = Math.max(0, Math.round((endTimeRef.current! - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleComplete();
        }
      }, 200); // 200ms for more responsive UI
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, handleComplete]);

  // Handle settings changes
  useEffect(() => {
    if (!isActive) {
      let duration = settings.focusDuration;
      if (mode === 'shortBreak') duration = settings.shortBreakDuration;
      if (mode === 'longBreak') duration = settings.longBreakDuration;
      setTimeLeft(duration * 60);
    }
  }, [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration, mode]); // isActive intentionally omitted

  return {
    mode,
    timeLeft,
    isActive,
    sessionCount,
    toggleTimer,
    resetTimer,
    skipTimer,
    setMode: switchMode
  };
}
