import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LivePkProps {
  user: User;
  allUsers: User[];
  onBack: () => void;
  onUpdateUser: (data: Partial<User>) => void;
}

const getRankScore = (u: User, view: 'daily' | 'weekly', userScore: number, currentUserId: string) => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const week = 5 * day; // Kullanıcı isteği: haftalık 5 gün
    const period = view === 'daily' ? day : week;
    
    // Süreye dayalı bir 'seed' oluşturarak her periyotta aynı kullanıcı için farklı (ama o periyotta sabit) puan almasını sağla
    const seed = Math.floor(now / period) + (u.id.charCodeAt(0) || 0);
    const randomScore = (seed * 12345) % 100000;
    
    return u.id === currentUserId ? (view === 'daily' ? userScore : userScore * 5) : randomScore;
};

export const LivePk: React.FC<LivePkProps> = ({ user, allUsers, onBack, onUpdateUser }) => {
  const [gameState, setGameState] = useState<'lobby' | 'pk' | 'ranking' | 'invite' | 'history'>('lobby');
  const [timeLeft, setTimeLeft] = useState(180);
  const [isMultiplierActive, setIsMultiplierActive] = useState(false);
  const [multiplierTimer, setMultiplierTimer] = useState(0);
  const [showGifts, setShowGifts] = useState(false);
  const [rankView, setRankView] = useState<'daily' | 'weekly'>('daily');
  const [botScore, setBotScore] = useState(0);
  const [userScore, setUserScore] = useState(0);

  const friends = allUsers.filter(u => user.friends?.includes(u.id));

  const gifts = [
    { emoji: '🌹', name: 'Gül', price: 1, points: 2 },
    { emoji: '⭐', name: 'Yıldız', price: 5, points: 10 },
    { emoji: '🚀', name: 'Roket', price: 500, points: 1000 },
    { emoji: '👑', name: 'Taç', price: 1000, points: 2000 },
    { emoji: '🚗', name: 'Araba', price: 1000, points: 2000 },
    { emoji: '✈️', name: 'Jet', price: 3000, points: 5000 },
    { emoji: '🛫', name: 'Uçak', price: 10000, points: 15000 },
    { emoji: '🏆', name: 'Şampiyon', price: 30000, points: 40000 },
    { emoji: '👽', name: 'Uzaylı', price: 50000, points: 70000 },
    { emoji: '🦖', name: 'Dinazor', price: 70000, points: 80000 },
    { emoji: '📚', name: 'Ders', price: 80000, points: 100000 },
    { emoji: '🧤', name: 'Eldiven', price: 0, points: 0, isItem: true },
  ];

  const handleSendGift = (gift: typeof gifts[0]) => {
      if (gift.isItem) {
          if ((user.gloveCount || 0) <= 0) {
              alert("Eldiveniniz yok!");
              return;
          }
          // Eldiveni tüket: Kullanıcıdan eksilt
          onUpdateUser({ gloveCount: (user.gloveCount || 0) - 1 });
          
          setIsMultiplierActive(true);
          setMultiplierTimer(30);
          alert("Eldiven kullanıldı! Puanlar 2x!");
          return;
      }

      if ((user.diamonds || 0) < gift.price) {
          alert("Yetersiz elmas!");
          return;
      }
      onUpdateUser({ diamonds: (user.diamonds || 0) - gift.price });
      const pointsToApply = isMultiplierActive ? gift.points * 2 : gift.points;
      setUserScore(prev => prev + pointsToApply);
  };

  const [showChestModal, setShowChestModal] = useState(false);
  const [chestDiamonds, setChestDiamonds] = useState(0);
  const [chestSlots, setChestSlots] = useState(0);
  const [chestDuration, setChestDuration] = useState(1);
  const [activeChests, setActiveChests] = useState<any[]>([]);

  const createChest = () => {
    if (chestDiamonds <= 0 || chestSlots <= 0 || chestDuration <= 0 || chestDuration > 4) {
        alert("Geçersiz sandık ayarları! Süre max 4 dk olmalı.");
        return;
    }
    if ((user.diamonds || 0) < chestDiamonds) {
        alert("Yetersiz elmas!");
        return;
    }
    onUpdateUser({ diamonds: (user.diamonds || 0) - chestDiamonds });
    const newChest = { id: Date.now(), diamonds: chestDiamonds, slots: chestSlots, duration: chestDuration * 60, participants: 0 };
    setActiveChests([...activeChests, newChest]);
    setShowChestModal(false);
    alert("Sandık yayında oluşturuldu!");
  };

  return (
    <div className="min-h-screen bg-black text-white font-display overflow-hidden">
      {/* ... mevcut kodlar ... */}

      {/* Canlı Yayında Sandık Butonu (Geliştirilmiş) */}
      <div className="absolute top-20 left-6 z-40">
        <button onClick={() => setShowChestModal(true)} className="bg-amber-500 p-3 rounded-full text-2xl animate-bounce">
            📦
        </button>
      </div>
      
      {/* Sandık Oluşturma Modalı */}
      {showChestModal && (
        <div className="absolute inset-0 z-50 bg-black/90 p-8 flex flex-col justify-center gap-4">
            <h2 className="text-2xl font-bold">💎 Sandık Oluştur</h2>
            <input type="number" placeholder="Elmas Miktarı" onChange={(e) => setChestDiamonds(Number(e.target.value))} className="p-4 bg-white/10 rounded-xl" />
            <input type="number" placeholder="Katılımcı Sayısı" onChange={(e) => setChestSlots(Number(e.target.value))} className="p-4 bg-white/10 rounded-xl" />
            <input type="number" placeholder="Süre (dk, max 4)" max="4" onChange={(e) => setChestDuration(Math.min(Number(e.target.value), 4))} className="p-4 bg-white/10 rounded-xl" />
            <button onClick={createChest} className="bg-primary p-4 rounded-xl font-bold text-black">Sandığı Yayına Koy</button>
            <button onClick={() => setShowChestModal(false)} className="text-slate-400">İptal</button>
        </div>
      )}
  const getBotInterval = () => {
      switch(difficulty) {
          case 'easy': return 4000;
          case 'hard': return 500;
          default: return 1500;
      }
  };
    switch(difficulty) {
        case 'easy': return 4000;
        case 'hard': return 500;
        default: return 1500;
    }
};

// Zamanlayıcı yönetimi
useEffect(() => {
  if (gameState !== 'pk' || timeLeft <= 0) return;
  const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
  return () => clearInterval(timer);
}, [gameState, timeLeft]);

// Bot hediyeleşme döngüsü
useEffect(() => {
  if (gameState !== 'pk') return;
  const botInterval = setInterval(() => {
      const randomGift = gifts[Math.floor(Math.random() * gifts.length)];
      setBotScore(prev => prev + (isMultiplierActive ? randomGift.points * 2 : randomGift.points));
  }, getBotInterval());
  return () => clearInterval(botInterval); 
}, [gameState, isMultiplierActive, difficulty]);

// Çarpan süresi yönetimi
useEffect(() => {
  if (gameState !== 'pk' || !isMultiplierActive) return;
  if (multiplierTimer <= 0) {
      setIsMultiplierActive(false);
      return;
  }
  const interval = setInterval(() => setMultiplierTimer(prev => prev - 1), 1000);
  return () => clearInterval(interval);
}, [gameState, isMultiplierActive, multiplierTimer]);

const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

const saveHistory = (result: 'win' | 'loss') => {
    onUpdateUser({
        pkHistory: [...(user.pkHistory || []), { result, timestamp: Date.now() }]
    });
};

const handleWin = () => {
    const updates: Partial<User> = {
        coins: (user.coins || 0) + 100,
        gloveCount: (user.gloveCount || 0) + 1
    };
    
    onUpdateUser(updates);
    alert("Tebrikler! Eldiven kazandın!");
    
    saveHistory('win');
    setGameState('lobby');
    setUserScore(0);
    setBotScore(0);
};

return (
  <div className="min-h-screen bg-black text-white font-display overflow-hidden">
      {/* Canlı Yayında Sandık Butonu */}
      <div className="absolute top-20 left-6 z-40">
        <button onClick={() => setShowChestModal(true)} className="bg-amber-500 p-3 rounded-full text-2xl animate-bounce">
            📦
        </button>
      </div>
      
      {/* Sandık Oluşturma Modalı */}
      {showChestModal && (
        <div className="absolute inset-0 z-50 bg-black/90 p-8 flex flex-col justify-center gap-4">
            <h2 className="text-2xl font-bold">💎 Sandık Oluştur</h2>
            <input type="number" placeholder="Elmas Miktarı" onChange={(e) => setChestDiamonds(Number(e.target.value))} className="p-4 bg-white/10 rounded-xl" />
            <input type="number" placeholder="Katılımcı Sayısı" onChange={(e) => setChestSlots(Number(e.target.value))} className="p-4 bg-white/10 rounded-xl" />
            <input type="number" placeholder="Süre (dk, max 4)" max="4" onChange={(e) => setChestDuration(Math.min(Number(e.target.value), 4))} className="p-4 bg-white/10 rounded-xl" />
            <button onClick={createChest} className="bg-primary p-4 rounded-xl font-bold text-black">Sandığı Yayına Koy</button>
            <button onClick={() => setShowChestModal(false)} className="text-slate-400">İptal</button>
        </div>
      )}

      {gameState === 'lobby' && (
        <div className="p-8 flex flex-col gap-6 text-center h-screen justify-center">
          <h1 className="text-4xl font-black italic uppercase">1VS1 ARENA</h1>
          <div className="flex gap-2 justify-center">
            {[
                { id: 'easy', label: 'KOLAY' },
                { id: 'medium', label: 'ORTA' },
                { id: 'hard', label: 'ZOR' }
            ].map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id as any)} className={`px-4 py-2 rounded-lg font-bold uppercase ${difficulty === d.id ? 'bg-primary text-black' : 'bg-white/10'}`}>{d.label}</button>
            ))}
          </div>
          <button onClick={() => { setGameState('pk'); setTimeLeft(180); setUserScore(0); setBotScore(0); }} className="bg-red-600 text-white p-6 rounded-3xl font-black text-2xl uppercase shadow-glow">PK AÇ</button>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setGameState('ranking')} className="bg-white/10 p-6 rounded-3xl font-black uppercase">SIRALAMA</button>
            <button onClick={() => setGameState('invite')} className="bg-blue-600 p-6 rounded-3xl font-black uppercase">ARKADAŞ DAVET</button>
            <button onClick={() => setGameState('history')} className="col-span-2 bg-slate-800 p-6 rounded-3xl font-black uppercase">GEÇMİŞİM</button>
          </div>
          <button onClick={onBack} className="p-4 border border-white/10 rounded-2xl">Geri</button>
        </div>
      )}

      {gameState === 'pk' && (
        <div className="relative h-screen">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black z-0" />
          
          {/* Kazanan Ekranı */}
          {timeLeft === 0 && (
            <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
              <h1 className="text-5xl font-black italic uppercase mb-10 text-white">{userScore > botScore ? 'KAZANDIN! 🎉' : 'KAYBETTİN! 😔'}</h1>
              <button 
                onClick={() => {
                  userScore > botScore ? handleWin() : handleLoss();
                }} 
                className="p-6 bg-white rounded-3xl text-black font-black uppercase"
              >
                {userScore > botScore ? 'Ödülü Al ve Lobiye Dön' : 'Lobiye Dön'}
              </button>
            </div>
          )}

          <header className="absolute top-0 w-full p-6 flex justify-between z-20">
            <button onClick={() => setGameState('lobby')} className="text-sm">Yayını Bitir</button>
            <div className="bg-red-600 px-3 py-1 rounded-md text-xs font-black animate-pulse">CANLI</div>
          </header>

          <div className="absolute top-20 w-full px-6 flex justify-between items-center z-20">
            <div className="flex flex-col items-center">
                <div className="bg-black/60 p-4 rounded-3xl w-32 text-center border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <p className="text-[10px] font-black uppercase text-slate-400">{user.name}</p>
                  <p className="text-3xl font-black text-emerald-400">{userScore}</p>
                  <p className="text-[10px] font-black text-white mt-1">🧤 x {user.gloveCount || 0}</p>
                </div>
                 {isMultiplierActive && <div className="mt-2 text-[10px] font-black text-yellow-400 animate-pulse">2X ELDİVEN AKTİF ({multiplierTimer}s)</div>}
            </div>
            <div className="text-4xl font-black italic text-white/20">VS</div>
            <div className="bg-black/60 p-4 rounded-3xl w-32 text-center border-2 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <p className="text-[10px] font-black uppercase text-slate-400">Rakip</p>
              <p className="text-3xl font-black text-rose-400">{botScore}</p>
            </div>
          </div>

          <div className="absolute top-52 w-full px-12 z-20">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2 text-white/50">
                 <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                 <span>PK Savaş Süresi</span>
              </div>
              <div className="relative h-8 bg-black/40 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  {/* User Bar (Blue) */}
                  <div className="absolute inset-0 bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(37,99,235,0.6)]" style={{ width: `${(userScore / (Math.max(userScore + botScore, 1))) * 100}%` }}></div>
                   {/* Bot Bar (Rose) */}
                   <div className="absolute inset-0 bg-rose-600 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(225,29,72,0.6)]" style={{ left: `${(userScore / (Math.max(userScore + botScore, 1))) * 100}%` }}></div>
                   
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="text-xl font-black text-white bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm shadow-lg">
                           {userScore} | {botScore}
                       </span>
                   </div>
              </div>
          </div>

          <div className="absolute bottom-32 right-6 z-40">
            <button onClick={() => setShowGifts(true)} className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-[0_4px_15px_rgba(244,63,94,0.4)] border-2 border-white animate-pulse text-3xl">🎁</button>
          </div>
        </div>
      )}

      {showGifts && (
        <div className="absolute bottom-0 w-full bg-black/95 p-6 rounded-t-3xl z-50 border-t border-rose-500/50 h-[60vh] overflow-y-auto">
          <div className="flex justify-between mb-4 sticky top-0 bg-black/95 pb-4"><h2 className="font-bold">Hediyeler (Elmaslı)</h2><button onClick={() => setShowGifts(false)} className="text-sm">Kapat</button></div>
          <div className="grid grid-cols-2 gap-4 pb-20">
            {gifts.map(gift => (
              <button key={gift.name} onClick={() => handleSendGift(gift)} className="bg-white/10 p-4 rounded-xl text-left flex justify-between items-center hover:bg-rose-900 transition-colors">
                <span className="text-3xl">{gift.emoji}</span>
                <div className="text-right">
                  <p className="font-bold">{gift.price} Elmas</p>
                  <p className="text-[10px] text-slate-400">+{gift.points} Puan</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {gameState === 'ranking' && (
            <div className="p-8">
                <h2 className="text-2xl font-black mb-6 tracking-wider">LİDERLİK TABLOSU</h2>
                <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                    <button onClick={() => setRankView('daily')} className={`flex-1 p-3 rounded-lg font-bold transition-all ${rankView === 'daily' ? 'bg-primary text-black' : 'text-slate-400'}`}>Günlük</button>
                    <button onClick={() => setRankView('weekly')} className={`flex-1 p-3 rounded-lg font-bold transition-all ${rankView === 'weekly' ? 'bg-primary text-black' : 'text-slate-400'}`}>Haftalık</button>
                </div>
                <div className="space-y-4">
                    {allUsers
                        .map(u => ({ 
                            name: u.name, 
                            score: getRankScore(u, rankView, userScore, user.id)
                        }))
                        .sort((a,b)=>b.score-a.score)
                        .map((r, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <span className={`w-8 h-8 flex items-center justify-center font-black rounded-full ${i===0 ? 'bg-yellow-500' : i===1 ? 'bg-slate-400' : i===2 ? 'bg-amber-700' : 'bg-white/10'}`}>{i+1}</span>
                            <span className="flex-1 font-bold text-lg truncate">{r.name}</span>
                            <span className="font-mono text-emerald-400 font-bold">{r.score.toLocaleString()} Puan</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => setGameState('lobby')} className="mt-10 w-full p-4 bg-white/10 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">Lobiye Dön</button>
            </div>
        )}

        {gameState === 'invite' && (
             <div className="p-8">
                <h2 className="text-2xl font-black mb-6 tracking-wider">ARKADAŞLARINI DAVET ET</h2>
                <div className="space-y-4">
                    {friends.map(f => (
                        <div key={f.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <img src={f.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white/10" alt="avatar"/>
                            <span className="flex-1 font-bold">{f.name}</span>
                            <button onClick={() => alert(`${f.name} PK yayınına davet edildi!`)} className="bg-primary text-black px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform">Davet Et</button>
                        </div>
                    ))}
                </div>
                <button onClick={() => setGameState('lobby')} className="mt-10 w-full p-4 bg-white/10 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">Lobiye Dön</button>
            </div>
        )}

        {gameState === 'history' && (
             <div className="p-8">
                <h2 className="text-2xl font-black mb-6 tracking-wider">PK GEÇMİŞİ</h2>
                <div className="space-y-4">
                    {(user.pkHistory || []).slice().reverse().map((h, i) => (
                        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${h.result === 'win' ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                            <span className="font-bold">{h.result === 'win' ? 'KAZANDIN! 🎉' : 'KAYBETTİN! 😔'}</span>
                            <span className="text-gray-400 text-sm italic">{new Date(h.timestamp).toLocaleDateString()}</span>
                        </div>
                    ))}
                    {(user.pkHistory || []).length === 0 && <p className="text-center text-gray-500 mt-10">Henüz PK yarışması yapmadınız.</p>}
                </div>
                <button onClick={() => setGameState('lobby')} className="mt-10 w-full p-4 bg-white/10 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">Lobiye Dön</button>
            </div>
        )}
    </div>
  );
};
