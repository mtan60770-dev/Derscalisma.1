
import React, { useState, useRef, useEffect } from 'react';
import { Group, GroupMessage, User, Bot } from '../types';
import { getBotResponse, checkContentModeration } from '../services/geminiService';

const AVAILABLE_BOTS: Bot[] = [
    { id: 'bot_math', name: 'Matematik Pro', role: 'Ders Asistanı', avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=Math', personality: 'Ciddi, her matematik problemini saniyeler içinde çözer.' },
    { id: 'bot_moti', name: 'Moti-2026', role: 'Öğrenci Koçu', avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=Moti', personality: 'Aşırı enerjik, öğrencileri sürekli gaza getirir.' },
    { id: 'bot_secure', name: 'Guard-AI', role: 'Güvenlik Protokolü', avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=Secure', personality: 'Sessiz ve koruyucu. Küfürü engeller ve verileri şifreler.' },
    { id: 'bot_friend', name: 'Arkadaş Botu', role: 'Sosyal Asistan', avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=Friend', personality: 'Arkadaşlık isteklerini yönetir ve yeni arkadaşlar bulmana yardımcı olur.' },
];

const GROUP_GIFTS = [
    { icon: '🏎️', name: 'Süper Araba', cost: 50 },
    { icon: '🦁', name: 'Aslan Kral', cost: 100 },
    { icon: '🚀', name: 'Focus Roket', cost: 30 },
    { icon: '👑', name: 'Altın Taç', cost: 200 },
    { icon: '💎', name: 'Mavi Elmas', cost: 150 },
    { icon: '🔥', name: 'Alev Alan', cost: 20 },
];

interface GroupsProps {
    user: User;
    allUsers: User[];
    onSpendCoins: (amount: number) => boolean;
    onBack: () => void;
    onUpdateUser: (data: Partial<User>) => void;
    onViolation?: (reason: string) => void;
}

export const Groups: React.FC<GroupsProps> = ({ user, allUsers, onSpendCoins, onBack, onUpdateUser, onViolation }) => {
    const [view, setView] = useState<'list' | 'chat' | 'settings'>('list');
    const [activeGroupTab, setActiveGroupTab] = useState<'chat' | 'missions' | 'leaderboard'>('chat');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [msgInput, setMsgInput] = useState('');
    const [isModerating, setIsModerating] = useState(false);
    const [showGiftMenu, setShowGiftMenu] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [newGroupIsPrivate, setNewGroupIsPrivate] = useState(false);
    const [newGroupBannerUrl, setNewGroupBannerUrl] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3000);
    };

    const [groups, setGroups] = useState<Group[]>([
        {
            id: 'g1',
            name: 'Elite Focus 2026',
            description: 'Focus Pro üyeleri için güvenli ve hızlı çalışma merkezi.',
            avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Focus',
            bannerUrl: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&q=80',
            ownerId: user.id,
            memberCount: 240,
            messages: [{ id: 'm1', senderId: 'bot_secure', senderName: 'Guard-AI', text: 'Focus 5.0 Güvenlik Protokolü devrede. Tüm veriler şifrelendi. 🛡️', timestamp: Date.now(), type: 'system' }],
            activeBots: ['bot_secure', 'bot_moti'],
            isPrivate: true,
            messageDelay: 5,
            securityLevel: 'high',
            isExpiringMessages: true,
            isVerificationRequired: true,
            isMuted: true,
            isDiscussionEnabled: true,
            isAutoTranslate: true
        },
        {
            id: 'g2',
            name: 'Titan Elite Özel',
            description: 'Sadece Pro abonelere özel elit çalışma grubu.',
            avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Titan',
            bannerUrl: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&q=80',
            ownerId: user.id,
            memberCount: 50,
            messages: [{ id: 'm1', senderId: 'bot_moti', senderName: 'Moti-2026', text: 'Titan Elite grubuna hoş geldiniz! En iyiler burada. 🚀', timestamp: Date.now(), type: 'system' }],
            activeBots: ['bot_moti'],
            isPrivate: true,
            messageDelay: 0,
            securityLevel: 'high',
            isSubscriberOnly: true,
            isExpiringMessages: true,
            isVerificationRequired: true,
            isMuted: true,
            isDiscussionEnabled: true,
            isAutoTranslate: true
        }
    ]);

    const activeGroup = groups.find(g => g.id === selectedGroupId);

    useEffect(() => {
        if (view === 'chat' && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeGroup?.messages, view]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleSendMessage = async (giftIcon?: string, giftCost?: number) => {
        if (!activeGroup || isModerating) return;
        if (!giftIcon && !msgInput.trim()) return;

        if (cooldown > 0 && !giftIcon) {
            setErrorMsg(`${cooldown} saniye beklemelisin.`);
            setTimeout(() => setErrorMsg(''), 2000);
            return;
        }

        if (giftIcon && giftCost) {
            if (!onSpendCoins(giftCost)) {
                setErrorMsg('Yetersiz Jeton! 🪙');
                setTimeout(() => setErrorMsg(''), 2000);
                return;
            }
        }

        // AI Moderation Check
        if (user.isAiModerationEnabled && !giftIcon) {
            const badWords = ['hile', 'hack', 'kopya', 'aptal', 'salak', 'küfür', 'bot basma', 'cevap anahtarı'];
            const lowerMsg = msgInput.toLowerCase();
            const hasBadWord = badWords.some(word => lowerMsg.includes(word));
            
            if (hasBadWord) {
                if (onViolation) onViolation(`Uygunsuz içerik veya hile girişimi tespit edildi ("${msgInput}").`);
                return;
            }

            // Advanced AI Check
            setIsModerating(true);
            const aiCheck = await checkContentModeration(msgInput);
            setIsModerating(false);
            if (aiCheck.isViolation) {
                if (onViolation) onViolation(`Yapay Zeka Tespit Etti: ${aiCheck.reason} ("${msgInput}").`);
                return;
            }
        }

        const newMsg: GroupMessage = {
            id: Date.now().toString(),
            senderId: user.id,
            senderName: user.name,
            text: giftIcon ? '' : msgInput,
            timestamp: Date.now(),
            type: giftIcon ? 'gift' : 'text',
            giftIcon: giftIcon,
        };

        setGroups(prev => prev.map(g => g.id === selectedGroupId ? { ...g, messages: [...g.messages, newMsg] } : g));
        setMsgInput('');
        setShowGiftMenu(false);
        if (!giftIcon) setCooldown(activeGroup.messageDelay);

        // AI Bot Tetikleme
        if (!giftIcon && activeGroup.activeBots.length > 0) {
            const botId = activeGroup.activeBots[Math.floor(Math.random() * activeGroup.activeBots.length)];
            const bot = AVAILABLE_BOTS.find(b => b.id === botId);
            if (bot) {
                setTimeout(async () => {
                    const reply = await getBotResponse(bot.name, bot.role, bot.personality, activeGroup.name, msgInput);
                    const botMsg: GroupMessage = {
                        id: (Date.now() + 1).toString(),
                        senderId: bot.id,
                        senderName: bot.name,
                        text: reply,
                        timestamp: Date.now(),
                        type: 'bot'
                    };
                    setGroups(prev => prev.map(g => g.id === selectedGroupId ? { ...g, messages: [...g.messages, botMsg] } : g));
                }, 1000);
            }
        }
    };

    const updateGroup = (settings: Partial<Group>) => {
        setGroups(prev => prev.map(g => g.id === selectedGroupId ? { ...g, ...settings } : g));
    };

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) {
            showToast('Lütfen bir grup adı girin.');
            return;
        }
        const newGroup: Group = {
            id: 'g' + Date.now(),
            name: newGroupName,
            description: newGroupDesc || 'Yeni çalışma grubu.',
            avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${newGroupName}`,
            bannerUrl: newGroupBannerUrl || 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&q=80',
            ownerId: user.id,
            memberCount: 1,
            messages: [{ id: 'm1', senderId: 'system', senderName: 'Sistem', text: `${newGroupName} grubu oluşturuldu! 🎉`, timestamp: Date.now(), type: 'system' }],
            activeBots: [],
            isPrivate: newGroupIsPrivate,
            messageDelay: 0,
            securityLevel: 'low'
        };
        setGroups([newGroup, ...groups]);
        setShowCreateGroup(false);
        setNewGroupName('');
        setNewGroupDesc('');
        setNewGroupBannerUrl('');
        setNewGroupIsPrivate(false);
        setSelectedGroupId(newGroup.id);
        setView('chat');
        showToast('Grup başarıyla oluşturuldu!');
    };

    return (
        <div className="h-screen bg-[#0E1621] flex flex-col pb-24 text-white overflow-hidden font-display">
            {toastMsg && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[999] bg-tg-blue text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase shadow-2xl animate-in zoom-in">{toastMsg}</div>}
            {view === 'list' && (
                <div className="flex flex-col h-full animate-in fade-in">
                    <header className="p-4 bg-[#17212B] flex items-center justify-between border-b border-white/5 shadow-xl">
                        <div className="flex items-center gap-4">
                            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors"><span className="material-symbols-outlined">arrow_back</span></button>
                            <h1 className="text-xl font-black italic tracking-tighter">FOCUS <span className="text-tg-blue">HUB</span></h1>
                        </div>
                        <button onClick={() => setShowCreateGroup(true)} className="w-10 h-10 bg-tg-blue rounded-full flex items-center justify-center shadow-glow active:scale-90 transition-transform"><span className="material-symbols-outlined">add</span></button>
                    </header>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {errorMsg && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase shadow-2xl animate-in zoom-in">{errorMsg}</div>}
                        {groups.map(group => (
                            <div key={group.id} onClick={() => { 
                                if (group.isSubscriberOnly && !user.isProActive) {
                                    setErrorMsg('Bu grup sadece PRO abonelere özeldir.');
                                    setTimeout(() => setErrorMsg(''), 3000);
                                    return;
                                }
                                setSelectedGroupId(group.id); 
                                setView('chat'); 
                            }} className={`flex items-center gap-4 p-5 hover:bg-[#202B36] cursor-pointer border-b border-white/5 transition-all ${group.isSubscriberOnly && !user.isProActive ? 'opacity-50' : ''}`}>
                                <div className="relative">
                                    <img src={group.avatarUrl} className={`w-16 h-16 rounded-full border-2 ${group.isSubscriberOnly ? 'border-purple-500/50' : 'border-tg-blue/20'}`} alt="" referrerPolicy="no-referrer" />
                                    {group.isPrivate && <span className={`absolute bottom-0 right-0 rounded-full p-1 border-2 border-[#0E1621] ${group.isSubscriberOnly ? 'bg-purple-500' : 'bg-tg-blue'}`}><span className="material-symbols-outlined text-[10px] text-white">{group.isSubscriberOnly && !user.isProActive ? 'lock' : 'lock_open'}</span></span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-black italic truncate text-sm uppercase flex items-center gap-2">
                                            {group.name}
                                            {group.isSubscriberOnly && <span className="text-[8px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md">PRO</span>}
                                        </h3>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">v5.0</span>
                                    </div>
                                    <p className="text-xs text-slate-400 truncate font-medium">{group.messages[group.messages.length - 1]?.text || 'Grup aktif edildi.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Group Overlay */}
            {showCreateGroup && (
                <div className="fixed inset-0 z-[650] bg-[#0F172A] flex flex-col p-8 animate-in slide-in-from-bottom duration-300 overflow-y-auto">
                    <header className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-tg-blue">YENİ GRUP AÇ</h2>
                        <button onClick={() => setShowCreateGroup(false)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
                    </header>
                    <div className="space-y-6">
                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Grup Adı</label>
                                <input 
                                    type="text" 
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Örn: YKS 2026 Tayfa" 
                                    className="w-full bg-black/40 rounded-2xl p-4 border border-white/10 outline-none text-sm font-bold text-white"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Açıklama</label>
                                <textarea 
                                    value={newGroupDesc}
                                    onChange={(e) => setNewGroupDesc(e.target.value)}
                                    placeholder="Grup hakkında kısa bir bilgi..." 
                                    className="w-full h-24 bg-black/40 rounded-2xl p-4 border border-white/10 outline-none text-sm font-bold text-white resize-none"
                                ></textarea>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Banner URL</label>
                                <input 
                                    type="text" 
                                    value={newGroupBannerUrl}
                                    onChange={(e) => setNewGroupBannerUrl(e.target.value)}
                                    placeholder="Örn: https://images.unsplash.com/..." 
                                    className="w-full bg-black/40 rounded-2xl p-4 border border-white/10 outline-none text-sm font-bold text-white"
                                />
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-sm font-black italic">Özel Grup</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">Sadece davet ile katılım</p>
                                </div>
                                <button onClick={() => setNewGroupIsPrivate(!newGroupIsPrivate)} className={`w-14 h-7 rounded-full transition-all relative ${newGroupIsPrivate ? 'bg-tg-blue' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${newGroupIsPrivate ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <button 
                                onClick={handleCreateGroup} 
                                className="w-full py-4 mt-4 bg-tg-blue text-white rounded-2xl font-black uppercase active:scale-95 transition-transform shadow-glow"
                            >
                                GRUBU OLUŞTUR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {view === 'chat' && activeGroup && (
                <div className="flex flex-col h-full fixed inset-0 z-[100] tg-chat-bg animate-in slide-in-from-right duration-200">
                    <header className="p-3 bg-[#17212B] flex flex-col border-b border-white/5 shadow-lg relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setView('list')} className="text-slate-400 p-1"><span className="material-symbols-outlined">arrow_back</span></button>
                                <img src={activeGroup.avatarUrl} className="w-11 h-11 rounded-full border border-white/10" alt="" onClick={() => setView('settings')} referrerPolicy="no-referrer" />
                                <div onClick={() => setView('settings')} className="cursor-pointer">
                                    <h3 className="font-black text-sm tracking-tight uppercase italic leading-none">{activeGroup.name}</h3>
                                    <p className="text-[9px] text-tg-blue font-black tracking-widest uppercase mt-1">{activeGroup.memberCount} ÜYE • {activeGroup.activeBots.length} ROBOT</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setView('settings')} className="text-slate-400 p-2 bg-white/5 rounded-xl"><span className="material-symbols-outlined">settings</span></button>
                                <button onClick={() => showToast('Arkadaş davet etme özelliği yakında!')} className="text-slate-400 p-2 bg-white/5 rounded-xl"><span className="material-symbols-outlined">person_add</span></button>
                            </div>
                        </div>
                        <div className="flex bg-black/20 p-1 rounded-xl">
                            {[
                                { id: 'chat', label: 'SOHBET', icon: 'chat' },
                                { id: 'missions', label: 'GÖREVLER', icon: 'military_tech' },
                                { id: 'leaderboard', label: 'SIRALAMA', icon: 'leaderboard' }
                            ].map(tab => (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setActiveGroupTab(tab.id as any)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeGroupTab === tab.id ? 'bg-tg-blue text-white shadow-glow' : 'text-slate-500'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </header>

                    {activeGroupTab === 'chat' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-4 bg-[#17212B] border-b border-white/5">
                                <h4 className="text-[10px] font-black text-tg-blue uppercase tracking-widest mb-2">ARKADAŞLARINI DAVET ET</h4>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                    {user.friends?.filter(fId => !activeGroup.members?.includes(fId)).map(friendId => {
                                        const friend = allUsers.find(u => u.id === friendId);
                                        return (
                                            <button key={friendId} onClick={() => updateGroup({ members: [...(activeGroup.members || []), friendId] })} className="flex-shrink-0 flex items-center gap-2 bg-black/20 px-4 py-2 rounded-2xl border border-white/5">
                                                <img src={friend?.avatarUrl} className="w-6 h-6 rounded-full bg-slate-800" alt="" referrerPolicy="no-referrer" />
                                                <span className="text-[10px] font-black italic">{friend?.name}</span>
                                                <span className="material-symbols-outlined text-[12px] text-tg-blue">add</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar pb-10">
                                {errorMsg && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase shadow-2xl animate-in zoom-in">{errorMsg}</div>}
                                {activeGroup.messages.map(msg => {
                                    const isMe = msg.senderId === user.id;
                                    const isBot = msg.type === 'bot' || msg.senderId.startsWith('bot');
                                    const isSystem = msg.type === 'system';

                                    if (isSystem) return <div key={msg.id} className="text-center py-2"><span className="bg-black/40 px-6 py-1.5 rounded-full text-[9px] font-black uppercase text-slate-400 border border-white/5 tracking-widest">{msg.text}</span></div>;

                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] p-4 rounded-3xl shadow-tg relative transition-all ${isMe ? 'bg-tg-out text-white rounded-tr-none' : (isBot ? 'bg-[#2b2d42] border border-indigo-500/30' : 'bg-tg-msg text-white rounded-tl-none')}`}>
                                                <div className="flex items-center justify-between mb-1 gap-4">
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isBot ? 'text-indigo-400' : isMe ? 'text-blue-200' : 'text-tg-blue'}`}>{msg.senderName}</p>
                                                </div>

                                                {msg.type === 'gift' ? (
                                                    <div className="bg-yellow-500/10 p-5 rounded-2xl border border-yellow-500/30 flex flex-col items-center gap-3 animate-bounce">
                                                        <span className="text-5xl">{msg.giftIcon}</span>
                                                        <p className="text-[10px] font-black text-yellow-500 uppercase italic">ÖZEL HEDİYE</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-[13px] font-medium leading-relaxed tracking-tight">{msg.text}</p>
                                                )}

                                                <div className="flex items-center justify-end gap-1 mt-1 opacity-40">
                                                    <span className="text-[8px] font-black">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {isMe && <span className="material-symbols-outlined text-[10px]">done_all</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {showGiftMenu && (
                                <div className="bg-[#17212B] border-t border-white/5 p-4 animate-in slide-in-from-bottom">
                                    <div className="flex justify-between items-center mb-4 px-2">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-500">HEDİYE GÖNDER</h4>
                                        <button onClick={() => setShowGiftMenu(false)} className="text-slate-500"><span className="material-symbols-outlined text-sm">close</span></button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {GROUP_GIFTS.map(gift => (
                                            <button key={gift.name} onClick={() => handleSendMessage(gift.icon, gift.cost)} className="bg-black/20 p-4 rounded-3xl border border-white/5 flex flex-col items-center gap-2 hover:bg-yellow-500/10 hover:border-yellow-500/20 active:scale-95 transition-all">
                                                <span className="text-3xl">{gift.icon}</span>
                                                <div className="flex items-center gap-1 text-[9px] font-black text-yellow-500 italic">
                                                    {gift.cost} 🪙
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-[#17212B] border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowGiftMenu(!showGiftMenu)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showGiftMenu ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-glow shadow-yellow-500/20' : 'bg-white/5 text-slate-500'}`}><span className="material-symbols-outlined">card_giftcard</span></button>
                                    <div className="flex-1 bg-black/40 rounded-2xl flex items-center px-4 py-1">
                                        <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder={cooldown > 0 ? `${cooldown}s Bekle...` : "Mesaj gönder..."} className="flex-1 bg-transparent text-sm py-3 outline-none font-bold" disabled={cooldown > 0 || isModerating} />
                                    </div>
                                    <button onClick={() => handleSendMessage()} disabled={isModerating} className={`w-14 h-14 ${isModerating ? 'bg-tg-blue/50 cursor-not-allowed' : 'bg-tg-blue'} text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform`}>
                                        <span className={`material-symbols-outlined text-2xl font-black ${isModerating ? 'animate-spin' : ''}`}>
                                            {isModerating ? 'hourglass_empty' : 'send'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeGroupTab === 'missions' && (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in fade-in">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[3rem] border border-white/10 relative overflow-hidden">
                                <span className="absolute -right-4 -bottom-4 material-symbols-outlined text-9xl opacity-10">military_tech</span>
                                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">GRUP GÖREVLERİ</h4>
                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Birlikte çalışın, birlikte kazanın!</p>
                            </div>

                            {[
                                { title: 'BÜYÜK SORU MARATONU', desc: 'Grup üyeleri toplam 5000 soru çözmeli.', progress: 65, reward: 500, icon: 'quiz' },
                                { title: 'SABAH SAVAŞÇILARI', desc: 'Sabah 06:00 - 09:00 arası 50 kişi aktif olmalı.', progress: 30, reward: 300, icon: 'wb_sunny' },
                                { title: 'BİLGİ PAYLAŞIMI', desc: 'Grupta 100 adet faydalı bilgi paylaşılmalı.', progress: 88, reward: 200, icon: 'lightbulb' }
                            ].map(mission => (
                                <div key={mission.title} className="bg-[#17212B] p-6 rounded-[2.5rem] border border-white/5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-tg-blue/10 rounded-xl flex items-center justify-center text-tg-blue">
                                            <span className="material-symbols-outlined">{mission.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="text-xs font-black uppercase italic">{mission.title}</h5>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">{mission.desc}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                            <span className="text-slate-500">İLERLEME</span>
                                            <span className="text-tg-blue">%{mission.progress}</span>
                                        </div>
                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                            <div className="h-full bg-tg-blue rounded-full shadow-glow" style={{ width: `${mission.progress}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-yellow-500 italic">
                                            <span className="material-symbols-outlined text-sm">database</span>
                                            +{mission.reward} JETON
                                        </div>
                                        <button className="px-4 py-2 bg-white/5 rounded-xl text-[8px] font-black uppercase border border-white/10">DETAYLAR</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeGroupTab === 'leaderboard' && (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in fade-in">
                            <div className="flex flex-col items-center gap-4 mb-8">
                                <div className="flex items-end gap-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 rounded-full border-4 border-slate-400 p-1 relative">
                                            <img src="https://api.dicebear.com/9.x/micah/svg?seed=Liam" className="w-full h-full rounded-full bg-slate-800" alt="" />
                                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-slate-400 text-black rounded-lg flex items-center justify-center text-[10px] font-black">2</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase italic">Liam</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-24 h-24 rounded-full border-4 border-yellow-500 p-1 relative shadow-glow shadow-yellow-500/20">
                                            <img src="https://api.dicebear.com/9.x/micah/svg?seed=Felix" className="w-full h-full rounded-full bg-slate-800" alt="" />
                                            <span className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-500 text-black rounded-xl flex items-center justify-center text-xs font-black">1</span>
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl animate-bounce">👑</span>
                                        </div>
                                        <p className="text-xs font-black uppercase italic text-yellow-500">Felix</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 rounded-full border-4 border-orange-500 p-1 relative">
                                            <img src="https://api.dicebear.com/9.x/micah/svg?seed=Emma" className="w-full h-full rounded-full bg-slate-800" alt="" />
                                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-black rounded-lg flex items-center justify-center text-[10px] font-black">3</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase italic">Emma</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { name: 'Oliver', score: 1250, rank: 4 },
                                    { name: 'Sofia', score: 1100, rank: 5 },
                                    { name: 'Noah', score: 950, rank: 6 },
                                    { name: 'Mia', score: 800, rank: 7 },
                                    { name: 'Aneka', score: 750, rank: 8 }
                                ].map(member => (
                                    <div key={member.name} className="bg-[#17212B] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="w-6 text-center text-[10px] font-black text-slate-500">{member.rank}</span>
                                            <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${member.name}`} className="w-10 h-10 rounded-full bg-slate-800 border border-white/10" alt="" />
                                            <p className="text-xs font-black uppercase italic">{member.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black italic text-tg-blue">{member.score}</p>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">PUAN</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {view === 'settings' && activeGroup && (
                <div className="flex flex-col h-full bg-[#0E1621] animate-in slide-in-from-bottom overflow-y-auto no-scrollbar pb-32">
                    <header className="p-4 bg-[#17212B] flex items-center justify-between sticky top-0 z-20 shadow-lg border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('chat')} className="text-slate-400 p-1"><span className="material-symbols-outlined">arrow_back</span></button>
                            <h1 className="text-lg font-black italic uppercase tracking-tighter">GÜVENLİK PANELİ</h1>
                        </div>
                    </header>
                    <div className="p-6 space-y-8">
                        <div className="bg-[#17212B] rounded-[3rem] p-8 border border-white/10 text-center">
                            <img src={activeGroup.avatarUrl} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-tg-blue shadow-glow shadow-tg-blue/20" alt="" referrerPolicy="no-referrer" />
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">{activeGroup.name}</h2>
                        </div>

                        <section className="bg-[#17212B] rounded-[2.5rem] p-6 space-y-4 border border-white/5">
                            <h4 className="text-[10px] font-black text-tg-blue uppercase tracking-widest mb-4 flex items-center gap-2">👥 ÜYELER</h4>
                            <div className="space-y-3">
                                {activeGroup.members?.map(memberId => {
                                    const member = allUsers.find(u => u.id === memberId);
                                    return (
                                        <div key={memberId} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <img src={member?.avatarUrl} className="w-10 h-10 rounded-full bg-slate-800" alt="" referrerPolicy="no-referrer" />
                                                <p className="text-xs font-black italic">{member?.name}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {activeGroup.ownerId === user.id && (
                                <div className="mt-4">
                                    <h4 className="text-[10px] font-black text-tg-blue uppercase tracking-widest mb-2">ARKADAŞ DAVET ET</h4>
                                    <div className="space-y-2">
                                        {user.friends?.filter(fId => !activeGroup.members?.includes(fId)).map(friendId => {
                                            const friend = allUsers.find(u => u.id === friendId);
                                            return (
                                                <div key={friendId} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                                                    <p className="text-xs font-black italic">{friend?.name}</p>
                                                    <button onClick={() => updateGroup({ members: [...(activeGroup.members || []), friendId] })} className="px-4 py-2 bg-tg-blue text-white rounded-xl text-[9px] font-black uppercase italic">DAVET ET</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="bg-[#17212B] rounded-[2.5rem] p-6 space-y-6 border border-white/5">
                            <h4 className="text-[10px] font-black text-tg-blue uppercase tracking-widest mb-4 flex items-center gap-2">🛡️ GİZLİLİK & GÜVENLİK</h4>
                            <div className="flex justify-between items-center">
                                <div><p className="text-sm font-black italic">Özel Grup</p><p className="text-[9px] text-slate-500 font-bold uppercase">Sadece davet ile katılım</p></div>
                                <button onClick={() => { updateGroup({ isPrivate: !activeGroup.isPrivate }); showToast(`Grup gizliliği ${!activeGroup.isPrivate ? 'açıldı' : 'kapandı'}.`); }} className={`w-14 h-7 rounded-full transition-all relative ${activeGroup.isPrivate ? 'bg-tg-blue' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${activeGroup.isPrivate ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div><p className="text-sm font-black italic">Guard-AI Filtresi</p><p className="text-[9px] text-slate-500 font-bold uppercase">Küfür ve Spam Koruması</p></div>
                                <button onClick={() => { updateGroup({ securityLevel: activeGroup.securityLevel === 'high' ? 'low' : 'high' }); showToast('Güvenlik seviyesi güncellendi.'); }} className={`w-14 h-7 rounded-full transition-all relative ${activeGroup.securityLevel === 'high' ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${activeGroup.securityLevel === 'high' ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div><p className="text-sm font-black italic">Süreli Mesajlar</p><p className="text-[9px] text-slate-500 font-bold uppercase">Mesajlar 24 saat sonra silinir</p></div>
                                <button onClick={() => { updateGroup({ isExpiringMessages: !activeGroup.isExpiringMessages }); showToast('Süreli mesajlar güncellendi.'); }} className={`w-14 h-7 rounded-full transition-all relative ${activeGroup.isExpiringMessages ? 'bg-tg-blue' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${activeGroup.isExpiringMessages ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div><p className="text-sm font-black italic">Doğrulama Mesajları</p><p className="text-[9px] text-slate-500 font-bold uppercase">Yeni üyeler doğrulanır</p></div>
                                <button onClick={() => { updateGroup({ isVerificationRequired: !activeGroup.isVerificationRequired }); showToast('Doğrulama ayarları güncellendi.'); }} className={`w-14 h-7 rounded-full transition-all relative ${activeGroup.isVerificationRequired ? 'bg-tg-blue' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${activeGroup.isVerificationRequired ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1"><p className="text-[10px] font-black text-slate-500 uppercase">SLOW MODE (SN)</p><span className="text-tg-blue font-black text-xs italic">{activeGroup.messageDelay} SN</span></div>
                                <input type="range" min="0" max="60" value={activeGroup.messageDelay} onChange={(e) => { updateGroup({ messageDelay: Number(e.target.value) }); showToast('Mesaj gecikmesi güncellendi.'); }} className="w-full accent-tg-blue h-1.5 bg-white/5 rounded-full appearance-none" />
                            </div>
                        </section>

                        <section className="bg-[#17212B] rounded-[2.5rem] p-6 space-y-4 border border-white/5">
                            <h4 className="text-[10px] font-black text-tg-blue uppercase tracking-widest mb-4 flex items-center gap-2">⚙️ GRUP AYARLARI</h4>
                            
                            <div onClick={() => showToast('Sohbet kontrolleri yakında eklenecek.')} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400">tune</span>
                                    <div><p className="text-xs font-black italic">Sohbet Kontrolleri</p><p className="text-[8px] text-slate-500 font-black uppercase">Kimler mesaj gönderebilir</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase">AKTİF</span>
                                    <span className="material-symbols-outlined text-slate-500">chevron_right</span>
                                </div>
                            </div>

                            <div onClick={() => showToast('Takım adları yönetimi yakında eklenecek.')} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400">badge</span>
                                    <div><p className="text-xs font-black italic">Takım Adları</p><p className="text-[8px] text-slate-500 font-black uppercase">Grup içi takımları yönet</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase">AKTİF</span>
                                    <span className="material-symbols-outlined text-slate-500">chevron_right</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400">notifications_off</span>
                                    <div><p className="text-xs font-black italic">Sessize Al</p><p className="text-[8px] text-slate-500 font-black uppercase">Bildirimleri kapat</p></div>
                                </div>
                                <button onClick={() => updateGroup({ isMuted: !activeGroup.isMuted })} className={`w-12 h-6 rounded-full transition-all relative ${activeGroup.isMuted ? 'bg-tg-blue' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${activeGroup.isMuted ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div onClick={() => showToast('Kanal tipi değiştirilemez.')} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400">category</span>
                                    <div><p className="text-xs font-black italic">Kanal Tipi</p><p className="text-[8px] text-slate-500 font-black uppercase">Sohbet / Duyuru</p></div>
                                </div>
                                <span className="text-[10px] font-black text-tg-blue uppercase">Sohbet</span>
                            </div>

                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400">forum</span>
                                    <div><p className="text-xs font-black italic">Tartışma</p><p className="text-[8px] text-slate-500 font-black uppercase">Mesajlara yanıt verme</p></div>
                                </div>
                                <button onClick={() => updateGroup({ isDiscussionEnabled: !activeGroup.isDiscussionEnabled })} className={`w-12 h-6 rounded-full transition-all relative ${activeGroup.isDiscussionEnabled ? 'bg-tg-blue' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${activeGroup.isDiscussionEnabled ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div onClick={() => showToast('Tema yönetimi yakında eklenecek.')} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400">palette</span>
                                    <div><p className="text-xs font-black italic">Dış Görünüş</p><p className="text-[8px] text-slate-500 font-black uppercase">Tema ve renkler</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase">AKTİF</span>
                                    <span className="material-symbols-outlined text-slate-500">chevron_right</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400">translate</span>
                                    <div><p className="text-xs font-black italic">Otomatik Çeviri</p><p className="text-[8px] text-slate-500 font-black uppercase">Mesajları otomatik çevir</p></div>
                                </div>
                                <button onClick={() => updateGroup({ isAutoTranslate: !activeGroup.isAutoTranslate })} className={`w-12 h-6 rounded-full transition-all relative ${activeGroup.isAutoTranslate ? 'bg-tg-blue' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${activeGroup.isAutoTranslate ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div onClick={() => showToast('Yönetici paneli yakında eklenecek.')} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400">admin_panel_settings</span>
                                    <div><p className="text-xs font-black italic">Yöneticiler</p><p className="text-[8px] text-slate-500 font-black uppercase">Grup yöneticilerini düzenle</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase">AKTİF</span>
                                    <span className="material-symbols-outlined text-slate-500">chevron_right</span>
                                </div>
                            </div>

                            <div onClick={() => showToast('Abonelik ayarları yakında eklenecek.')} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-purple-400">workspace_premium</span>
                                    <div><p className="text-xs font-black italic text-purple-400">Abonelikler</p><p className="text-[8px] text-slate-500 font-black uppercase">Grup abonelik ayarları</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-purple-400 uppercase">AKTİF</span>
                                    <span className="material-symbols-outlined text-slate-500">chevron_right</span>
                                </div>
                            </div>
                        </section>

                        <section className="bg-[#17212B] rounded-[2.5rem] p-6 space-y-4 border border-white/5">
                            <h4 className="text-[10px] font-black text-tg-blue uppercase tracking-widest mb-4 flex items-center gap-2">🤖 AI AGENTLAR</h4>
                            {AVAILABLE_BOTS.map(bot => {
                                const isActive = activeGroup.activeBots.includes(bot.id);
                                return (
                                    <div key={bot.id} className="flex justify-between items-center bg-black/20 p-4 rounded-3xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <img src={bot.avatar} className={`w-12 h-12 rounded-xl bg-white/5 border ${isActive ? 'border-tg-blue' : 'border-white/5 grayscale opacity-40'}`} alt="" />
                                            <div><p className="text-xs font-black italic">{bot.name}</p><p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{bot.role}</p></div>
                                        </div>
                                        <button onClick={() => updateGroup({ activeBots: isActive ? activeGroup.activeBots.filter(id => id !== bot.id) : [...activeGroup.activeBots, bot.id] })} className={`text-[9px] font-black px-4 py-2 rounded-xl border italic ${isActive ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-tg-blue/10 text-tg-blue border-tg-blue/20'}`}>{isActive ? 'KALDIR' : 'EKLE'}</button>
                                    </div>
                                );
                            })}
                        </section>

                        <section className="bg-[#17212B] rounded-[2.5rem] p-6 space-y-4 border border-white/5">
                            <h4 className="text-[10px] font-black text-tg-blue uppercase tracking-widest mb-4 flex items-center gap-2">📞 SESLİ KANALLAR</h4>
                            <div className="space-y-3">
                                {[
                                    { name: 'Ders Çalışma Odası 1', users: 12, active: true },
                                    { name: 'Soru Çözüm Odası', users: 5, active: false },
                                    { name: 'Mola & Sohbet', users: 24, active: true }
                                ].map(room => (
                                    <div key={room.name} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined ${room.active ? 'text-emerald-500' : 'text-slate-500'}`}>volume_up</span>
                                            <div>
                                                <p className="text-xs font-black italic">{room.name}</p>
                                                <p className="text-[8px] text-slate-500 font-black uppercase">{room.users} KİŞİ BAĞLI</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-tg-blue/10 text-tg-blue border border-tg-blue/20 rounded-xl text-[9px] font-black uppercase italic">KATIL</button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
};
