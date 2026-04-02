import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface ChallengeEventProps {
  user: User;
  onBack: () => void;
  onCompleteDay: (dayIndex: number, reward: number) => void;
  onUpdateUser: (data: Partial<User>) => void;
}

const CHALLENGE_DAYS = Array.from({ length: 40 }, (_, i) => ({
  title: `${i + 1}. Gün: Meydan Okuma`,
  task: `Bugün toplam ${20 + i * 30} soru çöz.`,
  reward: 50 + i * 130,
}));

export const ChallengeEvent: React.FC<ChallengeEventProps> = ({ user, onBack, onCompleteDay, onUpdateUser }) => {
  const completedDays = user.specialEventProgress40 || [];
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [cooldownTime, setCooldownTime] = useState<string | null>(null);

  useEffect(() => {
    if (!user.specialEventStartDate) {
      onUpdateUser({ specialEventStartDate: Date.now() });
    }
  }, [user.specialEventStartDate, onUpdateUser]);

  const startDate = user.specialEventStartDate || Date.now();
  const daysPassed = Math.floor((Date.now() - startDate) / (24 * 60 * 60 * 1000));
  const daysRemaining = Math.max(0, 40 - daysPassed);

  const COOLDOWN_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    const checkCooldown = () => {
      if (user.lastSpecialEventCompletionTime40) {
        const diff = Date.now() - user.lastSpecialEventCompletionTime40;
        if (diff < COOLDOWN_MS) {
          const remaining = COOLDOWN_MS - diff;
          const h = Math.floor(remaining / (60 * 60 * 1000));
          const m = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
          const s = Math.floor((remaining % (60 * 1000)) / 1000);
          setCooldownTime(`${h}s ${m}d ${s}sn`);
        } else {
          setCooldownTime(null);
        }
      }
    };

    const interval = setInterval(checkCooldown, 1000);
    checkCooldown();
    return () => clearInterval(interval);
  }, [user.lastSpecialEventCompletionTime40]);

  const handleComplete = (idx: number) => {
    if (!completedDays.includes(idx)) {
      onCompleteDay(idx, CHALLENGE_DAYS[idx].reward);
      setSelectedDay(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-y-auto no-scrollbar pb-24">
      <div className="p-6 bg-gradient-to-b from-indigo-900/50 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-black italic tracking-tighter text-indigo-400 uppercase">40 GÜN</h1>
          <div className="w-10" />
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 p-6 shadow-2xl shadow-indigo-900/40">
          <h2 className="text-3xl font-black leading-none mb-2">40 Günlük Meydan Okuma</h2>
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Disiplinini Kanıtla - {daysRemaining} Gün Kaldı</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 h-2 bg-indigo-900/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000" 
                style={{ width: `${(completedDays.length / 40) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold">{completedDays.length}/40</span>
          </div>
        </div>
      </div>

      <div className="px-6 grid grid-cols-4 gap-3">
        {CHALLENGE_DAYS.map((day, idx) => {
          const isCompleted = completedDays.includes(idx);
          const isLocked = (idx > 0 && !completedDays.includes(idx - 1) && !isCompleted) || (cooldownTime && !isCompleted);

          return (
            <button
              key={idx}
              disabled={isLocked}
              onClick={() => setSelectedDay(idx)}
              className={`
                relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95
                ${isCompleted ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : isLocked ? 'bg-slate-800 opacity-50' : 'bg-slate-800 border-2 border-indigo-500/30 hover:border-indigo-500'}
              `}
            >
              <span className="text-xl font-black">{idx + 1}</span>
              <span className="text-[8px] font-black uppercase opacity-60">GÜN</span>
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-indigo-600 text-[10px] font-bold">check</span>
                </div>
              )}
              {isLocked && (
                <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-slate-600 text-sm">lock</span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDay !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] p-8 border-t-4 border-indigo-500 animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-indigo-400 font-black italic text-sm uppercase tracking-widest">
                {CHALLENGE_DAYS[selectedDay].title}
              </h3>
              <button onClick={() => setSelectedDay(null)} className="text-slate-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-slate-300 mb-8 italic">"{CHALLENGE_DAYS[selectedDay].task}"</p>
            <button
              disabled={completedDays.includes(selectedDay) || (cooldownTime && !completedDays.includes(selectedDay))}
              onClick={() => handleComplete(selectedDay)}
              className="w-full py-5 rounded-2xl font-black text-lg bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500"
            >
              {completedDays.includes(selectedDay) ? 'TAMAMLANDI' : cooldownTime ? 'BEKLEME SÜRESİ' : 'GÖREVİ TAMAMLA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
