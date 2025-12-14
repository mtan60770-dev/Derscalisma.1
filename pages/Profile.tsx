import React, { useRef, useState } from 'react';
import { User, Exam, ViewState, Goal } from '../types';

interface ProfileProps {
  user: User;
  exams: Exam[];
  onBack: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onChangeView: (view: ViewState) => void;
  onBuyFrame: (frameId: string, cost: number) => boolean;
  onEquipFrame: (frameId: string) => void;
  onLogout: () => void;
}

// ... (Frame Generation code remains the same as previous step, re-including for completeness)
const generateFrames = () => {
    const frames = [];
    frames.push({ id: 'frame_0', name: 'Çerçevesiz', type: 'basic', cost: 0, currency: 'coin', style: 'border-0' });
    const colors = ['border-red-500', 'border-blue-500', 'border-green-500', 'border-yellow-500', 'border-purple-500', 'border-pink-500', 'border-indigo-500', 'border-orange-500', 'border-teal-500', 'border-gray-500'];
    colors.forEach((color, i) => { frames.push({ id: `frame_${i+1}`, name: `Renk ${i+1}`, type: 'basic', cost: 500, currency: 'coin', style: `border-4 ${color}` }); });
    const gradients = ['bg-gradient-to-r from-pink-500 to-violet-500', 'bg-gradient-to-r from-cyan-500 to-blue-500', 'bg-gradient-to-r from-emerald-500 to-lime-500', 'bg-gradient-to-r from-orange-500 to-red-500', 'bg-gradient-to-tr from-fuchsia-500 to-purple-600', 'bg-gradient-to-br from-yellow-400 to-orange-600', 'bg-gradient-to-tl from-indigo-500 to-cyan-400', 'bg-gradient-to-bl from-rose-400 to-red-500', 'bg-gradient-to-r from-slate-900 to-slate-700', 'bg-gradient-to-r from-amber-200 to-yellow-500'];
    gradients.forEach((grad, i) => { frames.push({ id: `frame_${i+11}`, name: `Gradyan ${i+1}`, type: 'gradient', cost: 50, currency: 'diamond', style: `p-1.5 ${grad}` }); });
    const neons = ['shadow-[0_0_15px_rgba(239,68,68,0.8)] border-red-500', 'shadow-[0_0_15px_rgba(59,130,246,0.8)] border-blue-500', 'shadow-[0_0_15px_rgba(34,197,94,0.8)] border-green-500', 'shadow-[0_0_15px_rgba(234,179,8,0.8)] border-yellow-500', 'shadow-[0_0_15px_rgba(168,85,247,0.8)] border-purple-500', 'shadow-[0_0_20px_#fff] border-white', 'shadow-[0_0_15px_cyan] border-cyan-400', 'shadow-[0_0_15px_magenta] border-fuchsia-500', 'shadow-[0_0_15px_orange] border-orange-500', 'shadow-[0_0_20px_rgba(99,102,241,1)] border-indigo-500'];
    neons.forEach((neon, i) => { frames.push({ id: `frame_${i+21}`, name: `Neon ${i+1}`, type: 'neon', cost: 100, currency: 'diamond', style: `border-[3px] ${neon}` }); });
    const patterns = ['border-4 border-dashed border-white', 'border-4 border-dotted border-yellow-400', 'border-double border-8 border-blue-500', 'p-1 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-yellow-500 via-purple-500 to-blue-500', 'p-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-200 via-gray-400 to-gray-600', 'border-[6px] border-t-red-500 border-r-blue-500 border-b-green-500 border-l-yellow-500', 'ring-4 ring-offset-4 ring-offset-black ring-indigo-500', 'border-4 border-indigo-500 rounded-none', 'border-4 border-white outline outline-4 outline-purple-500', 'p-1.5 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] bg-yellow-500'];
    patterns.forEach((pat, i) => { frames.push({ id: `frame_${i+31}`, name: `Özel ${i+1}`, type: 'epic', cost: 250, currency: 'diamond', style: `${pat}` }); });
    const legends = [{ name: 'Altın Halka', style: 'p-[3px] bg-gradient-to-r from-yellow-400 via-yellow-100 to-yellow-600 animate-spin-slow rounded-full' }, { name: 'Gökkuşağı', style: 'p-[3px] bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-spin rounded-full' }, { name: 'Matriks', style: 'border-4 border-green-500 shadow-[0_0_20px_green] animate-pulse' }, { name: 'Kalp Atışı', style: 'border-4 border-red-500 animate-ping' }, { name: 'Buz Ateşi', style: 'p-[3px] bg-gradient-to-br from-blue-400 to-white animate-pulse shadow-[0_0_30px_blue]' }, { name: 'Kozmik', style: 'p-[3px] bg-gradient-to-tr from-purple-900 via-fuchsia-500 to-black animate-spin-slow' }, { name: 'Lav', style: 'border-4 border-orange-600 shadow-[0_0_20px_orange] animate-bounce' }, { name: 'Hayalet', style: 'border-4 border-white/50 shadow-[0_0_20px_white] animate-pulse opacity-80' }, { name: 'Kraliyet', style: 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-purple-900 border-4 border-purple-900' }, { name: 'Zaman', style: 'border-4 border-dashed border-white animate-spin-slow' }];
    legends.forEach((leg, i) => { frames.push({ id: `frame_${i+41}`, name: leg.name, type: 'legendary', cost: 500, currency: 'diamond', style: leg.style }); });
    return frames;
};
const ALL_FRAMES = generateFrames();

// Achievements Data
const ACHIEVEMENTS = [
    { id: 'newbie', title: 'Yeni Başlayan', desc: 'İlk görevini tamamla', icon: 'hiking', condition: (u: User) => u.completedTasks >= 1 },
    { id: 'worker', title: 'Çalışkan', desc: '10 görev tamamla', icon: 'engineering', condition: (u: User) => u.completedTasks >= 10 },
    { id: 'expert', title: 'Uzman', desc: '50 görev tamamla', icon: 'psychology', condition: (u: User) => u.completedTasks >= 50 },
    { id: 'rich', title: 'Zengin', desc: '1000 Jeton biriktir', icon: 'savings', condition: (u: User) => u.coins >= 1000 },
    { id: 'diamond', title: 'Elmas Avcısı', desc: '100 Elmas biriktir', icon: 'diamond', condition: (u: User) => u.diamonds >= 100 },
    { id: 'loyal', title: 'Sadık', desc: '7 gün seri yap', icon: 'calendar_month', condition: (u: User) => u.streak >= 7 },
];

export const Profile: React.FC<ProfileProps> = ({ user, exams, onBack, onUpdateUser, onChangeView, onBuyFrame, onEquipFrame, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showFrameShop, setShowFrameShop] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [showHelp, setShowHelp] = useState(false); // Help Modal State
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [feedbackText, setFeedbackText] = useState('');
  
  // Goals State
  const [newGoal, setNewGoal] = useState('');

  const friends = ['Ahmet Yılmaz', 'Ayşe Demir', 'Mehmet Can'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateUser({ avatarUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveProfile = () => {
    onUpdateUser({ name: editName, email: editEmail });
    setIsEditing(false);
  };

  const handleFramePurchase = (frame: any) => {
      if (user.ownedFrames.includes(frame.id)) {
          onEquipFrame(frame.id);
      } else {
          const canAfford = frame.currency === 'diamond' ? user.diamonds >= frame.cost : user.coins >= frame.cost;
          const currencyName = frame.currency === 'diamond' ? 'Elmas' : 'Jeton';
          if (canAfford) {
              const confirm = window.confirm(`${frame.name} çerçevesini ${frame.cost} ${currencyName} karşılığında almak istiyor musun?`);
              if (confirm) onBuyFrame(frame.id, frame.cost);
          } else {
              alert(`Yetersiz ${currencyName}!`);
          }
      }
  };

  const handleSendGift = (friendName: string) => {
      if (user.coins >= 100) {
          if(window.confirm(`${friendName} kişisine 100 Jeton hediye gönderilsin mi?`)) {
              onUpdateUser({ coins: user.coins - 100 });
              alert("Hediye gönderildi!");
          }
      } else {
          alert("Yetersiz Jeton!");
      }
  };

  const handleSendFeedback = () => {
      if(!feedbackText.trim()) return;
      alert("Geri bildiriminiz için teşekkürler! Ekibimiz en kısa sürede inceleyecektir.");
      setFeedbackText('');
      setShowHelp(false);
  };

  const handleAddGoal = () => {
      if (!newGoal.trim()) return;
      const goal: Goal = {
          id: `goal-${Date.now()}`,
          text: newGoal,
          completed: false
      };
      const updatedGoals = user.goals ? [...user.goals, goal] : [goal];
      onUpdateUser({ goals: updatedGoals });
      setNewGoal('');
  };

  const handleToggleGoal = (id: string) => {
      const updatedGoals = user.goals?.map(g => g.id === id ? { ...g, completed: !g.completed } : g) || [];
      onUpdateUser({ goals: updatedGoals });
  };

  const handleDeleteGoal = (id: string) => {
      const updatedGoals = user.goals?.filter(g => g.id !== id) || [];
      onUpdateUser({ goals: updatedGoals });
  }

  // Rank Logic
  const getRank = () => {
      const t = user.completedTasks;
      if (t > 100) return { title: 'Efsane', color: 'from-purple-600 to-pink-600', icon: 'military_tech' };
      if (t > 50) return { title: 'Usta', color: 'from-yellow-500 to-orange-600', icon: 'workspace_premium' };
      if (t > 20) return { title: 'Kalfa', color: 'from-blue-500 to-cyan-500', icon: 'handyman' };
      if (t > 5) return { title: 'Çırak', color: 'from-green-500 to-emerald-600', icon: 'build' };
      return { title: 'Çaylak', color: 'from-slate-500 to-slate-700', icon: 'school' };
  };
  const rank = getRank();

  const averageTarget = exams.length > 0 
    ? Math.round(exams.reduce((acc, curr) => acc + curr.targetScore, 0) / exams.length) 
    : 0;

  const currentFrame = ALL_FRAMES.find(f => f.id === user.frameId) || ALL_FRAMES[0];

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24 overflow-x-hidden text-white relative">
      
      {/* Help Modal */}
      {showHelp && (
          <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in p-6">
             <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 border border-slate-700 max-h-[80vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="font-bold text-lg flex items-center gap-2">
                         <span className="material-symbols-outlined text-yellow-500">help</span> Yardım & Destek
                     </h2>
                     <button onClick={() => setShowHelp(false)}><span className="material-symbols-outlined">close</span></button>
                 </div>
                 
                 <div className="space-y-6">
                     <div>
                         <h3 className="text-sm font-bold text-slate-300 mb-2">Sıkça Sorulan Sorular</h3>
                         <div className="space-y-2 text-xs text-slate-400">
                             <details className="bg-slate-900 p-2 rounded-lg cursor-pointer">
                                 <summary className="font-bold">Nasıl Jeton kazanırım?</summary>
                                 <p className="mt-2 pl-2">Günlük giriş yaparak, görev tamamlayarak veya test çözerek kazanabilirsin.</p>
                             </details>
                             <details className="bg-slate-900 p-2 rounded-lg cursor-pointer">
                                 <summary className="font-bold">AI Asistan ücretli mi?</summary>
                                 <p className="mt-2 pl-2">Her soru için 20 Jeton harcanır. Jetonların biterse elmas ile takas edebilirsin.</p>
                             </details>
                         </div>
                     </div>

                     <div>
                         <h3 className="text-sm font-bold text-slate-300 mb-2">Geri Bildirim Gönder</h3>
                         <textarea 
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Öneri veya şikayetini yaz..." 
                            className="w-full h-24 bg-slate-900 rounded-xl border border-slate-700 p-3 text-sm text-white resize-none outline-none focus:border-blue-500"
                         />
                         <button onClick={handleSendFeedback} className="w-full mt-2 bg-blue-600 hover:bg-blue-500 py-2 rounded-xl text-sm font-bold transition-colors">Gönder</button>
                     </div>
                 </div>
             </div>
          </div>
      )}

      {/* Modals (Gift & Frame) */}
      {showGifts && (
          <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
             <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 border border-slate-700">
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="font-bold text-lg">Arkadaşına Hediye Et</h2>
                     <button onClick={() => setShowGifts(false)}><span className="material-symbols-outlined">close</span></button>
                 </div>
                 <div className="space-y-3">
                     {friends.map((friend, i) => (
                         <div key={i} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                                     {friend.charAt(0)}
                                 </div>
                                 <span className="font-bold">{friend}</span>
                             </div>
                             <button onClick={() => handleSendGift(friend)} className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                 100 🪙
                             </button>
                         </div>
                     ))}
                 </div>
             </div>
          </div>
      )}

      {showFrameShop && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
              <div className="p-4 bg-slate-900 border-b border-gray-800 flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-3">
                       <button onClick={() => setShowFrameShop(false)} className="p-2 rounded-full hover:bg-white/10">
                           <span className="material-symbols-outlined">arrow_back</span>
                       </button>
                       <div>
                           <h2 className="font-bold text-lg">Çerçeve Marketi</h2>
                           <p className="text-xs text-slate-400">Jeton ve Elmas ile al</p>
                       </div>
                  </div>
                  <div className="flex gap-2">
                       <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
                           <span>🪙</span>
                           <span className="font-bold text-yellow-500 text-xs">{user.coins}</span>
                       </div>
                       <div className="flex items-center gap-1 bg-cyan-900/50 px-2 py-1 rounded-full border border-cyan-500/30">
                           <span>💎</span>
                           <span className="font-bold text-cyan-400 text-xs">{user.diamonds}</span>
                       </div>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-4 pb-24">
                  {ALL_FRAMES.map((frame) => {
                      const isOwned = user.ownedFrames?.includes(frame.id);
                      const isEquipped = user.frameId === frame.id;
                      const currencyIcon = frame.currency === 'diamond' ? '💎' : '🪙';
                      return (
                          <button 
                            key={frame.id}
                            onClick={() => handleFramePurchase(frame)}
                            className={`relative flex flex-col items-center p-3 rounded-xl border transition-all ${isEquipped ? 'bg-indigo-900/40 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                          >
                              <div className="relative mb-2">
                                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${frame.style.includes('bg-') || frame.style.includes('p-') ? frame.style : ''}`}>
                                      <div className={`w-full h-full rounded-full bg-cover bg-center ${!frame.style.includes('bg-') && !frame.style.includes('p-') ? frame.style : ''} border-none`} style={{ backgroundImage: `url("${user.avatarUrl}")` }}></div>
                                  </div>
                                  {isEquipped && <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5"><span className="material-symbols-outlined text-[12px]">check</span></div>}
                              </div>
                              <p className="text-[10px] font-bold text-center truncate w-full mb-1">{frame.name}</p>
                              {isOwned ? (
                                  <span className="text-[10px] text-green-400 font-bold uppercase">{isEquipped ? 'Takılı' : 'Sahipsin'}</span>
                              ) : (
                                  <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded text-[10px]">
                                      <span>{currencyIcon}</span>
                                      <span>{frame.cost}</span>
                                  </div>
                              )}
                          </button>
                      );
                  })}
              </div>
          </div>
      )}

      {/* Profile Header */}
      <div className="sticky top-0 z-50 p-4 flex items-center justify-between backdrop-blur-md bg-opacity-20 bg-[#0F172A]">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-white">Profil & Gelişim</h1>
        <div className="flex items-center gap-2">
            {isEditing ? (
                <button onClick={handleSaveProfile} className="text-blue-400 font-bold text-sm">Bitti</button>
            ) : (
                <button onClick={() => setIsEditing(true)} className="text-blue-400 font-bold text-sm">Düzenle</button>
            )}
            <button onClick={onLogout} className="text-red-400 font-bold text-sm ml-2 bg-red-500/10 p-2 rounded-lg hover:bg-red-500/20">
                <span className="material-symbols-outlined text-sm">logout</span>
            </button>
        </div>
      </div>

      <div className="p-6 flex flex-col items-center relative z-10">
        
        {/* Avatar & Basic Info */}
        <div className="relative group mb-4">
          <div 
             onClick={() => fileInputRef.current?.click()}
             className={`w-28 h-28 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${currentFrame.style.includes('bg-') || currentFrame.style.includes('p-') ? currentFrame.style : ''}`}
          >
               <div 
                  className={`w-full h-full rounded-full bg-cover bg-center shadow-2xl ${!currentFrame.style.includes('bg-') && !currentFrame.style.includes('p-') ? currentFrame.style : ''}`}
                  style={{ backgroundImage: `url("${user.avatarUrl}")` }}
               ></div>
          </div>
          <div className="absolute -bottom-2 -right-2 flex gap-2">
               <button onClick={() => setShowFrameShop(true)} className="bg-cyan-600 text-white p-2 rounded-full shadow-lg border-2 border-[#0F172A] hover:bg-cyan-500 transition-colors">
                <span className="material-symbols-outlined text-[16px]">palette</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-[#0F172A] hover:bg-blue-500 transition-colors">
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="text-center mb-6">
             {isEditing ? (
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-white/10 text-white text-center rounded-lg p-2 font-bold text-xl outline-none border border-transparent focus:border-blue-500 mb-2" />
             ) : (
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                        {user.name}
                        {user.frameId && user.frameId !== 'frame_0' && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/30">VIP</span>}
                    </h2>
                    {/* Dynamic Rank Badge */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${rank.color} mt-1 shadow-lg`}>
                        <span className="material-symbols-outlined text-[12px]">{rank.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide">{rank.title}</span>
                    </div>
                </div>
             )}
             <p className="text-slate-400 text-sm mt-2">{user.schoolNumber} | {user.className}</p>
        </div>

        {/* 1. Achievements Section */}
        <div className="w-full mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">emoji_events</span> Başarı Rozetleri
            </h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {ACHIEVEMENTS.map(ach => {
                    const isUnlocked = ach.condition(user);
                    return (
                        <div key={ach.id} className={`flex-shrink-0 w-24 p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${isUnlocked ? 'bg-gradient-to-b from-slate-700 to-slate-800 border-yellow-500/30' : 'bg-slate-800/50 border-slate-700 grayscale opacity-60'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${isUnlocked ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-slate-700 text-slate-500'}`}>
                                <span className="material-symbols-outlined">{ach.icon}</span>
                            </div>
                            <p className="text-[10px] font-bold text-white leading-tight">{ach.title}</p>
                            <p className="text-[8px] text-slate-400 leading-tight">{ach.desc}</p>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* 2. Activity Chart (CSS Bar Chart) */}
        <div className="w-full mb-6 bg-[#1E293B] p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-300">Haftalık Aktivite</h3>
                <span className="text-xs text-slate-500">Son 7 Gün</span>
            </div>
            <div className="flex items-end justify-between h-24 gap-2">
                {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((day, i) => {
                    // Mock data logic: Random height or based on something real if available
                    // For demo, we use a pseudo-random height based on day index
                    const height = [40, 70, 30, 85, 50, 90, 20][i]; 
                    return (
                        <div key={day} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="w-full bg-slate-700 rounded-t-sm relative overflow-hidden group-hover:bg-slate-600 transition-colors" style={{ height: `${height}%` }}>
                                <div className="absolute bottom-0 left-0 w-full bg-primary/80" style={{ height: '100%' }}></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold">{day}</span>
                        </div>
                    )
                })}
            </div>
        </div>

        {/* 3. Goals Section */}
        <div className="w-full mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">flag</span> Çalışma Hedefleri
            </h3>
            
            <div className="bg-[#1E293B] rounded-2xl p-1 mb-3 flex items-center">
                <input 
                    type="text" 
                    value={newGoal} 
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Yeni hedef ekle..." 
                    className="bg-transparent border-none text-white text-sm focus:ring-0 flex-1 px-4"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <button onClick={handleAddGoal} className="bg-primary text-white p-2 rounded-xl m-1 hover:bg-blue-600 transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                </button>
            </div>

            <div className="space-y-2">
                {user.goals && user.goals.length > 0 ? (
                    user.goals.map(goal => (
                        <div key={goal.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5 group">
                            <button 
                                onClick={() => handleToggleGoal(goal.id)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${goal.completed ? 'bg-green-500 border-green-500' : 'border-slate-500 hover:border-green-400'}`}
                            >
                                {goal.completed && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
                            </button>
                            <span className={`flex-1 text-sm ${goal.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{goal.text}</span>
                            <button onClick={() => handleDeleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity">
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-slate-600 text-xs italic">Henüz hedef eklemedin.</div>
                )}
            </div>
        </div>

        {/* 4. Stats Grid (Updated Design) */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
            <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 p-4 rounded-2xl border border-indigo-500/20">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Ortalama</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{averageTarget}</span>
                    <span className="text-xs text-slate-500">/100</span>
                </div>
                <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${averageTarget}%` }}></div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-orange-900/50 to-slate-900 p-4 rounded-2xl border border-orange-500/20">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Toplam Sınav</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{exams.length}</span>
                </div>
                 <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
                    <div className="bg-orange-500 h-full w-1/2"></div>
                </div>
            </div>
        </div>

        {/* 5. Menu Items */}
        <div className="w-full flex flex-col gap-2">
            <button onClick={() => setShowGifts(true)} className="flex items-center gap-4 p-4 bg-[#1E293B] rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-white group">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">card_giftcard</span>
                </div>
                <div className="flex-1 text-left">
                    <p className="font-bold text-sm">Hediye Gönder</p>
                </div>
                <span className="material-symbols-outlined text-slate-600">chevron_right</span>
            </button>

            <button onClick={() => setShowFrameShop(true)} className="flex items-center gap-4 p-4 bg-[#1E293B] rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-white group">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">palette</span>
                </div>
                <div className="flex-1 text-left">
                    <p className="font-bold text-sm">Çerçeve Marketi</p>
                </div>
                <span className="material-symbols-outlined text-slate-600">chevron_right</span>
            </button>

            <button onClick={() => onChangeView(ViewState.STUDENTS)} className="flex items-center gap-4 p-4 bg-[#1E293B] rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-white group">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">school</span>
                </div>
                <div className="flex-1 text-left">
                    <p className="font-bold text-sm">Öğrenci İşleri</p>
                </div>
                <span className="material-symbols-outlined text-slate-600">chevron_right</span>
            </button>

            {/* New Help Button */}
            <button onClick={() => setShowHelp(true)} className="flex items-center gap-4 p-4 bg-[#1E293B] rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-white group mt-1">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">help</span>
                </div>
                <div className="flex-1 text-left">
                    <p className="font-bold text-sm">Yardım & Geri Bildirim</p>
                </div>
                <span className="material-symbols-outlined text-slate-600">chevron_right</span>
            </button>
        </div>

      </div>
    </div>
  );
};