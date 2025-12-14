import React from 'react';
import { Task } from '../types';

interface AnalyticsProps {
  tasks: Task[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ tasks }) => {
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Calculate subject breakdown
  const subjectCounts: Record<string, number> = {};
  tasks.forEach(task => {
    const subject = task.title;
    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
  });

  // Calculate time spent (mock estimate based on tasks)
  const totalMinutes = tasks.length * 45; // Assumption: avg 45 mins
  const completedMinutes = completed * 45;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-28">
      <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Performans Analizi</h1>
      </div>

      <div className="p-4 flex flex-col gap-6">
        
        {/* Main Score Card */}
        <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="15" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                    <circle 
                        cx="80" cy="80" r="70" 
                        stroke="currentColor" strokeWidth="15" fill="transparent" 
                        strokeDasharray={440} 
                        strokeDashoffset={440 - (440 * progress) / 100}
                        className="text-primary transition-all duration-1000 ease-out" 
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">%{progress}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase">Başarı</span>
                </div>
            </div>
            <p className="text-center text-slate-600 dark:text-slate-300 text-sm">
                Toplam <span className="font-bold text-primary">{total}</span> görevden <span className="font-bold text-primary">{completed}</span> tanesini tamamladın.
            </p>
        </div>

        {/* Time Stats */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-500 text-white rounded-2xl p-5 shadow-lg shadow-indigo-500/20">
                <div className="flex items-start justify-between mb-4">
                    <span className="material-symbols-outlined opacity-80">schedule</span>
                    <span className="text-xs font-bold opacity-60 uppercase">Çalışma</span>
                </div>
                <p className="text-3xl font-bold">{(completedMinutes / 60).toFixed(1)}<span className="text-sm font-normal opacity-80">sa</span></p>
                <p className="text-xs opacity-70 mt-1">Tamamlanan süre</p>
            </div>
             <div className="bg-emerald-500 text-white rounded-2xl p-5 shadow-lg shadow-emerald-500/20">
                <div className="flex items-start justify-between mb-4">
                    <span className="material-symbols-outlined opacity-80">trending_up</span>
                    <span className="text-xs font-bold opacity-60 uppercase">Verim</span>
                </div>
                <p className="text-3xl font-bold">{total > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0}<span className="text-sm font-normal opacity-80">%</span></p>
                <p className="text-xs opacity-70 mt-1">Zaman verimliliği</p>
            </div>
        </div>

        {/* Subject Breakdown */}
        <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 px-1">Ders Dağılımı</h3>
            <div className="flex flex-col gap-3">
                {Object.entries(subjectCounts).map(([subject, count], idx) => {
                    const pct = Math.round((count / total) * 100);
                    const colors = ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500'];
                    const color = colors[idx % colors.length];
                    
                    return (
                        <div key={subject} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white font-bold`}>
                                {subject.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white">{subject}</span>
                                    <span className="text-xs font-medium text-slate-500">{count} Ders ({pct}%)</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {total === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">Henüz veri yok.</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
