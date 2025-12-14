import React from 'react';
import { ViewState } from '../types';

interface OnboardingProps {
  onStart: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onStart }) => {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col justify-between overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Visual */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full px-6 mt-12">
        <div className="w-full max-w-[320px] aspect-[4/3] relative z-0 mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
          {/* Main Image */}
          <div
            className="relative w-full h-full bg-center bg-no-repeat bg-contain z-10 rounded-3xl shadow-2xl"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBnfgb3p-ytBYBlzWkdqiNg0GIvYj_NmBIFcoZQSmIKRhLrRk9LguJZ8PwJsb5ve1BjtaIuJ5K6hpL26Zj2JIl-7Nvp8P8NSFK_IRBDAgL6J6FP8xgeX6UEyOUrWTnTlofu95mwpc3B1MYkbmlrFdEJWcFkhbJT92KyaVfwoVdgJrk_bFPYMQdVXHKk5MB2QYQ4WtQCGuV4P6q3fqSozphLaytnEAyduinuCw_cSg6KB9eBWkJYARHaQZm_1qQ5do-82SY5Gj0a130")',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent rounded-3xl"></div>
          </div>

          {/* Floating Cards */}
          <div className="absolute -bottom-6 -left-4 bg-white dark:bg-[#1E2532] p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">schedule</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900 dark:text-white">Matematik</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">14:00 - 15:30</span>
            </div>
          </div>

          <div className="absolute top-10 -right-4 bg-white dark:bg-[#1E2532] p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900 dark:text-white">Tamamlandı</span>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="w-full overflow-x-auto no-scrollbar pb-4 pt-2">
          <div className="flex flex-row items-center justify-center gap-4 min-w-min mx-auto">
            {/* Fizik */}
            <div className="flex flex-col items-center gap-2 w-20 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-white text-2xl">science</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-[12px] font-medium leading-tight">Fizik</p>
            </div>
            {/* Matematik */}
            <div className="flex flex-col items-center gap-2 w-20 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark transition-transform scale-110">
                <span className="material-symbols-outlined text-white text-2xl">calculate</span>
              </div>
              <p className="text-gray-900 dark:text-white text-[12px] font-bold leading-tight">Matematik</p>
            </div>
            {/* Tarih */}
            <div className="flex flex-col items-center gap-2 w-20 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-white text-2xl">history_edu</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-[12px] font-medium leading-tight">Tarih</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="w-full bg-white dark:bg-[#151a23] rounded-t-[32px] p-8 pb-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] border-t border-gray-100 dark:border-gray-800 relative z-20 flex flex-col items-center">
        <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-6"></div>
        <div className="flex w-full flex-row items-center justify-center gap-2 mb-6">
          <div className="h-2 w-6 rounded-full bg-primary transition-all duration-300"></div>
          <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        </div>
        <h1 className="text-gray-900 dark:text-white tracking-tight text-[28px] md:text-[32px] font-bold leading-tight text-center mb-3">
          Zamanını Yönet,<br />Hedeflerine Ulaş
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-relaxed text-center mb-8 max-w-[320px]">
          Akıllı hatırlatıcılar ile ders kaçırmayın ve hedeflerinize emin adımlarla ilerleyin.
        </p>
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center rounded-xl h-14 px-6 bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all text-white text-lg font-bold leading-normal tracking-wide shadow-glow shadow-primary/40"
          >
            <span className="truncate">Hemen Başla</span>
            <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
