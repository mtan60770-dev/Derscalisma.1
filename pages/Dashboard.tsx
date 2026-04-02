
import React, { useState, useEffect, useMemo } from 'react';
import { Task, User, ViewState, Exam, Mission } from '../types';
import { streamAssistantResponse, checkContentModeration } from '../services/geminiService';
import Markdown from 'react-markdown';

const MISSION_POOL: Mission[] = [
    // 9. Sınıf Görevleri
    { id: 'm9_1', title: 'Hücre Yolculuğu', goal: 'Biyoloji testi çöz', reward: 50, icon: 'microscope', gradeRequirement: 9 },
    { id: 'm9_2', title: 'Denklem Avcısı', goal: 'Temel matematik testi', reward: 60, icon: 'calculate', gradeRequirement: 9 },
    // 10. Sınıf
    { id: 'm10_1', title: 'Newton Ustası', goal: 'Fizik hareket testi', reward: 70, icon: 'speed', gradeRequirement: 10 },
    { id: 'm10_2', title: 'Periyodik Gezgin', goal: 'Kimya element testi', reward: 65, icon: 'science', gradeRequirement: 10 },
    // 11. Sınıf
    { id: 'm11_1', title: 'Trigono-Star', goal: 'Trigonometri testi', reward: 80, icon: 'triangle', gradeRequirement: 11 },
    { id: 'm11_2', title: 'Edebiyat Gurusu', goal: 'Cumhuriyet dönemi testi', reward: 75, icon: 'menu_book', gradeRequirement: 11 },
    // 12. Sınıf
    { id: 'm12_1', title: 'Türev Canavarı', goal: 'Limit ve Türev testi', reward: 100, icon: 'show_chart', gradeRequirement: 12 },
    { id: 'm12_2', title: 'Atomun Kalbi', goal: 'Modern fizik testi', reward: 95, icon: 'atom', gradeRequirement: 12 },
    // Genel
    { id: 'mg_1', title: 'Odaklanma Ustası', goal: '30 dk Sessiz Çalış', reward: 40, icon: 'timer' },
    { id: 'mg_2', title: 'AI Kaşifi', goal: 'AI Solver kullan', reward: 30, icon: 'auto_fix_high' },
    { id: 'm40_marathon', title: '40 Günlük Maraton', goal: 'Günün görevini tamamla', reward: 100, icon: 'timer' },
    { id: 'm60_marathon', title: '60 Günlük Maraton', goal: 'Günün görevini tamamla', reward: 150, icon: 'workspace_premium' },
];

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
  onCompleteMission: (missionId: string, reward: number) => void;
  onViolation?: (reason: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    user, tasks, exams, onChangeView, onSpendCoins, onTaskToggle, onCompleteMission, onViolation
}) => {
  const [showAssistant, setShowAssistant] = useState(false);
  const [messages, setMessages] = useState<any[]>([{ id: '1', role: 'ai', text: 'v4.2 Titan Aktif! Sınıfına özel görevler seni bekliyor. 🚀' }]);
  const [assistantQuery, setAssistantQuery] = useState('');
  const [isModerating, setIsModerating] = useState(false);
  
  const dailyMissions = useMemo(() => {
    const gradeMissions = MISSION_POOL.filter(m => !m.gradeRequirement || m.gradeRequirement === user.grade);
    const day = new Date().getDate();
    const shuffled = [...gradeMissions].sort((a, b) => (a.id.charCodeAt(1) * day) % 7 - (b.id.charCodeAt(1) * day) % 7);
    return shuffled.slice(0, 3);
  }, [user.grade]);

  const handleStartMission = (mission: Mission) => {
      // Görevi başlatmak için AI Test sayfasına yönlendiririz
      // Test başarılı olunca coins verilecek
      onChangeView(ViewState.AI_TEST);
  };

  const handleAsk = async () => {
    if (!assistantQuery.trim() || isModerating) return;
    
    // AI Moderation Check
    if (user.isAiModerationEnabled) {
        setIsModerating(true);
        const aiCheck = await checkContentModeration(assistantQuery);
        setIsModerating(false);
        if (aiCheck.isViolation) {
            if (onViolation) onViolation(`Yapay Zeka Tespit Etti: ${aiCheck.reason} ("${assistantQuery}").`);
            setAssistantQuery('');
            return;
        }
    }

    const cost = user.isProActive ? 0 : 20;
    if (user.coins < cost) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Yetersiz Jeton! 🪙 Çözüm için 20 jetona ihtiyacın var." }]);
        return;
    }
    if (cost > 0) {
        onSpendCoins(cost);
    }

    const userMsg = { id: Date.now().toString(), role: 'user', text: assistantQuery };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setAssistantQuery('');
    
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '...' }]);
    
    try {
        const stream = streamAssistantResponse(updatedMessages);
        let fullText = "";
        for await (const chunk of stream) {
            fullText += chunk;
            setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: fullText } : msg));
        }
    } catch (e) {
        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: "Bağlantı hatası oluştu." } : msg));
    }
  };

  return (
    <div className="bg-background-dark min-h-screen pb-32 text-white overflow-x-hidden font-display">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-xl p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3" onClick={() => onChangeView(ViewState.PROFILE)}>
          <div className="relative">
            <div className={`w-12 h-12 rounded-full border-2 border-primary p-0.5 overflow-hidden bg-slate-800 ${user.isPrivacyModeEnabled ? 'blur-sm' : ''}`}>
                <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            </div>
            {user.isSecurityEnabled && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-background-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] text-white font-black">shield</span>
              </div>
            )}
          </div>
          <div>
            <h2 className={`text-sm font-black italic tracking-tighter uppercase leading-none ${user.isPrivacyModeEnabled ? 'blur-md select-none' : ''}`}>{user.name}</h2>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{user.grade}. SINIF</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <span className="text-xs">🪙</span>
                <span className="text-[10px] font-black text-yellow-500">{user.coins}</span>
            </div>
            <button onClick={() => onChangeView(ViewState.DAILY_BONUS)} className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                <span className="material-symbols-outlined text-lg">redeem</span>
            </button>
        </div>
      </div>

      <div className="p-6 space-y-8 animate-in fade-in duration-700">
         
         {/* Daily Goal Progress */}
         {user.isDailyGoalActive && (
             <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden">
                 <div className="flex justify-between items-center mb-4">
                     <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">GÜNLÜK HEDEF</h3>
                        <p className="text-lg font-black italic tracking-tighter uppercase">{user.completedTasks} / {user.dailyGoalTasks || 5} GÖREV</p>
                     </div>
                     <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">target</span>
                     </div>
                 </div>
                 <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-gradient-to-r from-primary to-tg-blue transition-all duration-1000" 
                        style={{ width: `${Math.min(((user.completedTasks || 0) / (user.dailyGoalTasks || 5)) * 100, 100)}%` }}
                     />
                 </div>
                 {user.completedTasks >= (user.dailyGoalTasks || 5) && (
                     <p className="mt-3 text-[9px] font-black text-emerald-500 uppercase italic animate-pulse">Hedefe Ulaşıldı! +50 Bonus Jeton Kazandın! 🏆</p>
                 )}
             </section>
         )}

         {/* Popularity Ranking Button */}
         <section className="px-2">
             <button 
                onClick={() => onChangeView(ViewState.POPULARITY_RANKING)}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 p-6 rounded-[2.5rem] flex items-center justify-between shadow-glow active:scale-95 transition-transform"
             >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-white">emoji_events</span>
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-black uppercase italic text-white">Popülerlik Sıralaması</h3>
                        <p className="text-[9px] text-white/80 font-bold uppercase">En popüler arkadaşları gör</p>
                    </div>
                </div>
                <span className="material-symbols-outlined text-white">arrow_forward</span>
             </button>
         </section>

         {/* Daily Missions */}
         <section className="space-y-4">
             <div className="flex justify-between items-end px-2">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">SINIFINA ÖZEL GÖREVLER <span className="text-primary ml-2 bg-primary/10 px-2 py-0.5 rounded-full">{user.completedMissionsToday?.length || 0}/{dailyMissions.length}</span></h3>
                 <span className="text-[8px] font-black text-tg-blue uppercase tracking-widest">GÜNCEL</span>
             </div>
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                 {dailyMissions.map(mission => {
                     const isCompleted = user.completedMissionsToday?.includes(mission.id);
                     return (
                         <div key={mission.id} className={`min-w-[220px] p-6 rounded-[2.5rem] border relative overflow-hidden group transition-all duration-500 ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 opacity-60' : 'bg-white/5 border-white/5'}`}>
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><span className="material-symbols-outlined text-4xl">{mission.icon}</span></div>
                             <h4 className="text-xs font-black uppercase italic mb-1 tracking-tighter">{mission.title}</h4>
                             <p className="text-[9px] text-slate-500 font-bold mb-4 h-6 leading-tight">{mission.goal}</p>
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                                     <span className="text-[10px] font-black text-yellow-500">+{mission.reward} 🪙</span>
                                 </div>
                                 {isCompleted ? (
                                     <span className="text-[9px] font-black text-emerald-500 uppercase italic">OK</span>
                                 ) : (
                                     <button 
                                        onClick={() => handleStartMission(mission)}
                                        className="bg-primary text-white text-[9px] font-black px-5 py-2 rounded-xl uppercase shadow-glow active:scale-95 transition-transform"
                                     >
                                         TESTİ ÇÖZ
                                     </button>
                                 )}
                             </div>
                         </div>
                     );
                 })}
             </div>
         </section>

         {/* Titan 20 Special Event Banner */}
         {Date.now() < new Date('2026-04-13T15:38:41Z').getTime() && (
            <section className="px-2 space-y-4">
                <div 
                    onClick={() => onChangeView(ViewState.SPECIAL_EVENT_20)}
                    className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-purple-600 to-indigo-800 p-8 shadow-2xl shadow-purple-900/40 group cursor-pointer active:scale-95 transition-all"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-purple-300 text-lg">rocket_launch</span>
                            <span className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">ÖZEL ETKİNLİK</span>
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-1">TITAN 20 CHALLENGE</h2>
                        <p className="text-[10px] font-black text-purple-200/60 tracking-widest border border-[#142649] p-1 rounded text-left no-underline">20 günlük meydan okuma</p>
                        
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex-1 h-1.5 bg-purple-950 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-purple-300" 
                                    style={{ width: `${((user.specialEventProgress20?.length || 0) / 20) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-purple-300">%{Math.round(((user.specialEventProgress20?.length || 0) / 20) * 100)}</span>
                        </div>
                    </div>
                    <span className="absolute -right-6 -bottom-6 material-symbols-outlined text-[120px] text-purple-400/10 rotate-12 group-hover:scale-110 transition-transform">
                        bolt
                    </span>
                </div>

                {/* Titan 40 Special Event Banner */}
                <div 
                    onClick={() => onChangeView(ViewState.SPECIAL_EVENT_40)}
                    className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-600 to-teal-800 p-8 shadow-2xl shadow-emerald-900/40 group cursor-pointer active:scale-95 transition-all"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-emerald-300 text-lg">workspace_premium</span>
                            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em]">ÖZEL ETKİNLİK</span>
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-1">TITAN 40 CHALLENGE</h2>
                        <p className="text-[10px] font-black text-emerald-200/60 uppercase tracking-widest border border-[#142649] p-1 rounded">40 Günlük Büyük Maraton</p>
                        
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex-1 h-1.5 bg-emerald-950 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-300" 
                                    style={{ width: `${((user.specialEventProgress40?.length || 0) / 40) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-emerald-300">%{Math.round(((user.specialEventProgress40?.length || 0) / 40) * 100)}</span>
                        </div>
                    </div>
                    <span className="absolute -right-6 -bottom-6 material-symbols-outlined text-[120px] text-emerald-400/10 rotate-12 group-hover:scale-110 transition-transform">
                        emoji_events
                    </span>
                </div>

                {/* Titan 60 Special Event Banner */}
                <div 
                    onClick={() => onChangeView(ViewState.SPECIAL_EVENT_60)}
                    className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-amber-600 to-orange-800 p-8 shadow-2xl shadow-amber-900/40 group cursor-pointer active:scale-95 transition-all"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-amber-300 text-lg">workspace_premium</span>
                            <span className="text-[10px] font-black text-amber-300 uppercase tracking-[0.2em]">ÖZEL ETKİNLİK</span>
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-1">TITAN 60 CHALLENGE</h2>
                        <p className="text-[10px] font-black text-amber-200/60 uppercase tracking-widest border border-[#142649] p-1 rounded">60 Günlük Büyük Maraton</p>
                        
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex-1 h-1.5 bg-amber-950 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-amber-300" 
                                    style={{ width: `${((user.specialEventProgress60?.length || 0) / 60) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-amber-300">%{Math.round(((user.specialEventProgress60?.length || 0) / 60) * 100)}</span>
                        </div>
                    </div>
                    <span className="absolute -right-6 -bottom-6 material-symbols-outlined text-[120px] text-amber-400/10 rotate-12 group-hover:scale-110 transition-transform">
                        emoji_events
                    </span>
                </div>
            </section>
         )}

         {/* Hero Action */}
         <div onClick={() => onChangeView(ViewState.AI_TEST)} className="bg-gradient-to-br from-tg-blue via-indigo-600 to-purple-700 p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden active:scale-95 transition-transform group cursor-pointer">
             <div className="absolute top-[-20%] right-[-10%] opacity-10 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[150px]">quiz</span></div>
             <div className="relative z-10">
                 <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-2">AI TEST ARENASI</h2>
                 <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Yapay Zeka ile Kendini Sına</p>
                 <button className="mt-6 bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase italic tracking-tighter">BAŞLA</button>
             </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onChangeView(ViewState.AI_SOLVER)} className="bg-[#1e293b] p-8 rounded-[3rem] border border-white/5 flex flex-col items-center gap-4 active:scale-95 transition-all">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-glow"><span className="material-symbols-outlined text-4xl">photo_camera</span></div>
                <span className="font-black text-[10px] uppercase tracking-widest italic">AI ÇÖZÜCÜ</span>
            </button>
            <button onClick={() => onChangeView(ViewState.AI_VIDEO)} className="bg-[#1e293b] p-8 rounded-[3rem] border border-white/5 flex flex-col items-center gap-4 active:scale-95 transition-all">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500"><span className="material-symbols-outlined text-4xl">play_circle</span></div>
                <span className="font-black text-[10px] uppercase tracking-widest italic">CINEMA</span>
            </button>
            <button onClick={() => onChangeView(ViewState.PAST_EXAMS)} className="col-span-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-6 rounded-[3rem] border border-emerald-500/30 flex items-center justify-between active:scale-95 transition-all group">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-glow">
                        <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                    </div>
                    <div className="text-left">
                        <h3 className="font-black text-sm uppercase italic">ÇIKMIŞ SORULAR</h3>
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1">PDF ARŞİVİ</p>
                    </div>
                </div>
                <span className="material-symbols-outlined text-emerald-500 group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </button>
         </div>
      </div>

      {/* AI Assistant FAB */}
      <button onClick={() => setShowAssistant(true)} className="fixed bottom-28 right-6 z-[90] w-16 h-16 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-glow border-4 border-white/10 active:scale-90 transition-transform">
         <span className="material-symbols-outlined text-3xl">auto_awesome</span>
      </button>

      {/* AI Assistant Panel */}
      {showAssistant && (
           <div className="fixed inset-x-0 bottom-0 top-12 z-[150] bg-background-dark flex flex-col animate-in slide-in-from-bottom duration-300 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10">
               {/* Drag Handle (Aşağı Yukarı İtme Çubuğu) */}
               <div className="w-full flex justify-center pt-4 pb-2 cursor-pointer" onClick={() => setShowAssistant(false)}>
                   <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
               </div>
               <header className="px-6 pb-4 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-primary">auto_awesome</span>
                       <h2 className="font-black text-sm uppercase italic">FOCUS AI KOÇ</h2>
                   </div>
                   <button onClick={() => setShowAssistant(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-sm">close</span></button>
               </header>
               <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                   {messages.map(msg => (
                       <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white/5 border border-white/5 text-slate-200 rounded-bl-none'}`}>
                               {msg.role === 'ai' ? (
                                   <div className="prose prose-invert prose-sm max-w-none">
                                       <Markdown>{msg.text}</Markdown>
                                   </div>
                               ) : (
                                   msg.text
                               )}
                           </div>
                       </div>
                   ))}
               </div>
               <div className="p-6 border-t border-white/5 flex gap-3">
                   <input 
                    value={assistantQuery} 
                    onChange={e => setAssistantQuery(e.target.value)} 
                    placeholder={user.isProActive ? "Ders hakkında bir soru sor... (ÜCRETSİZ)" : "Ders hakkında bir soru sor... (20 🪙)"} 
                    className="flex-1 bg-white/5 p-4 rounded-2xl outline-none text-sm font-bold border border-white/10" 
                    onKeyDown={e => e.key === 'Enter' && handleAsk()} 
                   />
                   <button onClick={handleAsk} disabled={isModerating} className={`w-14 h-14 ${isModerating ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary'} text-white rounded-2xl flex items-center justify-center shadow-glow`}>
                       <span className={`material-symbols-outlined ${isModerating ? 'animate-spin' : ''}`}>
                           {isModerating ? 'hourglass_empty' : 'send'}
                       </span>
                   </button>
               </div>
           </div>
      )}
    </div>
  );
};
