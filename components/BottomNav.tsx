
import React from 'react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const navItemClass = (isActive: boolean) =>
    `flex flex-col items-center gap-1 p-2 transition-all ${
      isActive
        ? 'text-primary'
        : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-white'
    }`;

  return (
    <div className="fixed bottom-0 left-0 z-[60] w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-xl border-t border-border-light dark:border-border-dark pb-6 pt-2">
      <div className="flex justify-around items-center px-2">
        <button onClick={() => onChangeView(ViewState.DASHBOARD)} className={navItemClass(currentView === ViewState.DASHBOARD)}>
          <span className="material-symbols-outlined text-[26px]">home</span>
          <span className="text-[10px] font-bold">Panel</span>
        </button>

        <button onClick={() => onChangeView(ViewState.GROUPS)} className={navItemClass(currentView === ViewState.GROUPS)}>
          <span className="material-symbols-outlined text-[26px]">groups</span>
          <span className="text-[10px] font-bold">Gruplar</span>
        </button>

        <button onClick={() => onChangeView(ViewState.FRIENDS)} className={navItemClass(currentView === ViewState.FRIENDS)}>
          <span className="material-symbols-outlined text-[26px]">person_add</span>
          <span className="text-[10px] font-bold">Arkadaşlar</span>
        </button>

        <button onClick={() => onChangeView(ViewState.AI_COMPETITION)} className={navItemClass(currentView === ViewState.AI_COMPETITION)}>
          <span className="material-symbols-outlined text-[26px]">emoji_events</span>
          <span className="text-[10px] font-bold">Yarışma</span>
        </button>

        <button onClick={() => onChangeView(ViewState.AI_TEST)} className="relative -top-6 bg-gradient-to-tr from-primary to-indigo-600 text-white rounded-full p-4 shadow-xl shadow-primary/40 hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[28px]">quiz</span>
        </button>

        <button onClick={() => onChangeView(ViewState.CALENDAR)} className={navItemClass(currentView === ViewState.CALENDAR)}>
          <span className="material-symbols-outlined text-[26px]">calendar_month</span>
          <span className="text-[10px] font-bold">Takvim</span>
        </button>

        <button onClick={() => onChangeView(ViewState.PROFILE)} className={navItemClass(currentView === ViewState.PROFILE)}>
          <span className="material-symbols-outlined text-[26px]">person</span>
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </div>
    </div>
  );
};
