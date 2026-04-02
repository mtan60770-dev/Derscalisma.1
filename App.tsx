
import React, { useState, useEffect } from 'react';
import { ViewState, Task, User, Exam, GroupMessage, GiftRecord } from './types';
import { motion } from 'framer-motion';
import { evaluateAppeal } from './services/geminiService';
import { Onboarding } from './pages/Onboarding';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { CreateProgram } from './pages/CreateProgram';
import { Profile } from './pages/Profile';
import { PastExams } from './pages/PastExams';
import { Analytics } from './pages/Analytics';
import { AddExam } from './pages/AddExam';
import { DailyBonus } from './pages/DailyBonus';
import { StudentManagement } from './pages/StudentManagement';
import { AiTest } from './pages/AiTest';
import { AiCompetition } from './pages/AiCompetition';
import { AiVideo } from './pages/AiVideo';
import { AiSolver } from './pages/AiSolver';
import { Groups } from './pages/Groups';
import { Contest } from './pages/Contest';
import { Security } from './pages/Security';
import { SpecialEvent } from './pages/SpecialEvent';
import { PopularityRanking } from './pages/PopularityRanking';
import { Friends } from './pages/Friends';
import { FriendProfile } from './pages/FriendProfile';
import { BottomNav } from './components/BottomNav';

const defaultUser: User = {
  id: 'student-1',
  name: "Öğrenci 2026",
  password: "1234", 
  schoolNumber: "1234",
  className: "Focus Pro",
  grade: 12, 
  avatarUrl: "https://api.dicebear.com/9.x/micah/svg?seed=Felix&backgroundColor=b6e3f4",
  progress: 0,
  totalTasks: 0,
  completedTasks: 0,
  email: '',
  coins: 500, 
  diamonds: 100, 
  averageScore: 92,
  streak: 1,
  lastBonusClaimTime: 0,
  frameId: 'frame_none',
  ownedFrames: ['frame_none'],
  goals: [],
  completedMissionsToday: [],
  isPrivacyModeEnabled: false,
  isAiModerationEnabled: true,
  dailyGoalTasks: 5,
  solvedQuestions: {
    total: 1250,
    test: 850,
    classic: 300,
    performance: 100,
    bySubject: {
      "Matematik": 450,
      "Türkçe": 320,
      "Fen Bilimleri": 280,
      "Sosyal Bilgiler": 200
    }
  },
  loginSessions: [
    { id: '1', deviceName: 'iPhone 15 Pro', location: 'İstanbul, TR', lastActive: Date.now(), isCurrent: true },
    { id: '2', deviceName: 'MacBook Pro', location: 'Ankara, TR', lastActive: Date.now() - 86400000, isCurrent: false }
  ],
  notifications: [
    { id: 'n1', title: 'Yeni Güncelleme!', message: 'Haftalık ders programı görünümü yenilendi! Artık daha profesyonel bir çizelgeye sahipsin.', timestamp: Date.now(), isRead: false, type: 'update' },
    { id: 'n2', title: 'Güvenlik Merkezi', message: 'Hesabını daha güvenli hale getirmek için PIN kodu ve cihaz geçmişi özelliklerini kullanabilirsin.', timestamp: Date.now() - 3600000, isRead: false, type: 'feature' }
  ]
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateText, setUpdateText] = useState("Güncelleme başlatılıyor...");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadText, setDownloadText] = useState("Sisteme bağlanılıyor...");
  const [view, setView] = useState<ViewState>(ViewState.ONBOARDING);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<User[]>([defaultUser]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [chatFriend, setChatFriend] = useState<User | null>(null);
  const [chatMsg, setChatMsg] = useState('');

  // Appeal State
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [isAppealing, setIsAppealing] = useState(false);
  const [appealResult, setAppealResult] = useState<{accepted: boolean, message: string} | null>(null);

  const user = students[currentUserIndex];

  useEffect(() => {
    if (chatFriend && user.friendChats && user.friendChats[chatFriend.id]) {
      const chats = user.friendChats[chatFriend.id];
      const hasUnread = chats.some(msg => msg.senderId === chatFriend.id && !msg.isRead);
      if (hasUnread) {
        const updatedChats = chats.map(msg => msg.senderId === chatFriend.id ? {...msg, isRead: true} : msg);
        updateUserState(u => ({...u, friendChats: {...u.friendChats, [chatFriend.id]: updatedChats}}));
      }
    }
  }, [chatFriend, user.friendChats]);

  const sendMessage = () => {
    if (!chatFriend || !chatMsg.trim()) return;
    const newMsg: GroupMessage = {
        id: Date.now().toString(),
        senderId: user.id,
        senderName: user.name,
        text: chatMsg,
        timestamp: Date.now(),
        type: 'text',
        isRead: false
    };
    const currentChats = user.friendChats || {};
    const friendChat = currentChats[chatFriend.id] || [];
    updateUserState(u => ({...u, friendChats: { ...currentChats, [chatFriend.id]: [...friendChat, newMsg] } }));
    setChatMsg('');
  };

  const sendGift = (friendId: string, giftIcon: string, cost: number, popularity: number) => {
    if (user.coins >= cost) {
        updateUserState(u => ({...u, coins: u.coins - cost}));
        const newGift: GiftRecord = {
          senderId: user.id,
          senderName: user.name,
          giftIcon,
          timestamp: Date.now()
        };
        setStudents(prev => prev.map(s => s.id === friendId ? {
          ...s, 
          popularity: (s.popularity || 0) + popularity,
          dailyPopularity: (s.dailyPopularity || 0) + popularity,
          weeklyPopularity: (s.weeklyPopularity || 0) + popularity,
          receivedGifts: [...(s.receivedGifts || []), newGift]
        } : s));
        const newMsg: GroupMessage = {
            id: Date.now().toString(),
            senderId: user.id,
            senderName: user.name,
            text: 'Sana bir hediye gönderdim!',
            timestamp: Date.now(),
            type: 'gift',
            giftIcon: giftIcon,
            isRead: false
        };
        const currentChats = user.friendChats || {};
        const friendChat = currentChats[friendId] || [];
        updateUserState(u => ({...u, friendChats: { ...currentChats, [friendId]: [...friendChat, newMsg] } }));
    }
  };

  useEffect(() => {
    const savedUsers = localStorage.getItem('focusApp_users');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (parsed && parsed.length > 0) {
          const now = Date.now();
          const ONE_DAY = 24 * 60 * 60 * 1000;
          const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
          const updatedStudents = parsed.map((u: User) => {
              let updated = { ...u };
              if (now - (u.lastDailyReset || 0) > ONE_DAY) {
                  updated.dailyPopularity = 0;
                  updated.lastDailyReset = now;
              }
              if (now - (u.lastWeeklyReset || 0) > FIVE_DAYS) {
                  updated.weeklyPopularity = 0;
                  updated.lastWeeklyReset = now;
              }
              return updated;
          });
          setStudents(updatedStudents);
          const lastId = localStorage.getItem('focusApp_currentUserId');
          if (lastId) {
            const idx = parsed.findIndex((u: User) => u.id === lastId);
            if (idx !== -1) {
              setCurrentUserIndex(idx);
              setView(ViewState.DASHBOARD);
            }
          }
        }
      } catch (e) { console.error("Storage error", e); }
    }

    const startNormalLoading = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2; // 50 steps * 100ms = 5000ms
        if (progress > 100) progress = 100;
        setDownloadProgress(progress);

        if (progress < 20) setDownloadText("Sunucuya bağlanılıyor...");
        else if (progress < 40) setDownloadText("Kullanıcı profilleri indiriliyor...");
        else if (progress < 60) setDownloadText("Güvenlik protokolleri aktif ediliyor...");
        else if (progress < 80) setDownloadText("Yapay zeka modülleri yükleniyor...");
        else if (progress < 100) setDownloadText("Arayüz hazırlanıyor...");
        else setDownloadText("Sistem Hazır!");

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 200);
        }
      }, 100);
    };

    const CURRENT_VERSION = "v4.5";
    const savedVersion = localStorage.getItem('focusApp_version');

    if (savedVersion !== CURRENT_VERSION) {
      setIsUpdating(true);
      let upProgress = 0;
      const upInterval = setInterval(() => {
        upProgress += 0.5; // 200 steps * 100ms = 20000ms (20 seconds)
        if (upProgress > 100) upProgress = 100;
        setUpdateProgress(Math.floor(upProgress));

        if (upProgress < 20) setUpdateText("Güncelleme paketleri aranıyor...");
        else if (upProgress < 40) setUpdateText("Yeni sürüm indiriliyor...");
        else if (upProgress < 60) setUpdateText("Dosyalar çıkartılıyor...");
        else if (upProgress < 80) setUpdateText("Sistem dosyaları değiştiriliyor...");
        else if (upProgress < 100) setUpdateText("Güncelleme tamamlanıyor...");
        else setUpdateText("Güncelleme Başarılı!");

        if (upProgress >= 100) {
          clearInterval(upInterval);
          setTimeout(() => {
            setIsUpdating(false);
            localStorage.setItem('focusApp_version', CURRENT_VERSION);
            startNormalLoading();
          }, 500);
        }
      }, 100);
      return () => clearInterval(upInterval);
    } else {
      startNormalLoading();
    }
  }, []);

  useEffect(() => {
    if (user.isSecurityEnabled && !isPinVerified && ![ViewState.ONBOARDING, ViewState.AUTH].includes(view)) {
      // Pin check is handled by the overlay
    }
  }, [user.isSecurityEnabled, isPinVerified, view]);

  const updateUserState = (updater: (u: User) => User) => {
    setStudents(prev => {
      const newStudents = [...prev];
      newStudents[currentUserIndex] = updater(newStudents[currentUserIndex]);
      localStorage.setItem('focusApp_users', JSON.stringify(newStudents));
      return newStudents;
    });
  };

  const updateOtherUser = (userId: string, data: Partial<User>) => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === userId ? {...s, ...data} : s);
      localStorage.setItem('focusApp_users', JSON.stringify(updated));
      return updated;
    });
  };

  const handleBuyFrame = (frameId: string, cost: number) => {
      if (user.coins >= cost) {
          updateUserState(u => ({
              ...u, 
              coins: u.coins - cost, 
              ownedFrames: [...u.ownedFrames, frameId],
              frameId: frameId
          }));
          return true;
      }
      return false;
  };

  const handleSendCoins = (friendId: string, amount: number) => {
      if (user.coins >= amount) {
          updateUserState(u => ({...u, coins: u.coins - amount}));
          setStudents(prev => prev.map(s => s.id === friendId ? {...s, coins: (s.coins || 0) + amount} : s));
          return true;
      }
      return false;
  };

  const handleLogin = async (name: string, password: string, email: string, grade: number, rememberMe: boolean, isRegister: boolean): Promise<boolean> => {
    if (isRegister) {
      const newUser: User = { ...defaultUser, id: `student-${Date.now()}`, name, password, email, grade };
      const updated = [...students, newUser];
      setStudents(updated);
      setCurrentUserIndex(updated.length - 1);
      localStorage.setItem('focusApp_users', JSON.stringify(updated));
      if (rememberMe) localStorage.setItem('focusApp_currentUserId', newUser.id);
      setView(ViewState.DASHBOARD);
      return true;
    } else {
      const idx = students.findIndex(s => s.name.toLowerCase() === name.toLowerCase() && s.password === password);
      if (idx !== -1) {
        setCurrentUserIndex(idx);
        if (rememberMe) localStorage.setItem('focusApp_currentUserId', students[idx].id);
        setView(ViewState.DASHBOARD);
        return true;
      }
      return false;
    }
  };

  const handleCompleteMission = (missionId: string, reward: number) => {
      updateUserState(u => ({
          ...u,
          coins: u.coins + reward,
          completedMissionsToday: [...(u.completedMissionsToday || []), missionId]
      }));
  };

  const handleCompleteSpecialDay = (dayIndex: number, reward: number, eventDuration: 20 | 40 | 60) => {
    updateUserState(u => ({
      ...u,
      coins: u.coins + reward,
      specialEventProgress20: eventDuration === 20 ? [...(u.specialEventProgress20 || []), dayIndex] : u.specialEventProgress20,
      specialEventProgress40: eventDuration === 40 ? [...(u.specialEventProgress40 || []), dayIndex] : u.specialEventProgress40,
      specialEventProgress60: eventDuration === 60 ? [...(u.specialEventProgress60 || []), dayIndex] : u.specialEventProgress60,
      lastSpecialEventCompletionTime20: eventDuration === 20 ? Date.now() : u.lastSpecialEventCompletionTime20,
      lastSpecialEventCompletionTime40: eventDuration === 40 ? Date.now() : u.lastSpecialEventCompletionTime40,
      lastSpecialEventCompletionTime60: eventDuration === 60 ? Date.now() : u.lastSpecialEventCompletionTime60
    }));
  };

  const handleViolation = (reason: string) => {
    updateUserState(u => {
      const count = (u.violationCount || 0) + 1;
      let timeoutUntil = u.timeoutUntil;
      let isBanned = u.isBanned;
      let banReason = u.banReason;
      let timeoutReason = reason;

      if (count === 1) {
        // 1 hour timeout
        timeoutUntil = Date.now() + 1 * 60 * 60 * 1000;
      } else if (count === 2) {
        // 24 hours timeout
        timeoutUntil = Date.now() + 24 * 60 * 60 * 1000;
      } else {
        // Permanent ban
        isBanned = true;
        banReason = `Yapay Zeka Moderasyonu (Tekrarlayan İhlaller): ${reason}`;
      }

      return {
        ...u,
        violationCount: count,
        timeoutUntil,
        isBanned,
        banReason,
        timeoutReason
      };
    });
  };

  const handleUpdateSolvedQuestions = (type: 'test' | 'classic', count: number, subject: string) => {
    updateUserState(u => {
      const solved = u.solvedQuestions || { total: 0, test: 0, classic: 0, performance: 0, bySubject: {} };
      const newBySubject = { ...solved.bySubject };
      newBySubject[subject] = (newBySubject[subject] || 0) + count;
      
      return {
        ...u,
        solvedQuestions: {
          ...solved,
          total: solved.total + count,
          [type]: (solved as any)[type] + count,
          bySubject: newBySubject
        }
      };
    });
  };

  const handleAppealSubmit = async () => {
    if (!appealText.trim()) return;
    setIsAppealing(true);
    const reason = user.isBanned ? user.banReason : user.timeoutReason;
    const result = await evaluateAppeal(reason || 'Kural ihlali', appealText);
    setAppealResult(result);
    setIsAppealing(false);

    if (result.accepted) {
      updateUserState(u => ({
        ...u,
        isBanned: false,
        timeoutUntil: undefined,
        banReason: undefined,
        timeoutReason: undefined
      }));
      setTimeout(() => {
        setShowAppeal(false);
        setAppealResult(null);
        setAppealText('');
      }, 3000);
    }
  };

  const getRemainingTime = (timeoutUntil?: number) => {
    if (!timeoutUntil) return null;
    const diff = timeoutUntil - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let res = [];
    if (days > 0) res.push(`${days} gün`);
    if (hours > 0) res.push(`${hours} saat`);
    if (minutes > 0) res.push(`${minutes} dk`);
    return res.join(' ') + ' kaldı';
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.ONBOARDING: return <Onboarding onStart={() => setView(ViewState.AUTH)} />;
      case ViewState.AUTH: return <Auth onLogin={handleLogin} />;
      case ViewState.DASHBOARD: 
        return <Dashboard 
          user={user} tasks={tasks} exams={exams} 
          onTaskToggle={(id) => {
              const task = tasks.find(t => t.id === id);
              const isCompleting = !task?.completed;
              setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t));
              updateUserState(u => {
                  const newCompletedCount = u.completedTasks + (isCompleting ? 1 : -1);
                  const goal = u.dailyGoalTasks || 5;
                  let bonus = 0;
                  // If just reached the goal
                  if (isCompleting && newCompletedCount === goal) {
                      bonus = 50;
                  }
                  return {
                      ...u, 
                      completedTasks: newCompletedCount,
                      coins: u.coins + bonus
                  };
              });
          }} 
          onChangeView={setView} 
          onSpendCoins={(amt) => { if(user.coins >= amt) { updateUserState(u => ({...u, coins: u.coins - amt})); return true; } return false; }} 
          onUpdateExamScore={(id, score) => setExams(prev => prev.map(e => e.id === id ? {...e, actualScore: score} : e))} 
          onBuyDiamonds={(amt) => { updateUserState(u => ({...u, diamonds: u.diamonds + amt})); return true; }} 
          onExchange={(cost, reward) => { if(user.diamonds >= cost) { updateUserState(u => ({...u, diamonds: u.diamonds - cost, coins: u.coins + reward})); return true; } return false; }} 
          onCompleteMission={handleCompleteMission}
        />;
      case ViewState.CALENDAR: return <Calendar tasks={tasks} onAddTask={() => setView(ViewState.CREATE)} onDeleteTask={(id) => setTasks(prev => prev.filter(t => t.id !== id))} />;
      case ViewState.CREATE: return <CreateProgram user={user} onBack={() => setView(ViewState.DASHBOARD)} onSave={(t) => { setTasks([...tasks, ...t]); setView(ViewState.CALENDAR); }} onViolation={handleViolation} />;
      case ViewState.GROUPS: return <Groups user={user} allUsers={students} onSpendCoins={(amt) => { if(user.coins >= amt) { updateUserState(u => ({...u, coins: u.coins - amt})); return true; } return false; }} onBack={() => setView(ViewState.DASHBOARD)} onUpdateUser={(data) => updateUserState(u => ({...u, ...data}))} onViolation={handleViolation} />;
      case ViewState.PROFILE: return <Profile 
          user={user} exams={exams} onBack={() => setView(ViewState.DASHBOARD)} 
          onUpdateUser={(data) => updateUserState(u => ({...u, ...data}))} 
          onChangeView={setView} 
          onBuyFrame={handleBuyFrame}
          onEquipFrame={(id) => updateUserState(u => ({...u, frameId: id}))} 
          onLogout={() => { localStorage.removeItem('focusApp_currentUserId'); setView(ViewState.AUTH); }} 
        />;
      case ViewState.AI_TEST: return <AiTest user={user} onBack={() => setView(ViewState.DASHBOARD)} onEarnCoins={(amt) => updateUserState(u => ({...u, coins: u.coins + amt}))} onUpdateSolvedQuestions={handleUpdateSolvedQuestions} onUpdateUser={(data) => updateUserState(u => ({...u, ...data}))} onViolation={handleViolation} onChangeView={setView} />;
      case ViewState.AI_COMPETITION: return <AiCompetition user={user} onBack={() => setView(ViewState.DASHBOARD)} onUpdateUser={(data) => updateUserState(u => ({...u, ...data}))} onViolation={handleViolation} />;
      case ViewState.AI_VIDEO: return <AiVideo user={user} onBack={() => setView(ViewState.DASHBOARD)} onViolation={handleViolation} />;
      case ViewState.AI_SOLVER: return <AiSolver user={user} onUpdateUser={(data) => updateUserState(u => ({...u, ...data}))} onBack={() => setView(ViewState.DASHBOARD)} onViolation={handleViolation} />;
      case ViewState.PAST_EXAMS: return <PastExams user={user} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.DAILY_BONUS: return <DailyBonus user={user} onBack={() => setView(ViewState.DASHBOARD)} onClaim={(amount) => { 
          updateUserState(u => ({...u, coins: u.coins + amount, streak: u.streak + 1, lastBonusClaimTime: Date.now()})); 
          return true; 
      }} />;
      case ViewState.ADD_EXAM: return <AddExam onBack={() => setView(ViewState.DASHBOARD)} user={user} onSave={(exam) => { setExams([...exams, exam]); setView(ViewState.DASHBOARD); }} />;
      case ViewState.CONTEST: return <Contest user={user} students={students} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.SECURITY: return <Security user={user} onBack={() => setView(ViewState.PROFILE)} onUpdateUser={(data) => updateUserState(u => ({...u, ...data}))} onViolation={handleViolation} />;
      case ViewState.SPECIAL_EVENT_20: return <SpecialEvent user={user} onBack={() => setView(ViewState.DASHBOARD)} onCompleteDay={(d, r) => handleCompleteSpecialDay(d, r, 20)} onUpdateUser={(data) => updateUserState(u => ({...u, ...data}))} eventDuration={20} />;
      case ViewState.POPULARITY_RANKING: return <PopularityRanking students={students} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.SPECIAL_EVENT_40: return <SpecialEvent user={user} onBack={() => setView(ViewState.DASHBOARD)} onCompleteDay={(d, r) => handleCompleteSpecialDay(d, r, 40)} onUpdateUser={(data) => updateUserState(u => ({...u, ...data}))} eventDuration={40} />;
      case ViewState.SPECIAL_EVENT_60: return <SpecialEvent user={user} onBack={() => setView(ViewState.DASHBOARD)} onCompleteDay={(d, r) => handleCompleteSpecialDay(d, r, 60)} onUpdateUser={(data) => updateUserState(u => ({...u, ...data}))} eventDuration={60} />;
      case ViewState.FRIENDS: return <Friends user={user} students={students} onBack={() => setView(ViewState.DASHBOARD)} onUpdateUser={(data) => updateUserState(u => ({...u, ...data}))} onUpdateOtherUser={updateOtherUser} onSelectFriend={(friend) => { setSelectedFriend(friend); setView(ViewState.FRIEND_PROFILE); }} setChatFriend={setChatFriend} />;
      case ViewState.FRIEND_PROFILE: return selectedFriend ? <FriendProfile friend={selectedFriend} onBack={() => setView(ViewState.FRIENDS)} onSendCoins={handleSendCoins} onSendGift={sendGift} currentUserCoins={user.coins} setChatFriend={setChatFriend} /> : null;
      default: return <Dashboard user={user} tasks={tasks} exams={exams} onTaskToggle={() => {}} onChangeView={setView} onSpendCoins={() => true} onUpdateExamScore={() => {}} onBuyDiamonds={() => true} onExchange={() => true} onCompleteMission={() => {}} onViolation={handleViolation} />;
    }
  };

  return (
    <div className="w-full h-full min-h-[100dvh] bg-background-dark relative overflow-y-auto font-display">
      {chatFriend && (
        <div className="fixed inset-0 z-[2000] bg-[#0F172A] p-6 flex flex-col">
            <header className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black italic">{chatFriend.name}</h2>
                <button onClick={() => setChatFriend(null)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
            </header>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {(user.friendChats?.[chatFriend.id] || []).map(msg => (
                    <div key={msg.id} className={`p-3 rounded-xl ${msg.senderId === user.id ? 'bg-tg-blue text-white self-end ml-auto' : 'bg-white/10 text-white'}`}>
                        {msg.type === 'gift' ? (
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="flex items-center gap-2"
                            >
                                <span className="text-4xl">{msg.giftIcon}</span>
                                <p className="text-sm">{msg.text}</p>
                            </motion.div>
                        ) : (
                            <p className="text-sm">{msg.text}</p>
                        )}
                        {msg.senderId === user.id && (
                            <span className="text-[10px] opacity-70 block text-right">{msg.isRead ? 'Görüldü' : 'İletildi'}</span>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mb-2">
                {[
                    { icon: '🎁', cost: 50, popularity: 100 },
                    { icon: '❤️', cost: 100, popularity: 200 },
                    { icon: '✈️', cost: 200, popularity: 300 },
                    { icon: '🚗', cost: 500, popularity: 800 },
                    { icon: '⭐', cost: 1000, popularity: 1500 },
                ].map(gift => (
                    <button key={gift.icon} onClick={() => sendGift(chatFriend.id, gift.icon, gift.cost, gift.popularity)} className="flex flex-col items-center p-2 bg-white/5 rounded-xl">
                        <span className="text-2xl">{gift.icon}</span>
                        <span className="text-[10px] font-bold">{gift.cost} Coin</span>
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} className="flex-1 bg-white/5 p-3 rounded-xl" placeholder="Mesaj..." />
                <button onClick={sendMessage} className="bg-tg-blue text-white px-4 py-2 rounded-xl font-bold">Gönder</button>
            </div>
        </div>
      )}
      {isUpdating && (
          <div className="fixed inset-0 z-[2000] bg-[#0F172A] flex flex-col items-center justify-center p-8">
             <div className="relative w-32 h-32 mb-8">
                 <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                     <span className="material-symbols-outlined text-4xl text-emerald-500 animate-bounce">system_update_alt</span>
                 </div>
             </div>
             <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2 text-center">SİSTEM GÜNCELLEMESİ</h1>
             <p className="text-emerald-400 font-bold text-xs mb-8 animate-pulse">Lütfen cihazı kapatmayın</p>
             
             <div className="w-64 h-3 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/5">
                 <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-100 ease-linear" style={{ width: `${updateProgress}%` }}></div>
             </div>
             
             <div className="flex justify-between w-64 text-xs font-bold text-slate-400 mb-6">
                 <span>{updateProgress}%</span>
                 <span>100%</span>
             </div>

             <div className="bg-black/40 border border-white/5 rounded-xl p-4 w-full max-w-xs font-mono text-[10px] text-emerald-400">
                 <p className="animate-pulse">{`> ${updateText}`}</p>
             </div>
          </div>
      )}

      {loading && !isUpdating && (
          <div className="fixed inset-0 z-[1000] bg-[#0F172A] flex flex-col items-center justify-center p-8">
             <div className="relative w-32 h-32 mb-8">
                 <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                     <span className="material-symbols-outlined text-4xl text-indigo-500 animate-pulse">cloud_download</span>
                 </div>
             </div>
             <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2">SİSTEM BAŞLATILIYOR</h1>
             
             <div className="w-64 h-3 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/5">
                 <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100 ease-linear" style={{ width: `${downloadProgress}%` }}></div>
             </div>
             
             <div className="flex justify-between w-64 text-xs font-bold text-slate-400 mb-6">
                 <span>{downloadProgress}%</span>
                 <span>100%</span>
             </div>

             <div className="bg-black/40 border border-white/5 rounded-xl p-4 w-full max-w-xs font-mono text-[10px] text-emerald-400">
                 <p className="animate-pulse">{`> ${downloadText}`}</p>
                 {downloadProgress > 20 && <p className="opacity-50">{`> Sunucu bağlantısı başarılı [OK]`}</p>}
                 {downloadProgress > 40 && <p className="opacity-50">{`> Profil verileri senkronize edildi [OK]`}</p>}
                 {downloadProgress > 60 && <p className="opacity-50">{`> Güvenlik duvarı aktif [OK]`}</p>}
                 {downloadProgress > 80 && <p className="opacity-50">{`> AI Modülleri yüklendi [OK]`}</p>}
             </div>
          </div>
      )}
      
      {user.isSecurityEnabled && !isPinVerified && ![ViewState.ONBOARDING, ViewState.AUTH].includes(view) && !user.isBanned && (
        <div className="fixed inset-0 z-[200] bg-background-dark flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center text-primary mb-8 shadow-glow">
            <span className="material-symbols-outlined text-4xl">lock</span>
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">GÜVENLİK KİLİDİ</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-12">Lütfen 4 Haneli PIN Kodunuzu Girin</p>
          
          <div className="flex gap-4 mb-12">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${user.pinCode?.[i] ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5'}`}>
                {/* We don't show the actual numbers for security, just a dot if entered */}
                <div className={`w-3 h-3 rounded-full bg-primary transition-all ${i < (window as any)._currentPin?.length ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map(num => (
              <button
                key={num}
                onClick={() => {
                  const current = (window as any)._currentPin || '';
                  if (num === 'C') {
                    (window as any)._currentPin = current.slice(0, -1);
                  } else if (num === 'OK') {
                    if (current === user.pinCode) {
                      setIsPinVerified(true);
                      (window as any)._currentPin = '';
                    } else {
                      alert('Hatalı PIN Kodu!');
                      (window as any)._currentPin = '';
                    }
                  } else if (current.length < 4) {
                    (window as any)._currentPin = current + num;
                  }
                  // Force re-render
                  setLoading(l => l); 
                }}
                className="h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-xl hover:bg-white/10 active:scale-90 transition-all"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {user.isBanned && (
        <div className="fixed inset-0 z-[3000] bg-red-950 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-[2rem] flex items-center justify-center text-red-500 mb-8 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <span className="material-symbols-outlined text-5xl">gavel</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">HESAP ENGELLENDİ</h1>
          <p className="text-red-400 font-bold text-sm mb-8">Yapay Zeka Güvenlik Sistemi tarafından hesabınız askıya alındı.</p>
          
          <div className="bg-black/40 border border-red-500/20 rounded-2xl p-6 w-full max-w-xs mb-8">
            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">ENGEL NEDENİ</h3>
            <p className="text-white text-sm font-medium">{user.banReason || "Sistem kurallarının ihlali tespit edildi."}</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setShowAppeal(true)}
              className="px-8 py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest hover:bg-white/20 transition-colors"
            >
              İTİRAZ ET
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('focusApp_currentUserId');
                window.location.reload();
              }}
              className="px-8 py-4 rounded-2xl bg-red-500/20 text-red-500 font-black uppercase tracking-widest hover:bg-red-500/30 transition-colors"
            >
              ÇIKIŞ YAP
            </button>
          </div>
        </div>
      )}

      {!user.isBanned && user.timeoutUntil && user.timeoutUntil > Date.now() && (
        <div className="fixed inset-0 z-[3000] bg-orange-950 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-orange-500/20 rounded-[2rem] flex items-center justify-center text-orange-500 mb-8 shadow-[0_0_50px_rgba(249,115,22,0.3)]">
            <span className="material-symbols-outlined text-5xl">timer</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">GEÇİCİ UZAKLAŞTIRMA</h1>
          <p className="text-orange-400 font-bold text-sm mb-8">Yapay Zeka Güvenlik Sistemi tarafından geçici olarak uzaklaştırıldınız.</p>
          
          <div className="bg-black/40 border border-orange-500/20 rounded-2xl p-6 w-full max-w-xs mb-8">
            <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">UZAKLAŞTIRMA NEDENİ</h3>
            <p className="text-white text-sm font-medium mb-4">{user.timeoutReason || "Uygunsuz içerik veya hile girişimi."}</p>
            <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">KALAN SÜRE</h3>
            <p className="text-white text-xl font-black">{getRemainingTime(user.timeoutUntil)}</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setShowAppeal(true)}
              className="px-8 py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest hover:bg-white/20 transition-colors"
            >
              İTİRAZ ET
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('focusApp_currentUserId');
                window.location.reload();
              }}
              className="px-8 py-4 rounded-2xl bg-orange-500/20 text-orange-500 font-black uppercase tracking-widest hover:bg-orange-500/30 transition-colors"
            >
              ÇIKIŞ YAP
            </button>
          </div>
        </div>
      )}

      {showAppeal && (
        <div className="fixed inset-0 z-[4000] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-xl">
          <div className="bg-[#1E293B] w-full max-w-sm rounded-[2rem] p-6 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">CEZAYA İTİRAZ ET</h2>
            <p className="text-xs text-slate-400 mb-6">Yapay zeka yöneticisi itirazınızı inceleyecek. Lütfen mantıklı bir açıklama yapın veya özür dileyin.</p>
            
            <textarea
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              placeholder="İtirazınızı buraya yazın..."
              className="w-full h-32 bg-black/40 rounded-2xl p-4 text-sm text-white outline-none border border-white/5 focus:border-primary/50 resize-none mb-6"
              disabled={isAppealing || !!appealResult}
            />

            {appealResult && (
              <div className={`p-4 rounded-2xl mb-6 text-sm font-bold ${appealResult.accepted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {appealResult.message}
              </div>
            )}

            <div className="flex gap-3">
              {!appealResult && (
                <button 
                  onClick={() => setShowAppeal(false)}
                  className="flex-1 py-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
                  disabled={isAppealing}
                >
                  İPTAL
                </button>
              )}
              {!appealResult ? (
                <button 
                  onClick={handleAppealSubmit}
                  disabled={isAppealing || !appealText.trim()}
                  className="flex-1 py-4 rounded-xl bg-primary text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAppealing ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'GÖNDER'}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setShowAppeal(false);
                    setAppealResult(null);
                    setAppealText('');
                  }}
                  className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                >
                  KAPAT
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!user.isBanned && (!user.timeoutUntil || user.timeoutUntil <= Date.now()) && renderContent()}
      {!user.isBanned && (!user.timeoutUntil || user.timeoutUntil <= Date.now()) && ![ViewState.ONBOARDING, ViewState.AUTH].includes(view) && (
        <BottomNav currentView={view} onChangeView={setView} />
      )}
    </div>
  );
}
