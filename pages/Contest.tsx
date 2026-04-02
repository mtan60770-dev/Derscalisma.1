
import React, { useMemo } from 'react';
import { User } from '../types';

interface ContestProps {
  user: User;
  students: User[];
  onBack: () => void;
}

export const Contest: React.FC<ContestProps> = ({ user, students, onBack }) => {
  // Maratonun 3. günündeyiz varsayıyoruz
  const contestDay = 3; 

  const leaderboard = useMemo(() => {
    return [...students].sort((a, b) => b.completedTasks - a.completedTasks);
  }, [students]);

  const userRank = leaderboard.findIndex(s => s.id === user.id) + 1;
  const personAbove = userRank > 1 ? leaderboard[userRank - 2] : null;
  const diffAbove = personAbove ? personAbove.completedTasks - user.completedTasks : 0;

  const getRankBadge = (rank: number) => {
      if (rank === 1) return { icon: 'workspace_premium', color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Şampiyon' };
      if (rank === 2) return { icon: 'military_tech', color: 'text-slate-300', bg: 'bg-slate-300/10', label: 'Efsane' };
      if (rank === 3) return { icon: 'military_tech', color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Yıldız' };
      return { icon: 'stars', color: 'text-slate-500', bg: 'bg-slate-800', label: 'Elit' };
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col relative overflow-hidden font-display">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent pointer-events-none"></div>
      
      <header className="relative z-20 p-6 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-[#0F172A]/40">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 active:scale-90"><span className="material-symbols-outlined">arrow_back</span></button>
        <div className="text-center">
            <h1 className="text-xl font-black italic tracking-tighter text-tg-blue">SORU MARATONU</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">10 Günlük Büyük Yarış • Sezon 4.2</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-tg-blue/10 flex items-center justify-center text-tg-blue border border-tg-blue/20">
          <span className="material-symbols-outlined">emoji_events</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 relative z-10 pb-32">
        
        {/* Status Panel */}
        <section className="bg-gradient-to-br from-red-600/10 to-black p-6 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in slide-in-from-top">
             <div className="flex items-center justify-between mb-6">
                 <div>
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">SIRALAMADAKİ YERİN</p>
                    <h2 className="text-2xl font-black italic tracking-tighter">#{userRank} / {leaderboard.length}</h2>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">GÜN</p>
                    <p className="text-2xl font-black text-white italic">{contestDay}/10</p>
                 </div>
             </div>

             <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                 <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black text-slate-400 uppercase italic">HEDEFE KALAN SORU</p>
                     <p className="text-lg font-black text-red-500">+{diffAbove + 1}</p>
                 </div>
                 <div className="h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                     <div className="h-full bg-red-500 shadow-glow" style={{ width: `${Math.min(100, (user.completedTasks / (personAbove?.completedTasks || 1)) * 100)}%` }}></div>
                 </div>
             </div>
        </section>

        {/* 10 Day Timeline */}
        <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">MARATON TAKVİMİ</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(day => {
                    const isPassed = day < contestDay;
                    const isToday = day === contestDay;
                    return (
                        <div key={day} className={`min-w-[70px] h-24 rounded-3xl flex flex-col items-center justify-center border-2 transition-all ${
                            isPassed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                            isToday ? 'bg-tg-blue border-white text-white shadow-glow scale-105 z-10' :
                            'bg-white/5 border-white/5 text-slate-600'
                        }`}>
                            <span className="text-[8px] font-black uppercase">GÜN</span>
                            <span className="text-2xl font-black italic">{day}</span>
                            {isPassed && <span className="material-symbols-outlined text-xs mt-1">check_circle</span>}
                        </div>
                    );
                })}
            </div>
        </section>

        {/* Leaderboard */}
        <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">LİDERLİK KÜRSÜSÜ</h3>
             <div className="space-y-3">
                 {leaderboard.map((student, idx) => {
                     const rank = idx + 1;
                     const badge = getRankBadge(rank);
                     const isMe = student.id === user.id;

                     return (
                         <div 
                            key={student.id} 
                            className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all ${
                                isMe ? 'bg-tg-blue/10 border-tg-blue shadow-glow' : 'bg-black/20 border-white/5'
                            }`}
                         >
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${badge.bg}`}>
                                 <span className={`material-symbols-outlined text-3xl ${badge.color}`}>{rank <= 3 ? badge.icon : ''}</span>
                                 {rank > 3 && <span className="text-xl font-black italic text-slate-600">#{rank}</span>}
                             </div>

                             <div className="flex-1">
                                 <h4 className={`font-black italic text-sm ${isMe ? 'text-tg-blue' : 'text-white'}`}>{student.name}</h4>
                                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{student.className || 'Focus Elite'}</p>
                             </div>

                             <div className="text-right">
                                 <div className="text-lg font-black italic">{student.completedTasks}</div>
                                 <div className="text-[8px] text-slate-500 font-black uppercase">SORU</div>
                             </div>
                         </div>
                     );
                 })}
             </div>
        </section>
      </div>

      {/* Floating Info */}
      <div className="fixed bottom-24 left-6 right-6 z-30 bg-[#1E293B]/90 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-tg-blue/20 flex items-center justify-center text-tg-blue"><span className="material-symbols-outlined">trending_up</span></div>
                <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">HEDEFE MESAFE</p>
                    <p className="text-sm font-black italic">#{Math.max(1, userRank - 1)} İçin {diffAbove + 1} Soru</p>
                </div>
            </div>
            <button onClick={onBack} className="bg-white text-black text-[10px] font-black px-6 py-3 rounded-2xl active:scale-95 transition-transform uppercase italic tracking-tighter">ÇALIŞ</button>
      </div>
    </div>
  );
};
