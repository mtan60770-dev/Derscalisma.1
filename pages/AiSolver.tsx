import React, { useState, useRef } from 'react';
import { solveHomework } from '../services/geminiService';

interface AiSolverProps {
    onBack: () => void;
}

export const AiSolver: React.FC<AiSolverProps> = ({ onBack }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<string | null>(null);
    const [solution, setSolution] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImage(event.target.result as string);
                    setSolution(''); // Reset previous solution
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSolve = async () => {
        if (!image) return;
        setLoading(true);
        
        // Remove data:image/...;base64, prefix
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];

        const result = await solveHomework(base64Data, mimeType);
        setSolution(result);
        setLoading(false);
    };

    const handleReset = () => {
        setImage(null);
        setSolution('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-[#1E293B] shadow-sm flex items-center justify-between sticky top-0 z-20">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="material-symbols-outlined dark:text-white">arrow_back</span>
                </button>
                <h1 className="font-bold text-slate-900 dark:text-white">AI Soru Çözücü</h1>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center">
                
                {!image ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-6 w-full animate-in zoom-in-95">
                        <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
                            <span className="material-symbols-outlined text-6xl text-indigo-600">center_focus_strong</span>
                        </div>
                        
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Soru Fotoğrafı Çek</h2>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                Yapamadığın sorunun fotoğrafını çek veya galeriden yükle, yapay zeka anında çözsün.
                            </p>
                        </div>

                        <div className="w-full max-w-sm grid grid-cols-2 gap-4 mt-4">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-2 active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-3xl">photo_camera</span>
                                <span className="font-bold">Kamera</span>
                            </button>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-3xl">image</span>
                                <span className="font-bold">Galeri</span>
                            </button>
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            accept="image/*" 
                            capture="environment" // Mobile camera preference
                            className="hidden" 
                            onChange={handleCapture}
                        />
                    </div>
                ) : (
                    <div className="w-full flex flex-col gap-4 animate-in fade-in">
                        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-black">
                            <img src={image} alt="Soru" className="w-full max-h-[40vh] object-contain" />
                            <button 
                                onClick={handleReset}
                                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {!solution && (
                             <button 
                                onClick={handleSolve}
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                             >
                                 {loading ? (
                                     <>
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                        <span>Çözülüyor...</span>
                                     </>
                                 ) : (
                                     <>
                                        <span className="material-symbols-outlined">auto_awesome</span>
                                        <span>Çözümü Getir</span>
                                     </>
                                 )}
                             </button>
                        )}

                        {solution && (
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-10">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span> Çözüm
                                </h3>
                                <div className="prose dark:prose-invert text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">
                                    {solution}
                                </div>
                                <button 
                                    onClick={handleReset}
                                    className="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                                >
                                    Yeni Soru Çek
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};
