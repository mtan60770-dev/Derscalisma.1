
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Exam, ViewState, Badge } from '../types';
import { generateProfileAvatar } from '../services/geminiService';
import { RANKS, getRank, capitalize, FRAMES, LEVELS, getLevel } from '../constants';
import { LevelUpAnimation } from '../components/LevelUpAnimation';

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

const APP_VERSION = "4.3";
const APP_CODENAME = "TITAN";

const ALL_BADGES: Badge[] = [
    { id: 'b1', name: 'İlk Adım', icon: 'check_circle', color: 'text-indigo-400', conditionType: 'tasks', requirementValue: 10, description: '10 görev tamamla.', rewardCoins: 100 },
    { id: 'b2', name: 'İstikrar Ustası', icon: 'local_fire_department', color: 'text-orange-400', conditionType: 'streak', requirementValue: 7, description: '7 gün üst üste giriş yap.', rewardCoins: 200 },
    { id: 'b3', name: 'Zengin', icon: 'monetization_on', color: 'text-yellow-400', conditionType: 'coins', requirementValue: 1000, description: '1000 Focus Coin biriktir.', rewardCoins: 300 },
    { id: 'b4', name: 'Elmas Avcısı', icon: 'diamond', color: 'text-cyan-400', conditionType: 'diamonds', requirementValue: 50, description: '50 Elmas kazan.', rewardCoins: 500 },
    { id: 'b5', name: 'Siber Koruyucu', icon: 'admin_panel_settings', color: 'text-emerald-500', conditionType: 'security', requirementValue: 1, description: 'Güvenlik ve Gizlilik modunu aç.', rewardCoins: 150 },
    { id: 'b6', name: 'Soru Canavarı', icon: 'psychology', color: 'text-purple-400', conditionType: 'questions', requirementValue: 500, description: 'Toplam 500 soru çöz.', rewardCoins: 400 },
    { id: 'b7', name: 'Görev Ustası', icon: 'task_alt', color: 'text-blue-400', conditionType: 'tasks', requirementValue: 100, description: '100 görev tamamla.', rewardCoins: 500 },
    { id: 'b8', name: 'Efsanevi Seri', icon: 'whatshot', color: 'text-red-500', conditionType: 'streak', requirementValue: 30, description: '30 gün üst üste giriş yap.', rewardCoins: 1000 },
    { id: 'b9', name: 'Milyoner', icon: 'account_balance', color: 'text-yellow-500', conditionType: 'coins', requirementValue: 10000, description: '10000 Focus Coin biriktir.', rewardCoins: 2000 },
    { id: 'b10', name: 'Sınav Fatihi', icon: 'school', color: 'text-emerald-400', conditionType: 'questions', requirementValue: 2000, description: 'Toplam 2000 soru çöz.', rewardCoins: 2500 },
    { id: 'b11', name: 'Koleksiyoncu', icon: 'diamond', color: 'text-cyan-500', conditionType: 'diamonds', requirementValue: 200, description: '200 Elmas kazan.', rewardCoins: 1500 },
];

const checkBadgeCondition = (badge: Badge, user: User) => {
    if (badge.id === 'b5') return user.isSecurityEnabled && user.isPrivacyModeEnabled;
    
    const val = badge.requirementValue || badge.requiredTasks || 0;
    switch (badge.conditionType) {
        case 'tasks': return user.completedTasks >= val;
        case 'coins': return user.coins >= val;
        case 'streak': return user.streak >= val;
        case 'diamonds': return user.diamonds >= val;
        case 'security': return user.isSecurityEnabled && user.isPrivacyModeEnabled;
        case 'questions': return (user.solvedQuestions?.total || 0) >= val;
        default: return user.completedTasks >= val;
    }
};

const getBadgeProgress = (badge: Badge, user: User) => {
    if (badge.id === 'b5' || badge.conditionType === 'security') return (user.isSecurityEnabled && user.isPrivacyModeEnabled) ? 100 : 0;
    
    const val = badge.requirementValue || badge.requiredTasks || 1;
    let current = 0;
    switch (badge.conditionType) {
        case 'tasks': current = user.completedTasks; break;
        case 'coins': current = user.coins; break;
        case 'streak': current = user.streak; break;
        case 'diamonds': current = user.diamonds; break;
        case 'questions': current = user.solvedQuestions?.total || 0; break;
        default: current = user.completedTasks; break;
    }
    return Math.min(100, (current / val) * 100);
};

const getBadgeProgressText = (badge: Badge, user: User) => {
    if (badge.id === 'b5' || badge.conditionType === 'security') return (user.isSecurityEnabled && user.isPrivacyModeEnabled) ? '1 / 1' : '0 / 1';
    
    const val = badge.requirementValue || badge.requiredTasks || 1;
    let current = 0;
    switch (badge.conditionType) {
        case 'tasks': current = user.completedTasks; break;
        case 'coins': current = user.coins; break;
        case 'streak': current = user.streak; break;
        case 'diamonds': current = user.diamonds; break;
        case 'questions': current = user.solvedQuestions?.total || 0; break;
        default: current = user.completedTasks; break;
    }
    return `${Math.min(current, val)} / ${val}`;
};

const getBadgeConditionText = (badge: Badge) => {
    if (badge.id === 'b5') return 'Güvenlik ve Gizlilik modunu aç';
    const val = badge.requirementValue || badge.requiredTasks || 0;
    switch (badge.conditionType) {
        case 'tasks': return `${val} Görev Tamamla`;
        case 'coins': return `${val} Coin Biriktir`;
        case 'streak': return `${val} Gün Seri Yap`;
        case 'diamonds': return `${val} Elmas Kazan`;
        case 'questions': return `${val} Soru Çöz`;
        default: return `${val} Görev Tamamla`;
    }
};

const LOCAL_FRAMES = [
    { id: 'frame_none', name: 'Standart', color: 'border-white/10', cost: 0, animation: '' },
    // Glowing
    { id: 'frame_glow_blue', name: 'Neon Mavi', color: 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]', cost: 2000, animation: 'animate-pulse' },
    { id: 'frame_glow_purple', name: 'Neon Mor', color: 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]', cost: 2000, animation: 'animate-pulse' },
    // Patterned
    { id: 'frame_dashed', name: 'Çizgili', color: 'border-dashed border-4 border-slate-400', cost: 1000, animation: '' },
    { id: 'frame_dotted', name: 'Noktalı', color: 'border-dotted border-4 border-slate-400', cost: 1000, animation: '' },
    { id: 'frame_double', name: 'Çift Çizgi', color: 'border-double border-8 border-slate-400', cost: 1500, animation: '' },
    // New Distinct Frames
    { id: 'frame_thick_red', name: 'Kalın Kırmızı', color: 'border-solid border-8 border-red-500', cost: 1200, animation: '' },
    { id: 'frame_thick_green', name: 'Kalın Yeşil', color: 'border-solid border-8 border-green-500', cost: 1200, animation: '' },
    { id: 'frame_thick_yellow', name: 'Kalın Sarı', color: 'border-solid border-8 border-yellow-500', cost: 1200, animation: '' },
    { id: 'frame_thick_blue', name: 'Kalın Mavi', color: 'border-solid border-8 border-blue-500', cost: 1200, animation: '' },
    { id: 'frame_thick_teal', name: 'Kalın Turkuaz', color: 'border-solid border-8 border-teal-500', cost: 1200, animation: '' },
    // Patterned Additions
    { id: 'frame_checkered', name: 'Kareli', color: 'border-4 border-slate-700 bg-[repeating-linear-gradient(45deg,#e2e8f0,#e2e8f0_10px,#cbd5e1_10px,#cbd5e1_20px)]', cost: 2500, animation: '' },
    { id: 'frame_striped', name: 'Çizgili', color: 'border-4 border-slate-700 bg-[repeating-linear-gradient(0deg,#e2e8f0,#e2e8f0_10px,#cbd5e1_10px,#cbd5e1_20px)]', cost: 2500, animation: '' },
    // New Distinct Frame
    { id: 'frame_zigzag', name: 'Zikzak', color: 'border-4 border-slate-700 bg-[repeating-linear-gradient(135deg,#e2e8f0,#e2e8f0_10px,#cbd5e1_10px,#cbd5e1_20px)]', cost: 2000, animation: '' },
];

const STORE_AVATARS = [
    { id: 'avatar_einstein', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Fizik&backgroundColor=b6e3f4&backgroundType=gradientLinear', name: 'Fizik Dehası', cost: 1500 },
    { id: 'avatar_newton', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Matematik&backgroundColor=c0aede&backgroundType=gradientLinear', name: 'Matematikçi', cost: 1000 },
    { id: 'avatar_tesla', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Bilim&backgroundColor=d1d4f9&backgroundType=gradientLinear', name: 'Bilim İnsanı', cost: 2500 },
    { id: 'avatar_curie', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Kimya&backgroundColor=ffd5dc&backgroundType=gradientLinear', name: 'Kimyager', cost: 2000 },
    { id: 'avatar_davinci', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Tarih&backgroundColor=ffdfbf&backgroundType=gradientLinear', name: 'Tarihçi', cost: 3000 },
    { id: 'avatar_aristotle', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Felsefe&backgroundColor=dcfce7&backgroundType=gradientLinear', name: 'Filozof', cost: 5000 },
    { id: 'avatar_new1', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Yeni1&backgroundColor=e0e7ff&backgroundType=gradientLinear', name: 'Kaşif', cost: 1200 },
    { id: 'avatar_new2', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Yeni2&backgroundColor=fef08a&backgroundType=gradientLinear', name: 'Gözlemci', cost: 1300 },
    { id: 'avatar_new3', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Yeni3&backgroundColor=f3e8ff&backgroundType=gradientLinear', name: 'Analist', cost: 1400 },
    { id: 'avatar_new4', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Yeni4&backgroundColor=ccfbf1&backgroundType=gradientLinear', name: 'Yaratıcı', cost: 1600 },
    { id: 'avatar_new5', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Yeni5&backgroundColor=fce7f3&backgroundType=gradientLinear', name: 'Stratejist', cost: 1800 },
    // New Distinct Avatar
    { id: 'avatar_unique', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Unique&backgroundColor=fef08a&backgroundType=gradientLinear', name: 'Özel Profil', cost: 2000 },
];

const PRESET_AVATARS = [
    { id: 'preset_1', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4&backgroundType=gradientLinear', name: 'Lise Öğrencisi' },
    { id: 'preset_2', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka&backgroundColor=ffdfbf&backgroundType=gradientLinear', name: 'Üniversiteli' },
    { id: 'preset_3', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Liam&backgroundColor=d1d4f9&backgroundType=gradientLinear', name: 'Çalışkan' },
    { id: 'preset_4', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Mia&backgroundColor=ffd5dc&backgroundType=gradientLinear', name: 'Kitapkurdu' },
    { id: 'preset_5', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Oliver&backgroundColor=c0aede&backgroundType=gradientLinear', name: 'Araştırmacı' },
    { id: 'preset_6', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Emma&backgroundColor=dcfce7&backgroundType=gradientLinear', name: 'Sınav Canavarı' },
    { id: 'preset_7', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Noah&backgroundColor=fef08a&backgroundType=gradientLinear', name: 'Derece Öğrencisi' },
    { id: 'preset_8', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sofia&backgroundColor=e0e7ff&backgroundType=gradientLinear', name: 'Mezun' },
];

export const Profile: React.FC<ProfileProps> = ({ user, exams, onBack, onUpdateUser, onChangeView, onLogout, onEquipFrame, onBuyFrame }) => {
  const [activeTab, setActiveTab] = useState<'me' | 'stats' | 'achievements' | 'store' | 'levels'>('me');
  const [storeTab, setStoreTab] = useState<'frames' | 'avatars'>('frames');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountCenter, setShowAccountCenter] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [showAddQuestions, setShowAddQuestions] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);
  const [manualQuestions, setManualQuestions] = useState({ test: 0, classic: 0, subject: 'Matematik' });
  const [isProActive, setIsProActive] = useState(user.isProActive || false);
  const [isInvoiceActive, setIsInvoiceActive] = useState(false);
  const [metaFacebook, setMetaFacebook] = useState(true);
  const [metaInstagram, setMetaInstagram] = useState(false);
  const [metaDiscord, setMetaDiscord] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [reportText, setReportText] = useState('');
  const [claimingBadge, setClaimingBadge] = useState<Badge | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [showAddFriendBot, setShowAddFriendBot] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const solved = useMemo(() => user.solvedQuestions || { total: 0, test: 0, classic: 0, performance: 0, bySubject: {} }, [user.solvedQuestions]);
  const currentLevel = useMemo(() => getLevel(solved.total), [solved.total]);
  const currentLevelObj = useMemo(() => LEVELS.find(l => l.level === currentLevel) || LEVELS[0], [currentLevel]);
  const nextLevelObj = useMemo(() => LEVELS.find(l => l.level === currentLevel + 1), [currentLevel]);
  const prevLevelMin = useMemo(() => currentLevel > 1 ? LEVELS.find(l => l.level === currentLevel - 1)?.minQuestions || 0 : 0, [currentLevel]);
  const progress = useMemo(() => {
      if (!nextLevelObj) return 100;
      return Math.min(100, Math.max(0, ((solved.total - prevLevelMin) / (nextLevelObj.minQuestions - prevLevelMin)) * 100));
  }, [solved.total, prevLevelMin, nextLevelObj]);
  const prevLevelRef = useRef(currentLevel);

  useEffect(() => {
    if (currentLevel > prevLevelRef.current) {
      setLevelUp(currentLevel);
    }
    prevLevelRef.current = currentLevel;
  }, [currentLevel]);

  const handleGenerateAvatar = async () => {
      if (!avatarPrompt.trim()) return;
      setIsGeneratingAvatar(true);
      const avatar = await generateProfileAvatar(avatarPrompt);
      if (avatar) {
          onUpdateUser({ avatarUrl: avatar });
          setShowAvatarPicker(false);
          triggerNotif("Yapay zeka ile profil fotoğrafı oluşturuldu!");
      } else {
          triggerNotif("Fotoğraf oluşturulamadı.");
      }
      setIsGeneratingAvatar(false);
  };

  const handleClaimBadge = (badge: Badge) => {
      setClaimingBadge(badge);
      setTimeout(() => {
          onUpdateUser({
              claimedBadges: [...(user.claimedBadges || []), badge.id],
              coins: user.coins + (badge.rewardCoins || 0)
          });
          setClaimingBadge(null);
          triggerNotif(`${badge.name} rozeti kazanıldı! +${badge.rewardCoins} Coin`);
      }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdateUser({ avatarUrl: reader.result as string });
              setShowAvatarPicker(false);
              triggerNotif("Profil fotoğrafı güncellendi!");
          };
          reader.readAsDataURL(file);
      }
  };

  const currentFrame = LOCAL_FRAMES.find(f => f.id === user.frameId) || LOCAL_FRAMES[0];
  const currentFrameClass = `${currentFrame.color} ${currentFrame.animation}`;

  const triggerNotif = (msg: string) => {
      setNotif(msg);
      setTimeout(() => setNotif(null), 3000);
  };

  const currentRank = getRank(solved.total);
  const currentRankIndex = RANKS.findIndex(r => r.id === currentRank.id);
  const nextRank = currentRankIndex > 0 ? RANKS[currentRankIndex - 1] : null;

  let targetRank = null;
  if (user.targetRankId) {
    const selectedTarget = RANKS.find(r => r.id === user.targetRankId);
    if (selectedTarget && selectedTarget.min > solved.total) {
      targetRank = selectedTarget;
    }
  }
  if (!targetRank) {
    targetRank = nextRank;
  }

  const [showTargetRankModal, setShowTargetRankModal] = useState(false);

  const examAnalysis = useMemo(() => {
    const subjectStats: Record<string, { totalScore: number; count: number; targetTotal: number }> = {};
    
    exams.forEach(exam => {
      if (exam.actualScore !== undefined) {
        if (!subjectStats[exam.subject]) {
          subjectStats[exam.subject] = { totalScore: 0, count: 0, targetTotal: 0 };
        }
        subjectStats[exam.subject].totalScore += exam.actualScore;
        subjectStats[exam.subject].targetTotal += exam.targetScore;
        subjectStats[exam.subject].count += 1;
      }
    });

    const analysis = Object.entries(subjectStats).map(([subject, stats]) => {
      const avgScore = Math.round(stats.totalScore / stats.count);
      const avgTarget = Math.round(stats.targetTotal / stats.count);
      const diff = avgScore - avgTarget;
      
      let status: 'success' | 'warning' | 'danger' = 'success';
      let message = 'Hedefin üstündesin, harika!';
      
      if (diff < -15) {
        status = 'danger';
        message = 'Bu derse daha fazla çalışmalısın.';
      } else if (diff < 0) {
        status = 'warning';
        message = 'Hedefine çok yakınsın, biraz daha gayret.';
      }

      return { subject, avgScore, avgTarget, diff, status, message };
    });

    return analysis.sort((a, b) => a.diff - b.diff);
  }, [exams]);

  const handleManualAdd = () => {
    const newTotal = solved.total + manualQuestions.test + manualQuestions.classic;
    const newBySubject = { ...solved.bySubject };
    const addedCount = manualQuestions.test + manualQuestions.classic;
    newBySubject[manualQuestions.subject] = (newBySubject[manualQuestions.subject] || 0) + addedCount;

    onUpdateUser({
      solvedQuestions: {
        total: newTotal,
        test: solved.test + manualQuestions.test,
        classic: solved.classic + manualQuestions.classic,
        performance: solved.performance,
        bySubject: newBySubject
      }
    });
    setShowAddQuestions(false);
    triggerNotif(`${addedCount} Soru Başarıyla Eklendi!`);
    setManualQuestions({ test: 0, classic: 0, subject: 'Matematik' });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pb-32 text-white font-display overflow-x-hidden">
      
      {/* Toast */}
      {notif && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[500] bg-primary px-6 py-3 rounded-2xl shadow-glow text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top">{notif}</div>}

      {/* Settings Panel */}
      {showSettings && (
          <div className="fixed inset-0 z-[600] bg-[#0F172A] flex flex-col p-8 animate-in slide-in-from-bottom duration-300">
              <header className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">AYARLAR</h2>
                  <button onClick={() => setShowSettings(false)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </header>
              <div className="space-y-6">
                  {/* Güncelleme Hakkında */}
                  <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">VERSİYON v{APP_VERSION}</p>
                      <h3 className="text-xl font-black italic uppercase text-primary">{APP_CODENAME} GÜNCELLEMESİ</h3>
                      <ul className="mt-4 space-y-2">
                          <li className="flex items-center gap-2 text-xs text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Güvenlik merkezi eklendi.</li>
                          <li className="flex items-center gap-2 text-xs text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Hesaplar merkezi eklendi.</li>
                          <li className="flex items-center gap-2 text-xs text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Abonelikler ve E-Fatura eklendi.</li>
                          <li className="flex items-center gap-2 text-xs text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Meta merkezi entegre edildi.</li>
                          <li className="flex items-center gap-2 text-xs text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Geri bildirim sistemi eklendi.</li>
                      </ul>
                  </div>

                  {/* Geri Bildirim */}
                  <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10">
                      <h3 className="text-sm font-black uppercase mb-4">GERİ BİLDİRİM GÖNDER</h3>
                      <textarea placeholder="Fikrini buraya yaz..." className="w-full h-32 bg-black/40 rounded-2xl p-4 border border-white/10 outline-none text-sm font-bold"></textarea>
                      <button onClick={() => { triggerNotif("Geri bildirim iletildi! Teşekkürler."); setShowSettings(false); }} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase mt-4 active:scale-95 transition-transform">GÖNDER</button>
                  </div>

                  {/* Güvenlik ve Gizlilik */}
                  <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-6">
                      <div className="flex items-center justify-between">
                          <div>
                              <h3 className="text-sm font-black uppercase italic">GİZLİLİK MODU</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">Verilerini Ana Ekranda Gizle</p>
                          </div>
                          <button 
                            onClick={() => onUpdateUser({ isPrivacyModeEnabled: !user.isPrivacyModeEnabled })}
                            className={`w-14 h-8 rounded-full transition-all relative ${user.isPrivacyModeEnabled ? 'bg-primary' : 'bg-white/10'}`}
                          >
                              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.isPrivacyModeEnabled ? 'left-7' : 'left-1'}`} />
                          </button>
                      </div>

                      <div className="h-px bg-white/5" />

                      <div className="flex items-center justify-between">
                          <div>
                              <h3 className="text-sm font-black uppercase italic">GÜNLÜK HEDEF AKTİF</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">Hedef takibini başlat</p>
                          </div>
                          <button 
                            onClick={() => onUpdateUser({ isDailyGoalActive: !user.isDailyGoalActive })}
                            className={`w-14 h-8 rounded-full transition-all relative ${user.isDailyGoalActive ? 'bg-primary' : 'bg-white/10'}`}
                          >
                              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.isDailyGoalActive ? 'left-7' : 'left-1'}`} />
                          </button>
                      </div>

                      <div className="h-px bg-white/5" />

                      <div className="flex items-center justify-between">
                          <div>
                              <h3 className="text-sm font-black uppercase italic">GÜNLÜK HEDEF</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">Hedeflenen Görev Sayısı</p>
                          </div>
                          <div className="flex items-center gap-3">
                              <button onClick={() => onUpdateUser({ dailyGoalTasks: Math.max(1, (user.dailyGoalTasks || 5) - 1) })} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">-</button>
                              <span className="text-sm font-black">{user.dailyGoalTasks || 5}</span>
                              <button onClick={() => onUpdateUser({ dailyGoalTasks: (user.dailyGoalTasks || 5) + 1 })} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">+</button>
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={() => { setShowSettings(false); onChangeView(ViewState.SECURITY); }}
                    className="w-full py-6 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-[2.5rem] font-black uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">security</span>
                    GÜVENLİK MERKEZİ
                  </button>

                  <button 
                    onClick={() => { setShowSettings(false); setShowAccountCenter(true); }}
                    className="w-full py-6 bg-blue-500/10 text-blue-500 border border-blue-500/10 rounded-[2.5rem] font-black uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">account_circle</span>
                    HESAPLAR MERKEZİ
                  </button>

                  <button 
                    onClick={() => { setShowSettings(false); setShowStatistics(true); }}
                    className="w-full py-6 bg-cyan-500/10 text-cyan-500 border border-cyan-500/10 rounded-[2.5rem] font-black uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">bar_chart</span>
                    İSTATİSTİKLER
                  </button>

                  <button 
                    onClick={() => { setShowSettings(false); setShowSubscriptions(true); }}
                    className="w-full py-6 bg-purple-500/10 text-purple-500 border border-purple-500/10 rounded-[2.5rem] font-black uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">subscriptions</span>
                    ABONELİKLER
                  </button>

                  {/* Uygulama Hakkında */}
                  <div className="text-center p-4">
                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">Focus Pro - 2026 Academic Hub</p>
                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] mt-1">Made with AI Energy</p>
                  </div>

                  <button onClick={onLogout} className="w-full py-6 bg-red-500/10 text-red-500 border border-red-500/10 rounded-[2.5rem] font-black uppercase text-sm mt-8 active:scale-95 transition-all">OTURUMU KAPAT</button>
              </div>
          </div>
      )}

      {/* Subscriptions Overlay */}
      {showSubscriptions && (
          <div className="fixed inset-0 z-[650] bg-[#0F172A] flex flex-col p-8 animate-in slide-in-from-right duration-300 overflow-y-auto">
              <header className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-purple-500">ABONELİKLER</h2>
                  <button onClick={() => setShowSubscriptions(false)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </header>

              <div className="space-y-4">
                  <div className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all ${isProActive ? 'bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-purple-500/30' : 'bg-white/5 border-white/10'}`}>
                      {isProActive && <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>}
                      <div className="flex items-center justify-between mb-4 relative z-10">
                          <div>
                              <h3 className="text-xl font-black uppercase italic text-white">PRO ÜYELİK</h3>
                              <p className={`text-xs font-bold uppercase ${isProActive ? 'text-purple-300' : 'text-slate-500'}`}>{isProActive ? 'Aktif Abonelik' : 'Aylık 150 TL'}</p>
                          </div>
                          <span className={`material-symbols-outlined text-4xl ${isProActive ? 'text-purple-400' : 'text-slate-600'}`}>workspace_premium</span>
                      </div>
                      <ul className="space-y-2 mb-6 relative z-10">
                          <li className="flex items-center gap-2 text-xs text-slate-300"><span className={`material-symbols-outlined text-[16px] ${isProActive ? 'text-purple-400' : 'text-slate-600'}`}>check_circle</span> Sınırsız AI Soru Çözümü</li>
                          <li className="flex items-center gap-2 text-xs text-slate-300"><span className={`material-symbols-outlined text-[16px] ${isProActive ? 'text-purple-400' : 'text-slate-600'}`}>check_circle</span> Özel Profil Çerçeveleri</li>
                          <li className="flex items-center gap-2 text-xs text-slate-300"><span className={`material-symbols-outlined text-[16px] ${isProActive ? 'text-purple-400' : 'text-slate-600'}`}>check_circle</span> Reklamsız Deneyim</li>
                      </ul>
                      <button 
                        onClick={() => {
                            if (!isProActive) {
                                setIsProActive(true);
                                onUpdateUser({ isProActive: true });
                                triggerNotif("Pro Üyelik Aktif Edildi!");
                            }
                        }}
                        className={`w-full py-4 rounded-2xl font-black uppercase text-xs border active:scale-95 transition-all relative z-10 ${isProActive ? 'bg-white/10 text-white border-white/20' : 'bg-purple-500 text-white border-purple-500'}`}
                      >
                          {isProActive ? 'YÖNET' : 'AKTİF ET'}
                      </button>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                          <div>
                              <h3 className="text-sm font-black uppercase italic text-slate-400">GEÇMİŞ FATURALAR</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">Ödeme Geçmişi</p>
                          </div>
                          <span className="material-symbols-outlined text-slate-500">receipt_long</span>
                      </div>
                      <button className="w-full py-4 bg-white/5 text-slate-300 rounded-2xl font-black uppercase text-xs active:scale-95 transition-all">
                          GÖRÜNTÜLE
                      </button>
                  </div>

                  <div className={`p-6 rounded-[2rem] border transition-all ${isInvoiceActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex items-center justify-between mb-4">
                          <div>
                              <h3 className="text-sm font-black uppercase italic text-white">E-FATURA</h3>
                              <p className={`text-[9px] font-bold uppercase ${isInvoiceActive ? 'text-emerald-400' : 'text-slate-500'}`}>{isInvoiceActive ? 'Aktif' : 'Pasif'}</p>
                          </div>
                          <span className={`material-symbols-outlined ${isInvoiceActive ? 'text-emerald-400' : 'text-slate-500'}`}>receipt</span>
                      </div>
                      <button 
                        onClick={() => {
                            setIsInvoiceActive(!isInvoiceActive);
                            triggerNotif(isInvoiceActive ? "E-Fatura kapatıldı." : "E-Fatura aktif edildi.");
                        }}
                        className={`w-full py-4 rounded-2xl font-black uppercase text-xs active:scale-95 transition-all ${isInvoiceActive ? 'bg-white/5 text-slate-300' : 'bg-emerald-500 text-white'}`}
                      >
                          {isInvoiceActive ? 'YÖNET' : 'AKTİF ET'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Meta Overlay */}
      {showMeta && (
          <div className="fixed inset-0 z-[650] bg-[#0F172A] flex flex-col p-8 animate-in slide-in-from-right duration-300 overflow-y-auto">
              <header className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-indigo-500">META MERKEZİ</h2>
                  <button onClick={() => setShowMeta(false)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </header>

              <div className="space-y-4">
                  <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                          <span className="material-symbols-outlined text-4xl text-indigo-400">hub</span>
                      </div>
                      <h3 className="text-lg font-black uppercase text-white">Bağlı Hesaplar</h3>
                      <p className="text-xs text-slate-400 mt-1">Diğer platformlardaki hesaplarınızı yönetin</p>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${metaFacebook ? 'bg-[#1877F2]/20' : 'bg-white/10'}`}>
                              <span className={`font-black text-xl ${metaFacebook ? 'text-[#1877F2]' : 'text-slate-500'}`}>f</span>
                          </div>
                          <div>
                              <h3 className="text-sm font-black uppercase italic">Facebook</h3>
                              <p className={`text-[9px] font-bold uppercase ${metaFacebook ? 'text-emerald-400' : 'text-slate-500'}`}>{metaFacebook ? 'Bağlı' : 'Bağlı Değil'}</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => {
                            setMetaFacebook(!metaFacebook);
                            triggerNotif(metaFacebook ? "Facebook bağlantısı kesildi." : "Facebook bağlandı.");
                        }}
                        className={`text-xs font-black uppercase px-4 py-2 rounded-xl transition-all ${metaFacebook ? 'text-slate-400 bg-white/5' : 'text-white bg-indigo-500'}`}
                      >
                          {metaFacebook ? 'Kapat' : 'Aç'}
                      </button>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${metaInstagram ? 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] opacity-20' : 'bg-white/10'}`}>
                              <span className={`material-symbols-outlined ${metaInstagram ? 'text-white' : 'text-slate-500'}`}>photo_camera</span>
                          </div>
                          <div>
                              <h3 className="text-sm font-black uppercase italic">Instagram</h3>
                              <p className={`text-[9px] font-bold uppercase ${metaInstagram ? 'text-emerald-400' : 'text-slate-500'}`}>{metaInstagram ? 'Bağlı' : 'Bağlı Değil'}</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => {
                            setMetaInstagram(!metaInstagram);
                            triggerNotif(metaInstagram ? "Instagram bağlantısı kesildi." : "Instagram bağlandı.");
                        }}
                        className={`text-xs font-black uppercase px-4 py-2 rounded-xl transition-all ${metaInstagram ? 'text-slate-400 bg-white/5' : 'text-white bg-indigo-500'}`}
                      >
                          {metaInstagram ? 'Kapat' : 'Aç'}
                      </button>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${metaDiscord ? 'bg-[#5865F2]/20' : 'bg-white/10'}`}>
                              <span className={`material-symbols-outlined ${metaDiscord ? 'text-[#5865F2]' : 'text-slate-500'}`}>sports_esports</span>
                          </div>
                          <div>
                              <h3 className="text-sm font-black uppercase italic">Discord</h3>
                              <p className={`text-[9px] font-bold uppercase ${metaDiscord ? 'text-emerald-400' : 'text-slate-500'}`}>{metaDiscord ? 'Bağlı' : 'Bağlı Değil'}</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => {
                            setMetaDiscord(!metaDiscord);
                            triggerNotif(metaDiscord ? "Discord bağlantısı kesildi." : "Discord bağlandı.");
                        }}
                        className={`text-xs font-black uppercase px-4 py-2 rounded-xl transition-all ${metaDiscord ? 'text-slate-400 bg-white/5' : 'text-white bg-indigo-500'}`}
                      >
                          {metaDiscord ? 'Kapat' : 'Aç'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Account Center Overlay */}
      {showAccountCenter && (
          <div className="fixed inset-0 z-[650] bg-[#0F172A] flex flex-col p-8 animate-in slide-in-from-right duration-300 overflow-y-auto">
              <header className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-blue-500">HESAPLAR MERKEZİ</h2>
                  <button onClick={() => setShowAccountCenter(false)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </header>

              <div className="space-y-4">
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-blue-400">face</span>
                          <div>
                              <h3 className="text-sm font-black uppercase italic">DOĞRULAMA SELFİE'Sİ</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">Yüz tanıma ile güvenliği artır</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => onUpdateUser({ isSelfieVerificationActive: !user.isSelfieVerificationActive })}
                        className={`w-14 h-8 rounded-full transition-all relative ${user.isSelfieVerificationActive ? 'bg-blue-500' : 'bg-white/10'}`}
                      >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.isSelfieVerificationActive ? 'left-7' : 'left-1'}`} />
                      </button>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-blue-400">save</span>
                          <div>
                              <h3 className="text-sm font-black uppercase italic">KAYDEDİLEN GİRİŞ BİLGİLERİ</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">Hızlı giriş için bilgileri sakla</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => onUpdateUser({ isSavedLoginInfoActive: !user.isSavedLoginInfoActive })}
                        className={`w-14 h-8 rounded-full transition-all relative ${user.isSavedLoginInfoActive ? 'bg-blue-500' : 'bg-white/10'}`}
                      >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.isSavedLoginInfoActive ? 'left-7' : 'left-1'}`} />
                      </button>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-blue-400">location_on</span>
                          <div>
                              <h3 className="text-sm font-black uppercase italic">GİRİŞ YAPTIĞIN YERLER</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">Konum geçmişini kaydet</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => onUpdateUser({ isLoginLocationsActive: !user.isLoginLocationsActive })}
                        className={`w-14 h-8 rounded-full transition-all relative ${user.isLoginLocationsActive ? 'bg-blue-500' : 'bg-white/10'}`}
                      >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.isLoginLocationsActive ? 'left-7' : 'left-1'}`} />
                      </button>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-blue-400">notifications_active</span>
                          <div>
                              <h3 className="text-sm font-black uppercase italic">GİRİŞ UYARILARI</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">Yeni girişlerde bildirim al</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => onUpdateUser({ isLoginAlertsActive: !user.isLoginAlertsActive })}
                        className={`w-14 h-8 rounded-full transition-all relative ${user.isLoginAlertsActive ? 'bg-blue-500' : 'bg-white/10'}`}
                      >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.isLoginAlertsActive ? 'left-7' : 'left-1'}`} />
                      </button>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-blue-400">badge</span>
                          <div>
                              <h3 className="text-sm font-black uppercase italic">KİŞİSEL DETAYLAR</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">Profil bilgilerini yönet</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => onUpdateUser({ isPersonalDetailsActive: !user.isPersonalDetailsActive })}
                        className={`w-14 h-8 rounded-full transition-all relative ${user.isPersonalDetailsActive ? 'bg-blue-500' : 'bg-white/10'}`}
                      >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.isPersonalDetailsActive ? 'left-7' : 'left-1'}`} />
                      </button>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-blue-400">fingerprint</span>
                          <div>
                              <h3 className="text-sm font-black uppercase italic">BİLGİLERİN VE İZLERİN</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">Veri izlerini kontrol et</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => onUpdateUser({ isInfoAndTracesActive: !user.isInfoAndTracesActive })}
                        className={`w-14 h-8 rounded-full transition-all relative ${user.isInfoAndTracesActive ? 'bg-blue-500' : 'bg-white/10'}`}
                      >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${user.isInfoAndTracesActive ? 'left-7' : 'left-1'}`} />
                      </button>
                  </div>

                  <button 
                    onClick={() => {
                        onUpdateUser({
                            isSelfieVerificationActive: true,
                            isSavedLoginInfoActive: true,
                            isLoginLocationsActive: true,
                            isLoginAlertsActive: true,
                            isPersonalDetailsActive: true,
                            isInfoAndTracesActive: true
                        });
                        triggerNotif("TÜM ÖZELLİKLER AKTİF EDİLDİ!");
                    }}
                    className="w-full py-6 bg-blue-500 text-white rounded-[2.5rem] font-black uppercase text-sm shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95 transition-all mt-4"
                  >
                    HEPSİNİ AKTİF ET
                  </button>
              </div>
          </div>
      )}

      {/* Add Friend Bot Overlay */}
      {showAddFriendBot && (
          <div className="fixed inset-0 z-[700] bg-[#0F172A] flex flex-col p-8 animate-in slide-in-from-bottom duration-300">
              <header className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-indigo-500">ARKADAŞ EKLE BOTU</h2>
                  <button onClick={() => setShowAddFriendBot(false)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </header>
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="w-32 h-32 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                      <span className="material-symbols-outlined text-6xl text-indigo-400">smart_toy</span>
                  </div>
                  <p className="text-center text-slate-400 text-sm font-bold">Merhaba! Arkadaş eklemek için bir kullanıcı adı gir.</p>
                  <input type="text" placeholder="Kullanıcı Adı" className="w-full bg-black/40 rounded-2xl p-4 border border-white/10 outline-none text-sm font-bold text-white" />
                  <button onClick={() => triggerNotif("Arkadaşlık isteği gönderildi!")} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase mt-4 active:scale-95 transition-transform">İSTEK GÖNDER</button>
              </div>
          </div>
      )}
      <header className="p-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl bg-[#0F172A]/80 border-b border-white/5">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-transform"><span className="material-symbols-outlined">arrow_back</span></button>
        <div className="text-center">
            <h1 className="text-lg font-black tracking-tighter italic uppercase leading-none">FOCUS <span className="text-primary">{APP_CODENAME}</span></h1>
            <p className="text-[8px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1">v{APP_VERSION} TITAN</p>
        </div>
        <button onClick={() => setShowSettings(true)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-transform"><span className="material-symbols-outlined">settings</span></button>
      </header>

      <div className="p-6 space-y-10 flex flex-col items-center">
          
          {/* Centered Identity Card */}
          <section className="w-full bg-gradient-to-br from-indigo-600 via-purple-700 to-[#0F172A] rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group border border-white/10 flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000"><span className="material-symbols-outlined text-9xl">workspace_premium</span></div>
              <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-8 mx-auto" onClick={() => setShowAvatarPicker(true)}>
                      <div className={`w-48 h-48 rounded-full border-8 ${currentFrameClass} p-1.5 shadow-glow animate-breathe overflow-hidden flex items-center justify-center bg-slate-900 cursor-pointer active:scale-95 transition-all`}>
                          <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover block mx-auto" alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl border-4 border-indigo-700">
                          <span className="material-symbols-outlined text-xl font-black">palette</span>
                      </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                      {isEditingName ? (
                          <div className="flex items-center gap-2">
                              <input 
                                  type="text" 
                                  value={editedName} 
                                  onChange={(e) => setEditedName(e.target.value)}
                                  className="bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-2xl font-black italic tracking-tighter uppercase outline-none w-48 text-center"
                                  autoFocus
                              />
                              <button 
                                  onClick={() => {
                                      if (editedName.trim()) {
                                          onUpdateUser({ name: capitalize(editedName.trim()) });
                                          setIsEditingName(false);
                                          triggerNotif("İsim güncellendi!");
                                      }
                                  }}
                                  className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white"
                              >
                                  <span className="material-symbols-outlined">check</span>
                              </button>
                              <button 
                                  onClick={() => {
                                      setEditedName(user.name);
                                      setIsEditingName(false);
                                  }}
                                  className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center"
                              >
                                  <span className="material-symbols-outlined">close</span>
                              </button>
                          </div>
                      ) : (
                          <>
                              <h2 className="text-4xl font-black italic tracking-tighter uppercase flex items-center justify-center gap-2">
                                  {user.name}
                                  <button 
                                      onClick={() => setIsEditingName(true)}
                                      className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                  >
                                      <span className="material-symbols-outlined text-sm">edit</span>
                                  </button>
                                  {isProActive && <span className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-[12px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-glow">PRO</span>}
                              </h2>
                          </>
                      )}
                  </div>
                  <div className="flex gap-2 justify-center mt-4">
                    <span className="bg-black/30 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10">{user.grade}. SINIF</span>
                   <span className="bg-black/30 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10 flex items-center gap-1 text-yellow-500">
                        <span className="material-symbols-outlined text-[10px]">star</span>
                        {user.popularity || 0} POP
                   </span>
                    <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">ID:</span>
                        <span className="text-[10px] text-slate-300 font-mono">{user.id}</span>
                    </div>
                    <span className={`${currentRank.bg} px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border ${currentRank.border} ${currentRank.color}`}>{currentRank.name}</span>
                    <span className="bg-amber-500/20 text-amber-400 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-amber-500/30">SEVİYE {currentLevel}</span>
                  </div>
                  <div className="w-full mt-6 bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{solved.total} / {currentLevelObj.minQuestions} Soru</p>
              </div>
          </section>

          {/* Navigation Grid */}
          <div className="w-full flex bg-white/5 p-1.5 rounded-[2.5rem] border border-white/10 shadow-lg">
              {([
                  { id: 'me', label: 'GENEL', icon: 'dashboard' },
                  { id: 'stats', label: 'SORULAR', icon: 'query_stats' },
                  { id: 'achievements', label: 'ROZETLER', icon: 'stars' },
                  { id: 'store', label: 'MARKET', icon: 'storefront' },
                  { id: 'levels', label: 'SEVİYELER', icon: 'leaderboard' }
              ] as const).map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-1 py-4 rounded-full text-[8px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-glow' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>{tab.label}
                  </button>
              ))}
          </div>

          <div className="w-full min-h-[400px]">
              {activeTab === 'me' && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left duration-500">
                      
                      {/* PUBG Style Rank Card - Enhanced */}
                      <div className={`col-span-2 bg-[#0a0f1c] p-8 rounded-[3.5rem] border-2 ${currentRank.border} relative overflow-hidden flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
                          {/* Background Effects */}
                          <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${currentRank.bg} opacity-10`}></div>
                          <div className={`absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br ${currentRank.gradient} rounded-full blur-[100px] opacity-20`}></div>
                          <div className={`absolute -bottom-24 -right-24 w-64 h-64 bg-gradient-to-tl ${currentRank.gradient} rounded-full blur-[100px] opacity-20`}></div>
                          
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 z-10 bg-black/50 px-4 py-1.5 rounded-full border border-white/10">MEVCUT KADEME</h3>
                          
                          {/* Emblem */}
                          <div className="relative z-10 mb-6 group">
                              {/* Outer rotating ring */}
                              <div className={`absolute -inset-4 rounded-full border-2 border-dashed ${currentRank.border} animate-[spin_10s_linear_infinite] opacity-50`}></div>
                              {/* Glowing aura */}
                              <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${currentRank.gradient} blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`}></div>
                              {/* Main Circle */}
                              <div className={`w-36 h-36 rounded-full flex items-center justify-center relative bg-gradient-to-b from-slate-800 to-slate-950 border-4 ${currentRank.border} shadow-inner`}>
                                  <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${currentRank.gradient} opacity-20`}></div>
                                  <span className={`material-symbols-outlined text-8xl ${currentRank.color} drop-shadow-[0_0_15px_currentColor]`}>{currentRank.icon}</span>
                              </div>
                          </div>
                          
                          <h2 className={`text-5xl font-black italic uppercase tracking-tighter bg-gradient-to-b ${currentRank.gradient} text-transparent bg-clip-text z-10 drop-shadow-sm mb-1`}>
                              {currentRank.name}
                          </h2>
                          <div className="flex items-center gap-2 z-10 bg-black/40 px-4 py-1 rounded-full border border-white/5 mt-2">
                              <span className="material-symbols-outlined text-sm text-slate-400">military_tech</span>
                              <p className="text-xs font-bold text-slate-300">{solved.total} Soru Çözüldü</p>
                          </div>

                          {nextRank && (
                              <div className="w-full mt-10 z-10 bg-black/40 p-5 rounded-3xl border border-white/5 backdrop-blur-sm">
                                  <div className="flex justify-between items-end mb-3">
                                      <div className="text-left">
                                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">SONRAKİ HEDEF</p>
                                          <p className={`text-sm font-black italic uppercase ${nextRank.color}`}>{nextRank.name}</p>
                                      </div>
                                      <div className="text-right">
                                          <span className="text-xl font-black text-white italic">{solved.total}</span>
                                          <span className="text-xs font-bold text-slate-500"> / {nextRank.min}</span>
                                      </div>
                                  </div>
                                  {/* XP Bar */}
                                  <div className="h-5 bg-slate-950 rounded-full overflow-hidden border border-white/10 p-1 relative shadow-inner">
                                      <div 
                                          className={`h-full rounded-full bg-gradient-to-r ${nextRank.gradient} transition-all duration-1000 relative shadow-[0_0_10px_currentColor]`}
                                          style={{ width: `${Math.min(((solved.total - currentRank.min) / (nextRank.min - currentRank.min)) * 100, 100)}%` }}
                                      >
                                          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                                          <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-[2px] -skew-x-12 animate-[shimmer_2s_infinite]"></div>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>

                      <div className="bg-[#1e293b] p-10 rounded-[3rem] border border-white/5 flex flex-col items-center gap-2">
                          <span className="text-4xl">🪙</span>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">JETONLAR</p>
                          <p className="text-4xl font-black text-yellow-500 italic leading-none mt-1">{user.coins}</p>
                      </div>
                      <div className="bg-[#1e293b] p-10 rounded-[3rem] border border-white/5 flex flex-col items-center gap-2">
                          <span className="text-4xl">🔥</span>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">DİSİPLİN</p>
                          <p className="text-4xl font-black text-orange-500 italic leading-none mt-1">{user.streak}G</p>
                      </div>
                      <div className="col-span-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-10 rounded-[3.5rem] border border-emerald-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><span className="material-symbols-outlined text-3xl">task_alt</span></div>
                            <div>
                                <p className="text-3xl font-black italic leading-none">{user.completedTasks}</p>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">TAMAMLANAN GÖREV</p>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-emerald-500/20 text-7xl">military_tech</span>
                      </div>

                      {/* Hedef Rütbe */}
                      <div className="col-span-2 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 rounded-[3.5rem] border border-white/10 relative overflow-hidden group shadow-xl">
                          {/* Background Glow */}
                          {targetRank && <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${targetRank.gradient} rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>}
                          
                          <div className="flex justify-between items-center mb-6 relative z-10">
                              <div>
                                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">SEÇİLİ HEDEF KADEME</h3>
                                  <div className="flex items-center gap-3">
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${targetRank?.bg || 'bg-slate-800'} border ${targetRank?.border || 'border-slate-700'} shadow-lg`}>
                                          <span className={`material-symbols-outlined ${targetRank?.color || 'text-slate-400'} text-3xl drop-shadow-md`}>{targetRank?.icon || 'flag'}</span>
                                      </div>
                                      <p className={`text-3xl font-black italic uppercase ${targetRank?.color || 'text-white'} drop-shadow-sm`}>{targetRank?.name || 'MAKSİMUM SEVİYE'}</p>
                                  </div>
                              </div>
                              <button 
                                onClick={() => setShowTargetRankModal(true)}
                                className="px-5 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95 flex items-center gap-2"
                              >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                  DEĞİŞTİR
                              </button>
                          </div>
                          
                          {targetRank && (
                              <div className="relative z-10 bg-black/30 p-4 rounded-2xl border border-white/5">
                                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                      <span className="text-slate-400 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">trending_up</span> İLERLEME DURUMU</span>
                                      <span className={targetRank.color}>{solved.total} / {targetRank.min} SORU</span>
                                  </div>
                                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                                      <div 
                                          className={`h-full rounded-full bg-gradient-to-r ${targetRank.gradient} transition-all duration-1000 relative`}
                                          style={{ width: `${Math.min((solved.total / targetRank.min) * 100, 100)}%` }}
                                      >
                                          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12"></div>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>

                      <button 
                        onClick={onLogout}
                        className="col-span-2 py-6 bg-red-500/10 text-red-500 border border-red-500/10 rounded-[2.5rem] font-black uppercase text-sm flex items-center justify-center gap-3 active:scale-95 transition-all mt-4"
                      >
                        <span className="material-symbols-outlined">logout</span>
                        OTURUMU KAPAT
                      </button>
                  </div>
              )}

              {activeTab === 'stats' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                      <div className="bg-gradient-to-br from-primary/20 to-indigo-600/20 p-8 rounded-[3rem] border border-primary/20 flex items-center justify-between">
                          <div>
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">TOPLAM ÇÖZÜLEN</p>
                              <h3 className="text-5xl font-black italic tracking-tighter">{solved.total}</h3>
                              <p className="text-[10px] font-black text-slate-500 uppercase mt-2">SORU TAMAMLANDI</p>
                          </div>
                          <button onClick={() => setShowAddQuestions(true)} className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 active:scale-95 transition-all">
                              <span className="material-symbols-outlined text-4xl text-primary animate-pulse">add_circle</span>
                          </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center">
                              <p className="text-2xl font-black italic text-indigo-400">{solved.test}</p>
                              <p className="text-[8px] font-black text-slate-500 uppercase mt-1">TEST</p>
                          </div>
                          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center">
                              <p className="text-2xl font-black italic text-emerald-400">{solved.classic}</p>
                              <p className="text-[8px] font-black text-slate-500 uppercase mt-1">KLASİK</p>
                          </div>
                          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center">
                              <p className="text-2xl font-black italic text-orange-400">{solved.performance}</p>
                              <p className="text-[8px] font-black text-slate-500 uppercase mt-1">PERFORM.</p>
                          </div>
                      </div>

                      <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
                          <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 text-slate-400">DERS BAZLI DAĞILIM</h4>
                          <div className="space-y-4">
                              {Object.entries(solved.bySubject).map(([subject, count]) => {
                                  const countNum = Number(count);
                                  const percentage = solved.total > 0 ? Math.round((countNum / solved.total) * 100) : 0;
                                  return (
                                      <div key={subject} className="space-y-2">
                                          <div className="flex justify-between items-end">
                                              <p className="text-xs font-black uppercase italic">{subject}</p>
                                              <p className="text-[10px] font-black text-primary">{countNum} Soru</p>
                                          </div>
                                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                              <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>

                      {examAnalysis.length > 0 && (
                          <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
                              <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 text-slate-400">SINAV ANALİZİ VE TAVSİYELER</h4>
                              <div className="space-y-4">
                                  {examAnalysis.map((analysis) => (
                                      <div key={analysis.subject} className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                          <div className="flex justify-between items-center mb-2">
                                              <p className="text-sm font-black uppercase italic">{analysis.subject}</p>
                                              <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                  analysis.status === 'danger' ? 'bg-red-500/20 text-red-400' :
                                                  analysis.status === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                                                  'bg-emerald-500/20 text-emerald-400'
                                              }`}>
                                                  ORT: {analysis.avgScore} / HEDEF: {analysis.avgTarget}
                                              </div>
                                          </div>
                                          <p className="text-xs text-slate-400 font-medium">{analysis.message}</p>
                                          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                                              <div className={`absolute top-0 left-0 h-full rounded-full ${
                                                  analysis.status === 'danger' ? 'bg-red-500' :
                                                  analysis.status === 'warning' ? 'bg-orange-500' :
                                                  'bg-emerald-500'
                                              }`} style={{ width: `${Math.min(100, (analysis.avgScore / 100) * 100)}%` }} />
                                              <div className="absolute top-0 bottom-0 w-1 bg-white z-10" style={{ left: `${Math.min(100, (analysis.avgTarget / 100) * 100)}%`, transform: 'translateX(-50%)' }} />
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'achievements' && (
                  <div className="flex flex-col gap-8 animate-in slide-in-from-right duration-500">
                      {/* Alınabilir Rozetler */}
                      {ALL_BADGES.filter(b => checkBadgeCondition(b, user) && !user.claimedBadges?.includes(b.id)).length > 0 && (
                          <div>
                              <h3 className="text-yellow-400 font-black italic uppercase tracking-tighter mb-4 flex items-center gap-2 animate-pulse">
                                  <span className="material-symbols-outlined">stars</span>
                                  Yeni Rozetler Açıldı!
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                  {ALL_BADGES.filter(b => checkBadgeCondition(b, user) && !user.claimedBadges?.includes(b.id)).map(badge => (
                                      <div key={badge.id} className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-5 rounded-[2rem] border border-yellow-500/50 transition-all flex flex-col items-center text-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.2)] relative overflow-hidden">
                                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
                                          <div className={`w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center ${badge.color} border border-white/20 shadow-glow`}>
                                              <span className="material-symbols-outlined text-3xl">{badge.icon}</span>
                                          </div>
                                          <h4 className="font-black text-[11px] uppercase italic leading-none text-white">{badge.name}</h4>
                                          <p className="text-[9px] text-slate-300 font-bold leading-tight">{badge.description}</p>
                                          
                                          <div className="mt-auto pt-2 w-full">
                                              <div className="bg-black/40 rounded-xl p-3 border border-yellow-500/30 mb-3">
                                                  <div className="flex justify-between items-center mb-1">
                                                      <div className="text-[8px] text-yellow-500/70 font-bold uppercase">Kazanma Koşulu:</div>
                                                      <div className="text-[9px] font-black text-yellow-400">{getBadgeProgressText(badge, user)}</div>
                                                  </div>
                                                  <div className="text-[9px] text-white font-black mb-2 text-left">
                                                      {getBadgeConditionText(badge)}
                                                  </div>
                                                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                                                      <div className="absolute top-0 left-0 h-full bg-yellow-400" style={{ width: '100%' }}></div>
                                                  </div>
                                              </div>
                                              <button 
                                                  onClick={() => handleClaimBadge(badge)}
                                                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl py-2 text-[10px] font-black uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-lg relative z-10"
                                              >
                                                  Rozeti Al
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* Kazanılan Rozetler */}
                      <div>
                          <h3 className="text-white font-black italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary">military_tech</span>
                              Kazanılan Rozetler
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                              {ALL_BADGES.filter(b => user.claimedBadges?.includes(b.id)).length === 0 ? (
                                  <div className="col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 text-center text-slate-500 text-xs font-bold">
                                      Henüz kazanılmış bir rozetin yok. Görevleri tamamlamaya devam et!
                                  </div>
                              ) : (
                                  ALL_BADGES.filter(b => user.claimedBadges?.includes(b.id)).map(badge => (
                                      <div key={badge.id} className="bg-[#1e293b] p-5 rounded-[2rem] border border-primary/30 transition-all flex flex-col items-center text-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                          <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${badge.color} border border-white/10`}>
                                              <span className="material-symbols-outlined text-3xl">{badge.icon}</span>
                                          </div>
                                          <h4 className="font-black text-[11px] uppercase italic leading-none text-white">{badge.name}</h4>
                                          <p className="text-[9px] text-slate-400 font-bold leading-tight">{badge.description}</p>
                                          
                                          <div className="mt-auto pt-2 w-full">
                                              <div className="bg-black/40 rounded-xl p-3 border border-primary/20">
                                                  <div className="flex justify-between items-center mb-1">
                                                      <div className="text-[8px] text-slate-400 font-bold uppercase">Kazanma Koşulu:</div>
                                                      <div className="text-[9px] font-black text-primary">{getBadgeProgressText(badge, user)}</div>
                                                  </div>
                                                  <div className="text-[9px] text-white font-black mb-2 text-left">
                                                      {getBadgeConditionText(badge)}
                                                  </div>
                                                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                                                      <div className="absolute top-0 left-0 h-full bg-primary" style={{ width: '100%' }}></div>
                                                  </div>
                                              </div>
                                              <div className="mt-3 px-3 py-1.5 bg-primary/20 rounded-full text-[8px] font-black text-primary uppercase tracking-wider w-full">KAZANILDI</div>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>

                      {/* Kilitli Rozetler */}
                      <div>
                          <h3 className="text-slate-400 font-black italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                              <span className="material-symbols-outlined">lock</span>
                              Kilitli Rozetler
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                              {ALL_BADGES.filter(b => !checkBadgeCondition(b, user)).map((badge, index, arr) => {
                                  const isLastBadge = index === arr.length - 1;
                                  return (
                                      <div key={badge.id} className={`p-5 rounded-[2rem] transition-all flex flex-col items-center text-center gap-2 ${isLastBadge ? 'col-span-2 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-purple-500/30 opacity-90' : 'bg-[#1e293b]/50 border border-white/5 opacity-60 grayscale'}`}>
                                          <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 ${isLastBadge ? badge.color : 'text-slate-600'}`}>
                                              <span className="material-symbols-outlined text-3xl">{badge.icon}</span>
                                          </div>
                                          <h4 className={`font-black text-[11px] uppercase italic leading-none ${isLastBadge ? 'text-purple-300' : 'text-slate-300'}`}>{badge.name}</h4>
                                          <p className={`text-[9px] font-bold leading-tight ${isLastBadge ? 'text-purple-200/70' : 'text-slate-500'}`}>{badge.description}</p>
                                          
                                          <div className="mt-auto pt-2 w-full">
                                              <div className={`bg-black/40 rounded-xl p-3 border ${isLastBadge ? 'border-purple-500/20' : 'border-white/5'}`}>
                                                  <div className="flex justify-between items-center mb-1">
                                                      <div className="text-[8px] text-slate-400 font-bold uppercase">Kazanma Koşulu:</div>
                                                      <div className={`text-[9px] font-black ${isLastBadge ? 'text-purple-300' : 'text-white'}`}>{getBadgeProgressText(badge, user)}</div>
                                                  </div>
                                                  <div className="text-[9px] text-white font-black mb-2 text-left">
                                                      {getBadgeConditionText(badge)}
                                                  </div>
                                                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                                                      <div className={`absolute top-0 left-0 h-full ${isLastBadge ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-500'}`} style={{ width: `${getBadgeProgress(badge, user)}%` }}></div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'store' && (
                  <div className="animate-in zoom-in-95 duration-500 pb-20">
                      <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/10">
                          <button 
                              onClick={() => setStoreTab('frames')} 
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${storeTab === 'frames' ? 'bg-primary text-white shadow-glow' : 'text-slate-500 hover:text-white'}`}
                          >
                              ÇERÇEVELER
                          </button>
                          <button 
                              onClick={() => setStoreTab('avatars')} 
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${storeTab === 'avatars' ? 'bg-primary text-white shadow-glow' : 'text-slate-500 hover:text-white'}`}
                          >
                              AVATARLAR
                          </button>
                      </div>

                      {storeTab === 'frames' && (
                          <div className="grid grid-cols-2 gap-6">
                              {LOCAL_FRAMES.map(frame => {
                                  const isOwned = user.ownedFrames.includes(frame.id);
                                  const isEquipped = user.frameId === frame.id;
                                  return (
                                      <div key={frame.id} onClick={() => isOwned ? onEquipFrame(frame.id) : (onBuyFrame(frame.id, frame.cost) && triggerNotif("Seçkin Çerçeve Aktif!"))} className={`p-6 rounded-[3rem] bg-white/5 border-2 transition-all flex flex-col items-center gap-4 cursor-pointer active:scale-95 ${isEquipped ? 'border-primary bg-primary/10' : 'border-white/5'}`}>
                                          <div className={`w-24 h-24 rounded-full border-8 ${frame.color} ${frame.animation} flex items-center justify-center bg-slate-900 shadow-2xl overflow-hidden`}>
                                              <img src={user.avatarUrl} className="w-16 h-16 rounded-full opacity-40 grayscale" alt="" referrerPolicy="no-referrer" />
                                          </div>
                                          <div className="text-center">
                                              <p className="text-[10px] font-black uppercase tracking-widest leading-none">{frame.name}</p>
                                              {isOwned ? (
                                                  <p className={`text-[8px] font-black uppercase mt-2 ${isEquipped ? 'text-primary' : 'text-slate-500'}`}>{isEquipped ? 'AKTİF' : 'KUŞAN'}</p>
                                              ) : (
                                                  <p className="text-[10px] font-black text-yellow-500 mt-2 uppercase italic leading-none">{frame.cost} 🪙</p>
                                              )}
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      )}

                      {storeTab === 'avatars' && (
                          <div className="grid grid-cols-2 gap-6">
                              {STORE_AVATARS.map(avatar => {
                                  const isOwned = user.ownedAvatars?.includes(avatar.id);
                                  const avatarUrl = avatar.url;
                                  const isEquipped = user.avatarUrl === avatarUrl;
                                  
                                  const handleAvatarClick = () => {
                                      if (isOwned) {
                                          onUpdateUser({ avatarUrl });
                                          triggerNotif(`${avatar.name} kuşandı!`);
                                      } else {
                                          if (user.coins >= avatar.cost) {
                                              onUpdateUser({
                                                  coins: user.coins - avatar.cost,
                                                  ownedAvatars: [...(user.ownedAvatars || []), avatar.id],
                                                  avatarUrl
                                              });
                                              triggerNotif(`${avatar.name} satın alındı!`);
                                          } else {
                                              triggerNotif("Yetersiz jeton!");
                                          }
                                      }
                                  };

                                  return (
                                      <div key={avatar.id} onClick={handleAvatarClick} className={`p-6 rounded-[3rem] bg-white/5 border-2 transition-all flex flex-col items-center gap-4 cursor-pointer active:scale-95 ${isEquipped ? 'border-primary bg-primary/10' : 'border-white/5'}`}>
                                          <div className={`w-24 h-24 rounded-full border-8 ${isEquipped ? 'border-primary' : 'border-white/10'} flex items-center justify-center bg-slate-900 shadow-2xl overflow-hidden`}>
                                              <img src={avatarUrl} className="w-20 h-20 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                                          </div>
                                          <div className="text-center">
                                              <p className="text-[10px] font-black uppercase tracking-widest leading-none">{avatar.name}</p>
                                              {isOwned ? (
                                                  <p className={`text-[8px] font-black uppercase mt-2 ${isEquipped ? 'text-primary' : 'text-slate-500'}`}>{isEquipped ? 'AKTİF' : 'KUŞAN'}</p>
                                              ) : (
                                                  <p className="text-[10px] font-black text-yellow-500 mt-2 uppercase italic leading-none">{avatar.cost} 🪙</p>
                                              )}
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      )}
                  </div>
              )}
              {activeTab === 'levels' && (
                  <div className="space-y-4 animate-in slide-in-from-right duration-500 pb-20">
                      {LEVELS.map((levelObj) => {
                          const isCurrent = levelObj.level === currentLevel;
                          const isReached = solved.total >= levelObj.minQuestions;
                          return (
                              <div key={levelObj.level} className={`p-6 rounded-3xl border flex items-center justify-between ${isCurrent ? 'bg-indigo-900/50 border-indigo-500' : isReached ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                  <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${isCurrent ? 'bg-indigo-500 text-white' : isReached ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                          {levelObj.level}
                                      </div>
                                      <div>
                                          <h3 className="font-black text-white">Seviye {levelObj.level}</h3>
                                          <p className="text-xs text-slate-400">{levelObj.minQuestions} Soru</p>
                                      </div>
                                  </div>
                                  {isCurrent && <span className="text-xs font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">Şu an</span>}
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>
      </div>

      {/* Avatar Picker Overlay */}
      {showAvatarPicker && (
          <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-3xl p-8 animate-in slide-in-from-bottom flex flex-col">
              <div className="flex justify-between items-center mb-12 shrink-0">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">PERSONA SEÇ</h2>
                  <button onClick={() => setShowAvatarPicker(false)} className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"><span className="material-symbols-outlined">close</span></button>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar pb-20 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-[2.5rem] border border-blue-500/30 flex flex-col items-center text-center gap-4">
                          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-glow">
                              <span className="material-symbols-outlined text-3xl">photo_library</span>
                          </div>
                          <div>
                              <h3 className="text-xl font-black italic uppercase">Galeriden Seç</h3>
                              <p className="text-[10px] text-blue-300 font-bold mt-1">Kendi fotoğrafını yükle!</p>
                          </div>
                          <label className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black uppercase text-xs shadow-glow active:scale-95 transition-all mt-2 cursor-pointer inline-block">
                              FOTOĞRAF YÜKLE
                              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                          </label>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-[2.5rem] border border-indigo-500/30 flex flex-col items-center text-center gap-4">
                          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-glow">
                              <span className="material-symbols-outlined text-3xl">image_edit_auto</span>
                          </div>
                          <div>
                              <h3 className="text-xl font-black italic uppercase">AI Avatar</h3>
                              <input 
                                  type="text" 
                                  placeholder="Avatarını tarif et..." 
                                  value={avatarPrompt}
                                  onChange={(e) => setAvatarPrompt(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold mt-2 outline-none"
                              />
                          </div>
                          <button 
                              onClick={handleGenerateAvatar}
                              disabled={isGeneratingAvatar}
                              className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs shadow-glow active:scale-95 transition-all mt-2 disabled:opacity-50"
                          >
                              {isGeneratingAvatar ? 'ÜRETİLİYOR...' : 'ÜRETMEYE BAŞLA'}
                          </button>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                      {PRESET_AVATARS.map(avatar => (
                          <div key={avatar.id} onClick={() => { onUpdateUser({ avatarUrl: avatar.url }); setShowAvatarPicker(false); triggerNotif("Persona Güncellendi!"); }} className={`p-6 rounded-[2.5rem] bg-white/5 border-2 transition-all flex flex-col items-center gap-4 ${user.avatarUrl === avatar.url ? 'border-primary' : 'border-white/5 opacity-50 hover:opacity-100 hover:grayscale-0 grayscale'}`}>
                              <img src={avatar.url} className="w-28 h-28 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                              <div className="text-center">
                                  <p className="text-lg font-black italic tracking-tighter uppercase leading-none">{avatar.name}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Add Questions Modal */}
      {showAddQuestions && (
          <div className="fixed inset-0 z-[800] bg-black/95 backdrop-blur-3xl p-8 animate-in slide-in-from-bottom">
              <div className="flex justify-between items-center mb-12">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">SORU EKLE</h2>
                  <button onClick={() => setShowAddQuestions(false)} className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"><span className="material-symbols-outlined">close</span></button>
              </div>
              
              <div className="space-y-8">
                  <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">DERS SEÇİMİ</p>
                      <select 
                        value={manualQuestions.subject}
                        onChange={(e) => setManualQuestions(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none text-sm font-bold appearance-none"
                      >
                          {["Matematik", "Türkçe", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Din Kültürü"].map(s => (
                              <option key={s} value={s} className="bg-[#0F172A]">{s}</option>
                          ))}
                      </select>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                      <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                                  <span className="material-symbols-outlined">quiz</span>
                              </div>
                              <span className="text-xs font-black uppercase italic">TEST SORUSU</span>
                          </div>
                          <div className="flex items-center gap-4">
                              <button onClick={() => setManualQuestions(prev => ({ ...prev, test: Math.max(0, prev.test - 5) }))} className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center font-black">-5</button>
                              <span className="w-12 text-center text-lg font-black italic">{manualQuestions.test}</span>
                              <button onClick={() => setManualQuestions(prev => ({ ...prev, test: Math.min(30, prev.test + 5) }))} className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center font-black">+5</button>
                          </div>
                      </div>
                      <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400">
                                  <span className="material-symbols-outlined">edit_note</span>
                              </div>
                              <span className="text-xs font-black uppercase italic">KLASİK SORU</span>
                          </div>
                          <div className="flex items-center gap-4">
                              <button onClick={() => setManualQuestions(prev => ({ ...prev, classic: Math.max(0, prev.classic - 5) }))} className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center font-black">-5</button>
                              <span className="w-12 text-center text-lg font-black italic">{manualQuestions.classic}</span>
                              <button onClick={() => setManualQuestions(prev => ({ ...prev, classic: Math.min(30, prev.classic + 5) }))} className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center font-black">+5</button>
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={handleManualAdd}
                    className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black uppercase text-sm shadow-glow active:scale-95 transition-all mt-8"
                  >
                    İSTATİSTİKLERİ GÜNCELLE
                  </button>
              </div>
          </div>
      )}
      {/* Report Issue Overlay */}
      {showReportIssue && (
          <div className="fixed inset-0 z-[650] bg-[#0F172A] flex flex-col p-8 animate-in slide-in-from-right duration-300 overflow-y-auto">
              <header className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-rose-500">SORUN BİLDİR</h2>
                  <button onClick={() => setShowReportIssue(false)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </header>
              <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                      <p className="text-xs text-slate-400 mb-6 leading-relaxed">Karşılaştığınız sorunu veya iletmek istediğiniz geri bildirimi detaylı bir şekilde yazın. Ekibimiz en kısa sürede inceleyecektir.</p>
                      <textarea 
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          placeholder="Sorunu buraya yazın..." 
                          className="w-full h-40 bg-black/40 rounded-2xl p-4 border border-white/10 outline-none text-sm font-bold text-white resize-none mb-4"
                      ></textarea>
                      <button 
                          onClick={() => { 
                              if(!reportText.trim()) return;
                              triggerNotif("Bildiriminiz başarıyla iletildi. Teşekkürler!"); 
                              setShowReportIssue(false); 
                              setReportText('');
                          }} 
                          className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase active:scale-95 transition-transform"
                      >
                          GÖNDER
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Statistics Overlay */}
      {showStatistics && (
          <div className="fixed inset-0 z-[650] bg-[#0F172A] flex flex-col p-8 animate-in slide-in-from-right duration-300 overflow-y-auto">
              <header className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-cyan-500">İSTATİSTİKLER</h2>
                  <button onClick={() => setShowStatistics(false)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </header>
              <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500">
                          <span className="material-symbols-outlined text-3xl">timer</span>
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Toplam Ders Çalışma</p>
                          <p className="text-3xl font-black italic text-white">42 <span className="text-sm text-slate-400">Saat</span> 15 <span className="text-sm text-slate-400">Dk</span></p>
                      </div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                          <span className="material-symbols-outlined text-3xl">smartphone</span>
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Uygulamada Geçirilen Süre</p>
                          <p className="text-3xl font-black italic text-white">56 <span className="text-sm text-slate-400">Saat</span></p>
                      </div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                      <h3 className="text-sm font-black uppercase italic mb-6">Çalışılan Dersler</h3>
                      <div className="space-y-4">
                          {[
                              { name: 'Matematik', hours: 18, color: 'bg-blue-500', percent: 45 },
                              { name: 'Fizik', hours: 12, color: 'bg-emerald-500', percent: 30 },
                              { name: 'Türkçe', hours: 8, color: 'bg-amber-500', percent: 20 },
                              { name: 'Kimya', hours: 4, color: 'bg-rose-500', percent: 10 },
                          ].map(subject => (
                              <div key={subject.name} className="space-y-2">
                                  <div className="flex justify-between text-xs font-black uppercase">
                                      <span>{subject.name}</span>
                                      <span className="text-slate-400">{subject.hours} Saat</span>
                                  </div>
                                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                      <div className={`h-full ${subject.color} rounded-full`} style={{ width: `${subject.percent}%` }} />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Target Rank Modal */}
      {showTargetRankModal && (
          <div className="fixed inset-0 z-[650] bg-[#0F172A] flex flex-col p-8 animate-in slide-in-from-bottom duration-300 overflow-y-auto">
              <header className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">HEDEF RÜTBE</h2>
                  <button onClick={() => setShowTargetRankModal(false)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </header>
              <div className="space-y-4">
                  {RANKS.map((rank) => {
                      const isCurrent = currentRank.id === rank.id;
                      const isTarget = targetRank?.id === rank.id;
                      const isUnlocked = solved.total >= rank.min;
                      
                      return (
                          <div 
                              key={rank.id}
                              onClick={() => {
                                  if (!isUnlocked && !isCurrent) {
                                      onUpdateUser({ targetRankId: rank.id });
                                      setShowTargetRankModal(false);
                                      triggerNotif(`Hedef rütbe ${rank.name} olarak belirlendi!`);
                                  }
                              }}
                              className={`p-6 rounded-[2rem] border transition-all ${isTarget ? 'bg-primary/20 border-primary shadow-glow' : isUnlocked ? 'bg-white/5 border-white/10 opacity-50' : 'bg-[#1e293b] border-white/5 hover:border-white/20 cursor-pointer'}`}
                          >
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${rank.bg} ${rank.border} border`}>
                                          <span className={`material-symbols-outlined text-2xl ${rank.color}`}>{rank.icon}</span>
                                      </div>
                                      <div>
                                          <h3 className={`text-xl font-black italic uppercase ${rank.color}`}>{rank.name}</h3>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rank.min} SORU</p>
                                      </div>
                                  </div>
                                  {isCurrent ? (
                                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg">MEVCUT</span>
                                  ) : isTarget ? (
                                      <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg">HEDEF</span>
                                  ) : isUnlocked ? (
                                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg">GEÇİLDİ</span>
                                  ) : (
                                      <span className="material-symbols-outlined text-slate-600">chevron_right</span>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      {/* Claiming Badge Modal */}
      {claimingBadge && (
          <div className="fixed inset-0 z-[3000] bg-black/90 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent animate-pulse"></div>
              </div>
              
              <div className="relative z-10 flex flex-col items-center animate-bounce-custom">
                  <div className={`w-32 h-32 rounded-[3rem] bg-white/10 flex items-center justify-center ${claimingBadge.color} border-2 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.2)] mb-8 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 animate-shimmer"></div>
                      <span className="material-symbols-outlined text-7xl drop-shadow-2xl">{claimingBadge.icon}</span>
                  </div>
                  
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-2 text-center drop-shadow-lg">
                      ROZET KAZANILDI!
                  </h2>
                  <h3 className={`text-2xl font-bold ${claimingBadge.color} mb-4 text-center`}>
                      {claimingBadge.name}
                  </h3>
                  <p className="text-slate-300 text-center mb-8 max-w-[250px]">
                      {claimingBadge.description}
                  </p>
                  
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-2xl px-6 py-3 flex items-center gap-3 animate-pulse">
                      <span className="material-symbols-outlined text-yellow-400 text-3xl">monetization_on</span>
                      <div className="text-left">
                          <div className="text-[10px] text-yellow-200 font-bold uppercase">Ödül</div>
                          <div className="text-xl font-black text-yellow-400">+{claimingBadge.rewardCoins} Coin</div>
                      </div>
                  </div>
              </div>
          </div>
      )}
      {levelUp !== null && (
        <LevelUpAnimation level={levelUp} currentQuestions={solved.total} targetQuestions={currentLevelObj.minQuestions} onComplete={() => setLevelUp(null)} />
      )}
    </div>
  );
};
