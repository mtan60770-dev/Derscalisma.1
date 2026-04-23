import React, { useState } from 'react';
import { User, GiftRecord } from '../types';
import { getRank, FRAMES, capitalize } from '../constants';
import { motion } from 'framer-motion';

interface FriendProfileProps {
  friend: User;
  onBack: () => void;
  onSendCoins: (friendId: string, amount: number) => void;
  onSendDiamonds: (friendId: string, amount: number) => void;
  onSendGift: (friendId: string, giftIcon: string, cost: number, popularity: number, currency: 'coins' | 'diamonds') => void;
  currentUserCoins: number;
  currentUserDiamonds: number;
  setChatFriend: (friend: User | null) => void;
  diamondAnimation?: { amount: number; senderName: string } | null;
}

export const FriendProfile: React.FC<FriendProfileProps> = ({ friend, onBack, onSendCoins, onSendDiamonds, onSendGift, currentUserCoins, currentUserDiamonds, setChatFriend, diamondAnimation }) => {
  const [giftAnimation, setGiftAnimation] = useState<string | null>(null);

  const triggerGiftAnimation = (icon: string) => {
    setGiftAnimation(icon);
    setTimeout(() => setGiftAnimation(null), 2000);
  };
 
  const [amount, setAmount] = useState(50);
  const [diamondAmount, setDiamondAmount] = useState(10);
  const [giftQuantity, setGiftQuantity] = useState(1);
  const frame = FRAMES.find(f => f.id === friend.frameId) || FRAMES[0];
  const rank = getRank(friend.solvedQuestions?.total || 0);

  const gifts = [
    { icon: '🎁', cost: 50, popularity: 100 },
    { icon: '❤️', cost: 100, popularity: 200 },
    { icon: '✈️', cost: 200, popularity: 300 },
    { icon: '🚗', cost: 500, popularity: 800 },
    { icon: '⭐', cost: 1000, popularity: 1500 },
  ];

  const diamondGifts = [
    { icon: '💎', cost: 50, popularity: 500 },
    { icon: '👑', cost: 100, popularity: 1000 },
    { icon: '🚀', cost: 200, popularity: 2000 },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <button onClick={onBack} className="mb-4 text-slate-400">Geri</button>
      <div className="flex flex-col items-center">
        <div className={`w-32 h-32 rounded-full border-8 ${frame.color} ${frame.animation} p-1.5 mb-4 overflow-hidden flex items-center justify-center bg-slate-900`}>
          <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full rounded-full object-cover" />
        </div>
        <h1 className="text-2xl font-black">{capitalize(friend.name)}</h1>
        <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
            <span>ID: {friend.id}</span>
            <span className="flex items-center gap-0.5 text-yellow-500 font-bold">
                <span className="material-symbols-outlined text-xs">star</span>
                {friend.popularity || 0}
            </span>
        </div>
        <div className={`mt-2 px-4 py-1 rounded-full text-xs font-black uppercase border ${rank.border} ${rank.bg} ${rank.color}`}>
          {rank.name}
        </div>
        <p className="text-slate-400 mt-2">{friend.grade}. Sınıf</p>
        
        <button 
            onClick={() => setChatFriend(friend)}
            className="mt-4 w-full bg-tg-blue py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
            <span className="material-symbols-outlined">chat</span> Mesaj Gönder
        </button>
        
        <div className="mt-6 w-full bg-white/5 p-4 rounded-xl">
            <h3 className="text-sm font-bold mb-2">Son Hediyeler</h3>
            <div className="flex flex-wrap gap-2">
                {friend.receivedGifts && friend.receivedGifts.length > 0 ? (
                    friend.receivedGifts.slice(-5).map((gift, index) => (
                        <div key={index} className="bg-white/10 p-2 rounded-lg text-xs" title={`${gift.senderName} tarafından gönderildi`}>
                            {gift.giftIcon}
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-slate-500">Henüz hediye alınmadı.</p>
                )}
            </div>
        </div>

        {/* Gift Animation Overlay */}
        {giftAnimation && (
            <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
                <div className="text-8xl">{giftAnimation}</div>
            </motion.div>
        )}
        
        <div className="mt-4 w-full flex items-center gap-2 bg-white/5 p-2 rounded-xl">
            <span className="text-xs font-bold">Adet:</span>
            <input type="number" value={giftQuantity} onChange={(e) => setGiftQuantity(Math.max(1, Number(e.target.value)))} className="w-16 bg-white/10 p-1 rounded-lg text-center" />
        </div>

        <div className="mt-4 w-full flex gap-2">
            {gifts.map(gift => (
                <motion.button 
                    key={gift.icon} 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        onSendGift(friend.id, gift.icon, gift.cost * giftQuantity, gift.popularity * giftQuantity, 'coins');
                        triggerGiftAnimation(gift.icon);
                    }} 
                    disabled={currentUserCoins < gift.cost * giftQuantity}
                    className="flex-1 flex flex-col items-center p-3 bg-white/5 rounded-xl disabled:opacity-50"
                >
                    <span className="text-2xl">{gift.icon}</span>
                    <span className="text-[10px] font-bold">{gift.cost * giftQuantity} Coin</span>
                </motion.button>
            ))}
        </div>

        <div className="mt-4 w-full flex gap-2">
            {diamondGifts.map(gift => (
                <motion.button 
                    key={gift.icon} 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        onSendGift(friend.id, gift.icon, gift.cost * giftQuantity, gift.popularity * giftQuantity, 'diamonds');
                        triggerGiftAnimation(gift.icon);
                    }} 
                    disabled={currentUserDiamonds < gift.cost * giftQuantity}
                    className="flex-1 flex flex-col items-center p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl disabled:opacity-50"
                >
                    <span className="text-2xl">{gift.icon}</span>
                    <span className="text-[10px] font-bold text-blue-400">{gift.cost * giftQuantity} Elmas</span>
                </motion.button>
            ))}
        </div>

        <div className="mt-6 w-full bg-white/5 p-4 rounded-xl flex justify-around items-center">

          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-yellow-400">monetization_on</span>
            <p className="font-bold">{friend.coins}</p>
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
            className="flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-cyan-400">diamond</span>
            <p className="font-bold">{friend.diamonds}</p>
          </motion.div>
        </div>

        <div className="mt-8 w-full bg-white/5 p-4 rounded-xl">
            <h3 className="text-sm font-bold mb-2">Coin Gönder</h3>
            <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white/10 p-2 rounded-lg mb-2"
            />
            <button 
                onClick={() => onSendCoins(friend.id, amount)} 
                disabled={amount > currentUserCoins || amount <= 0}
                className="w-full bg-primary py-2 rounded-lg font-bold disabled:opacity-50"
            >
                {amount > currentUserCoins ? 'Yetersiz Coin' : `${amount} Coin Gönder`}
            </button>
        </div>

        <div className="mt-4 w-full bg-white/5 p-4 rounded-xl">
            <h3 className="text-sm font-bold mb-2">Elmas Gönder</h3>
            <input 
                type="number" 
                value={diamondAmount} 
                onChange={(e) => setDiamondAmount(Number(e.target.value))}
                className="w-full bg-white/10 p-2 rounded-lg mb-2"
            />
            <button 
                onClick={() => onSendDiamonds(friend.id, diamondAmount)} 
                disabled={diamondAmount > currentUserDiamonds || diamondAmount <= 0}
                className="w-full bg-blue-500 py-2 rounded-lg font-bold disabled:opacity-50"
            >
                {diamondAmount > currentUserDiamonds ? 'Yetersiz Elmas' : `${diamondAmount} Elmas Gönder`}
            </button>
        </div>
      </div>
    </div>
  );
};
