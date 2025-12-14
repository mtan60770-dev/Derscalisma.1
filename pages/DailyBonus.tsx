import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface DailyBonusProps {
  user: User;
  onClaim: () => boolean;
  onBack: () => void;
}

export const DailyBonus: React.FC<DailyBonusProps> = ({ user, onClaim, onBack }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
        const now = Date.now();
        const lastClaim = user.lastBonusClaimTime || 0;
        const nextClaim = lastClaim + (24 * 60 * 60 * 1000);
        const diff = nextClaim - now;

        if (lastClaim === 0 || diff <= 0) {
            setIsReady(true);
            setTimeLeft('ŞİMDİ ALABİLİRSİN!');
        } else {
            setIsReady(false);
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${h}sa ${m}dk ${s}sn`);
        }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [user.lastBonusClaimTime]);

  const handleClaim = () => {
      if (onClaim()) {
          // Success animation could go here
      }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] relative overflow-hidden flex flex-col">
       {/* Background Effects */}
       <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0F172A] to-[#0F172A]"></div>
       
       {/* Header */}
       <div className="relative z-10 p-6 flex items-center justify-between">
           <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
               <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <div className="bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/30 flex items-center gap-2">
               <span className="text-xl">🪙</span>
               <span className="text-yellow-400 font-bold">{user.coins}</span>
           </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 relative z-10 px-6 flex flex-col items-center">
           <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/30 mb-4 animate-bounce">
               <span className="text-5xl">🎁</span>
           </div>
           <h1 className="text-3xl font-black text-white text-center mb-2">Günlük Bonus</h1>
           <p className="text-slate-400 text-center mb-8">Her gün giriş yap, ödülleri katlayarak kazan!</p>

           {/* Status Card */}
           <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-center">
               <p className="text-xs uppercase font-bold text-slate-500 mb-1">Kalan Süre</p>
               <p className={`text-2xl font-mono font-bold ${isReady ? 'text-green-400' : 'text-white'}`}>{timeLeft}</p>
           </div>

           {/* Calendar Grid */}
           <div className="w-full grid grid-cols-5 gap-2 mb-20 overflow-y-auto max-h-[40vh] no-scrollbar pb-10">
               {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                   const coinAmount = day * 10;
                   const isMilestone = day % 7 === 0 || day === 31;
                   const status = day < user.streak ? 'claimed' : day === user.streak ? 'current' : 'locked';
                   
                   return (
                       <div key={day} className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden ${
                           status === 'claimed' ? 'bg-green-500/20 border-green-500/50' :
                           status === 'current' ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#0F172A]' :
                           'bg-slate-800/50 border-slate-700 opacity-50'
                       }`}>
                           {status === 'claimed' && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center"><span className="material-symbols-outlined text-green-400">check</span></div>}
                           <span className="text-[10px] text-slate-400 font-bold">GÜN {day}</span>
                           <span className={`font-black ${status === 'current' ? 'text-white' : 'text-slate-300'}`}>{coinAmount}</span>
                           {isMilestone && <div className="absolute bottom-0 w-full bg-cyan-500/80 text-[8px] text-white font-bold text-center py-0.5">ELMAS</div>}
                       </div>
                   )
               })}
           </div>
       </div>

       {/* Bottom Button */}
       <div className="absolute bottom-6 left-0 w-full px-6 z-20">
           <button 
            onClick={handleClaim}
            disabled={!isReady}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-green-500/20 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
           >
               {isReady ? 'ÖDÜLÜ TOPLA' : 'YARINI BEKLE'}
           </button>
       </div>
    </div>
  );
};
