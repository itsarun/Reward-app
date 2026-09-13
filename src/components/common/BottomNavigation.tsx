import React from 'react';
import { Home, CheckSquare, PlayCircle, Disc3, User } from 'lucide-react';

export type UserTab = 'home' | 'tasks' | 'ads' | 'spin' | 'profile' | 'withdraw' | 'referral' | 'history' | 'support' | 'notifications';

interface BottomNavigationProps {
  currentTab: UserTab;
  onChangeTab: (tab: UserTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentTab, onChangeTab }) => {
  const tabs: { id: UserTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'ads', label: 'Watch Ads', icon: PlayCircle },
    { id: 'spin', label: 'Spin', icon: Disc3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-[#0d1117]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative min-w-[56px] ${
              isActive
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <div className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20 -z-10 animate-fade-in" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              {tab.id === 'spin' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              )}
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 font-medium whitespace-nowrap ${
                isActive ? 'font-bold text-emerald-400' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
