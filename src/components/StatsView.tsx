import { useMemo } from 'react';
import { useAppContext } from '../store';
import { format, subDays, isSameDay } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function StatsView() {
  const { sessions, settings } = useAppContext();

  // Process data for the last 7 days
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
  }, []);

  const chartData = useMemo(() => {
    const labels = last7Days.map(d => format(d, 'EEE'));
    
    const focusData = last7Days.map(day => {
      const daySessions = sessions.filter(s => s.type === 'focus' && isSameDay(new Date(s.timestamp), day));
      return daySessions.reduce((acc, s) => acc + s.duration / 60, 0); // minutes
    });

    return {
      labels,
      datasets: [
        {
          label: 'Focus Time (min)',
          data: focusData,
          backgroundColor: 'rgba(79, 70, 229, 0.8)',
          borderColor: 'rgb(79, 70, 229)',
          borderWidth: 1,
          borderRadius: 4,
        }
      ]
    };
  }, [sessions, last7Days]);

  const timeDistributionData = useMemo(() => {
    let focus = 0, short = 0, long = 0;
    sessions.forEach(s => {
      if (s.type === 'focus') focus += s.duration;
      else if (s.type === 'shortBreak') short += s.duration;
      else if (s.type === 'longBreak') long += s.duration;
    });

    return {
      labels: ['Focus', 'Short Break', 'Long Break'],
      datasets: [{
        data: [focus / 60, short / 60, long / 60],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(13, 148, 136, 0.8)',
          'rgba(217, 119, 6, 0.8)'
        ],
        borderColor: [
          'rgb(79, 70, 229)',
          'rgb(13, 148, 136)',
          'rgb(217, 119, 6)'
        ],
        borderWidth: 1,
      }]
    };
  }, [sessions]);

  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0);
    sessions.forEach(s => {
      if (s.type === 'focus') {
        const hour = new Date(s.timestamp).getHours();
        hours[hour] += s.duration / 60;
      }
    });

    return {
      labels: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
      datasets: [{
        label: 'Focus Time (min)',
        data: hours,
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        borderRadius: 4,
      }]
    };
  }, [sessions]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom' as const,
        labels: { color: '#cbd5e1', padding: 20 }
      },
      tooltip: {
        backgroundColor: '#141418',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    cutout: '75%',
    borderColor: 'transparent',
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#141418',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' }
      }
    }
  };

  const todayFocusSeconds = sessions
    .filter(s => s.type === 'focus' && isSameDay(new Date(s.timestamp), new Date()))
    .reduce((acc, s) => acc + s.duration, 0);

  const totalFocusSeconds = sessions
    .filter(s => s.type === 'focus')
    .reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Statistics</h2>
          <p className="text-slate-400 text-sm mt-1">Review your focus patterns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Today's Focus</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white font-mono">{Math.floor(todayFocusSeconds / 3600)}<span className="text-xl text-slate-500 ml-1">h</span></span>
              <span className="text-4xl font-bold text-white font-mono">{Math.floor((todayFocusSeconds % 3600) / 60)}<span className="text-xl text-slate-500 ml-1">m</span></span>
            </div>
          </div>

          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Sessions</h3>
            <div className="text-4xl font-bold text-white font-mono">{sessions.filter(s => s.type === 'focus').length}</div>
          </div>

          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Focus Time</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white font-mono">{Math.floor(totalFocusSeconds / 3600)}<span className="text-xl text-slate-500 ml-1">h</span></span>
              <span className="text-4xl font-bold text-white font-mono">{Math.floor((totalFocusSeconds % 3600) / 60)}<span className="text-xl text-slate-500 ml-1">m</span></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 h-[400px] flex flex-col">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Weekly Activity</h3>
            <div className="flex-1 relative">
              <Bar data={chartData} options={lineOptions} />
            </div>
          </div>

          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 h-[400px] flex flex-col">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Focus Trend</h3>
            <div className="flex-1 relative">
              <Line 
                data={{
                  ...chartData,
                  datasets: [{
                    ...chartData.datasets[0],
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderColor: 'rgb(79, 70, 229)',
                    fill: true,
                    tension: 0.4,
                  }]
                }} 
                options={lineOptions} 
              />
            </div>
          </div>

          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 h-[400px] flex flex-col">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Time Distribution</h3>
            <div className="flex-1 relative">
              <Doughnut data={timeDistributionData} options={doughnutOptions} />
            </div>
          </div>

          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6 h-[400px] flex flex-col">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Productivity by Hour</h3>
            <div className="flex-1 relative">
              <Bar data={hourlyData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
