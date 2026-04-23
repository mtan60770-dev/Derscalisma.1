import React, { useState } from 'react';
import { User, ViewState } from '../types';
import { capitalize, getLevel } from '../constants';

interface PopularityRankingProps {
  user: User;
  students: User[];
  onBack: () => void;
  onSelectFriend: (friend: User) => void;
  onChangeView: (view: ViewState) => void;
  onUpdateOtherUser: (userId: string, data: Partial<User>) => void;
  triggerNotif: (message: string) => void;
}

export const PopularityRanking: React.FC<PopularityRankingProps> = ({ user, students, onBack, onSelectFriend, onChangeView, onUpdateOtherUser, triggerNotif }) => {
  const [tab, setTab] = useState<'daily' | 'weekly' | 'allTime'>('allTime');
  const [search, setSearch] = useState('');

  const sortedStudents = [...students].filter(s => s.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
    if (tab === 'daily') {
      return (b.dailyPopularity || 0) - (a.dailyPopularity || 0);
    } else if (tab === 'weekly') {
      return (b.weeklyPopularity || 0) - (a.weeklyPopularity || 0);
    } else {
      return (b.popularity || 0) - (a.popularity || 0);
    }
  });

  const topUser = sortedStudents[0];

  const handleSendFriendRequest = (friend: User) => {
    if (user.id === friend.id) {
        triggerNotif('Kendinize istek gönderemezsiniz!');
        return;
    }
    if (user.friends?.includes(friend.id)) {
        triggerNotif('Bu kullanıcı zaten arkadaş listenizde!');
        return;
    }
    if (user.friendRequests?.includes(friend.id)) {
        triggerNotif('Zaten bir istek gönderdiniz!');
        return;
    }
    
    if (friend.isFriendRequestsEnabled === false) {
        triggerNotif('Bu kullanıcı arkadaş isteklerini kapattı!');
        return;
    }
    if (friend.blockedFriends?.includes(user.id)) {
        triggerNotif('Bu kullanıcı tarafından engellendiniz!');
        return;
    }

    onUpdateOtherUser(friend.id, { friendRequests: [...(friend.friendRequests || []), user.id] });
    triggerNotif(`${capitalize(friend.name)} kullanıcısına istek gönderildi!`);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <button onClick={onBack} className="mb-4 text-slate-400">Geri</button>
      <button onClick={() => onChangeView(ViewState.DEVICE_POPULARITY)} className="mb-4 text-indigo-400 font-bold block">Cihaz Sıralaması</button>
      <h1 className="text-2xl font-black mb-6">Popülerlik Sıralaması</h1>
      
      <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Arkadaş ara..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-10 text-sm font-bold text-white outline-none"
          />
          <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500">search</span>
      </div>
      
      {topUser && tab === 'allTime' && search === '' && (
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl mb-6 border border-white/10 flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className="relative cursor-pointer" onClick={() => onSelectFriend(topUser)}>
                <img src={topUser.avatarUrl} alt={topUser.name} className="w-20 h-20 rounded-full border-4 border-yellow-500" />
                <span className="absolute -top-2 -right-2 text-3xl">👑</span>
            </div>
            <div className="flex-1 cursor-pointer" onClick={() => onSelectFriend(topUser)}>
                <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest">Zirvedeki İsim</p>
                <p className="text-xl font-black">{capitalize(topUser.name)}</p>
                <div className="flex items-center gap-1 text-yellow-500 font-bold mt-1">
                    <span className="material-symbols-outlined text-sm">star</span>
                    {tab === 'daily' ? (topUser.dailyPopularity || 0) : tab === 'weekly' ? (topUser.weeklyPopularity || 0) : (topUser.popularity || 0)}
                </div>
            </div>
            {topUser.id !== user.id && !user.friends?.includes(topUser.id) && (
              <button 
                onClick={() => handleSendFriendRequest(topUser)}
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <span className="material-symbols-outlined text-indigo-400">person_add</span>
              </button>
            )}
        </div>
      )}

      <div className="flex bg-white/5 rounded-xl p-1 mb-6">
        <button onClick={() => setTab('daily')} className={`flex-1 py-2 rounded-lg font-bold ${tab === 'daily' ? 'bg-white/10' : ''}`}>Günlük</button>
        <button onClick={() => setTab('weekly')} className={`flex-1 py-2 rounded-lg font-bold ${tab === 'weekly' ? 'bg-white/10' : ''}`}>Haftalık</button>
        <button onClick={() => setTab('allTime')} className={`flex-1 py-2 rounded-lg font-bold ${tab === 'allTime' ? 'bg-white/10' : ''}`}>Tüm Zamanlar</button>
      </div>

      <div className="space-y-3">
        {sortedStudents.map((student, index) => {
          const isTop3 = index < 3;
          const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-700'];
          return (
            <div key={student.id} className={`p-4 rounded-2xl flex items-center gap-4 ${isTop3 ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/5 border border-white/5'}`}>
              <div className={`text-2xl font-black w-10 flex items-center justify-center ${isTop3 ? rankColors[index] : 'text-slate-500'}`} onClick={() => onSelectFriend(student)}>
                {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
              </div>
              <div className="relative cursor-pointer" onClick={() => onSelectFriend(student)}>
                  <img src={student.avatarUrl} alt={student.name} className="w-12 h-12 rounded-full border-2 border-white/10" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0F172A]" />
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => onSelectFriend(student)}>
                <p className={`font-black text-sm ${isTop3 ? 'text-white' : 'text-slate-200'}`}>{capitalize(student.name)}</p>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] text-slate-400 font-bold bg-black/20 px-2 py-0.5 rounded-full inline-block">Seviye {getLevel(student.solvedQuestions?.total || 0)}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{student.friends?.length || 0} Arkadaş</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-yellow-400 font-black text-sm">
                    <span className="material-symbols-outlined text-xs">star</span>
                    {tab === 'daily' ? (student.dailyPopularity || 0) : tab === 'weekly' ? (student.weeklyPopularity || 0) : (student.popularity || 0)}
                </div>
                {student.id !== user.id && !user.friends?.includes(student.id) && (
                    <button 
                        onClick={() => handleSendFriendRequest(student)}
                        className="w-8 h-8 bg-indigo-500 hover:bg-indigo-400 rounded-full flex items-center justify-center transition-all shadow-lg"
                    >
                        <span className="material-symbols-outlined text-[10px] text-white">person_add</span>
                    </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
