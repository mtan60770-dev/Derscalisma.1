
import React, { useState, useEffect, useRef } from 'react';
import { generateQuiz, QuizQuestion, checkContentModeration } from '../services/geminiService';
import { User, ViewState } from '../types';

interface AiTestProps {
    user: User;
    onBack: () => void;
    onEarnCoins: (amount: number) => void;
    onUpdateSolvedQuestions: (type: 'test' | 'classic', count: number, subject: string) => void;
    onUpdateUser: (data: Partial<User>) => void;
    onViolation?: (reason: string) => void;
    onChangeView: (view: ViewState) => void;
}

const GRADE_TESTS = [
    { grade: 9, subjects: ['Hücre Bilimi', 'Temel Matematik', 'Dil ve Anlatım', 'Tarih Bilimi', 'Fizik Bilimine Giriş'] },
    { grade: 10, subjects: ['Newton Kanunları', 'Fonksiyonlar', 'Asitler ve Bazlar', 'Osmanlı Tarihi', 'Kalıtım'] },
    { grade: 11, subjects: ['Trigonometri', 'Modern Fizik', 'Sistemler (Biyoloji)', 'Organik Kimya', 'Cumhuriyet Dönemi'] },
    { grade: 12, subjects: ['Türev & İntegral', 'Elektrokimya', 'Atom Modelleri', 'İnkılap Tarihi', 'Bitki Biyolojisi'] },
];

export const AiTest: React.FC<AiTestProps> = ({ user, onBack, onEarnCoins, onUpdateSolvedQuestions, onUpdateUser, onViolation, onChangeView }) => {
    const [step, setStep] = useState<'setup' | 'loading' | 'quiz' | 'result'>('setup');
    const [subject, setSubject] = useState('');
    const [level, setLevel] = useState('Orta');
    const [questionType, setQuestionType] = useState<'test' | 'classic'>('test');
    const [questionCount, setQuestionCount] = useState(5);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const feedbackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAnswered && feedbackRef.current) {
            feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [isAnswered]);

    const handleStart = async (selectedSubject?: string) => {
        const finalSubject = selectedSubject || subject;
        if (!finalSubject) return;

        setStep('loading');

        // AI Moderation Check
        if (user.isAiModerationEnabled) {
            const badWords = ['hile', 'hack', 'kopya', 'aptal', 'salak', 'küfür', 'bot basma', 'cevap anahtarı', 'cevapları ver'];
            const lowerSubject = finalSubject.toLowerCase();
            const hasBadWord = badWords.some(word => lowerSubject.includes(word));
            
            if (hasBadWord) {
                setStep('setup');
                if (onViolation) onViolation(`Uygunsuz konu veya hile girişimi tespit edildi ("${finalSubject}").`);
                return;
            }

            // Advanced AI Check
            const aiCheck = await checkContentModeration(finalSubject);
            if (aiCheck.isViolation) {
                setStep('setup');
                if (onViolation) onViolation(`Yapay Zeka Tespit Etti: ${aiCheck.reason} ("${finalSubject}").`);
                return;
            }
        }

        const data = await generateQuiz(finalSubject, level, questionType, questionCount);
        if (data.length > 0) {
            setQuestions(data);
            setStep('quiz');
        } else {
            setStep('setup');
            alert("Soru üretilemedi, lütfen tekrar dene.");
        }
    };

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        if (index === questions[currentIndex].correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col pb-24 text-white">
            <header className="p-4 bg-[#1E293B]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-white/5">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10"><span className="material-symbols-outlined">arrow_back</span></button>
                <h1 className="text-xl font-black italic tracking-tighter">FOCUS <span className="text-tg-blue">QUIZ</span></h1>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                {step === 'setup' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom">
                        <section className="bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-black/40 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-sm">
                            <h2 className="text-xl font-black italic mb-4">ÖZEL TEST ÜRET</h2>
                            <div className="space-y-4">
                                <input 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Konu girin (Örn: Logaritma)"
                                    className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-tg-blue transition-colors font-bold"
                                />
                                <div className="flex gap-2">
                                    {['Kolay', 'Orta', 'Zor'].map(l => (
                                        <button key={l} onClick={() => setLevel(l)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${level === l ? 'bg-tg-blue shadow-glow' : 'bg-white/5 border border-white/10'}`}>{l}</button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {[5, 10, 15, 20, 30].map(c => (
                                        <button key={c} onClick={() => setQuestionCount(c)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${questionCount === c ? 'bg-tg-blue shadow-glow' : 'bg-white/5 border border-white/10'}`}>{c} Soru</button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'test', label: 'TEST', icon: 'quiz' },
                                        { id: 'classic', label: 'KLASİK', icon: 'edit_note' }
                                    ].map(t => (
                                        <button key={t.id} onClick={() => setQuestionType(t.id as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${questionType === t.id ? 'bg-indigo-600 shadow-glow' : 'bg-white/5 border border-white/10'}`}>
                                            <span className="material-symbols-outlined text-sm">{t.icon}</span>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => handleStart()} className="w-full py-4 bg-white text-black rounded-2xl font-black shadow-xl active:scale-95 transition-transform">HEMEN ÜRET</button>
                                <button onClick={() => onChangeView(ViewState.CREATE)} className="w-full py-4 bg-white/5 text-white rounded-2xl font-black border border-white/10 active:scale-95 transition-transform">DERS EKLE</button>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Sınıf Bazlı Hazır Testler</h2>
                                <span className="text-[10px] bg-tg-blue/20 text-tg-blue px-2 py-1 rounded-lg font-black uppercase">{user.grade}. Sınıf</span>
                            </div>
                            
                            {/* User's Grade Tests */}
                            {GRADE_TESTS.filter(g => g.grade === user.grade).map((g) => (
                                <div key={`user-grade-${g.grade}`} className="space-y-3 bg-white/5 p-4 rounded-3xl border border-tg-blue/30">
                                    <h3 className="text-xs font-black text-white ml-2 uppercase italic">Senin Sınıfın İçin Önerilenler</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {g.subjects.map(s => (
                                            <button key={s} onClick={() => handleStart(s)} className="bg-tg-blue text-white px-4 py-3 rounded-2xl text-xs font-bold shadow-glow active:scale-95 transition-transform flex-1 min-w-[120px]">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Other Grades */}
                            <div className="mt-6">
                                <h3 className="text-[10px] font-black text-slate-500 ml-2 uppercase mb-3">Diğer Sınıflar</h3>
                                <div className="space-y-4">
                                    {GRADE_TESTS.filter(g => g.grade !== user.grade).map((g) => (
                                        <div key={g.grade} className="space-y-2">
                                            <h4 className="text-[10px] font-black text-slate-400 ml-2 uppercase">{g.grade}. Sınıf</h4>
                                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                                {g.subjects.map(s => (
                                                    <button key={s} onClick={() => handleStart(s)} className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl whitespace-nowrap text-xs font-bold hover:bg-white/10 transition-all active:scale-95">
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {step === 'loading' && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-pulse">
                        <div className="w-20 h-20 border-4 border-tg-blue border-t-transparent rounded-full animate-spin mb-6 shadow-glow"></div>
                        <h2 className="text-2xl font-black italic">ANALİZ EDİLİYOR</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Yapay zeka soruları senin seviyene göre hazırlıyor...</p>
                    </div>
                )}

                {step === 'quiz' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                            <span className="text-slate-500">SORU {currentIndex + 1}/{questions.length}</span>
                            <span className="text-tg-blue">SKOR: {score}</span>
                        </div>
                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-h-[200px] flex items-center justify-center text-center">
                            <p className="text-xl font-bold italic leading-relaxed">{questions[currentIndex].question}</p>
                        </div>
                        <div className="space-y-3">
                            {questions[currentIndex].options.map((opt, i) => {
                                let style = "bg-white/5 border-white/10 text-white";
                                if (isAnswered) {
                                    if (i === questions[currentIndex].correctIndex) style = "bg-green-500 border-green-500 text-white shadow-lg";
                                    else if (i === selectedOption) style = "bg-red-500 border-red-500 text-white";
                                    else style = "opacity-30 bg-white/5 border-transparent";
                                }
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => handleAnswer(i)}
                                        className={`w-full p-5 rounded-2xl border-2 font-bold text-sm text-left transition-all ${style} ${!isAnswered ? 'hover:border-tg-blue active:scale-[0.98]' : ''}`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        {isAnswered && (
                            <button onClick={() => {
                                if (currentIndex < questions.length - 1) {
                                    setCurrentIndex(c => c + 1);
                                    setIsAnswered(false);
                                    setSelectedOption(null);
                                } else {
                                    setStep('result');
                                    onEarnCoins(score * 10);
                                    onUpdateSolvedQuestions(questionType, questions.length, subject || 'Genel');
                                }
                            }} className="w-full py-5 bg-tg-blue text-white rounded-2xl font-black shadow-glow animate-in slide-in-from-bottom transition-transform active:scale-95">
                                {currentIndex < questions.length - 1 ? 'SONRAKİ SORU' : 'SONUÇLARI GÖR'}
                            </button>
                        )}
                    </div>
                )}

                {step === 'result' && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in">
                        <div className="relative">
                            <div className="w-40 h-40 bg-tg-blue rounded-full flex items-center justify-center shadow-glow animate-breathe">
                                <span className="text-7xl">🏆</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black italic mb-2">TEBRİKLER!</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Test başarıyla tamamlandı</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10"><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Doğru</p><p className="text-3xl font-black text-green-500">{score}</p></div>
                            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10"><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Kazanç</p><p className="text-3xl font-black text-yellow-500">+{score * 10} 🪙</p></div>
                        </div>
                        <button onClick={onBack} className="w-full py-5 bg-white text-black rounded-2xl font-black shadow-xl active:scale-95 transition-transform">PANEL'E DÖN</button>
                    </div>
                )}
            </div>
        </div>
    );
};
