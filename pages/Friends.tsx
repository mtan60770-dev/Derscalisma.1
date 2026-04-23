import React, { useState } from 'react';
import { User } from '../types';
import { getRank, getLevel, getPopularityLevel, capitalize, GIFTS, POPULARITY_LEVELS } from '../constants';
import { Gift } from '../constants';

interface FriendsProps {
  user: User;
  students: User[];
  onUpdateUser: (data: Partial<User>) => void;
  onUpdateOtherUser: (userId: string, data: Partial<User>) => void;
  onBack: () => void;
  onSelectFriend: (friend: User) => void;
  setChatFriend: (friend: User | null) => void;
}

const FriendItem = ({ friendId, user, students, onSelectFriend, setChatFriend, togglePin, blockFriend, deleteFriend, setGiftRecipient }: any) => {
    const friend = students.find((s: User) => s.id === friendId);
    console.log("FriendItem rendered for", friendId, friend?.popularity);
    if (!friend) return <li className="bg-white/5 p-3 rounded-xl">{friendId}</li>;
    const rank = getRank(friend.solvedQuestions?.total || 0);
    const isPinned = user.pinnedFriends?.includes(friendId);
    return (
        <li className="bg-white/5 p-3 rounded-xl flex justify-between items-center">
            <div className="cursor-pointer hover:bg-white/10 flex-1 flex items-center gap-3" onClick={() => onSelectFriend(friend)}>
                <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full" />
                <div>
                    <span className="font-bold">{capitalize(friend.name)}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>ID: {friend.id}</span>
                        <span className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-full text-yellow-500 font-bold border border-yellow-500/20">
                            {friend.popularity || 0}
                        </span>
                    </div>                    <div className="flex items-center gap-2">
                        <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${rank.border} ${rank.bg} ${rank.color} inline-block`}>{rank.name}</div>
                        <div className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/20 text-indigo-400">Seviye {getLevel(friend.solvedQuestions?.total || 0)}</div>
                    </div>
                    {/* Progress Bar for FriendItem */}
                    <div className="w-32 h-2 bg-black/40 rounded-full mt-1 overflow-hidden border border-white/10">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                            style={{ 
                                width: `${(() => {
                                    const popularity = friend.popularityLevelProgress || 0;
                                    const level = getPopularityLevel(popularity);
                                    const currentLevelMin = POPULARITY_LEVELS.find(l => l.level === level)?.min || 0;
                                    const nextLevelMin = POPULARITY_LEVELS.find(l => l.level === level + 1)?.min || popularity;
                                    const range = nextLevelMin - currentLevelMin;
                                    return range === 0 ? 100 : Math.min(100, Math.max(0, ((popularity - currentLevelMin) / range) * 100));
                                })()}%` 
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setGiftRecipient(friend)} className="p-2 rounded-lg bg-pink-500/20 text-pink-500 hover:animate-pulse">
                    <span className="material-symbols-outlined text-sm">redeem</span>
                </button>
                <button onClick={() => setChatFriend(friend)} className="p-2 rounded-lg bg-tg-blue/20 text-tg-blue">
                    <span className="material-symbols-outlined text-sm">chat</span>
                </button>
                <button onClick={() => togglePin(friendId)} className={`p-2 rounded-lg ${isPinned ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-sm">push_pin</span>
                </button>
                <button onClick={() => blockFriend(friendId)} className="p-2 rounded-lg bg-red-500/20 text-red-500">
                    <span className="material-symbols-outlined text-sm">block</span>
                </button>
                <button onClick={() => deleteFriend(friendId)} className="p-2 rounded-lg bg-slate-500/20 text-slate-400">
                    <span className="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        </li>
    );
};

const GiftAnimationOverlay = ({ giftAnimation }: { giftAnimation: any }) => {
    const getProgress = (progress: number) => {
        const level = getPopularityLevel(progress);
        const currentLevelMin = POPULARITY_LEVELS.find(l => l.level === level)?.min || 0;
        const nextLevelMin = POPULARITY_LEVELS.find(l => l.level === level + 1)?.min || progress;
        const range = nextLevelMin - currentLevelMin;
        return range === 0 ? 100 : Math.min(100, Math.max(0, ((progress - currentLevelMin) / range) * 100));
    };

    const [width, setWidth] = useState(getProgress(giftAnimation.oldPopularity));

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setWidth(getProgress(giftAnimation.newPopularity));
        }, 100);
        return () => clearTimeout(timer);
    }, [giftAnimation]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-[#1E293B] p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300">
                <span className="text-8xl animate-bounce">{giftAnimation.icon}</span>
                <div className="text-center">
                    <p className="text-2xl font-black text-white">{giftAnimation.name} Gönderildi!</p>
                    <p className="text-yellow-400 font-bold text-xl mt-1">+{giftAnimation.popularityGain} Seviye Puanı</p>
                </div>
                
                <div className="w-full flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400">Seviye {getPopularityLevel(giftAnimation.oldPopularity)}</span>
                    <span className="text-white">Seviye {getPopularityLevel(giftAnimation.newPopularity)}</span>
                </div>

                {/* Blue Progress Bar */}
                <div className="w-full bg-black/40 rounded-full h-6 overflow-hidden border border-white/10 p-1">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${width}%` }}
                    />
                </div>
                <p className="text-sm text-slate-300 font-bold">
                    {giftAnimation.newPopularity} / {(() => {
                        const level = getPopularityLevel(giftAnimation.newPopularity);
                        return POPULARITY_LEVELS.find(l => l.level === level + 1)?.min || giftAnimation.newPopularity;
                    })()} Puan
                </p>
                {giftAnimation.levelUp && (
                    <div className="bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-full font-black text-sm animate-pulse">
                        🎉 Seviye {giftAnimation.levelUp} Oldun!
                    </div>
                )}
            </div>
        </div>
    );
};

export const Friends: React.FC<FriendsProps> = ({ user, students, onUpdateUser, onUpdateOtherUser, onBack, onSelectFriend, setChatFriend }) => {
  const [friendIdentifier, setFriendIdentifier] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'settings'>('friends');
  const [giftRecipient, setGiftRecipient] = useState<User | null>(null);
  const [giftQuantities, setGiftQuantities] = useState<Record<string, number>>({});
  const [giftAnimation, setGiftAnimation] = useState<{ icon: string; name: string; popularityGain: number; levelUp: number | null; oldPopularity: number; newPopularity: number } | null>(null);

  const handleSendGift = (friend: User, gift: Gift, currency: 'coins' | 'diamonds', quantity: number) => {
    console.log("handleSendGift called", { friend, gift, currency, userDiamonds: user.diamonds, quantity });
    let userUpdates: Partial<User> = {};
    const totalCost = gift.cost * quantity;
    const totalGain = gift.popularity * quantity;

    if (currency === 'coins') {
        if ((user.coins || 0) < totalCost) {
            setError('Yetersiz coin!');
            return;
        }
        userUpdates.coins = (user.coins || 0) - totalCost;
    } else {
        console.log("Deducting diamonds", { currentDiamonds: user.diamonds, cost: totalCost });
        if ((user.diamonds || 0) < totalCost) {
            setError('Yetersiz elmas!');
            return;
        }
        userUpdates.diamonds = (user.diamonds || 0) - totalCost;
    }
    const currentSenderLevelProgress = user.levelProgress || 0;
    const gain = totalGain; 
    
    // Sender: Don't update popularity (kalp), but update levelProgress
    const newSenderLevelProgress = currentSenderLevelProgress + gain;
    const oldLevel = getPopularityLevel(currentSenderLevelProgress);
    const newLevel = getPopularityLevel(newSenderLevelProgress);
    
    userUpdates.levelProgress = newSenderLevelProgress;
    
    onUpdateUser({ 
        ...userUpdates
    });
    
    onUpdateOtherUser(friend.id, {
        // Friend gains popularity score (kalp), but NOT level progression
        popularity: (friend.popularity || 0) + gain,
        dailyPopularity: (friend.dailyPopularity || 0) + gain,
        weeklyPopularity: (friend.weeklyPopularity || 0) + gain
    });
    
    setGiftAnimation({ 
        icon: gift.icon, 
        name: `${gift.name} (x${quantity})`, 
        popularityGain: gain, 
        levelUp: newLevel > oldLevel ? newLevel : null,
        oldPopularity: currentSenderLevelProgress,
        newPopularity: newSenderLevelProgress
    });
    setTimeout(() => setGiftAnimation(null), 3000);
    
    setError(`${gift.name} (x${quantity}) gönderildi!`);
    setGiftRecipient(null);
    setGiftQuantities({});
  };

  const handleSendFriendRequest = (friendId: string) => {
    if (user.id === friendId) {
        setError('Kendinize istek gönderemezsiniz!');
        return;
    }
    if (user.friends?.includes(friendId)) {
        setError('Bu kullanıcı zaten arkadaş listenizde!');
        return;
    }
    if (user.friendRequests?.includes(friendId)) {
        setError('Zaten bir istek gönderdiniz!');
        return;
    }
    
    const targetUser = students.find(s => s.id === friendId);
    if (targetUser) {
        if (targetUser.isFriendRequestsEnabled === false) {
            setError('Bu kullanıcı arkadaş isteklerini kapattı!');
            return;
        }
        if (targetUser.blockedFriends?.includes(user.id)) {
            setError('Bu kullanıcı tarafından engellendiniz!');
            return;
        }
        const newRequests = [...(targetUser.friendRequests || []), user.id];
        onUpdateOtherUser(friendId, { friendRequests: [...(targetUser.friendRequests || []), user.id] });
        setError('İstek gönderildi!');
    } else {
        setError('Kullanıcı bulunamadı!');
    }
    setFriendIdentifier('');
  };

  const handleBotFriendRequest = () => {
    const potentialFriends = students.filter(s => 
        s.id !== user.id && 
        !user.friends?.includes(s.id) && 
        !user.friendRequests?.includes(s.id) &&
        !user.blockedFriends?.includes(s.id)
    );
    
    if (potentialFriends.length === 0) {
        setError('Arkadaş bulunamadı!');
        return;
    }
    
    const randomFriend = potentialFriends[Math.floor(Math.random() * potentialFriends.length)];
    handleSendFriendRequest(randomFriend.id);
    setError(`Arkadaş Botu ${randomFriend.name} kullanıcısına istek gönderdi!`);
  };

  const handleAcceptFriendRequest = (friendId: string) => {
    const newFriends = [...(user.friends || []), friendId];
    const newRequests = user.friendRequests?.filter(id => id !== friendId);
    onUpdateUser({ friends: newFriends, friendRequests: newRequests });
    
    const otherUser = students.find(s => s.id === friendId);
    if (otherUser) {
        const newOtherFriends = [...(otherUser.friends || []), user.id];
        onUpdateOtherUser(friendId, { friends: newOtherFriends });
    }
  };

  const handleRejectFriendRequest = (friendId: string) => {
    const newRequests = user.friendRequests?.filter(id => id !== friendId);
    onUpdateUser({ friendRequests: newRequests });
  };

  const toggleFriendRequestsEnabled = () => {
    onUpdateUser({ isFriendRequestsEnabled: !user.isFriendRequestsEnabled });
  };

  React.useEffect(() => {
    console.log("All students:", students);
  }, [students]);

  const handleSearch = (value: string) => {
      setFriendIdentifier(value);
      setError('');
      console.log("Searching for:", value);
      console.log("Total students:", students.length);
      if (!value.trim()) {
          setSearchResults([]);
          return;
      }
      const results = students.filter(s => 
          ((s.email || '').toLowerCase().includes(value.toLowerCase().trim()) || 
          (s.name || '').toLowerCase().includes(value.toLowerCase().trim()) || 
          (s.id || '').toLowerCase() === value.toLowerCase().trim()) &&
          s.id !== user.id
      );
      console.log("Search results:", results.length);
      setSearchResults(results);
  };

  const togglePin = (friendId: string) => {
    const isPinned = user.pinnedFriends?.includes(friendId);
    const newPinned = isPinned 
        ? user.pinnedFriends?.filter(id => id !== friendId) 
        : [...(user.pinnedFriends || []), friendId];
    onUpdateUser({ pinnedFriends: newPinned });
  };

  const blockFriend = (friendId: string) => {
    const newBlocked = [...(user.blockedFriends || []), friendId];
    const newFriends = user.friends?.filter(id => id !== friendId);
    const newPinned = user.pinnedFriends?.filter(id => id !== friendId);
    onUpdateUser({ blockedFriends: newBlocked, friends: newFriends, pinnedFriends: newPinned });
  };

  const unblockFriend = (friendId: string) => {
    const newBlocked = user.blockedFriends?.filter(id => id !== friendId);
    onUpdateUser({ blockedFriends: newBlocked });
  };

  const deleteFriend = (friendId: string) => {
    const newFriends = user.friends?.filter(id => id !== friendId);
    const newPinned = user.pinnedFriends?.filter(id => id !== friendId);
    onUpdateUser({ friends: newFriends, pinnedFriends: newPinned });
  };

  const sortedFriends = [...(user.friends || [])]
    .filter(id => !user.blockedFriends?.includes(id))
    .sort((a, b) => {
    const aPinned = user.pinnedFriends?.includes(a);
    const bPinned = user.pinnedFriends?.includes(b);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    
    const friendA = students.find(s => s.id === a);
    const friendB = students.find(s => s.id === b);
    return (friendB?.popularity || 0) - (friendA?.popularity || 0);
  });

  console.log("Friends component user popularity:", user.popularity);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <button onClick={onBack} className="mb-4 text-slate-400">Geri</button>
      
      {/* Current User Profile Section */}
      <div className="bg-white/10 p-4 rounded-xl mb-6 flex items-center gap-4">
          <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
          <div>
              <h2 className="text-lg font-black">{capitalize(user.name)}</h2>
              <p className="text-xs text-slate-400">ID: {user.id}</p>
              <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-full text-yellow-500 font-bold border border-yellow-500/20 text-[10px]">
                      {user.popularity || 0}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/20 text-indigo-400">
                      Seviye {getPopularityLevel(user.popularity || 0)}
                  </span>
              </div>
          </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black">Arkadaşlar</h1>
        <div className="flex gap-2">
            <button onClick={handleBotFriendRequest} className="bg-tg-blue/20 text-tg-blue px-4 py-2 rounded-lg font-bold text-sm">🤖 Bot ile Arkadaş Bul</button>
            <div className="flex bg-white/5 rounded-xl p-1">
                <button onClick={() => setActiveTab('friends')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'friends' ? 'bg-white/10' : ''}`}>Liste</button>
                <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'settings' ? 'bg-white/10' : ''}`}>Ayar</button>
            </div>
        </div>
      </div>
      
      {activeTab === 'friends' ? (
        <>
          <div className="flex flex-col gap-2 mb-4 relative">
            <input 
              type="text" 
              value={friendIdentifier} 
              onChange={(e) => handleSearch(e.target.value)} 
              placeholder="Arkadaşın adı, e-postası veya ID'si"
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-white"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            
            {searchResults.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-[#1E293B] border border-white/10 rounded-xl mt-1 z-10 max-h-60 overflow-y-auto">
                    {searchResults.map(friend => (
                        <li key={friend.id} className="p-3 hover:bg-white/10 cursor-pointer flex flex-col gap-1" onClick={() => handleSendFriendRequest(friend.id)}>
                            <div className="flex justify-between items-center">
                                <span className="font-bold">{capitalize(friend.name)}</span>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-400">ID: {friend.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Kullanıcı Adı: {friend.name}</span>
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">Seviye {getPopularityLevel(friend.popularity || 0)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
          </div>
          <ul className="space-y-2">
            {sortedFriends.map((friendId, index) => (
                <FriendItem 
                    key={friendId} 
                    friendId={friendId} 
                    user={user} 
                    students={students} 
                    onSelectFriend={onSelectFriend} 
                    setChatFriend={setChatFriend} 
                    togglePin={togglePin} 
                    blockFriend={blockFriend} 
                    deleteFriend={deleteFriend} 
                    setGiftRecipient={setGiftRecipient} 
                />
            ))}
          </ul>
          {giftAnimation && <GiftAnimationOverlay giftAnimation={giftAnimation} />}
          {giftRecipient && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
                <div className="bg-[#1E293B] p-6 rounded-2xl w-full max-w-sm">
                    <h2 className="text-xl font-black mb-4">Hediye Gönder: {capitalize(giftRecipient.name)}</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {GIFTS.map(gift => {
                            const quantity = giftQuantities[gift.name] || 1;
                            
                            return (
                                <div key={gift.name} className="bg-white/5 p-3 rounded-xl flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{gift.icon}</span>
                                            <div>
                                                <span className="font-bold text-xs block">{gift.name}</span>
                                                <span className="text-[9px] text-slate-400">{gift.popularity} Puan</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-black/40 rounded-lg">
                                            <button onClick={() => setGiftQuantities(prev => ({...prev, [gift.name]: Math.max(1, (prev[gift.name] || 1) - 1)}))} className="px-2 py-0.5 text-xs">-</button>
                                            <span className="px-1 text-xs font-bold">{quantity}</span>
                                            <button onClick={() => setGiftQuantities(prev => ({...prev, [gift.name]: Math.min(10, (prev[gift.name] || 1) + 1)}))} className="px-2 py-0.5 text-xs">+</button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1 mt-1">
                                        <button onClick={() => handleSendGift(giftRecipient, gift, 'coins', quantity)} className="bg-yellow-500/20 text-yellow-500 py-1.5 rounded-lg font-bold text-[10px] hover:animate-pulse">
                                            <span className="material-symbols-outlined text-[10px] mr-1 align-middle">monetization_on</span>
                                            {gift.cost * quantity} Coin
                                        </button>
                                        <button onClick={() => handleSendGift(giftRecipient, gift, 'diamonds', quantity)} className="bg-blue-500/20 text-blue-500 py-1.5 rounded-lg font-bold text-[10px] hover:animate-pulse">
                                            <span className="material-symbols-outlined text-[10px] mr-1 align-middle">diamond</span>
                                            {gift.popularity * quantity} Elmas
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button onClick={() => setGiftRecipient(null)} className="w-full mt-6 py-3 bg-white/10 rounded-xl font-bold">İptal</button>
                </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                <span className="font-bold">Davetleri Kabul Et</span>
                <button onClick={toggleFriendRequestsEnabled} className={`w-12 h-6 rounded-full ${user.isFriendRequestsEnabled ? 'bg-green-500' : 'bg-slate-600'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${user.isFriendRequestsEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
            </div>
            
            <h2 className="text-xl font-black">Arkadaş İstekleri</h2>
            <ul className="space-y-2">
                {user.friendRequests?.map((requestId, index) => {
                    const requester = students.find(s => s.id === requestId);
                    return (
                        <li key={index} className="bg-white/5 p-3 rounded-xl flex justify-between items-center">
                            <div>
                                <span className="font-bold">{requester ? capitalize(requester.name) : 'Bilinmeyen'}</span>
                                <span className="text-xs text-slate-400 block">ID: {requestId}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAcceptFriendRequest(requestId)} className="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg font-bold">Kabul Et</button>
                                <button onClick={() => handleRejectFriendRequest(requestId)} className="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-bold">Reddet</button>
                            </div>
                        </li>
                    );
                })}
            </ul>
            
            <h2 className="text-xl font-black mt-6">Engellenenler</h2>
            <ul className="space-y-2">
                {user.blockedFriends?.map((friendId, index) => {
                    const friend = students.find(s => s.id === friendId);
                    return (
                        <li key={index} className="bg-white/5 p-3 rounded-xl flex justify-between items-center">
                            <div>
                                <span className="font-bold">{friend ? capitalize(friend.name) : 'Bilinmeyen'}</span>
                                <span className="text-xs text-slate-400 block">ID: {friendId}</span>
                            </div>
                            <button onClick={() => unblockFriend(friendId)} className="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg font-bold">Engeli Kaldır</button>
                        </li>
                    );
                })}
            </ul>
        </div>
      )}
    </div>
  );
};
