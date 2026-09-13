import React from 'react';
import { Bell, ShieldCheck, Wallet, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatBDT } from '../../lib/format';

interface TopHeaderProps {
  onOpenNotifications: () => void;
  onOpenWithdraw: () => void;
  onOpenAdmin: () => void;
  unreadNotifsCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenNotifications,
  onOpenWithdraw,
  onOpenAdmin,
  unreadNotifsCount,
}) => {
  const { userProfile } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0d1117]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Brand & User info */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-emerald-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center font-black text-emerald-400 text-sm">
            ৳
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-white tracking-tight">BDT Rewards</span>
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
            {userProfile ? `@${userProfile.username}` : 'Guest Member'}
          </p>
        </div>
      </div>

      {/* Right Action Icons: Balance Pill & Icons */}
      <div className="flex items-center gap-2">
        {/* Balance chip button */}
        <button
          onClick={onOpenWithdraw}
          className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 border border-emerald-500/40 text-emerald-400 px-2.5 py-1.5 rounded-full transition-all duration-150 shadow-sm"
          title="Click to Withdraw"
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold font-mono tracking-tight">
            {formatBDT(userProfile?.balance ?? 0)}
          </span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 flex items-center justify-center border border-slate-700/60 text-slate-300 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center ring-2 ring-[#0d1117]">
              {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
            </span>
          )}
        </button>

        {/* Admin Switch Icon */}
        <button
          onClick={onOpenAdmin}
          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-amber-500/20 active:scale-95 flex items-center justify-center border border-slate-700/60 hover:border-amber-500/40 text-slate-400 hover:text-amber-400 transition-colors"
          title="Admin Panel"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
