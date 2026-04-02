import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyBonusProps {
  user: User;
  onClaim: (amount: number) => boolean;
  onBack: () => void;
}

export const DailyBonus: React.FC<DailyBonusProps> = ({ user, onClaim, onBack }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showChestAnimation, setShowChestAnimation] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);

  const getRewardAmount = (streak: number) => {
    const day = (streak % 31) || 31;
    
    // 29, 30 ve 31. günler için özel sandık mantığı
    if (day === 29 || day === 30) {
      const options = [100, 200, 300];
      return options[Math.floor(Math.random() * options.length)];
    }
    if (day === 31) {
      const options = [100, 200, 300, 400];
      return options[Math.floor(Math.random() * options.length)];
    }
    
    // 1-28 arası günler için 10'un katları
    return day * 10;
  };

  const getRewardDisplay = (day: number) => {
    if (day === 29 || day === 30) return "🎁";
    if (day === 31) return "💎";
    return `${day * 10}`;
  };

  useEffect(() => {
    const checkStatus = () => {
        const now = Date.now();
        const lastClaim = user.lastBonusClaimTime || 0;
        const nextClaim = lastClaim + (24 * 60 * 60 * 1000);
        const diff = nextClaim - now;

        if (lastClaim === 0 || diff <= 0) {
            setIsReady(true);
            setTimeLeft('HEDİYEN HAZIR! 🎁');
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
    if (isClaiming || !isReady) return;
    setIsClaiming(true);
    setShowChestAnimation(true);

    const amount = getRewardAmount(user.streak + 1);
    setRewardAmount(amount);

    setTimeout(() => {
        onClaim(amount);
        setIsClaiming(false);
        setShowChestAnimation(false);
        setRewardAmount(null);
    }, 3000); // Animation duration
  };

  return (
    <div className="min-h-screen bg-[#0F172A] relative overflow-hidden flex flex-col">
       <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0F172A] to-[#0F172A]"></div>
       
       <div className="relative z-10 p-6 flex items-center justify-between backdrop-blur-md border-b border-white/5">
           <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform">
               <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <div className="flex flex-col items-end">
               <div className="bg-yellow-500/10 px-4 py-2 rounded-2xl border border-yellow-500/30 flex items-center gap-2 shadow-glow shadow-yellow-500/10">
                   <span className="text-xl">🪙</span>
                   <span className="text-yellow-400 font-black text-lg">{user.coins}</span>
               </div>
               <p className="text-[8px] font-black text-slate-500 uppercase mt-1 tracking-widest">Bakiyen</p>
           </div>
       </div>

       <div className="flex-1 relative z-10 px-6 flex flex-col items-center pt-4">
           <AnimatePresence mode="wait">
             {showChestAnimation ? (
               <motion.div 
                 key="animation"
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1.2, opacity: 1, rotate: [0, -10, 10, -10, 0] }}
                 exit={{ scale: 0, opacity: 0 }}
                 className="w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-[2.5rem] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.4)] mb-6"
               >
                 <span className="text-8xl">🎁</span>
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 1 }}
                   className="text-white font-black text-3xl mt-2"
                 >
                   {rewardAmount} 🪙
                 </motion.div>
               </motion.div>
             ) : (
               <motion.div 
                 key="idle"
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className={`w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.4)] mb-6 transition-all duration-700 ${isReady ? 'animate-bounce scale-110' : 'animate-pulse opacity-40'}`}
               >
                   <span className="text-7xl drop-shadow-2xl">🎁</span>
               </motion.div>
             )}
           </AnimatePresence>
           
           <div className="text-center mb-6">
                <h1 className="text-4xl font-black text-white tracking-tighter italic leading-none">GÜNLÜK BONUS</h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Şansını Dene!</p>
           </div>

           <div className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-6 mb-6 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden group">
               <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1 relative z-10">Kalan Süre</p>
               <p className={`text-4xl font-mono font-black tracking-tighter relative z-10 ${isReady ? 'text-green-400 animate-pulse' : 'text-white'}`}>{timeLeft}</p>
           </div>

           <div className="w-full grid grid-cols-7 gap-1 mb-6">
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isClaimed = day <= user.streak;
                const isCurrent = day === (user.streak + 1);
                return (
                  <div key={day} className={`flex flex-col items-center p-1 rounded-lg border ${isCurrent ? 'bg-yellow-500/20 border-yellow-500' : isClaimed ? 'bg-green-500/20 border-green-500' : 'bg-white/5 border-white/5'}`}>
                    <span className="text-[8px] text-slate-400 font-bold">{day}</span>
                    {isClaimed ? (
                        <span className="text-[16px] text-green-400 font-black">✓</span>
                    ) : (
                        <>
                            <span className="text-[25px] text-white font-black">{getRewardDisplay(day)}</span>
                            <span className="text-[8px] text-yellow-400">🪙</span>
                        </>
                    )}
                  </div>
                );
              })}
            </div>
       </div>

       <div className="absolute bottom-24 left-0 w-full px-8 z-20">
           <button 
            onClick={handleClaim}
            disabled={!isReady || isClaiming}
            className={`w-full h-20 text-white font-black text-2xl rounded-[2.5rem] shadow-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden group ${
                isReady 
                ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 shadow-yellow-500/30' 
                : 'bg-slate-800 border border-white/5 shadow-none opacity-50'
            }`}
           >
               {isClaiming ? (
                   <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
               ) : (
                   <>
                     <span className="relative z-10">{isReady ? 'SANDIĞI AÇ! 🎁' : 'YARIN GEL'}</span>
                   </>
               )}
           </button>
           <p className="text-center text-[9px] font-black text-slate-600 uppercase mt-4 tracking-[0.4em]">Focus Pro Rewards System 2.7</p>
       </div>
    </div>
  );
};
