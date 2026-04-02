import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarProps {
  tasks: Task[];
  onAddTask: () => void;
  onDeleteTask: (id: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ tasks, onAddTask, onDeleteTask }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // Default to today (adjusting Sunday 0 -> 6)
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [weeklyViewType, setWeeklyViewType] = useState<'grid' | 'list'>('grid');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 to 21:00
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const fullDayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  
  const getTaskPosition = (startTime: string) => {
    const [h, m] = startTime.split(':').map(Number);
    const startHour = 8;
    return ((h - startHour) * 60 + m);
  };

  const getCurrentTimePosition = () => {
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    const startHour = 8;
    if (h < 8 || h >= 22) return null;
    return ((h - startHour) * 60 + m);
  };

  const currentDayIndex = currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1;
  const timePos = getCurrentTimePosition();

  // Find if there's a current lesson
  const currentTask = tasks.find(t => {
    if (t.dayIndex !== currentDayIndex) return false;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [startH, startM] = t.startTime.split(':').map(Number);
    const [endH, endM] = t.endTime.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    return now >= start && now <= end;
  });

  // Calculate progress for current task
  const currentTaskProgress = currentTask ? (() => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [startH, startM] = currentTask.startTime.split(':').map(Number);
    const [endH, endM] = currentTask.endTime.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  })() : 0;

  // Filter and sort tasks for selected day
  const filteredTasks = tasks
    .filter(t => (t.dayIndex !== undefined ? t.dayIndex === selectedDayIndex : true))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="flex-none bg-white dark:bg-card-dark p-6 pb-4 flex items-center justify-between z-20 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                    </div>
                    <h1 className="text-2xl font-black leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                        {viewMode === 'daily' ? 'Günlük Akış' : 'Haftalık Program'}
                    </h1>
                </div>
                <div className="flex gap-2 mt-2">
                    <button 
                        onClick={() => setViewMode('daily')}
                        className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all border ${viewMode === 'daily' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-gray-700 text-slate-500'}`}
                    >
                        Günlük
                    </button>
                    <button 
                        onClick={() => setViewMode('weekly')}
                        className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all border ${viewMode === 'weekly' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-gray-700 text-slate-500'}`}
                    >
                        Haftalık
                    </button>
                </div>
            </div>

            {currentTask && (
                <div className="hidden lg:flex items-center gap-4 bg-primary/5 px-5 py-3 rounded-[2rem] border border-primary/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
                    <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
                        <div 
                            className="h-full bg-primary transition-all duration-1000 ease-linear"
                            style={{ width: `${currentTaskProgress}%` }}
                        ></div>
                    </div>
                    <div className={`w-3 h-3 rounded-full bg-${currentTask.color || 'primary'}-500 animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]`}></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Şu Anki Ders</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-800 dark:text-white">{currentTask.title}</span>
                            <span className="text-[10px] font-bold text-slate-400">{currentTask.startTime} - {currentTask.endTime}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                {['Matematik', 'Edebiyat', 'Fizik'].map(lesson => (
                    <button 
                        key={lesson}
                        onClick={onAddTask}
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-primary"
                    >
                        + {lesson}
                    </button>
                ))}
            </div>
            <button 
                onClick={() => window.print()}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                title="Yazdır"
            >
                <span className="material-symbols-outlined text-xl">print</span>
            </button>
            <button 
                onClick={onAddTask}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all hover:bg-primary/90"
            >
                <span className="material-symbols-outlined text-sm">add</span>
                Yeni Ders
            </button>
        </div>
      </header>

      {viewMode === 'daily' && (
          <div className="flex-none px-6 py-2 bg-white dark:bg-card-dark border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <p className="text-[10px] italic text-slate-400 dark:text-slate-500">
                  "Başarı, her gün tekrarlanan küçük çabaların toplamıdır."
              </p>
              <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sistem Aktif</span>
              </div>
          </div>
      )}

      {viewMode === 'weekly' && (
          <div className="flex-none px-6 py-3 bg-white dark:bg-card-dark border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Haftalık Görünüm</h2>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button 
                        onClick={() => setWeeklyViewType('grid')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${weeklyViewType === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
                      >
                          Çizelge
                      </button>
                      <button 
                        onClick={() => setWeeklyViewType('list')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${weeklyViewType === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
                      >
                          Liste
                      </button>
                  </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {fullDayNames[0]} - {fullDayNames[6]}
              </p>
          </div>
      )}

      {viewMode === 'daily' ? (
        <>
          {/* Modern Day Picker */}
          <div className="flex-none py-4 overflow-x-auto no-scrollbar pl-4">
            <div className="flex gap-3 pr-4">
              {dayNames.map((day, idx) => {
                const isSelected = idx === selectedDayIndex;
                return (
                    <button 
                        key={day} 
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`min-w-[60px] h-[80px] rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all duration-300 ${
                            isSelected 
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/40 scale-105' 
                            : 'bg-white dark:bg-[#1E293B] border-gray-100 dark:border-gray-800 text-slate-500 dark:text-slate-400'
                        }`}
                    >
                        <span className={`text-xs font-medium ${isSelected ? 'text-white/80' : ''}`}>{day}</span>
                        <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{idx + 1}</span>
                        {isSelected && <div className="w-1 h-1 bg-white rounded-full mt-1"></div>}
                    </button>
                )
              })}
            </div>
          </div>

          {/* Timeline View */}
          <div className="flex-1 overflow-y-auto relative no-scrollbar bg-background-light dark:bg-background-dark px-4 pt-2 pb-24">
            
            {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                    <p className="text-sm">Bugün için plan yok.</p>
                    <button onClick={onAddTask} className="text-primary text-sm font-bold mt-2">Ders Ekle</button>
                </div>
            ) : (
                <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 space-y-6 my-4">
                    {filteredTasks.map((task, index) => (
                        <div key={task.id} className="relative pl-6 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-4 border-background-light dark:border-background-dark bg-${task.color || 'indigo'}-500 shadow-sm z-10`}></div>
                            
                            {/* Time Label */}
                            <span className="text-xs font-bold text-slate-400 absolute -top-3 left-6 bg-background-light dark:bg-background-dark px-1">
                                {task.startTime}
                            </span>

                            {/* Card */}
                            <div className={`p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group`}>
                                 {/* Delete Button */}
                                 <div className="absolute top-2 right-2 z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                        className="p-1.5 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-red-500 hover:text-white text-slate-400 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                 </div>

                                 <div className={`absolute top-0 left-0 w-1 h-full bg-${task.color || 'indigo'}-500`}></div>
                                 <div className="flex justify-between items-start pr-8">
                                     <div>
                                         <h3 className="font-bold text-slate-900 dark:text-white text-lg">{task.title}</h3>
                                         <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{task.subtitle || 'Ders'}</p>
                                     </div>
                                     <div className={`w-8 h-8 rounded-full bg-${task.color || 'indigo'}-500/10 flex items-center justify-center text-${task.color || 'indigo'}-500`}>
                                         <span className="material-symbols-outlined text-lg">
                                             {task.type === 'break' ? 'coffee' : 'school'}
                                         </span>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                     <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                         <span className="material-symbols-outlined text-[14px]">schedule</span>
                                         <span>{task.startTime} - {task.endTime}</span>
                                     </div>
                                     {task.reminder && (
                                         <div className="flex items-center gap-1.5 text-orange-400 text-xs">
                                             <span className="material-symbols-outlined text-[14px]">notifications</span>
                                             <span>Açık</span>
                                         </div>
                                     )}
                                 </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-auto p-4 animate-in fade-in duration-500 no-scrollbar bg-slate-50/50 dark:bg-background-dark">
            {weeklyViewType === 'grid' ? (
                <div className="min-w-[900px] bg-white dark:bg-card-dark rounded-[3rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden mb-8 relative">
                    {/* Weekly Header */}
                    <div className="grid grid-cols-8 bg-slate-100/50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 backdrop-blur-xl">
                        <div className="p-6 border-r border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-card-dark">
                            <span className="material-symbols-outlined text-primary font-black">schedule</span>
                        </div>
                        {dayNames.map((day, idx) => {
                            const isToday = (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) === idx;
                            return (
                                <div key={day} className={`p-6 text-center border-r border-gray-200 dark:border-gray-800 last:border-r-0 relative ${isToday ? 'bg-primary/5' : ''}`}>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                                            {day}
                                        </span>
                                        {isToday && (
                                            <div className="absolute top-2 right-2 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                                <span className="text-[8px] font-black text-primary uppercase">Bugün</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative h-[900px] bg-grid-slate-200/[0.05] dark:bg-grid-white/[0.02]">
                        {/* Today Column Highlight */}
                        <div 
                            className="absolute h-full bg-primary/[0.02] dark:bg-primary/[0.05] pointer-events-none z-0"
                            style={{ 
                                left: `${12.5 + (currentDayIndex * 12.5)}%`, 
                                width: '12.5%' 
                            }}
                        ></div>

                        {/* Time Grid Lines */}
                        {timeSlots.map((hour, idx) => (
                            <div key={hour} className="absolute w-full border-b border-gray-100 dark:border-gray-800/40 flex group" style={{ top: `${(hour - 8) * 60}px`, height: '60px' }}>
                                <div className="w-[12.5%] border-r border-gray-200 dark:border-gray-800 p-3 text-right flex flex-col justify-start bg-white dark:bg-card-dark z-10 relative">
                                    <span className="text-[13px] font-black text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">{hour}:00</span>
                                    <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-tighter mt-1">
                                        {idx + 1}. DERS
                                    </span>
                                </div>
                                {Array(7).fill(0).map((_, i) => (
                                    <div key={i} className="flex-1 border-r border-gray-100 dark:border-gray-800/50 last:border-r-0"></div>
                                ))}
                            </div>
                        ))}

                        {/* Current Time Indicator Line */}
                        {timePos !== null && (
                            <div 
                                className="absolute w-full flex items-center z-40 pointer-events-none -translate-y-1/2"
                                style={{ top: `${timePos}px` }}
                            >
                                <div className="w-[12.5%] flex justify-end pr-3 bg-white dark:bg-card-dark items-center">
                                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-lg border border-primary/20 shadow-sm">
                                        {currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <div className="flex-1 h-[1px] border-t border-dashed border-primary/40 relative">
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(19,91,236,0.8)]"></div>
                                </div>
                            </div>
                        )}

                        {/* Tasks */}
                        {tasks.map(task => {
                            if (task.dayIndex === undefined) return null;
                            const top = getTaskPosition(task.startTime);
                            const bottom = getTaskPosition(task.endTime);
                            const height = bottom - top;
                            
                            const baseColor = task.color || 'indigo';
                            
                            // Color mapping for Tailwind classes
                            const bgClasses: Record<string, string> = {
                                indigo: 'bg-indigo-500 shadow-indigo-500/25',
                                emerald: 'bg-emerald-500 shadow-emerald-500/25',
                                rose: 'bg-rose-500 shadow-rose-500/25',
                                amber: 'bg-amber-500 shadow-amber-500/25',
                                violet: 'bg-violet-500 shadow-violet-500/25',
                                sky: 'bg-sky-500 shadow-sky-500/25',
                            };

                            return (
                                <div 
                                    key={task.id}
                                    className={`absolute rounded-2xl p-3 text-[10px] shadow-2xl transition-all hover:scale-[1.03] hover:z-50 group cursor-pointer border border-white/30 dark:border-white/10 flex flex-col justify-between overflow-hidden ${bgClasses[baseColor] || bgClasses.indigo}`}
                                    style={{ 
                                        top: `${top}px`, 
                                        height: `${height}px`, 
                                        left: `${12.5 + (task.dayIndex * 12.5)}%`,
                                        width: '11.8%',
                                        margin: '0.35%',
                                    }}
                                >
                                    {/* Glass Overlay & Patterns */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-60"></div>
                                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                    
                                    {/* Delete Button (Hidden by default, shows on hover) */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                        className="absolute top-1 right-1 z-20 w-5 h-5 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex flex-col">
                                                <span className="font-black uppercase tracking-wider text-white truncate pr-1 drop-shadow-md text-[11px] leading-tight">{task.title}</span>
                                                <span className="text-[7px] font-black text-white/60 uppercase tracking-widest">{task.type === 'break' ? 'MOLA' : 'DERS'}</span>
                                            </div>
                                            <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
                                                <span className="material-symbols-outlined text-[12px] text-white">
                                                    {task.type === 'break' ? 'coffee' : 'school'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-[8px] font-bold text-white/90 truncate drop-shadow-sm mt-0.5">{task.subtitle}</div>
                                    </div>
                                    
                                    <div className="relative z-10 flex items-center justify-between mt-auto pt-1.5 border-t border-white/20">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[9px] text-white/70">schedule</span>
                                            <span className="font-black text-white drop-shadow-sm text-[9px]">{task.startTime}</span>
                                        </div>
                                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/40 transition-colors shadow-inner">
                                            <span className="material-symbols-outlined text-[10px] text-white">arrow_forward</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
                    {dayNames.map((day, dayIdx) => {
                        const dayTasks = tasks
                            .filter(t => t.dayIndex === dayIdx)
                            .sort((a, b) => a.startTime.localeCompare(b.startTime));
                        const isToday = currentDayIndex === dayIdx;

                        return (
                            <div key={day} className={`bg-white dark:bg-card-dark rounded-[2.5rem] border ${isToday ? 'border-primary shadow-xl shadow-primary/5' : 'border-gray-100 dark:border-gray-800'} p-5 flex flex-col min-h-[450px] transition-all hover:shadow-2xl`}>
                                <div className="text-center mb-6">
                                    <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${isToday ? 'text-primary' : 'text-slate-400'}`}>{day}</span>
                                    {isToday && <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-1.5 shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]"></div>}
                                </div>
                                <div className="space-y-4 flex-1">
                                    {dayTasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full opacity-10">
                                            <span className="material-symbols-outlined text-3xl">event_busy</span>
                                        </div>
                                    ) : (
                                        dayTasks.map((task, taskIdx) => (
                                            <div key={task.id} className={`p-4 rounded-2xl bg-${task.color || 'indigo'}-500/5 dark:bg-${task.color || 'indigo'}-500/10 border border-${task.color || 'indigo'}-500/10 group relative transition-all hover:scale-[1.02]`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[11px] font-black text-slate-800 dark:text-white truncate pr-2 leading-tight">{task.title}</span>
                                                    <span className={`text-[8px] font-black text-${task.color || 'indigo'}-500 uppercase bg-${task.color || 'indigo'}-500/10 px-1.5 py-0.5 rounded-md`}>{taskIdx + 1}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                        <span className="text-[9px] font-bold">{task.startTime}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[14px] text-slate-300">{task.type === 'break' ? 'coffee' : 'school'}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <span className="material-symbols-outlined text-[10px]">close</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button 
                                    onClick={onAddTask}
                                    className="mt-6 w-full py-3 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-[10px] font-black text-slate-400 hover:text-primary hover:border-primary transition-all uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/30"
                                >
                                    + Ders Ekle
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Weekly Insights - Bento Style */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-24">
                <div className="md:col-span-2 bg-white dark:bg-card-dark p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Haftalık Performans</h4>
                        <p className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Mükemmel gidiyorsun! <br/><span className="text-primary">Hedeflerine %92 yaklaştın.</span></p>
                    </div>
                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex -space-x-2">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-card-dark bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black">
                                    {i}
                                </div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-slate-500">Bu hafta 4 rozet kazandın</span>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-card-dark p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col items-center justify-center text-center group">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">bolt</span>
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">En Verimli Gün</h4>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">Pazartesi</p>
                </div>

                <div className="bg-white dark:bg-card-dark p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col items-center justify-center text-center group">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">emoji_events</span>
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Toplam Süre</h4>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">24.5 Saat</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
