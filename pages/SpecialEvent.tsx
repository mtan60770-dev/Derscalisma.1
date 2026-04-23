
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

interface SpecialEventProps {
  user: User;
  onBack: () => void;
  onCompleteDay: (dayIndex: number, reward: number, eventDuration: 20 | 40 | 60) => void;
  onUpdateUser: (data: Partial<User>) => void;
  eventDuration: 20 | 40 | 60;
}

export const SpecialEvent: React.FC<SpecialEventProps> = ({ user, onBack, onCompleteDay, onUpdateUser, eventDuration }) => {
  const completedDays = (eventDuration === 20 ? user.specialEventProgress20 : eventDuration === 40 ? user.specialEventProgress40 : user.specialEventProgress60) || [];
  const SPECIAL_DAYS = Array.from({ length: eventDuration }, (_, i) => ({
    title: `${i + 1}. Gün: Titan Meydan Okuması`,
    task: `Bugün toplam ${100 + i * 10} soru çöz ve 1 saat odaklanarak çalış.`,
    reward: 200 + i * 20,
  }));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const [studyTimeLeft, setStudyTimeLeft] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [cooldownTime, setCooldownTime] = useState<string | null>(null);

  const COOLDOWN_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStudying && studyTimeLeft > 0) {
      timer = setInterval(() => {
        setStudyTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isStudying && studyTimeLeft === 0) {
      setIsStudying(false);
      setCanClaim(true);
    }
    return () => clearInterval(timer);
  }, [isStudying, studyTimeLeft]);

  useEffect(() => {
    const checkCooldown = () => {
      const lastCompletion = eventDuration === 20 ? user.lastSpecialEventCompletionTime20 : eventDuration === 40 ? user.lastSpecialEventCompletionTime40 : user.lastSpecialEventCompletionTime60;
      if (lastCompletion) {
        const diff = Date.now() - lastCompletion;
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
  }, [user.lastSpecialEventCompletionTime20, user.lastSpecialEventCompletionTime40, user.lastSpecialEventCompletionTime60, eventDuration]);

  useEffect(() => {
    if (eventDuration === 20 && !user.specialEventStartDate) {
      onUpdateUser({ specialEventStartDate: Date.now() });
    } else if (eventDuration === 40 && !user.specialEventStartDate40) {
      onUpdateUser({ specialEventStartDate40: Date.now() });
    } else if (eventDuration === 60 && !user.specialEventStartDate60) {
      onUpdateUser({ specialEventStartDate60: Date.now() });
    }
  }, [eventDuration, user.specialEventStartDate, user.specialEventStartDate40, user.specialEventStartDate60, onUpdateUser]);

  const EVENT_DURATION_MS = eventDuration * 24 * 60 * 60 * 1000;
  const startDate = eventDuration === 40 ? (user.specialEventStartDate40 || Date.now()) : eventDuration === 60 ? (user.specialEventStartDate60 || Date.now()) : (user.specialEventStartDate || Date.now());
  const EVENT_END_DATE = startDate + EVENT_DURATION_MS;
  const timeLeftEvent = EVENT_END_DATE - Date.now();

  const daysLeft = Math.max(0, Math.floor(timeLeftEvent / (24 * 60 * 60 * 1000)));
  const hoursLeft = Math.max(0, Math.floor((timeLeftEvent % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)));

  const isExpired = timeLeftEvent <= 0;
  const isFullyCompleted = completedDays.length >= eventDuration;

  if (isExpired && isFullyCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background-dark text-white p-6 text-center">
        <span className="material-symbols-outlined text-9xl text-slate-700 mb-6">timer_off</span>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">ETKİNLİK SONA ERDİ</h2>
        <p className="text-slate-500 font-bold uppercase text-xs mb-8">{eventDuration}-Günlük Titan Meydan Okuması Tamamlandı.</p>
        <button onClick={onBack} className="bg-primary px-8 py-4 rounded-2xl font-black uppercase italic shadow-glow">
          GERİ DÖN
        </button>
      </div>
    );
  }

  const handleStartStudy = () => {
    if (cooldownTime) return;
    setIsStudying(true);
    setStudyTimeLeft(15); // 15 seconds for special event
    setCanClaim(false);
  };

  const handleComplete = (idx: number) => {
    if (!completedDays.includes(idx)) {
      onCompleteDay(idx, SPECIAL_DAYS[idx].reward, eventDuration);
      setSelectedDay(null);
      setCanClaim(false);
      setIsStudying(false);
    }
  };

  const is60Day = eventDuration === 60;
  const theme = is60Day 
    ? { from: 'from-amber-500', to: 'to-orange-600', shadow: 'shadow-amber-900/40', border: 'border-amber-500', text: 'text-amber-400' }
    : { from: 'from-purple-600', to: 'to-indigo-700', shadow: 'shadow-purple-900/40', border: 'border-purple-500', text: 'text-purple-400' };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-y-auto no-scrollbar pb-24">
      {/* Header */}
      <div className={`p-6 bg-gradient-to-b ${theme.from}/50 to-transparent`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className={`text-xl font-black italic tracking-tighter ${theme.text} uppercase`}>
            {eventDuration === 20 ? 'TITAN 20' : eventDuration === 40 ? 'TITAN 40' : 'TITAN 60'}
          </h1>
          <div className="w-10" />
        </div>

        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.from} ${theme.to} p-6 shadow-2xl ${theme.shadow}`}>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">{eventDuration}-Günlük Elit Meydan Okuma</p>
                <h2 className="text-3xl font-black leading-none">Titan Yükselişi</h2>
              </div>
              <div className="bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 text-center">
                <p className="text-[8px] font-black uppercase text-white/70">Kalan Süre</p>
                <p className="text-xs font-black">{daysLeft}G {hoursLeft}S</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000" 
                  style={{ width: `${(completedDays.length / eventDuration) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold">{completedDays.length}/{eventDuration}</span>
            </div>
          </div>
          <span className="absolute -right-4 -bottom-4 material-symbols-outlined text-9xl text-white/20 rotate-12">
            {is60Day ? 'workspace_premium' : 'rocket_launch'}
          </span>
        </div>
      </div>

      {cooldownTime && (
        <div className={`mx-6 mb-6 p-4 bg-gradient-to-r ${theme.from}/10 to-transparent border ${theme.border}/20 rounded-2xl flex items-center gap-3`}>
          <span className={`material-symbols-outlined ${theme.text}`}>timer</span>
          <div>
            <p className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>Titan Bekleme Süresi</p>
            <p className="text-xs font-bold">Yeni meydan okuma: <span className="text-white">{cooldownTime}</span></p>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="px-6 grid grid-cols-4 gap-3">
        {SPECIAL_DAYS.map((day, idx) => {
          const isCompleted = completedDays.includes(idx);
          const isLocked = (idx > 0 && !completedDays.includes(idx - 1) && !isCompleted) || (cooldownTime && !isCompleted);

          return (
            <button
              key={idx}
              disabled={isLocked}
              onClick={() => {
                setSelectedDay(idx);
                setCanClaim(false);
                setIsStudying(false);
              }}
              className={`
                relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95
                ${isCompleted ? `bg-gradient-to-br ${theme.from} ${theme.to} shadow-lg ${theme.shadow}` : isLocked ? 'bg-slate-800 opacity-50' : `bg-slate-800 border-2 ${theme.border}/30 hover:${theme.border}`}
              `}
            >
              <span className="text-xl font-black">{idx + 1}</span>
              <span className="text-[8px] font-black uppercase opacity-60">GÜN</span>
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className={`material-symbols-outlined ${theme.text} text-[10px] font-bold`}>check</span>
                </div>
              )}
              {isLocked && (
                <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-slate-600 text-sm">lock</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal / Detail */}
      {selectedDay !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`w-full max-w-md bg-slate-900 rounded-[2.5rem] p-8 border-t-4 ${theme.border}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className={`${theme.text} font-black italic text-sm mb-1 uppercase tracking-widest`}>
                  {SPECIAL_DAYS[selectedDay].title}
                </h3>
                <p className="text-2xl font-black leading-tight">Titan Görevi</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-slate-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-white/5">
              <p className="text-slate-300 leading-relaxed italic">
                "{SPECIAL_DAYS[selectedDay].task}"
              </p>
            </div>

            {isStudying && (
              <div className="mb-8 text-center">
                <div className={`w-20 h-20 border-4 ${theme.border} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
                <p className={`${theme.text} font-black text-2xl`}>{studyTimeLeft}s</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Titan Odaklanması Aktif...</p>
              </div>
            )}

            {!isStudying && !canClaim && !completedDays.includes(selectedDay) && (
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-yellow-500">payments</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Ödül</p>
                    <p className="font-black text-yellow-500">+{SPECIAL_DAYS[selectedDay].reward} Coin</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full ${theme.from}/20 flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${theme.text}`}>bolt</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Bonus</p>
                    <p className={`font-black ${theme.text}`}>+50 XP</p>
                  </div>
                </div>
              </div>
            )}

            {canClaim && !completedDays.includes(selectedDay) && (
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1.05 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
                className={`mb-8 p-4 bg-gradient-to-r ${theme.from}/20 to-transparent border ${theme.border}/20 rounded-2xl text-center`}
              >
                <p className={`${theme.text} font-black text-sm uppercase italic`}>Titan Görevi Başarıldı! Ödülünü Al.</p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={completedDays.includes(selectedDay) || isStudying || (cooldownTime && !completedDays.includes(selectedDay))}
              onClick={() => {
                if (isStudying) return;
                if (canClaim) handleComplete(selectedDay);
                else handleStartStudy();
              }}
              className={`
                w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all
                ${completedDays.includes(selectedDay) 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : isStudying 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : canClaim 
                      ? `bg-gradient-to-r ${theme.from} ${theme.to} text-white ${theme.shadow}`
                      : cooldownTime
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : `bg-gradient-to-r ${theme.from} ${theme.to} text-white ${theme.shadow}`}
              `}
            >
              {completedDays.includes(selectedDay) 
                ? 'TAMAMLANDI' 
                : isStudying 
                  ? 'ODAKLANILIYOR...' 
                  : canClaim 
                    ? 'ÖDÜLÜ AL' 
                    : cooldownTime
                      ? 'BEKLEME SÜRESİ'
                      : 'TITAN GÜCÜNÜ KANITLA'}
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
