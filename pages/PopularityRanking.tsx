import React, { useState } from 'react';
import { User, ViewState } from '../types';
import { capitalize, getLevel } from '../constants';

interface PopularityRankingProps {
  students: User[];
  onBack: () => void;
}

export const PopularityRanking: React.FC<PopularityRankingProps> = ({ students, onBack }) => {
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');

  const sortedStudents = [...students].sort((a, b) => {
    if (tab === 'daily') {
      return (b.dailyPopularity || 0) - (a.dailyPopularity || 0);
    } else {
      return (b.weeklyPopularity || 0) - (a.weeklyPopularity || 0);
    }
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <button onClick={onBack} className="mb-4 text-slate-400">Geri</button>
      <h1 className="text-2xl font-black mb-6">Popülerlik Sıralaması</h1>
      
      <div className="flex bg-white/5 rounded-xl p-1 mb-6">
        <button onClick={() => setTab('daily')} className={`flex-1 py-2 rounded-lg font-bold ${tab === 'daily' ? 'bg-white/10' : ''}`}>Günlük</button>
        <button onClick={() => setTab('weekly')} className={`flex-1 py-2 rounded-lg font-bold ${tab === 'weekly' ? 'bg-white/10' : ''}`}>Haftalık</button>
      </div>

      <div className="space-y-3">
        {sortedStudents.map((student, index) => (
          <div key={student.id} className="bg-white/5 p-4 rounded-xl flex items-center gap-4">
            <span className="text-xl font-black text-slate-500 w-8">{index + 1}</span>
            <img src={student.avatarUrl} alt={student.name} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <p className="font-bold">{capitalize(student.name)}</p>
              <p className="text-xs text-slate-400">Seviye {getLevel(student.solvedQuestions?.total || 0)}</p>
            </div>
            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                <span className="material-symbols-outlined text-sm">star</span>
                {tab === 'daily' ? (student.dailyPopularity || 0) : (student.weeklyPopularity || 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
