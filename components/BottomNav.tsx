import React from 'react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const navItemClass = (isActive: boolean) =>
    `flex flex-col items-center gap-1 p-2 transition-colors ${
      isActive
        ? 'text-primary'
        : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-white'
    }`;

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-lg border-t border-border-light dark:border-border-dark pb-6 pt-2">
      <div className="flex justify-around items-center px-2">
        {/* Dashboard */}
        <button
          onClick={() => onChangeView(ViewState.DASHBOARD)}
          className={navItemClass(currentView === ViewState.DASHBOARD)}
        >
          <span className={`material-symbols-outlined text-[26px] ${currentView === ViewState.DASHBOARD ? 'font-variation-settings-fill' : ''}`}>
            today
          </span>
          <span className={`text-[10px] ${currentView === ViewState.DASHBOARD ? 'font-bold' : 'font-medium'}`}>
            Bugün
          </span>
        </button>

        {/* AI Video (Quick Access) */}
        <button
          onClick={() => onChangeView(ViewState.AI_VIDEO)}
          className={navItemClass(currentView === ViewState.AI_VIDEO)}
        >
          <span className="material-symbols-outlined text-[26px]">smart_display</span>
          <span className="text-[10px] font-medium">Video</span>
        </button>

        {/* AI TEST (Center) */}
        <button
          onClick={() => onChangeView(ViewState.AI_TEST)}
          className="relative -top-6 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-lg shadow-purple-500/40 hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined text-[28px]">quiz</span>
        </button>

        {/* Calendar */}
        <button
          onClick={() => onChangeView(ViewState.CALENDAR)}
          className={navItemClass(currentView === ViewState.CALENDAR)}
        >
          <span className="material-symbols-outlined text-[26px]">calendar_month</span>
          <span className="text-[10px] font-medium">Takvim</span>
        </button>

        {/* Profile */}
        <button 
          onClick={() => onChangeView(ViewState.PROFILE)}
          className={navItemClass(currentView === ViewState.PROFILE)}
        >
          <span className="material-symbols-outlined text-[26px]">person</span>
          <span className="text-[10px] font-medium">Profil</span>
        </button>
      </div>
    </div>
  );
};
