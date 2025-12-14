import React, { useState, useEffect, useRef } from 'react';
import { generateQuiz, QuizQuestion } from '../services/geminiService';

interface AiTestProps {
    onBack: () => void;
    onEarnCoins: (amount: number) => void;
}

export const AiTest: React.FC<AiTestProps> = ({ onBack, onEarnCoins }) => {
    const [step, setStep] = useState<'setup' | 'loading' | 'quiz' | 'result'>('setup');
    const [subject, setSubject] = useState('');
    const [level, setLevel] = useState('Orta');
    const [questionType, setQuestionType] = useState<'test' | 'classic'>('test'); // New State
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    
    // For auto-scrolling to feedback
    const feedbackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAnswered && feedbackRef.current) {
            feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [isAnswered]);

    const handleStart = async () => {
        if (!subject) return;
        setStep('loading');
        const data = await generateQuiz(subject, level, questionType);
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

    const handleShowAnswerClassic = () => {
        setIsAnswered(true);
        // In classic mode, we rely on user self-evaluation or just learning, 
        // but we can give points for 'completing' the question.
        setScore(prev => prev + 1); 
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setStep('result');
            const finalScore = score; 
            const reward = finalScore * 15; 
            if (reward > 0) onEarnCoins(reward);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-[#1E293B] shadow-sm flex items-center justify-between sticky top-0 z-20">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="material-symbols-outlined dark:text-white">arrow_back</span>
                </button>
                <h1 className="font-bold text-slate-900 dark:text-white">Yapay Zeka Testi</h1>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-center">
                
                {step === 'setup' && (
                    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-10">
                        <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-purple-600 text-5xl">quiz</span>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Hangi konuda test çözmek istersin?</h2>
                        
                        <input 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Örn: Tarih, Türev, İngilizce Kelimeler..."
                            className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-purple-500"
                        />

                        {/* Question Type Selection */}
                        <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Soru Tipi</label>
                             <div className="flex bg-gray-200 dark:bg-slate-800 rounded-xl p-1">
                                 <button 
                                     onClick={() => setQuestionType('test')}
                                     className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${questionType === 'test' ? 'bg-white dark:bg-slate-600 shadow-sm text-purple-600 dark:text-white' : 'text-slate-500'}`}
                                 >
                                     Çoktan Seçmeli (Test)
                                 </button>
                                 <button 
                                     onClick={() => setQuestionType('classic')}
                                     className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${questionType === 'classic' ? 'bg-white dark:bg-slate-600 shadow-sm text-purple-600 dark:text-white' : 'text-slate-500'}`}
                                 >
                                     Klasik (Yazılı)
                                 </button>
                             </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Zorluk Seviyesi</label>
                            <div className="flex gap-2">
                                {['Kolay', 'Orta', 'Zor'].map(l => (
                                    <button 
                                        key={l}
                                        onClick={() => setLevel(l)}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${level === l ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleStart}
                            disabled={!subject}
                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg mt-4 disabled:opacity-50"
                        >
                            Testi Başlat
                        </button>
                    </div>
                )}

                {step === 'loading' && (
                    <div className="text-center animate-pulse">
                        <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sorular Hazırlanıyor...</h3>
                        <p className="text-slate-500">Yapay zeka senin için özel sorular üretiyor.</p>
                    </div>
                )}

                {step === 'quiz' && (
                    <div className="w-full max-w-md mx-auto animate-in fade-in pb-20">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-bold text-slate-500">Soru {currentIndex + 1}/{questions.length}</span>
                            <span className="text-sm font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-lg">Skor: {score}</span>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg mb-6 min-h-[160px] flex items-center justify-center">
                            <p className="text-lg font-bold text-center text-slate-900 dark:text-white leading-relaxed">
                                {questions[currentIndex].question}
                            </p>
                        </div>

                        {/* RENDER OPTIONS OR CLASSIC ANSWER BUTTON */}
                        {questions[currentIndex].type === 'test' ? (
                             <div className="flex flex-col gap-3">
                                {questions[currentIndex].options.map((opt, i) => {
                                    let bgClass = "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-purple-500";
                                    const isCorrect = i === questions[currentIndex].correctIndex;
                                    const isSelected = i === selectedOption;

                                    if (isAnswered) {
                                        if (isCorrect) bgClass = "bg-green-500 text-white border-green-500";
                                        else if (isSelected) bgClass = "bg-red-500 text-white border-red-500";
                                        else bgClass = "opacity-50 bg-white dark:bg-slate-800 border-transparent";
                                    }

                                    return (
                                        <button 
                                            key={i}
                                            onClick={() => handleAnswer(i)}
                                            disabled={isAnswered}
                                            className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all relative ${bgClass} ${!isAnswered ? 'text-slate-700 dark:text-slate-200' : ''}`}
                                        >
                                            <span>{opt}</span>
                                            {isAnswered && isCorrect && <span className="material-symbols-outlined absolute right-4 top-4">check_circle</span>}
                                            {isAnswered && isSelected && !isCorrect && <span className="material-symbols-outlined absolute right-4 top-4">cancel</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            // CLASSIC MODE UI
                            <div className="flex flex-col gap-4">
                                <textarea 
                                    className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="Cevabını buraya yazabilirsin (isteğe bağlı)..."
                                ></textarea>
                                {!isAnswered && (
                                    <button 
                                        onClick={handleShowAnswerClassic}
                                        className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg"
                                    >
                                        Cevabı Göster
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Immediate Feedback Section */}
                        {isAnswered && (
                            <div ref={feedbackRef} className="mt-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                <div className={`p-5 rounded-2xl border mb-4 ${
                                    (questions[currentIndex].type === 'classic' || selectedOption === questions[currentIndex].correctIndex)
                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`material-symbols-outlined ${
                                           (questions[currentIndex].type === 'classic' || selectedOption === questions[currentIndex].correctIndex) ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {(questions[currentIndex].type === 'classic' || selectedOption === questions[currentIndex].correctIndex) ? 'sentiment_very_satisfied' : 'info'}
                                        </span>
                                        <h3 className={`font-bold ${
                                            (questions[currentIndex].type === 'classic' || selectedOption === questions[currentIndex].correctIndex) ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                                        }`}>
                                            {questions[currentIndex].type === 'classic' ? 'Örnek Cevap:' : (selectedOption === questions[currentIndex].correctIndex ? 'Tebrikler, Doğru!' : 'Maalesef Yanlış')}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {questions[currentIndex].explanation || "Bu soru için açıklama bulunmuyor."}
                                    </p>
                                </div>
                                
                                <button 
                                    onClick={handleNext}
                                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                >
                                    <span>{currentIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {step === 'result' && (
                    <div className="text-center animate-in zoom-in">
                        <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-yellow-500/40 animate-bounce">
                            <span className="text-6xl">🏆</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Test Bitti!</h2>
                        <p className="text-slate-500 mb-8">Soruların hepsini tamamladın.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-green-600 uppercase">Tamamlanan</p>
                                <p className="text-3xl font-black text-green-700 dark:text-green-400">{score}</p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-blue-600 uppercase">Toplam</p>
                                <p className="text-3xl font-black text-blue-700 dark:text-blue-400">{questions.length}</p>
                            </div>
                        </div>

                        <div className="bg-yellow-500 text-white p-4 rounded-xl font-bold text-lg shadow-lg mb-6 flex items-center justify-center gap-2">
                             <span>+{score * 15} Jeton Kazandın!</span>
                             <span className="material-symbols-outlined">savings</span>
                        </div>

                        <button onClick={onBack} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold">
                            Ana Menüye Dön
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
