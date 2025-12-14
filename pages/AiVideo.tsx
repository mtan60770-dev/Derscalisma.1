import React, { useState } from 'react';
import { findVideoResources, VideoResource } from '../services/geminiService';

interface AiVideoProps {
    onBack: () => void;
}

export const AiVideo: React.FC<AiVideoProps> = ({ onBack }) => {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [videos, setVideos] = useState<VideoResource[]>([]);

    const handleSearch = async () => {
        if (!topic) return;
        setLoading(true);
        const results = await findVideoResources(topic);
        setVideos(results);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
            <div className="p-4 bg-white dark:bg-[#1E293B] shadow-sm flex items-center justify-between sticky top-0 z-20">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="material-symbols-outlined dark:text-white">arrow_back</span>
                </button>
                <h1 className="font-bold text-slate-900 dark:text-white">Video Ders Asistanı</h1>
                <div className="w-10"></div>
            </div>

            <div className="p-6">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white mb-8 shadow-xl shadow-red-500/20">
                    <h2 className="text-2xl font-bold mb-2">Hangi dersi izlemek istersin?</h2>
                    <p className="text-red-100 text-sm mb-4">Yapay zeka senin için en iyi anlatım videolarını bulsun.</p>
                    
                    <div className="flex gap-2">
                        <input 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Örn: Fotosentez, 2. Derece Denklemler..."
                            className="flex-1 rounded-xl border-none text-slate-900 px-4 py-3 text-sm focus:ring-2 focus:ring-white"
                        />
                        <button 
                            onClick={handleSearch}
                            disabled={loading || !topic}
                            className="bg-white text-red-600 px-4 py-2 rounded-xl font-bold disabled:opacity-50"
                        >
                            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">search</span>}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {videos.map((video, idx) => (
                        <a 
                            key={idx} 
                            href={video.uri} 
                            target="_blank" 
                            rel="noreferrer"
                            className="block bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 transition-colors shadow-sm group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">play_arrow</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                                        {video.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                        YouTube'da İzle
                                    </p>
                                </div>
                            </div>
                        </a>
                    ))}
                    
                    {!loading && videos.length === 0 && (
                         <div className="text-center py-10 text-slate-400">
                             <span className="material-symbols-outlined text-4xl mb-2 opacity-50">smart_display</span>
                             <p>Arama yaparak ders videolarını burada listeleyebilirsin.</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};
