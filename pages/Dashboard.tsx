import React, { useState, useEffect } from 'react';
import { Task, User, ViewState, Exam } from '../types';
import { askAssistant } from '../services/geminiService';

interface DashboardProps {
  user: User;
  tasks: Task[];
  exams: Exam[];
  onTaskToggle: (taskId: string) => void;
  onChangeView: (view: ViewState) => void;
  onSpendCoins: (amount: number) => boolean;
  onUpdateExamScore: (examId: string, score: number) => void;
  onBuyDiamonds: (amount: number) => boolean;
  onExchange: (diamondCost: number, coinReward: number) => boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    user, tasks, exams, onChangeView, onSpendCoins, onUpdateExamScore, onBuyDiamonds, onExchange
}) => {
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [shopTab, setShopTab] = useState<'buy' | 'exchange'>('buy');
  
  // Timer States
  const [timerText, setTimerText] = useState('');
  const [timerLabel, setTimerLabel] = useState('');

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');

  // Calculate Rank (Matches logic in Profile.tsx)
  const getRank = () => {
      const t = user.completedTasks;
      if (t > 100) return { title: 'Efsane', color: 'bg-gradient-to-r from-purple-600 to-pink-600', icon: 'military_tech' };
      if (t > 50) return { title: 'Usta', color: 'bg-gradient-to-r from-yellow-500 to-orange-600', icon: 'workspace_premium' };
      if (t > 20) return { title: 'Kalfa', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', icon: 'handyman' };
      if (t > 5) return { title: 'Çırak', color: 'bg-gradient-to-r from-green-500 to-emerald-600', icon: 'build' };
      return { title: 'Çaylak', color: 'bg-slate-500', icon: 'school' };
  };
  const rank = getRank();

  const handleAsk = async () => {
    if (!assistantQuery.trim()) return;
    const COST = 20;
    const canAfford = onSpendCoins(COST);
    if (!canAfford) {
        setAssistantResponse("Yetersiz Jeton! Günlük bonusunu topla.");
        return;
    }
    setLoading(true);
    setAssistantResponse('');
    const answer = await askAssistant(assistantQuery);
    setAssistantResponse(answer);
    setLoading(false);
  };

  const handleScoreSubmit = () => {
      if (selectedExamId && scoreInput) {
          onUpdateExamScore(selectedExamId, Number(scoreInput));
          setSelectedExamId(null);
          setScoreInput('');
      }
  };

  const handleBuyDiamondPack = (amount: number, price: number) => {
      const confirmed = window.confirm(`${amount} Elmas almak için ${price} TL ödeme yapılsın mı? (Simülasyon)`);
      if(confirmed) {
          onBuyDiamonds(amount);
          alert("Satın alma başarılı!");
      }
  };

  const handleExchangePack = (cost: number, reward: number) => {
      if(onExchange(cost, reward)) {
          alert("Takas Başarılı!");
      } else {
          alert("Yetersiz Elmas!");
      }
  };

  const activeTask = tasks.find(t => t.type === 'class' && !t.completed);
  const nextTask = !activeTask ? tasks.find(t => t.type === 'class' && !t.completed) : null;

  useEffect(() => {
    const targetTask = activeTask || nextTask;
    if (!targetTask) {
        setTimerText(''); setTimerLabel(''); return;
    }
    const calculateTime = () => {
        const now = new Date();
        const [sH, sM] = targetTask.startTime.split(':').map(Number);
        const [eH, eM] = targetTask.endTime.split(':').map(Number);
        const start = new Date(); start.setHours(sH, sM, 0, 0);
        const end = new Date(); end.setHours(eH, eM, 0, 0);

        if (now < start) {
            setTimerLabel('Başlamasına');
            const diff = start.getTime() - now.getTime();
            return `${Math.floor(diff / 60000)} dk ${Math.floor((diff % 60000) / 1000)} sn`;
        } else if (now >= start && now < end) {
            setTimerLabel('Bitişine');
            const diff = end.getTime() - now.getTime();
            return `${Math.floor(diff / 60000)} dk ${Math.floor((diff % 60000) / 1000)} sn`;
        } else {
            return 'Bitti';
        }
    };
    setTimerText(calculateTime());
    const interval = setInterval(() => setTimerText(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [activeTask, nextTask]);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32 relative">
      
      {/* SHOP MODAL */}
      {showShop && (
          <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
              <div className="bg-[#1E293B] w-full max-w-sm rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="p-4 bg-slate-900 border-b border-gray-700 flex justify-between items-center">
                       <h3 className="text-white font-bold text-lg">Mağaza</h3>
                       <button onClick={() => setShowShop(false)}><span className="material-symbols-outlined text-slate-400">close</span></button>
                  </div>
                  <div className="flex p-2 bg-slate-900 gap-2">
                      <button onClick={() => setShopTab('buy')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${shopTab === 'buy' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Elmas Al (TL)</button>
                      <button onClick={() => setShopTab('exchange')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${shopTab === 'exchange' ? 'bg-yellow-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Jeton Al (💎)</button>
                  </div>
                  <div className="p-4 overflow-y-auto no-scrollbar grid gap-3">
                      {shopTab === 'buy' ? (
                          <>
                             {[
                                 { amount: 100, price: 20 },
                                 { amount: 200, price: 50 },
                                 { amount: 500, price: 150 },
                                 { amount: 1000, price: 300, popular: true }
                             ].map((pack, i) => (
                                 <button key={i} onClick={() => handleBuyDiamondPack(pack.amount, pack.price)} className={`flex items-center justify-between p-4 rounded-xl border bg-slate-800 ${pack.popular ? 'border-cyan-500/50' : 'border-slate-700'}`}>
                                     <div className="flex items-center gap-3">
                                         <span className="text-2xl">💎</span>
                                         <div className="text-left">
                                             <p className="text-white font-bold">{pack.amount} Elmas</p>
                                         </div>
                                     </div>
                                     <span className="bg-white text-slate-900 px-3 py-1 rounded-full text-xs font-bold">{pack.price} TL</span>
                                 </button>
                             ))}
                          </>
                      ) : (
                          <>
                            <div className="p-3 bg-yellow-500/10 rounded-xl mb-2 text-center border border-yellow-500/20">
                                <p className="text-yellow-500 text-xs">Mevcut Elmasın: <span className="font-bold text-lg">{user.diamonds}</span></p>
                            </div>
                            {[
                                { coins: 500, cost: 10 },
                                { coins: 1500, cost: 25 },
                                { coins: 5000, cost: 75, best: true }
                            ].map((pack, i) => (
                                <button key={i} onClick={() => handleExchangePack(pack.cost, pack.coins)} className={`flex items-center justify-between p-4 rounded-xl border bg-slate-800 ${pack.best ? 'border-yellow-500/50' : 'border-slate-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🪙</span>
                                        <div className="text-left">
                                            <p className="text-white font-bold">{pack.coins} Jeton</p>
                                        </div>
                                    </div>
                                    <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        {pack.cost} 💎
                                    </span>
                                </button>
                            ))}
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 pb-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-800/50">
        <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onChangeView(ViewState.PROFILE)}
        >
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20 overflow-hidden">
             {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : user.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">{user.schoolNumber || 'Öğrenci'}</span>
            <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold leading-tight text-slate-900 dark:text-white truncate max-w-[80px]">{user.name}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white ${rank.color}`}>{rank.title}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
           <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
               <span className="text-base">🪙</span>
               <span className="text-xs font-bold text-yellow-500">{user.coins}</span>
           </div>
           <div className="flex items-center gap-1 bg-cyan-400/10 pl-2 pr-1 py-1 rounded-full border border-cyan-400/20">
               <span className="text-base">💎</span>
               <span className="text-xs font-bold text-cyan-400 mr-1">{user.diamonds}</span>
               <button onClick={() => setShowShop(true)} className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-white">
                   <span className="material-symbols-outlined text-[14px] font-bold">shopping_cart</span>
               </button>
           </div>
        </div>
      </div>

       {/* Floating AI */}
       <div className="fixed bottom-24 right-4 z-50">
           {showAssistant && (
               <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 origin-bottom-right">
                   <div className="p-4 bg-primary text-white flex justify-between items-center">
                       <h3 className="font-bold flex items-center gap-2">AI Asistan</h3>
                       <button onClick={() => setShowAssistant(false)}><span className="material-symbols-outlined text-sm">close</span></button>
                   </div>
                   <div className="p-4">
                       <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-300 mb-3 min-h-[60px]">
                           {assistantResponse || "Merhaba! Nasıl yardımcı olabilirim?"}
                       </div>
                       <div className="flex gap-2">
                           <input value={assistantQuery} onChange={(e) => setAssistantQuery(e.target.value)} placeholder="Soru sor... (20 Jeton)" className="flex-1 rounded-lg border dark:bg-slate-950 p-2 text-sm" />
                           <button onClick={handleAsk} disabled={loading} className="bg-primary text-white px-3 py-2 rounded-lg text-xs font-bold">{loading ? '...' : 'Sor'}</button>
                       </div>
                   </div>
               </div>
           )}
           <button onClick={() => setShowAssistant(!showAssistant)} className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
             <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
           </button>
       </div>

      {/* Main Content */}
      <div className="px-4 py-4 space-y-6">
         
         {/* Daily Bonus Card */}
         <div onClick={() => onChangeView(ViewState.DAILY_BONUS)} className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 shadow-lg shadow-orange-500/20 text-white flex items-center justify-between cursor-pointer active:scale-95 transition-transform">
             <div>
                 <h3 className="font-bold text-lg">Günlük Ödül</h3>
                 <p className="text-xs text-orange-100">Seriyi bozma, kazan!</p>
             </div>
             <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                 <span className="text-xl">🎁</span>
                 <span className="font-bold text-sm">Giriş Yap</span>
             </div>
         </div>

         {/* AI Solver & Tools Row */}
         <div className="flex gap-4">
            <button 
                onClick={() => onChangeView(ViewState.AI_SOLVER)}
                className="flex-1 bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-2xl shadow-lg shadow-indigo-500/20 text-white flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-3xl">center_focus_strong</span>
                <span className="font-bold text-sm">AI Soru Çözücü</span>
            </button>
            <button 
                onClick={() => onChangeView(ViewState.AI_TEST)}
                className="flex-1 bg-gradient-to-br from-teal-500 to-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-500/20 text-white flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined text-3xl">quiz</span>
                <span className="font-bold text-sm">Test Oluştur</span>
            </button>
         </div>

         {/* Active Lesson Status */}
         <div>
            <h2 className="text-[14px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 pl-1">Ders Durumu</h2>
            {timerText ? (
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${timerLabel === 'Bitişine' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{timerLabel}</p>
                    <div className="font-mono text-4xl font-bold text-slate-900 dark:text-white tracking-tighter mb-2">{timerText}</div>
                    <p className="font-bold text-primary text-lg">{(activeTask || nextTask)?.title}</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 text-center text-slate-500 text-sm">
                    Şu an aktif ders yok.
                </div>
            )}
         </div>

         {/* Exam/Score Entry & List Section */}
         <div>
            <div className="flex justify-between items-end mb-3 px-1">
                 <h2 className="text-[14px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Notlarım & Sınavlar</h2>
                 <button onClick={() => onChangeView(ViewState.ADD_EXAM)} className="text-primary text-xs font-bold bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span> Ekle
                </button>
            </div>
            
            <div className="flex flex-col gap-3">
                {exams.length === 0 && <div className="text-center py-8 bg-gray-50 dark:bg-card-dark rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-500">Henüz not veya sınav eklenmedi.</div>}
                {exams.map(exam => {
                    const isPassed = (exam.actualScore || 0) >= 50;
                    const typeLabel = exam.type === 'written' ? 'Yazılı' : exam.type === 'performance' ? 'Performans' : 'Proje';
                    const typeColor = exam.type === 'written' ? 'bg-blue-500' : exam.type === 'performance' ? 'bg-purple-500' : 'bg-pink-500';

                    return (
                        <div key={exam.id} onClick={() => setSelectedExamId(exam.id)} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/50 transition-colors cursor-pointer flex justify-between items-center group">
                            <div className="flex gap-3 items-center">
                                <div className={`w-10 h-10 rounded-lg ${typeColor} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-${typeColor.split('-')[1]}-500 font-bold text-xs uppercase`}>
                                    {typeLabel.substring(0,3)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{exam.subject}</h4>
                                    <p className="text-[10px] text-slate-400">{exam.date}</p>
                                </div>
                            </div>
                            
                            {exam.actualScore ? (
                                <div className={`text-xl font-black ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                                    {exam.actualScore}
                                </div>
                            ) : (
                                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-slate-400 group-hover:text-primary transition-colors">
                                    Not Gir
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
         </div>
         
         {selectedExamId && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
              <div className="bg-[#1E293B] w-full max-w-xs p-6 rounded-2xl border border-gray-700 shadow-2xl animate-in zoom-in-95">
                  <h3 className="text-white font-bold text-lg mb-2">Not Girişi</h3>
                  <p className="text-slate-400 text-xs mb-4">Bu sınav/ödevden kaç aldın?</p>
                  <input type="number" value={scoreInput} onChange={(e) => setScoreInput(e.target.value)} placeholder="0-100" className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 text-white text-center font-bold text-xl mb-4 focus:ring-2 focus:ring-primary outline-none" />
                  <div className="flex gap-2">
                      <button onClick={() => setSelectedExamId(null)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-white/5 rounded-lg transition-colors">İptal</button>
                      <button onClick={handleScoreSubmit} className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-colors">Kaydet</button>
                  </div>
              </div>
          </div>
         )}

      </div>
    </div>
  );
};
