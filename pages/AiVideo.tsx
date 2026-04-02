
import React, { useState } from 'react';
import { findVideoResources, VideoResource, checkContentModeration } from '../services/geminiService';
import { User } from '../types';

interface AiVideoProps {
    user: User;
    onBack: () => void;
    onViolation?: (reason: string) => void;
}

export const AiVideo: React.FC<AiVideoProps> = ({ user, onBack, onViolation }) => {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [videos, setVideos] = useState<VideoResource[]>([]);

    const handleSearch = async (searchTopic?: string) => {
        const finalTopic = searchTopic || topic;
        if (!finalTopic) return;

        setLoading(true);

        if (user.isAiModerationEnabled) {
            const aiCheck = await checkContentModeration(finalTopic);
            if (aiCheck.isViolation) {
                setLoading(false);
                if (onViolation) onViolation(`Yapay Zeka Tespit Etti: ${aiCheck.reason} ("${finalTopic}").`);
                return;
            }
        }

        const results = await findVideoResources(finalTopic);
        setVideos(results);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col pb-24 text-white">
            <header className="p-4 bg-[#1E293B]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10"><span className="material-symbols-outlined">arrow_back</span></button>
                    <h1 className="text-xl font-black italic tracking-tighter">FOCUS <span className="text-primary">CINEMA</span> <span className="text-[10px] text-slate-500 bg-slate-800 px-1 rounded ml-1">2026</span></h1>
                </div>
                <div className="w-10"></div>
            </header>

            <div className="p-6">
                {/* Hero Search */}
                <div className="relative rounded-[2.5rem] overflow-hidden p-8 mb-10 bg-gradient-to-tr from-primary/30 via-indigo-900 to-[#0F172A] border border-white/5 shadow-2xl">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4 leading-tight">Geleceği Bugün İzle.</h2>
                        <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
                            <input 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Ders, konu veya hoca ara..."
                                className="flex-1 bg-transparent px-4 py-2 text-sm outline-none font-bold"
                            />
                            <button 
                                onClick={() => handleSearch()}
                                disabled={loading || !topic}
                                className="bg-primary px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">smart_display</span>}
                                {loading ? 'Aranıyor' : 'Keşfet'}
                            </button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
                </div>

                {/* Categories */}
                {!loading && videos.length === 0 && (
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Popüler Kategoriler</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: 'Matematik-1', icon: 'calculate', color: 'from-blue-600 to-indigo-600' },
                                { name: 'Sınav Analiz', icon: 'analytics', color: 'from-purple-600 to-pink-600' },
                                { name: 'Yabancı Dil', icon: 'language', color: 'from-orange-500 to-red-600' },
                                { name: 'YKS-2026', icon: 'military_tech', color: 'from-emerald-500 to-teal-600' }
                            ].map((cat, i) => (
                                <button key={i} onClick={() => { setTopic(cat.name); handleSearch(cat.name); }} className={`bg-gradient-to-br ${cat.color} p-6 rounded-3xl flex flex-col gap-3 shadow-lg active:scale-95 transition-transform`}>
                                    <span className="material-symbols-outlined text-4xl">{cat.icon}</span>
                                    <span className="font-bold text-left">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Video Feed */}
                <div className="grid gap-6">
                    {videos.map((video, idx) => (
                        <a 
                            key={idx} 
                            href={video.uri} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex flex-col gap-3 bg-[#1E293B] rounded-3xl overflow-hidden border border-white/5 hover:border-primary/50 transition-colors shadow-xl group"
                        >
                            <div className="relative aspect-video">
                                <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                                        <span className="material-symbols-outlined text-3xl">play_arrow</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold">{video.duration}</div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold leading-tight group-hover:text-primary transition-colors">{video.title}</h3>
                                <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded">{video.category || 'Focus Pro'}</span>
                                    <span>•</span>
                                    <span>{Math.floor(Math.random() * 50) + 1}K İzlenme</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};
