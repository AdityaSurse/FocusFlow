import { useState } from 'react';
import { useAppContext } from '../store';

export function SettingsView() {
  const { settings, updateSettings, syncCode, linkSyncCode } = useAppContext();
  const [codeInput, setCodeInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleLink = async () => {
    if (!codeInput.trim()) return;
    setSyncStatus('loading');
    const success = await linkSyncCode(codeInput.trim());
    setSyncStatus(success ? 'success' : 'error');
    if (success) {
      setTimeout(() => setCodeInput(''), 2000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
          <p className="text-slate-400 text-sm mt-1">Configure your focus workflow</p>
        </div>

        <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-8">
          
          <section>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Data Sync</h3>
            <div className="flex flex-col gap-6">
              <div className="bg-white/5 border border-indigo-500/30 rounded-xl p-4">
                <div className="text-sm text-slate-300 mb-1">Your Sync Code</div>
                <div className="text-2xl font-mono font-bold text-white tracking-widest">{syncCode || '...'}</div>
                <div className="text-xs text-indigo-400 mt-2">Use this code on another device to sync your settings and sessions.</div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Link to existing sync code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter 6-character code"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono placeholder:text-slate-600"
                  />
                  <button 
                    onClick={handleLink}
                    disabled={syncStatus === 'loading' || codeInput.length < 5}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {syncStatus === 'loading' ? 'Linking...' : 'Link'}
                  </button>
                </div>
                {syncStatus === 'error' && <p className="text-xs text-red-400">Code not found or invalid.</p>}
                {syncStatus === 'success' && <p className="text-xs text-green-400">Successfully linked and synced!</p>}
              </div>
            </div>
          </section>

          <hr className="border-white/5" />

          <section>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Time Durations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Focus Time (min)</label>
                <input 
                  type="number" 
                  value={settings.focusDuration}
                  onChange={(e) => updateSettings({ focusDuration: Number(e.target.value) })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Short Break (min)</label>
                <input 
                  type="number" 
                  value={settings.shortBreakDuration}
                  onChange={(e) => updateSettings({ shortBreakDuration: Number(e.target.value) })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Long Break (min)</label>
                <input 
                  type="number" 
                  value={settings.longBreakDuration}
                  onChange={(e) => updateSettings({ longBreakDuration: Number(e.target.value) })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                />
              </div>
            </div>
          </section>

          <hr className="border-white/5" />

          <section>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Workflow</h3>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Long Break Interval</div>
                  <div className="text-xs text-slate-400 mt-1">Number of focus sessions before a long break</div>
                </div>
                <input 
                  type="number" 
                  value={settings.longBreakInterval}
                  onChange={(e) => updateSettings({ longBreakInterval: Number(e.target.value) })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-24 text-white focus:outline-none focus:border-indigo-500 text-center font-mono"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Auto-start Breaks</div>
                  <div className="text-xs text-slate-400 mt-1">Automatically start break timer when focus completes</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.autoStartBreaks} onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })} />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Auto-start Focus</div>
                  <div className="text-xs text-slate-400 mt-1">Automatically start focus timer when break completes</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.autoStartFocus} onChange={(e) => updateSettings({ autoStartFocus: e.target.checked })} />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </section>

          <hr className="border-white/5" />

          <section>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Goals</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Daily Session Goal</div>
                <div className="text-xs text-slate-400 mt-1">Target number of focus sessions per day</div>
              </div>
              <input 
                type="number" 
                value={settings.dailyTarget}
                onChange={(e) => updateSettings({ dailyTarget: Number(e.target.value) })}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-24 text-white focus:outline-none focus:border-indigo-500 text-center font-mono"
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}