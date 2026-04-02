import React, { useState } from 'react';
import { User } from '../types';
import { getRank, getLevel, capitalize } from '../constants';

interface FriendsProps {
  user: User;
  students: User[];
  onUpdateUser: (data: Partial<User>) => void;
  onUpdateOtherUser: (userId: string, data: Partial<User>) => void;
  onBack: () => void;
  onSelectFriend: (friend: User) => void;
  setChatFriend: (friend: User | null) => void;
}

export const Friends: React.FC<FriendsProps> = ({ user, students, onUpdateUser, onUpdateOtherUser, onBack, onSelectFriend, setChatFriend }) => {
  const [friendIdentifier, setFriendIdentifier] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'settings'>('friends');

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
        const newRequests = [...(targetUser.friendRequests || []), user.id];
        onUpdateOtherUser(friendId, { friendRequests: newRequests });
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

  const handleSearch = (value: string) => {
      setFriendIdentifier(value);
      setError('');
      if (!value.trim()) {
          setSearchResults([]);
          return;
      }
      const results = students.filter(s => 
          (s.email?.toLowerCase().includes(value.toLowerCase()) || 
          s.name?.toLowerCase().includes(value.toLowerCase()) || 
          s.id.toLowerCase().includes(value.toLowerCase())) &&
          s.id !== user.id
      );
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

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <button onClick={onBack} className="mb-4 text-slate-400">Geri</button>
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
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">Seviye {getLevel(friend.solvedQuestions?.total || 0)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
          </div>
          <ul className="space-y-2">
            {sortedFriends.map((friendId, index) => {
                const friend = students.find(s => s.id === friendId);
                if (!friend) return <li key={index} className="bg-white/5 p-3 rounded-xl">{friendId}</li>;
                const rank = getRank(friend.solvedQuestions?.total || 0);
                const isPinned = user.pinnedFriends?.includes(friendId);
                return (
                    <li key={index} className="bg-white/5 p-3 rounded-xl flex justify-between items-center">
                        <div className="cursor-pointer hover:bg-white/10 flex-1 flex items-center gap-3" onClick={() => onSelectFriend(friend)}>
                            <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <span className="font-bold">{capitalize(friend.name)}</span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <span>ID: {friend.id}</span>
                                    <span className="flex items-center gap-0.5 text-yellow-500 font-bold">
                                        <span className="material-symbols-outlined text-[10px]">star</span>
                                        {friend.popularity || 0}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${rank.border} ${rank.bg} ${rank.color} inline-block`}>{rank.name}</div>
                                    <div className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/20 text-indigo-400">Seviye {getLevel(friend.solvedQuestions?.total || 0)}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
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
            })}
          </ul>
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
