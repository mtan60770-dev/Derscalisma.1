import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { GoogleGenAI } from '@google/genai';

interface AiCompetitionProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (data: Partial<User>) => void;
  onViolation?: (reason: string) => void;
}

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export const AiCompetition: React.FC<AiCompetitionProps> = ({ user, onBack, onUpdateUser, onViolation }) => {
  const [gameState, setGameState] = useState<'LOBBY' | 'LOADING' | 'PLAYING' | 'RESULT' | 'LEADERBOARD'>('LOBBY');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [dailyScore, setDailyScore] = useState(0);

  const ENTRY_FEE = 30;
  const REWARD = 50;
  const LEADERBOARD_POINTS = 20;

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedScore = localStorage.getItem(`ai_comp_score_${today}`);
    if (savedScore) {
      setDailyScore(parseInt(savedScore, 10));
    }
  }, []);

  const startCompetition = async () => {
    if (user.coins < ENTRY_FEE) {
      setError(`Yarışmaya katılmak için en az ${ENTRY_FEE} jetonun olmalı.`);
      return;
    }

    // Deduct entry fee
    onUpdateUser({ coins: user.coins - ENTRY_FEE });
    setGameState('LOADING');
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `Sen bir eğitim botusun. Kullanıcı ${user.grade || 8}. sınıf öğrencisi. Bu sınıf seviyesine uygun, rastgele bir dersten (Matematik, Türkçe, Fen, Sosyal vb.) 10 adet çoktan seçmeli soru hazırla. Sorular zorlayıcı olsun.
Sadece JSON formatında yanıt ver. Başka hiçbir metin ekleme.
Format:
[
  {
    "question": "Soru metni",
    "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
    "answer": "Doğru şıkkın tam metni (options içindekiyle birebir aynı olmalı)"
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '[]';
      const parsedQuestions = JSON.parse(text) as Question[];
      
      if (parsedQuestions && parsedQuestions.length > 0) {
        setQuestions(parsedQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setGameState('PLAYING');
      } else {
        throw new Error('Soru üretilemedi.');
      }
    } catch (err) {
      console.error(err);
      setError('Sorular hazırlanırken bir hata oluştu. Jetonun iade edildi.');
      onUpdateUser({ coins: user.coins + ENTRY_FEE }); // Refund
      setGameState('LOBBY');
    }
  };

  const handleAnswer = (option: string) => {
    if (isChecking) return;
    setSelectedOption(option);
    setIsChecking(true);

    const currentQ = questions[currentQuestionIndex];
    const isCorrect = option === currentQ.answer;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setIsChecking(false);
      setSelectedOption(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Finish
        setGameState('RESULT');
        // If all correct, give reward and leaderboard points
        if (score + (isCorrect ? 1 : 0) === questions.length) {
          onUpdateUser({ coins: user.coins + REWARD });
          
          const today = new Date().toISOString().split('T')[0];
          const newDailyScore = dailyScore + LEADERBOARD_POINTS;
          setDailyScore(newDailyScore);
          localStorage.setItem(`ai_comp_score_${today}`, newDailyScore.toString());
        }
      }
    }, 1500);
  };

  const getLeaderboard = () => {
    const BOTS = [
      { name: 'Matematik Pro', avatar: 'Math', baseScore: 140 },
      { name: 'Moti-2026', avatar: 'Moti', baseScore: 120 },
      { name: 'Guard-AI', avatar: 'Secure', baseScore: 100 },
      { name: 'Test Ustası', avatar: 'Test', baseScore: 80 },
      { name: 'Hızlı Çözücü', avatar: 'Speed', baseScore: 60 },
    ];
    
    const todayStr = new Date().toISOString().split('T')[0];
    const dayHash = todayStr.split('-').reduce((acc, val) => acc + parseInt(val, 10), 0);
    
    const leaderboard = [
      ...BOTS.map(b => ({ 
        name: b.name, 
        avatar: `https://api.dicebear.com/9.x/bottts/svg?seed=${b.avatar}`, 
        score: b.baseScore + (dayHash % 20), 
        isUser: false 
      })),
      { 
        name: user.name || 'Sen', 
        avatar: user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.id}`, 
        score: dailyScore, 
        isUser: true 
      }
    ].sort((a, b) => b.score - a.score);

    return leaderboard;
  };

  const getDaysLeft = () => {
    // 20 days from a fixed date or just a static 20 days for the season
    // For this prototype, we'll calculate days left until April 7, 2026
    const endDate = new Date('2026-04-07T00:00:00Z').getTime();
    const now = Date.now();
    const diff = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-display flex flex-col">
      <header className="p-6 flex items-center gap-4 border-b border-white/5 shrink-0">
        <button onClick={onBack} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">AI YARIŞMASI</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">YAPAY ZEKA TEST ARENASI</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-2xl border border-yellow-500/30">
          <span className="material-symbols-outlined text-yellow-500">monetization_on</span>
          <span className="font-black text-yellow-500">{user.coins}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {gameState === 'LOBBY' && (
          <div className="bg-[#1e293b] p-8 rounded-[3rem] border border-white/5 max-w-md w-full text-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
              <span className="material-symbols-outlined text-5xl text-primary">emoji_events</span>
            </div>
            <h2 className="text-2xl font-black italic uppercase mb-2">Yapay Zeka Test Yarışması</h2>
            <p className="text-slate-400 text-sm mb-8">
              {user.grade || 8}. Sınıf seviyesine özel, her seferinde farklı sorularla hazırlanan yapay zeka testine katıl. Tüm soruları doğru bil, büyük ödülü kap!
            </p>
            
            <div className="flex justify-center gap-4 mb-8">
              <div className="bg-black/20 px-6 py-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">KATILIM</p>
                <p className="text-xl font-black text-red-400">-{ENTRY_FEE} Jeton</p>
              </div>
              <div className="bg-black/20 px-6 py-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ÖDÜL</p>
                <p className="text-xl font-black text-emerald-400">+{REWARD} Jeton</p>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-bold mb-4">{error}</p>}

            <div className="flex flex-col gap-3">
              <button 
                onClick={startCompetition}
                className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-4 rounded-2xl font-black italic uppercase tracking-widest shadow-glow active:scale-95 transition-transform"
              >
                YARIŞMAYA KATIL
              </button>
              <button 
                onClick={() => setGameState('LEADERBOARD')}
                className="w-full bg-white/5 text-white py-4 rounded-2xl font-black italic uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
              >
                GÜNLÜK SIRALAMA
              </button>
            </div>
          </div>
        )}

        {gameState === 'LEADERBOARD' && (
          <div className="bg-[#1e293b] p-6 rounded-[3rem] border border-white/5 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black italic uppercase">SIRALAMA</h2>
              <div className="text-right">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">24 SAATTE YENİLENİR</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEZON BİTİMİNE {getDaysLeft()} GÜN</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {getLeaderboard().map((entry, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border ${entry.isUser ? 'bg-primary/20 border-primary/50' : 'bg-black/20 border-white/5'}`}>
                  <div className="w-8 text-center font-black text-slate-500">#{idx + 1}</div>
                  <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full bg-white/10" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <p className={`font-bold ${entry.isUser ? 'text-primary' : 'text-white'}`}>{entry.name}</p>
                    {entry.isUser && <p className="text-[10px] text-primary uppercase tracking-widest">SEN</p>}
                  </div>
                  <div className="font-black italic text-xl">{entry.score} <span className="text-[10px] text-slate-500">P</span></div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setGameState('LOBBY')}
              className="w-full bg-white/5 text-white py-4 rounded-2xl font-black italic uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
            >
              GERİ DÖN
            </button>
          </div>
        )}

        {gameState === 'LOADING' && (
          <div className="text-center animate-pulse">
            <span className="material-symbols-outlined text-6xl text-primary mb-4 animate-spin">sync</span>
            <h2 className="text-xl font-black italic uppercase">Sorular Hazırlanıyor...</h2>
            <p className="text-slate-400 text-sm mt-2">Yapay zeka senin için benzersiz sorular üretiyor.</p>
          </div>
        )}

        {gameState === 'PLAYING' && questions.length > 0 && (
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Soru {currentQuestionIndex + 1} / {questions.length}</span>
              <span className="text-xs font-black text-primary uppercase tracking-widest">Skor: {score}</span>
            </div>

            <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-white/5 mb-6">
              <p className="text-lg font-medium">{questions[currentQuestionIndex].question}</p>
            </div>

            <div className="space-y-3">
              {questions[currentQuestionIndex].options.map((option, idx) => {
                let btnClass = "w-full text-left p-4 rounded-2xl border transition-all font-medium ";
                
                if (isChecking) {
                  if (option === questions[currentQuestionIndex].answer) {
                    btnClass += "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                  } else if (option === selectedOption) {
                    btnClass += "bg-red-500/20 border-red-500 text-red-400";
                  } else {
                    btnClass += "bg-white/5 border-white/5 text-slate-400 opacity-50";
                  }
                } else {
                  btnClass += "bg-white/5 border-white/5 hover:border-primary/50 hover:bg-white/10 active:scale-[0.98]";
                }

                return (
                  <button 
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={isChecking}
                    className={btnClass}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'RESULT' && (
          <div className="bg-[#1e293b] p-8 rounded-[3rem] border border-white/5 max-w-md w-full text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${score === questions.length ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-red-500/20 text-red-500'}`}>
              <span className="material-symbols-outlined text-5xl">
                {score === questions.length ? 'military_tech' : 'sentiment_dissatisfied'}
              </span>
            </div>
            
            <h2 className="text-3xl font-black italic uppercase mb-2">
              {score === questions.length ? 'KAZANDIN!' : 'KAYBETTİN'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {questions.length} sorudan {score} tanesini doğru bildin.
            </p>

            <div className="bg-black/20 p-6 rounded-3xl border border-white/5 mb-8">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">KAZANÇ</p>
              <p className={`text-4xl font-black italic ${score === questions.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                {score === questions.length ? `+${REWARD}` : '0'} <span className="text-lg">JETON</span>
              </p>
              {score === questions.length && (
                <p className="text-sm font-bold text-primary mt-2">+{LEADERBOARD_POINTS} SIRALAMA PUANI</p>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setGameState('LOBBY')}
                className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-black italic uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                TEKRAR DENE
              </button>
              <button 
                onClick={onBack}
                className="flex-1 bg-primary text-white py-4 rounded-2xl font-black italic uppercase tracking-widest shadow-glow active:scale-95 transition-transform"
              >
                PANELE DÖN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
