/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider, useAppContext } from './store';
import { Navbar } from './components/Navbar';
import { TimerView } from './components/TimerView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';

function AppContent() {
  const { activeView } = useAppContext();

  return (
    <div className="w-full h-screen bg-[#0A0A0B] text-slate-100 font-sans flex flex-col overflow-hidden select-none">
      <Navbar />
      <main className="flex-1 flex overflow-hidden">
        {activeView === 'timer' && <TimerView />}
        {activeView === 'stats' && <StatsView />}
        {activeView === 'settings' && <SettingsView />}
      </main>
      
      {/* Footer from Clean Minimalism template */}
      <footer className="h-12 border-t border-white/5 flex items-center px-8 bg-[#0F0F12] text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-indigo-400">System Active</span>
          <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
          <span>Auto-Start: ON</span>
          <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
          <span>Sound: Digital Bell</span>
        </div>
        <div className="ml-auto flex items-center gap-4 hidden md:flex">
          <span>Space to Play/Pause</span>
          <span>R to Reset</span>
          <span>S to Skip</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
