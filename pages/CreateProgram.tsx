import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { generateSmartSchedule } from '../services/geminiService';

interface CreateProgramProps {
  onBack: () => void;
  onSave: (tasks: Task[]) => void;
}

export const CreateProgram: React.FC<CreateProgramProps> = ({ onBack, onSave }) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('manual');
  
  // AI State
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);

  // Manual State
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubtitle, setManualSubtitle] = useState('');
  const [manualDay, setManualDay] = useState(0); // 0 = Monday
  const [manualStart, setManualStart] = useState('09:00');
  const [manualEnd, setManualEnd] = useState('10:00');
  const [manualType, setManualType] = useState<'class' | 'study'>('class');
  const [reminder, setReminder] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    // Gemini 3 Pro with thinking
    const result = await generateSmartSchedule(topic, 3, 'medium');
    
    // Convert result to Tasks
    let currentTime = 9; // Start at 9:00
    const newTasks: Task[] = result.map((item: any, index: number) => {
        const startHour = Math.floor(currentTime);
        const startMin = Math.round((currentTime - startHour) * 60);
        
        const durationHours = item.durationMinutes / 60;
        const endTotal = currentTime + durationHours;
        const endHour = Math.floor(endTotal);
        const endMin = Math.round((endTotal - endHour) * 60);
        
        currentTime = endTotal;

        return {
            id: `gen-${index}-${Date.now()}`,
            title: item.title,
            subtitle: item.subtitle || item.type,
            startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
            endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`,
            type: item.type === 'break' ? 'break' : 'study',
            completed: false,
            color: item.type === 'break' ? 'orange' : 'indigo',
            dayIndex: new Date().getDay() - 1,
            reminder: false
        }
    });
    setGeneratedTasks(newTasks);
    setLoading(false);
  };

  const handleAddManual = () => {
    if (!manualTitle) return;

    const newTask: Task = {
        id: `man-${Date.now()}`,
        title: manualTitle,
        subtitle: manualSubtitle || 'Kişisel Çalışma',
        startTime: manualStart,
        endTime: manualEnd,
        type: manualType,
        completed: false,
        color: manualType === 'class' ? 'emerald' : 'indigo',
        dayIndex: manualDay,
        reminder: reminder
    };

    setGeneratedTasks(prev => [...prev, newTask]);
    // Reset manual fields but keep day/time for rapid entry
    setManualTitle('');
    setManualSubtitle('');
    setReminder(false);
  };

  const handleSaveAll = () => {
      if (generatedTasks.length > 0) {
          onSave(generatedTasks);
      }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <div className="flex items-center sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-border-light dark:border-border-dark/30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center size-8 rounded-full active:bg-slate-200 dark:active:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Program Ekle</h2>
        </div>
        <button 
            onClick={handleSaveAll}
            className="flex px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors"
        >
          <p className="text-primary text-sm font-bold leading-normal tracking-[0.015em]">Kaydet ({generatedTasks.length})</p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-4 gap-4">
        <button 
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'manual' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-card-dark text-slate-500 dark:text-slate-400 border border-gray-200 dark:border-gray-700'}`}
        >
          Manuel Ekle
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'ai' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-card-dark text-slate-500 dark:text-slate-400 border border-gray-200 dark:border-gray-700'}`}
        >
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          Yapay Zeka
        </button>
      </div>

      <main className="flex-1 flex flex-col gap-6 px-4">
        
        {/* MANUAL ENTRY FORM */}
        {activeTab === 'manual' && (
           <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-left-4">
              <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ders Adı</label>
                  <input 
                    type="text" 
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Örn: Matematik"
                    className="w-full rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  />
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Açıklama / Hoca</label>
                  <input 
                    type="text" 
                    value={manualSubtitle}
                    onChange={(e) => setManualSubtitle(e.target.value)}
                    placeholder="Örn: Prof. Dr. Yılmaz"
                    className="w-full rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Gün</label>
                    <select 
                      value={manualDay}
                      onChange={(e) => setManualDay(Number(e.target.value))}
                      className="w-full rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value={0}>Pazartesi</option>
                        <option value={1}>Salı</option>
                        <option value={2}>Çarşamba</option>
                        <option value={3}>Perşembe</option>
                        <option value={4}>Cuma</option>
                        <option value={5}>Cumartesi</option>
                        <option value={6}>Pazar</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tür</label>
                     <select 
                      value={manualType}
                      onChange={(e) => setManualType(e.target.value as any)}
                      className="w-full rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="class">Ders</option>
                        <option value="study">Çalışma</option>
                    </select>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Başlangıç Saati</label>
                      <input 
                        type="time" 
                        value={manualStart}
                        onChange={(e) => setManualStart(e.target.value)}
                        className="w-full rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Bitiş Saati</label>
                      <input 
                        type="time" 
                        value={manualEnd}
                        onChange={(e) => setManualEnd(e.target.value)}
                        className="w-full rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                      />
                  </div>
              </div>

              {/* REMINDER CHECKBOX */}
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-background-dark p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                     <span className="material-symbols-outlined text-orange-500 text-sm">notifications</span>
                  </div>
                  <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Hatırlatıcı</p>
                      <p className="text-xs text-slate-500">Ders başlamadan 15 dk önce</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={reminder}
                    onChange={(e) => setReminder(e.target.checked)}
                    className="w-6 h-6 rounded-md border-gray-300 text-primary focus:ring-primary"
                  />
              </div>

              <button 
                onClick={handleAddManual}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold mt-2 active:scale-[0.98] transition-transform"
              >
                  Listeye Ekle
              </button>
           </div>
        )}

        {/* AI GENERATOR SECTION */}
        {activeTab === 'ai' && (
             <div className="bg-gradient-to-r from-primary/10 to-indigo-500/10 dark:from-primary/20 dark:to-indigo-500/20 rounded-2xl p-5 border border-primary/20 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary">psychology</span>
                    <h3 className="font-bold text-primary">Gemini Smart Plan</h3>
                </div>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-3">
                    Bir konu girin, Gemini sizin için molalı ve optimize edilmiş bir çalışma planı oluştursun.
                </p>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Örn: Türev Matematiği" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="flex-1 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark py-2 px-3 text-sm"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 disabled:opacity-50"
                    >
                        {loading ? 'Düşünüyor...' : 'Üret'}
                    </button>
                </div>
             </div>
        )}

        {/* Generated List */}
        <section className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Eklenenler Listesi</h3>
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{generatedTasks.length} Aktivite</span>
          </div>
          
          <div className="relative flex flex-col gap-3">
             <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-border-light dark:bg-border-dark -z-10"></div>
             
             {generatedTasks.length === 0 && (
                 <div className="text-center py-8 text-text-secondary-light dark:text-text-secondary-dark text-sm border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                     Henüz liste boş. Yukarıdan manuel veya yapay zeka ile ders ekleyin.
                 </div>
             )}

             {generatedTasks.map((task, i) => (
                <div key={i} className="flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col items-center gap-1 min-w-[54px]">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{task.startTime}</span>
                        <div className={`size-3 rounded-full bg-${task.color}-500 ring-4 ring-background-light dark:ring-background-dark`}></div>
                        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{task.endTime}</span>
                    </div>
                    <div className="flex-1 bg-surface-light dark:bg-surface-dark p-3 rounded-lg border border-border-light dark:border-border-dark shadow-sm relative group">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-bold ${task.type === 'break' ? 'text-orange-400' : 'text-slate-900 dark:text-white'}`}>{task.title}</h4>
                            <button 
                              onClick={() => setGeneratedTasks(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500 transition-colors"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                        </div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{task.subtitle}</p>
                        {task.reminder && (
                            <div className="absolute top-2 right-8 text-orange-500">
                                <span className="material-symbols-outlined text-[16px]">notifications</span>
                            </div>
                        )}
                    </div>
                </div>
             ))}
          </div>
        </section>
      </main>
      
    </div>
  );
};
