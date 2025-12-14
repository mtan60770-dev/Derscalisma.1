import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarProps {
  tasks: Task[];
  onAddTask: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({ tasks, onAddTask }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // Default to today (adjusting Sunday 0 -> 6)

  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 to 21:00
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  
  // Filter and sort tasks for selected day
  const filteredTasks = tasks
    .filter(t => (t.dayIndex !== undefined ? t.dayIndex === selectedDayIndex : true))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="flex-none bg-surface-light dark:bg-background-dark p-4 pb-2 flex items-center justify-between z-20">
        <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight">Haftalık Program</h1>
            <p className="text-xs text-slate-500">Ders ve çalışma planın</p>
        </div>
        <button 
            onClick={onAddTask}
            className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        >
            <span className="material-symbols-outlined text-sm">add</span>
            Ekle
        </button>
      </header>

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
                             <div className={`absolute top-0 left-0 w-1 h-full bg-${task.color || 'indigo'}-500`}></div>
                             <div className="flex justify-between items-start">
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
    </div>
  );
};
