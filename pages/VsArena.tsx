import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface VsArenaProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (data: Partial<User>) => void;
}

export const VsArena: React.FC<VsArenaProps> = ({ user, onBack, onUpdateUser }) => {
  const [gameState, setGameState] = useState<'LOBBY' | 'BATTLE' | 'RESULT'>('LOBBY');
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'BATTLE' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setGameState('RESULT');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleWin = () => {
    const currentFrames = user.ownedFrames || [];
    const hasGlove = currentFrames.includes('eldiven');
    const updates: Partial<User> = {
        coins: (user.coins || 0) + 100
    };
    
    if (!hasGlove) {
        updates.ownedFrames = [...currentFrames, 'eldiven'];
    }
    
    onUpdateUser(updates);
    alert(hasGlove ? "Tebrikler! Arena kazandın, 100 coin kazandın!" : "Tebrikler! Arena kazandın, eldiven kazandın!");
    setGameState('LOBBY');
  };

  const handleLoss = () => {
      setGameState('LOBBY');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6 font-display relative">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="text-2xl font-black italic uppercase">1VS1 ARENA</h1>
      </header>

      {gameState === 'BATTLE' && (
        <div className="text-center space-y-6">
          <div className="text-sm font-black text-slate-500 uppercase italic">CANLI VS</div>
          <div className="text-5xl font-black italic text-primary animate-pulse">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          
          <div className="flex justify-between items-center bg-[#1e293b] p-6 rounded-3xl border border-white/10 shadow-xl">
            <div className="text-center w-1/3">
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500 mb-2 mx-auto" />
              <p className="font-bold text-sm">{user.name}</p>
              <div className="text-2xl font-black italic text-indigo-400">0</div>
            </div>
            <div className="text-4xl font-black italic text-white/20">VS</div>
            <div className="text-center w-1/3">
              <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 mb-2 mx-auto" />
              <p className="font-bold text-sm">Rakip</p>
              <div className="text-2xl font-black italic text-red-400">0</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-900/50 to-red-900/50 p-1 rounded-full h-4 w-full overflow-hidden border border-white/10">
              <div className="bg-indigo-500 h-full w-1/2 transition-all duration-1000"></div>
          </div>
          
          <button className="w-full bg-white/10 py-4 rounded-2xl font-black italic uppercase animate-bounce">RAKİBE HEDİYE GÖNDER</button>
        </div>
      )}

      {gameState === 'LOBBY' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 p-8 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.3)] text-center">
            <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-6">ARENA'YA GİR</h2>
            <button onClick={() => { setGameState('BATTLE'); setTimeLeft(240); }} 
                    className="w-full bg-white text-indigo-900 py-6 rounded-3xl font-black italic text-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 transition-all hover:scale-105">
                MÜCADELEYİ BAŞLAT
            </button>
          </div>
          
          <div className="bg-[#1e293b]/50 backdrop-blur-md p-6 rounded-3xl border border-white/5">
            <div className="flex bg-black/40 p-1.5 rounded-2xl mb-6">
               <button className="flex-1 py-3 rounded-xl font-black uppercase text-xs bg-primary text-black">GÜNLÜK</button>
               <button className="flex-1 py-3 rounded-xl font-black uppercase text-xs text-slate-500 hover:text-white">HAFTALIK</button>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400 font-medium">
                <span>Sıralama Modu: </span>
                <span className="text-white font-bold italic">Rekabetçi</span>
            </div>
          </div>
        </div>
      )}

      {gameState === 'RESULT' && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
          <h1 className="text-5xl font-black italic uppercase mb-10 text-white text-center">
            PK SONUCU
          </h1>
          <button 
            onClick={() => {
              Math.random() > 0.5 ? handleWin() : handleLoss();
            }} 
            className="w-full p-6 bg-white rounded-3xl text-black font-black uppercase text-xl"
          >
            Sonucu Gör ve Lobiye Dön
          </button>
        </div>
      )}
    </div>
  );
};
