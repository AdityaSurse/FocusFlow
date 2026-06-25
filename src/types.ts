export type Mode = 'focus' | 'shortBreak' | 'longBreak';

export interface Settings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  alarmSound: string;
  volume: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;
}

export interface Session {
  id: string;
  date: string;
  type: Mode;
  duration: number;
  timestamp: number;
}
