import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { GoogleGenAI } from '@google/genai';

interface AiCompetitionProps {
  user: User;
  allUsers: User[];
  onBack: () => void;
  onUpdateUser: (data: Partial<User>) => void;
  onViolation?: (reason: string) => void;
}

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export const AiCompetition: React.FC<AiCompetitionProps> = ({ user, allUsers, onBack, onUpdateUser, onViolation }) => {
  const [gameState, setGameState] = useState<'LOBBY' | 'LOADING' | 'PLAYING' | 'RESULT' | 'LEADERBOARD'>('LOBBY');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [dailyScore, setDailyScore] = useState(0);

  const ENTRY_FEE = 30;
  const REWARD = 100;
  const LEADERBOARD_POINTS = 50;

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem(`ai_comp_score_${today}`);
    if (savedData) {
      try {
        const { score, expiry } = JSON.parse(savedData);
        if (Date.now() < expiry) {
          setDailyScore(score);
        } else {
          localStorage.removeItem(`ai_comp_score_${today}`);
        }
      } catch (e) {
        setDailyScore(parseInt(savedData, 10));
      }
    }
  }, []);

  const startCompetition = async () => {
    if (user.coins < ENTRY_FEE) {
      setError(`Yarışmaya katılmak için en az ${ENTRY_FEE} jetonun olmalı.`);
      return;
    }
    onUpdateUser({ coins: user.coins - ENTRY_FEE });
    setGameState('LOADING');
    setError('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `Sen bir eğitim botusun. Kullanıcı ${user.grade || 8}. sınıf öğrencisi. Bu sınıf seviyesine uygun, rastgele bir dersten 10 adet çoktan seçmeli soru hazırla. Sorular orta-zor seviyede olsun. Sadece JSON formatında yanıt ver. Format: [{"question": "...", "options": ["...", "...", "...", "..."], "answer": "..."}]`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      const parsedQuestions = JSON.parse(response.text || '[]') as Question[];
      if (parsedQuestions && parsedQuestions.length > 0) {
        setQuestions(parsedQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setStreak(0);
        setGameState('PLAYING');
      } else throw new Error('Soru üretilemedi.');
    } catch (err) {
      onUpdateUser({ coins: user.coins + ENTRY_FEE });
      setError('Hata oluştu. Jetonun iade edildi.');
      setGameState('LOBBY');
    }
  };

  const handleAnswer = (option: string) => {
    if (isChecking) return;
    setSelectedOption(option);
    setIsChecking(true);
    const currentQ = questions[currentQuestionIndex];
    if (option === currentQ.answer) {
      setScore(prev => prev + 1 + Math.floor(streak / 2));
      setStreak(prev => prev + 1);
    } else setStreak(0);
    setTimeout(() => {
      setIsChecking(false);
      setSelectedOption(null);
      if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
      else {
        setGameState('RESULT');
        const won = score >= questions.length * 0.7;
        const rewardAmount = won ? REWARD : -30;
        
        onUpdateUser({ coins: Math.max(0, user.coins + rewardAmount) });
        
        const today = new Date().toISOString().split('T')[0];
        const newDailyScore = dailyScore + (won ? LEADERBOARD_POINTS : 0);
        setDailyScore(newDailyScore);
        
        localStorage.setItem(`ai_comp_score_${today}`, JSON.stringify({ 
           score: newDailyScore, 
           expiry: Date.now() + (10 * 24 * 60 * 60 * 1000) 
        }));
      }
    }, 1000);
  };

  const getLeaderboard = () => {
    const BOTS = [
      { name: 'Matematik Dehası', role: 'Hesap Makinesi Gibi', avatar: 'Math', baseScore: 450 },
      { name: 'Edebiyat Gurusu', role: 'Kelime Oyuncusu', avatar: 'Lit', baseScore: 420 },
      { name: 'Fen Bilimci', role: 'Deney Ustası', avatar: 'Sci', baseScore: 380 },
    ];
    const todayStr = new Date().toISOString().split('T')[0];
    const dayHash = todayStr.split('-').reduce((acc, val) => acc + parseInt(val, 10), 0);
    const friends = allUsers.filter(u => u.id !== user.id && (user.friends?.includes(u.id) || false));
    return [
      ...BOTS.map(b => ({ name: b.name, avatar: `https://api.dicebear.com/9.x/bottts/svg?seed=${b.avatar}`, score: b.baseScore + (dayHash % 50), isUser: false })),
      ...friends.map(f => ({ name: f.name, avatar: f.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${f.id}`, score: (f.solvedQuestions?.total || 0) * 2, isUser: false })),
      { name: user?.name || 'Sen', avatar: user?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.id || 'unknown'}`, score: dailyScore, isUser: true }
    ].sort((a, b) => b.score - a.score);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-display flex flex-col">
      <header className="p-6 flex items-center gap-4 border-b border-white/5 shrink-0">
        <button onClick={onBack} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"><span className="material-symbols-outlined">arrow_back</span></button>
        <div><h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">AI YARIŞMASI</h1><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">GLOBAL ARENA</p></div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {gameState === 'LOBBY' && (
          <div className="bg-[#1e293b] p-8 rounded-[3rem] border border-white/5 max-w-md w-full text-center">
            <h2 className="text-2xl font-black italic uppercase mb-8">Test Arenası</h2>
            <div className="flex flex-col gap-3"><button onClick={startCompetition} className="w-full bg-primary text-white py-4 rounded-2xl font-black italic uppercase shadow-glow active:scale-95 transition-transform">YARIŞMAYA KATIL</button><button onClick={() => setGameState('LEADERBOARD')} className="w-full bg-white/5 text-white py-4 rounded-2xl font-black italic uppercase hover:bg-white/10 active:scale-95 transition-all">GÜNLÜK SIRALAMA</button></div>
          </div>
        )}
        {gameState === 'LEADERBOARD' && (
          <div className="bg-[#1e293b] p-6 rounded-[3rem] border border-white/5 max-w-md w-full">
            <h2 className="text-2xl font-black italic uppercase mb-6">GLOBAL SIRALAMA</h2>
            <div className="space-y-3 mb-6">{getLeaderboard().map((entry, idx) => (<div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border ${entry.isUser ? 'bg-primary/20 border-primary/50' : 'bg-black/20 border-white/5'}`}><div className="w-8 font-black text-slate-500">#{idx + 1}</div><img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full bg-white/10" referrerPolicy="no-referrer"/><div className="flex-1 font-bold text-white">{entry.name}</div><div className="font-black italic text-xl">{entry.score}</div></div>))}</div>
            <button onClick={() => setGameState('LOBBY')} className="w-full bg-white/5 py-4 rounded-2xl font-black italic uppercase">GERİ</button>
          </div>
        )}
        {gameState === 'RESULT' && (
          <div className="bg-[#1e293b] p-8 rounded-[3rem] border border-white/5 max-w-md w-full text-center">
            <h2 className="text-3xl font-black italic uppercase mb-2">{score >= questions.length * 0.7 ? 'KAZANDIN!' : 'KAYBETTİN'}</h2>
            <p className="text-slate-400 text-sm mb-6">{questions.length} sorudan {score} tanesini doğru bildin.</p>
            <div className="bg-black/20 p-6 rounded-3xl border border-white/5 mb-8">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">KAZANÇ/KAYIP DURUMU</p>
              <p className={`text-4xl font-black italic ${score >= questions.length * 0.7 ? 'text-emerald-400' : 'text-red-400'}`}>
                {score >= questions.length * 0.7 ? `+${REWARD} Jeton kazandın!` : '-30 Jeton kaybettin!'}
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setGameState('LOBBY')} className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-black italic uppercase">TEKRAR DENE</button>
              <button onClick={onBack} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black italic uppercase">PANELE DÖN</button>
            </div>
          </div>
        )}
        {gameState === 'PLAYING' && questions.length > 0 && (
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6"><span className="text-[10px] font-black text-slate-400 uppercase">Soru {currentQuestionIndex + 1} / {questions.length}</span><span className="text-[10px] font-black text-orange-400 uppercase">Seri: {streak}x | Puan: {score}</span></div>
            <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-white/5 mb-6 shadow-xl"><p className="text-lg">{questions[currentQuestionIndex].question}</p></div>
            <div className="space-y-3">{questions[currentQuestionIndex].options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === questions[currentQuestionIndex].answer;
                let btnClass = "w-full text-left p-4 rounded-2xl border transition-all ";
                if (isChecking) {
                    if (isCorrect) btnClass += "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                    else if (isSelected) btnClass += "bg-red-500/20 border-red-500 text-red-400";
                    else btnClass += "bg-white/5 border-white/5 text-slate-500";
                } else btnClass += "bg-white/5 border-white/5 hover:bg-primary/20";
                return <button key={idx} onClick={() => handleAnswer(option)} disabled={isChecking} className={btnClass}>{option}</button>;
            })}</div>
          </div>
        )}
        {gameState === 'LOADING' && (
          <div className="text-center">
            <h2 className="text-xl font-black italic uppercase animate-pulse">Sorular Hazırlanıyor...</h2>
          </div>
        )}
      </div>
    </div>
  );
};
