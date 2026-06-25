import { Settings2, BarChart2, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../store';
import { cn } from '../lib/utils';

export function Navbar() {
  const { activeView, setActiveView } = useAppContext();

  return (
    <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0F0F12]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin-slow"></div>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">FocusFlow</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex bg-white/5 p-1 rounded-full">
          <button
            onClick={() => setActiveView('timer')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-full transition-all",
              activeView === 'timer' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Timer
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-full transition-all",
              activeView === 'stats' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-full transition-all",
              activeView === 'settings' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Settings
          </button>
        </div>
        <div className="h-6 w-px bg-white/10"></div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
