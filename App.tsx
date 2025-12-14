import React, { useState, useEffect } from 'react';
import { ViewState, Task, User, Exam } from './types';
import { Onboarding } from './pages/Onboarding';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { CreateProgram } from './pages/CreateProgram';
import { Profile } from './pages/Profile';
import { Analytics } from './pages/Analytics';
import { AddExam } from './pages/AddExam';
import { DailyBonus } from './pages/DailyBonus';
import { StudentManagement } from './pages/StudentManagement';
import { AiTest } from './pages/AiTest';
import { AiVideo } from './pages/AiVideo';
import { AiSolver } from './pages/AiSolver';
import { BottomNav } from './components/BottomNav';

const defaultUser: User = {
  id: 'student-1',
  name: "Öğrenci",
  password: "1234", // Default password for testing
  schoolNumber: "1234",
  className: "12-A",
  grade: 9, // Default
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCixog0ga1gyp8KvF1wLdMDYPneLaJm_RyolUjv5Lbkl_r_f3vC7F2TK3yEbEH7KtSM4-7snlGLANiUvGt7U17ZOLKPa333uRdzc23HY2Fkb7S-EJwjCLdK16QmfubNUcreL5lqocir4QgMFqCMjiJC8si_fDeqeBP-M6o1Xb6kHrIitiLWbllOFh4ma4DC-w5yckvGBR6Pg79YQI9n8d-cMIA3MzE9PkiudcLe2OXa_rjFgAgGNBqGR2oK-sd9jz2Qsm5-xrTyrcc",
  progress: 0,
  totalTasks: 0,
  completedTasks: 0,
  email: '',
  coins: 100, 
  diamonds: 50, 
  averageScore: 78,
  streak: 1,
  lastBonusClaimTime: 0,
  frameId: 'frame_0',
  ownedFrames: ['frame_0'],
  goals: [] 
};

const initialTasks: Task[] = [];

// Splash Screen Component
const SplashScreen = () => (
  <div className="fixed inset-0 z-[100] bg-[#0F172A] flex flex-col items-center justify-center animate-out fade-out duration-1000 delay-1000 fill-mode-forwards">
    <div className="relative">
        <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse"></div>
        <div className="w-24 h-24 bg-gradient-to-tr from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 animate-bounce">
            <span className="material-symbols-outlined text-white text-5xl">school</span>
        </div>
    </div>
    <h1 className="mt-6 text-white text-2xl font-black tracking-tight animate-in slide-in-from-bottom-4 duration-700">Focus App</h1>
    <p className="text-slate-400 text-sm mt-2 animate-in slide-in-from-bottom-4 duration-700 delay-100">Öğrenci Asistanı</p>
  </div>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>(ViewState.ONBOARDING);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [exams, setExams] = useState<Exam[]>([]);
  
  // Student Management State
  // We initialize with defaultUser, but we will check localStorage for persisted users
  const [students, setStudents] = useState<User[]>([defaultUser]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);

  const user = students[currentUserIndex];

  // Helper to check and assign daily task
  const checkAndAssignDailyTask = (currentUser: User, currentTasks: Task[]) => {
      const todayDate = new Date().toDateString(); // Simple check string
      const hasDailyTask = currentTasks.some(t => t.id.startsWith('daily-task-') && t.date === todayDate);

      if (!hasDailyTask) {
          const grade = currentUser.grade || 9;
          let taskTitle = "Günlük Tekrar";
          let taskSubtitle = "Günü tekrar et";
          
          if (grade >= 1 && grade <= 4) {
              const opts = ["20 Sayfa Kitap Oku", "Çarpım Tablosu Çalış", "10 Toplama İşlemi Yap"];
              taskTitle = opts[Math.floor(Math.random() * opts.length)];
              taskSubtitle = "İlkokul Günlük Görevi";
          } else if (grade >= 5 && grade <= 8) {
              const opts = ["20 Paragraf Sorusu Çöz", "Fen Bilimleri Tekrarı", "İngilizce Kelime Çalış"];
              taskTitle = opts[Math.floor(Math.random() * opts.length)];
              taskSubtitle = "Ortaokul Günlük Görevi";
          } else {
              const opts = ["40 Paragraf Çöz", "Matematik Formül Tekrarı", "Bir Deneme Sınavı Çöz", "Edebiyat Notlarını Oku"];
              taskTitle = opts[Math.floor(Math.random() * opts.length)];
              taskSubtitle = "Lise Günlük Görevi";
          }

          const newTask: Task = {
              id: `daily-task-${Date.now()}`,
              title: taskTitle,
              subtitle: taskSubtitle,
              startTime: '18:00',
              endTime: '19:00',
              type: 'study',
              completed: false,
              color: 'purple',
              dayIndex: new Date().getDay() - 1,
              date: todayDate,
              reminder: true
          };

          setTasks(prev => [...prev, newTask]);
      }
  };

  useEffect(() => {
    // 1. Simulate splash screen delay
    const splashTimer = setTimeout(() => {
        setLoading(false);
    }, 2000);

    // 2. Check Storage for saved session (Local or Session)
    const savedSessionId = localStorage.getItem('focusApp_sessionId') || sessionStorage.getItem('focusApp_sessionId');
    const savedUsersStr = localStorage.getItem('focusApp_users');

    if (savedUsersStr) {
        try {
            const parsedUsers = JSON.parse(savedUsersStr);
            if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
                setStudents(parsedUsers);
                
                // If we have a saved session ID, try to find that user and auto-login
                if (savedSessionId) {
                    const foundIndex = parsedUsers.findIndex(u => u.id === savedSessionId);
                    if (foundIndex !== -1) {
                        setCurrentUserIndex(foundIndex);
                        setView(ViewState.DASHBOARD);
                        // Check for daily task on auto-login
                        checkAndAssignDailyTask(parsedUsers[foundIndex], tasks);
                    } else {
                        setView(ViewState.AUTH);
                    }
                } else {
                    setView(ViewState.AUTH);
                }
            }
        } catch (e) {
            console.error("Failed to parse saved users", e);
        }
    }

    return () => clearTimeout(splashTimer);
  }, []);

  // Helper to update current user state and PERSIST to local storage
  const updateUserState = (updater: (u: User) => User) => {
    setStudents(prev => {
      const newStudents = [...prev];
      newStudents[currentUserIndex] = updater(newStudents[currentUserIndex]);
      
      // Persist changes
      localStorage.setItem('focusApp_users', JSON.stringify(newStudents));
      return newStudents;
    });
  };

  const handleAddStudent = (newUser: User) => {
    setStudents(prev => {
        const updated = [...prev, newUser];
        localStorage.setItem('focusApp_users', JSON.stringify(updated));
        return updated;
    });
    setCurrentUserIndex(students.length); // Switch to new user
    setView(ViewState.DASHBOARD);
    checkAndAssignDailyTask(newUser, tasks);
  };

  const handleSwitchStudent = (id: string) => {
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      setCurrentUserIndex(index);
      setView(ViewState.DASHBOARD);
      checkAndAssignDailyTask(students[index], tasks);
      
      // Update session storage if active
      if (localStorage.getItem('focusApp_sessionId')) {
          localStorage.setItem('focusApp_sessionId', id);
      } else if (sessionStorage.getItem('focusApp_sessionId')) {
          sessionStorage.setItem('focusApp_sessionId', id);
      }
    }
  };

  const handleLogout = () => {
      // Clear session from both storages
      localStorage.removeItem('focusApp_sessionId');
      sessionStorage.removeItem('focusApp_sessionId');
      setView(ViewState.AUTH);
  };

  const handleClaimBonus = () => {
      const now = Date.now();
      const lastClaim = user.lastBonusClaimTime || 0;
      const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);

      if (hoursSinceLastClaim < 24 && lastClaim !== 0) return false;

      let newStreak = user.streak;
      if (hoursSinceLastClaim > 48) newStreak = 1;
      else if (lastClaim !== 0) newStreak = user.streak + 1;
      
      if (newStreak > 31) newStreak = 1;

      const coinReward = newStreak * 10;
      let diamondReward = 0;
      if (newStreak % 7 === 0 || newStreak === 31) diamondReward = 10; 

      updateUserState(u => ({
          ...u,
          coins: u.coins + coinReward,
          diamonds: u.diamonds + diamondReward,
          streak: newStreak,
          lastBonusClaimTime: now
      }));
      return true;
  };

  const handleTaskToggle = (id: string) => {
    setTasks(prev => {
        const newTasks = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        const completed = newTasks.filter(t => t.completed).length;
        const total = newTasks.length;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
        updateUserState(u => ({ ...u, completedTasks: completed, totalTasks: total, progress }));
        return newTasks;
    });
  };

  const handleAddTasks = (newTasks: Task[]) => {
      setTasks(prev => {
          const updated = [...prev, ...newTasks];
          const completed = updated.filter(t => t.completed).length;
          const total = updated.length;
          const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
          updateUserState(u => ({ ...u, completedTasks: completed, totalTasks: total, progress }));
          return updated;
      });
      setView(ViewState.CALENDAR);
  };

  const handleAddExam = (newExam: Exam) => {
    setExams(prev => [...prev, newExam]);
    setView(ViewState.DASHBOARD);
  };

  const handleUpdateExamScore = (examId: string, score: number) => {
      setExams(prev => {
          const updated = prev.map(e => e.id === examId ? { ...e, actualScore: score } : e);
          const scoredExams = updated.filter(e => e.actualScore !== undefined);
          const totalScore = scoredExams.reduce((sum, e) => sum + (e.actualScore || 0), 0);
          const average = scoredExams.length > 0 ? Math.round(totalScore / scoredExams.length) : 0;
          updateUserState(u => ({ ...u, averageScore: average }));
          return updated;
      });
  };

  const handleLogin = async (name: string, password: string, email: string, grade: number, rememberMe: boolean, isRegister: boolean): Promise<boolean> => {
    if (isRegister) {
        // Check if user exists
        if (students.some(s => s.name.toLowerCase() === name.toLowerCase())) {
            return false; // User exists
        }

        const newUser: User = {
            ...defaultUser,
            id: `student-${Date.now()}`,
            name,
            password,
            email,
            grade,
            coins: 150, // Bonus start
            goals: []
        };
        
        // Add to state and switch
        const updatedStudents = [...students, newUser];
        setStudents(updatedStudents);
        setCurrentUserIndex(updatedStudents.length - 1);
        
        // Persist Users
        localStorage.setItem('focusApp_users', JSON.stringify(updatedStudents));
        
        // Handle Session Persistence
        if (rememberMe) {
            localStorage.setItem('focusApp_sessionId', newUser.id);
        } else {
            sessionStorage.setItem('focusApp_sessionId', newUser.id);
        }

        setView(ViewState.DASHBOARD);
        checkAndAssignDailyTask(newUser, tasks);
        return true;
    } else {
        // Login Logic
        const foundUserIndex = students.findIndex(s => s.name.toLowerCase() === name.toLowerCase() && s.password === password);
        
        if (foundUserIndex !== -1) {
            setCurrentUserIndex(foundUserIndex);
            
            // Handle Session Persistence
            if (rememberMe) {
                localStorage.setItem('focusApp_sessionId', students[foundUserIndex].id);
            } else {
                sessionStorage.setItem('focusApp_sessionId', students[foundUserIndex].id);
            }
            
            setView(ViewState.DASHBOARD);
            checkAndAssignDailyTask(students[foundUserIndex], tasks);
            return true;
        } else {
            return false;
        }
    }
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    updateUserState(u => ({ ...u, ...updatedData }));
  };

  const spendCoins = (amount: number): boolean => {
      if (user.coins >= amount) {
          updateUserState(u => ({ ...u, coins: u.coins - amount }));
          return true;
      }
      return false;
  };

  const handleBuyDiamonds = (amount: number) => {
      updateUserState(u => ({ ...u, diamonds: u.diamonds + amount }));
      return true;
  };

  const handleExchangeDiamondsForCoins = (diamondCost: number, coinReward: number) => {
      if (user.diamonds >= diamondCost) {
          updateUserState(u => ({
              ...u,
              diamonds: u.diamonds - diamondCost,
              coins: u.coins + coinReward
          }));
          return true;
      }
      return false;
  };

  // Frame System Handlers
  const handleBuyFrame = (frameId: string, cost: number) => {
      if (user.ownedFrames.includes(frameId)) return false;

      const frameIndex = parseInt(frameId.split('_')[1]);
      
      if (frameIndex <= 10 && frameIndex > 0) {
          // Coin Frame
          if (user.coins >= cost) {
              updateUserState(u => ({
                  ...u,
                  coins: u.coins - cost,
                  ownedFrames: [...u.ownedFrames, frameId],
                  frameId: frameId
              }));
              return true;
          }
      } else {
          // Diamond Frame
          if (user.diamonds >= cost) {
              updateUserState(u => ({
                  ...u,
                  diamonds: u.diamonds - cost,
                  ownedFrames: [...u.ownedFrames, frameId],
                  frameId: frameId
              }));
              return true;
          }
      }
      return false;
  };

  const handleEquipFrame = (frameId: string) => {
      if (user.ownedFrames.includes(frameId)) {
          updateUserState(u => ({ ...u, frameId }));
      }
  };

  const handleEarnCoins = (amount: number) => {
      updateUserState(u => ({ ...u, coins: u.coins + amount }));
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.ONBOARDING:
        return <Onboarding onStart={() => setView(ViewState.AUTH)} />;
      case ViewState.AUTH:
        return <Auth onLogin={handleLogin} />;
      case ViewState.DASHBOARD:
        return <Dashboard 
                  user={user} 
                  tasks={tasks} 
                  exams={exams} 
                  onTaskToggle={handleTaskToggle} 
                  onChangeView={setView} 
                  onSpendCoins={spendCoins}
                  onUpdateExamScore={handleUpdateExamScore}
                  onBuyDiamonds={handleBuyDiamonds}
                  onExchange={handleExchangeDiamondsForCoins}
               />;
      case ViewState.CALENDAR:
        return <Calendar tasks={tasks} onAddTask={() => setView(ViewState.CREATE)} />;
      case ViewState.CREATE:
        return <CreateProgram onBack={() => setView(ViewState.DASHBOARD)} onSave={handleAddTasks} />;
      case ViewState.ADD_EXAM:
        return <AddExam onBack={() => setView(ViewState.DASHBOARD)} onSave={handleAddExam} user={user} />;
      case ViewState.PROFILE:
        return <Profile 
                  user={user} 
                  exams={exams} 
                  onBack={() => setView(ViewState.DASHBOARD)} 
                  onUpdateUser={handleUpdateUser} 
                  onChangeView={setView} 
                  onBuyFrame={handleBuyFrame}
                  onEquipFrame={handleEquipFrame}
                  onLogout={handleLogout}
               />;
      case ViewState.ANALYTICS:
        return <Analytics tasks={tasks} />;
      case ViewState.DAILY_BONUS:
        return <DailyBonus user={user} onClaim={handleClaimBonus} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.STUDENTS:
        return <StudentManagement students={students} currentUserId={user.id} onBack={() => setView(ViewState.PROFILE)} onAddStudent={handleAddStudent} onSwitchStudent={handleSwitchStudent} />;
      case ViewState.AI_TEST:
        return <AiTest onBack={() => setView(ViewState.DASHBOARD)} onEarnCoins={handleEarnCoins} />;
      case ViewState.AI_VIDEO:
        return <AiVideo onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.AI_SOLVER:
        return <AiSolver onBack={() => setView(ViewState.DASHBOARD)} />;
      default:
        return <Dashboard user={user} tasks={tasks} exams={exams} onTaskToggle={handleTaskToggle} onChangeView={setView} onSpendCoins={spendCoins} onUpdateExamScore={handleUpdateExamScore} onBuyDiamonds={handleBuyDiamonds} onExchange={handleExchangeDiamondsForCoins} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-full min-h-screen bg-white dark:bg-black shadow-2xl relative overflow-hidden font-display">
      {loading && <SplashScreen />}
      {renderContent()}
      
      {view !== ViewState.ONBOARDING && view !== ViewState.AUTH && view !== ViewState.CREATE && view !== ViewState.ADD_EXAM && view !== ViewState.DAILY_BONUS && view !== ViewState.STUDENTS && view !== ViewState.AI_TEST && view !== ViewState.AI_VIDEO && view !== ViewState.AI_SOLVER && (
        <BottomNav currentView={view} onChangeView={setView} />
      )}
    </div>
  );
}
