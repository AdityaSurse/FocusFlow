import { useEffect } from 'react';
import { Play, Pause, Square, SkipForward } from 'lucide-react';
import { useAppContext } from '../store';
import { useTimer } from '../hooks/useTimer';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimerView() {
  const { settings, sessions } = useAppContext();
  const {
    mode,
    timeLeft,
    isActive,
    sessionCount,
    toggleTimer,
    resetTimer,
    skipTimer,
    setMode,
  } = useTimer();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetTimer();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        skipTimer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimer, resetTimer, skipTimer]);

  const totalDuration =
    mode === 'focus' ? settings.focusDuration * 60 :
    mode === 'shortBreak' ? settings.shortBreakDuration * 60 :
    settings.longBreakDuration * 60;

  const progress = (timeLeft / totalDuration) * 100;
  const strokeDasharray = 282.7; // 2 * pi * 45
  const strokeDashoffset = strokeDasharray - (strokeDasharray * progress) / 100;

  // Stats calcs
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayFocusSessions = sessions.filter(s => s.date === today && s.type === 'focus');
  const todayFocusSeconds = todayFocusSessions.reduce((acc, s) => acc + s.duration, 0);
  
  const todayFocusHours = Math.floor(todayFocusSeconds / 3600);
  const todayFocusMinutes = Math.floor((todayFocusSeconds % 3600) / 60);

  const currentGoal = settings.dailyTarget || 8;
  const goalProgress = Math.min((todayFocusSessions.length / currentGoal) * 100, 100);

  // Recent history
  const recentSessions = [...sessions].reverse().slice(0, 4);

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 p-8 relative overflow-y-auto">
      {/* Left Column */}
      <div className="md:col-span-3 flex flex-col gap-6">
        <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Productivity Summary</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-bold text-white">{todayFocusSessions.length}/{currentGoal}</span>
                <span className="text-indigo-400 text-sm font-medium italic">Daily Goal</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all duration-1000"
                  style={{ width: `${goalProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Focus Time</div>
                <div className="text-lg font-bold text-white">{todayFocusHours}h {todayFocusMinutes}m</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Total Sessions</div>
                <div className="text-lg font-bold text-white italic">{sessions.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 flex-1">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Current Status</h3>
          <div className="space-y-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
              <div className="mt-1 w-4 h-4 rounded border-2 border-indigo-500 flex items-center justify-center">
                {isActive && <div className="w-2 h-2 bg-indigo-500 rounded-sm animate-pulse"></div>}
              </div>
              <div>
                <div className="text-sm font-semibold text-white capitalize">{mode.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="text-[10px] text-indigo-400 font-medium uppercase">
                  {isActive ? 'In Progress' : 'Paused'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Column - Timer */}
      <div className="md:col-span-6 flex flex-col items-center justify-center relative py-12 md:py-0">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className={cn(
            "w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[100px] md:blur-[120px] transition-colors duration-1000",
            mode === 'focus' ? "bg-indigo-600" :
            mode === 'shortBreak' ? "bg-teal-600" : "bg-amber-600"
          )}></div>
        </div>

        <div className="relative flex flex-col items-center z-10">
          <div className="flex gap-4 mb-12 bg-white/5 p-1.5 rounded-full border border-white/10">
            <button 
              onClick={() => setMode('focus')}
              className={cn("px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all", mode === 'focus' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
            >
              Focus
            </button>
            <button 
              onClick={() => setMode('shortBreak')}
              className={cn("px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all", mode === 'shortBreak' ? "bg-teal-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
            >
              Short Break
            </button>
            <button 
              onClick={() => setMode('longBreak')}
              className={cn("px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all", mode === 'longBreak' ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
            >
              Long Break
            </button>
          </div>

          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-white/5" strokeWidth="4" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
              <circle 
                className={cn(
                  "transition-all duration-1000 ease-linear",
                  mode === 'focus' ? "text-indigo-500" : mode === 'shortBreak' ? "text-teal-500" : "text-amber-500"
                )}
                strokeWidth="4" 
                strokeDasharray={strokeDasharray} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="transparent" 
                r="45" cx="50" cy="50" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[64px] md:text-[84px] font-bold tracking-tighter leading-none text-white font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className={cn(
                "text-xs font-bold uppercase tracking-widest mt-2 transition-colors",
                mode === 'focus' ? "text-indigo-400" : mode === 'shortBreak' ? "text-teal-400" : "text-amber-400"
              )}>
                Session {sessionCount} of {settings.longBreakInterval}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8 mt-12">
            <button 
              onClick={resetTimer}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-all hover:bg-white/10"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={toggleTimer}
              className={cn(
                "w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full transition-all group ring-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]",
                mode === 'focus' ? "bg-indigo-600 hover:bg-indigo-500 ring-indigo-500/10" : 
                mode === 'shortBreak' ? "bg-teal-600 hover:bg-teal-500 ring-teal-500/10" : 
                "bg-amber-600 hover:bg-amber-500 ring-amber-500/10"
              )}
            >
              {isActive ? (
                <Pause className="w-8 h-8 md:w-10 md:h-10 text-white fill-current group-active:scale-90 transition-transform" />
              ) : (
                <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-current group-active:scale-90 transition-transform ml-1" />
              )}
            </button>
            <button 
              onClick={skipTimer}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-all hover:bg-white/10"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          <div className="mt-12 md:mt-16 text-center italic text-slate-400 font-serif opacity-80 px-4">
            "The only way to do great work is to love what you do."
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="md:col-span-3 flex flex-col gap-6">
        <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 flex-1">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Session History</h3>
          <div className="space-y-4">
            {recentSessions.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">No sessions yet today.</div>
            ) : (
              recentSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    session.type === 'focus' ? "bg-indigo-500" :
                    session.type === 'shortBreak' ? "bg-teal-500" : "bg-amber-500"
                  )}></div>
                  <div className="flex-1 text-sm font-medium capitalize text-slate-200">
                    {session.type.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-xs text-slate-500">{Math.round(session.duration / 60)}m</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden h-48 flex flex-col justify-between">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <h4 className="text-sm font-bold mb-2 uppercase tracking-wide">Weekly Progress</h4>
          <div className="flex items-end gap-1.5 h-20 mb-3 z-10">
            {/* Mock chart for aesthetics as in the template */}
            {[40, 60, 30, 80, 95, 10, 10].map((h, i) => (
              <div key={i} className={cn("flex-1 rounded-t-sm transition-all", i === 4 ? "bg-white" : "bg-white/20", i > 4 ? "opacity-30" : "")} style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <p className="text-xs text-indigo-100 font-medium z-10">You're on track to beat last week's focus time.</p>
        </div>
      </div>
    </div>
  );
}
