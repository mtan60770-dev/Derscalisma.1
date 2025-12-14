import React, { useState } from 'react';
import { Exam, ScoreType, User } from '../types';

interface AddExamProps {
  onBack: () => void;
  onSave: (exam: Exam) => void;
  user: User; // Need user prop
}

export const AddExam: React.FC<AddExamProps> = ({ onBack, onSave, user }) => {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [targetScore, setTargetScore] = useState(85);
  const [type, setType] = useState<ScoreType>('written');

  const handleSave = () => {
    if (!subject || !date) return;
    const newExam: Exam = {
        id: `exam-${Date.now()}`,
        subject,
        date,
        time,
        type,
        targetScore
    };
    onSave(newExam);
  };

  const getTypeLabel = (t: ScoreType) => {
      switch(t) {
          case 'written': return 'Yazılı Sınav';
          case 'performance': return 'Performans / Sözlü';
          case 'project': return 'Proje Ödevi';
      }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20 p-4">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
        </button>
        <div className="text-center">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Not / Sınav Ekle</h1>
            <p className="text-xs text-primary font-bold">Öğrenci: {user.name}</p>
        </div>
        <div className="w-8"></div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-5 animate-in slide-in-from-bottom-4">
        
        {/* Score Type Selection */}
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
             {(['written', 'performance', 'project'] as ScoreType[]).map((t) => (
                 <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === t ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                 >
                     {getTypeLabel(t).split(' ')[0]}
                 </button>
             ))}
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Ders Adı</label>
            <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Örn: Matematik"
                className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Tarih</label>
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium outline-none"
                />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Saat</label>
                <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium outline-none"
                />
            </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hedef Puan</label>
                <span className="text-lg font-bold text-primary">{targetScore}</span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
        </div>

        <button 
            onClick={handleSave}
            disabled={!subject || !date}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
            <span className="material-symbols-outlined">save</span>
            <span>Kaydet</span>
        </button>
      </div>
    </div>
  );
};
