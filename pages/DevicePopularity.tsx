import React from 'react';
import { User } from '../types';

interface DevicePopularityProps {
  students: User[];
  onBack: () => void;
}

export const DevicePopularity: React.FC<DevicePopularityProps> = ({ students, onBack }) => {
  const deviceCounts: Record<string, number> = {};
  students.forEach(student => {
    student.loginSessions?.forEach(session => {
      deviceCounts[session.deviceName] = (deviceCounts[session.deviceName] || 0) + 1;
    });
  });

  const sortedDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <button onClick={onBack} className="mb-4 text-slate-400">Geri</button>
      <h1 className="text-2xl font-black mb-6">Cihaz Popülerlik Sıralaması</h1>
      
      <div className="space-y-3">
        {sortedDevices.map(([deviceName, count], index) => (
          <div key={deviceName} className="p-4 rounded-xl bg-white/5 flex items-center gap-4">
            <span className="text-2xl font-black w-8 text-slate-500">{index + 1}</span>
            <div className="flex-1">
              <p className="font-bold text-white">{deviceName}</p>
            </div>
            <div className="font-bold text-indigo-400">
              {count} Kullanıcı
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
