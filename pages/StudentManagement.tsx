import React, { useState } from 'react';
import { User } from '../types';

interface StudentManagementProps {
  students: User[];
  currentUserId: string;
  onBack: () => void;
  onAddStudent: (user: User) => void;
  onSwitchStudent: (id: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ 
    students, currentUserId, onBack, onAddStudent, onSwitchStudent 
}) => {
  const [mode, setMode] = useState<'list' | 'add'>('list');
  
  // Form State
  const [name, setName] = useState('');
  const [schoolNum, setSchoolNum] = useState('');
  const [className, setClassName] = useState('');

  const handleSave = () => {
      if (!name || !schoolNum) return;
      const newUser: User = {
          id: `student-${Date.now()}`,
          name,
          schoolNumber: schoolNum,
          className: className,
          avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCixog0ga1gyp8KvF1wLdMDYPneLaJm_RyolUjv5Lbkl_r_f3vC7F2TK3yEbEH7KtSM4-7snlGLANiUvGt7U17ZOLKPa333uRdzc23HY2Fkb7S-EJwjCLdK16QmfubNUcreL5lqocir4QgMFqCMjiJC8si_fDeqeBP-M6o1Xb6kHrIitiLWbllOFh4ma4DC-w5yckvGBR6Pg79YQI9n8d-cMIA3MzE9PkiudcLe2OXa_rjFgAgGNBqGR2oK-sd9jz2Qsm5-xrTyrcc",
          progress: 0,
          totalTasks: 0,
          completedTasks: 0,
          email: '',
          coins: 100,
          diamonds: 0,
          streak: 1,
          lastBonusClaimTime: 0,
          frameId: 'frame_0',
          ownedFrames: ['frame_0'],
          goals: []
      };
      onAddStudent(newUser);
      setMode('list');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col">
       {/* Header */}
       <div className="bg-primary p-6 pb-8 rounded-b-[2rem] shadow-xl relative z-10">
           <div className="flex items-center justify-between mb-4">
               <button onClick={onBack} className="text-white bg-white/20 p-2 rounded-full backdrop-blur-sm">
                   <span className="material-symbols-outlined">arrow_back</span>
               </button>
               <h1 className="text-white font-bold text-lg">Öğrenci İşleri</h1>
               <div className="w-10"></div>
           </div>
           <div className="text-center">
               <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-2 backdrop-blur-md border border-white/30">
                   <span className="material-symbols-outlined text-white text-3xl">school</span>
               </div>
               <p className="text-blue-100 text-sm">e-Okul Yönetim Sistemi</p>
           </div>
       </div>

       <div className="flex-1 p-6 -mt-4">
           {mode === 'list' ? (
               <div className="flex flex-col gap-4">
                   {/* Student List */}
                   {students.map(student => (
                       <div 
                        key={student.id}
                        onClick={() => onSwitchStudent(student.id)}
                        className={`bg-white dark:bg-[#1E293B] p-4 rounded-xl shadow-sm border-2 flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98] ${student.id === currentUserId ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                       >
                           <img src={student.avatarUrl} className="w-12 h-12 rounded-full border border-gray-200" alt={student.name} />
                           <div className="flex-1">
                               <h3 className="font-bold text-slate-900 dark:text-white">{student.name}</h3>
                               <p className="text-xs text-slate-500">{student.schoolNumber} - {student.className}</p>
                           </div>
                           {student.id === currentUserId && (
                               <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">Aktif</span>
                           )}
                       </div>
                   ))}

                   {/* Add Button */}
                   <button 
                    onClick={() => setMode('add')}
                    className="mt-4 w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                   >
                       <span className="material-symbols-outlined">add_circle</span>
                       <span className="font-bold">Yeni Öğrenci Yükle</span>
                   </button>
               </div>
           ) : (
               <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                   <h2 className="font-bold text-slate-900 dark:text-white mb-6">Öğrenci Kayıt Formu</h2>
                   
                   <div className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Öğrenci Adı Soyadı</label>
                           <input 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary"
                            placeholder="Ali Veli"
                           />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Okul No</label>
                               <input 
                                value={schoolNum}
                                onChange={e => setSchoolNum(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary"
                                placeholder="123"
                               />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sınıf / Şube</label>
                               <input 
                                value={className}
                                onChange={e => setClassName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary"
                                placeholder="9-B"
                               />
                           </div>
                       </div>
                   </div>

                   <div className="flex gap-3 mt-8">
                       <button onClick={() => setMode('list')} className="flex-1 py-3 text-slate-500 font-bold">İptal</button>
                       <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30">Kaydet</button>
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};