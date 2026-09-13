import React from 'react';
import {
  Wallet,
  TrendingUp,
  Award,
  Users,
  Clock,
  ArrowUpRight,
  PlayCircle,
  Disc3,
  CheckSquare,
  Gift,
  ChevronRight,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserTab } from '../common/BottomNavigation';
import { formatBDT, formatBDTWithSign, formatRelativeTime } from '../../lib/format';
import { TransactionRecord, PlatformSettings, AdPlacementConfig } from '../../types';
import { DynamicAdBanner } from '../common/DynamicAdBanner';

interface DashboardViewProps {
  onNavigate: (tab: UserTab) => void;
  recentTransactions: TransactionRecord[];
  pendingWithdrawalsTotal: number;
  settings: PlatformSettings;
  adsConfig: AdPlacementConfig;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  recentTransactions,
  pendingWithdrawalsTotal,
  settings,
  adsConfig,
}) => {
  const { userProfile } = useAuth();

  return (
    <div className="p-4 space-y-4 pb-20 animate-fade-in">
      {/* Announcement marquee/banner if active */}
      {settings.announcement && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-slate-900 border border-emerald-500/30 rounded-2xl p-3 flex items-start gap-2.5 shadow-sm">
          <Megaphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-200 leading-snug">{settings.announcement}</p>
        </div>
      )}

      {/* Main Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/60 via-slate-900 to-[#0c131d] border border-emerald-500/30 p-5 shadow-xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
            Available Balance
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Realtime BDT
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <h1 className="text-3xl font-black font-mono tracking-tight text-white">
            {formatBDT(userProfile?.balance ?? 0)}
          </h1>
          <span className="text-xs font-semibold text-emerald-400">BDT</span>
        </div>

        {/* Pending withdrawal notice if any */}
        {pendingWithdrawalsTotal > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Withdrawal: {formatBDT(pendingWithdrawalsTotal)}</span>
          </div>
        )}

        {/* Quick action inside card */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={() => onNavigate('withdraw')}
            className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
          <button
            onClick={() => onNavigate('referral')}
            className="flex-1 py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Refer & Earn</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Grid Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Earnings */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Total Earnings</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white">
            {formatBDT(userProfile?.totalEarnings ?? 0)}
          </span>
          <span className="text-[10px] text-slate-300 mt-0.5">Lifetime earned</span>
        </div>

        {/* Today's Earnings */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Today's Earnings</span>
            <Award className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <span className="text-lg font-bold font-mono text-teal-400">
            {formatBDT(userProfile?.todayEarnings ?? 0)}
          </span>
          <span className="text-[10px] text-slate-300 mt-0.5">Reset daily 00:00</span>
        </div>

        {/* Referral Earnings */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Referral Bonus</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white">
            {formatBDT(userProfile?.referralEarnings ?? 0)}
          </span>
          <span className="text-[10px] text-slate-300 mt-0.5">
            {settings.referralCommission}% Commission
          </span>
        </div>

        {/* Completed Tasks */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Tasks Done</span>
            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white">
            {userProfile?.completedTasksCount ?? 0}
          </span>
          <span className="text-[10px] text-slate-300 mt-0.5">Validated tasks</span>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Actions</h2>
          <span className="text-[10px] text-slate-300">Fast Navigation</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Action 1: Tasks */}
          <button
            onClick={() => onNavigate('tasks')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors mb-1.5">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200">Tasks</span>
            <span className="text-[9px] text-emerald-400 font-medium">10s Gate</span>
          </button>

          {/* Action 2: Watch Ads */}
          <button
            onClick={() => onNavigate('ads')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors mb-1.5">
              <PlayCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200">Watch Ads</span>
            <span className="text-[9px] text-teal-400 font-medium">Video</span>
          </button>

          {/* Action 3: Spin */}
          <button
            onClick={() => onNavigate('spin')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors mb-1.5">
              <Disc3 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200">Spin</span>
            <span className="text-[9px] text-amber-400 font-medium">Lucky</span>
          </button>

          {/* Action 4: Refer */}
          <button
            onClick={() => onNavigate('referral')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors mb-1.5">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-200">Refer</span>
            <span className="text-[9px] text-cyan-400 font-medium">Earn {settings.referralCommission}%</span>
          </button>
        </div>
      </div>

      {/* Dynamic Global Ad Banner */}
      <DynamicAdBanner placement="global" adsConfig={adsConfig} />

      {/* RECENT ACTIVITY / TRANSACTIONS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recent Activity</h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
            <p className="text-xs text-slate-300">No activity yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Complete your first task to start earning BDT!</p>
            <button
              onClick={() => onNavigate('tasks')}
              className="mt-3 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold"
            >
              Start Tasks Now
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      tx.amount >= 0
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {tx.amount >= 0 ? '+' : '-'}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate max-w-[170px]">
                      {tx.description}
                    </h4>
                    <p className="text-[10px] text-slate-300 font-mono">
                      {formatRelativeTime(tx.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold font-mono ${
                      tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatBDTWithSign(tx.amount)}
                  </span>
                  <p className="text-[9px] text-slate-300 uppercase font-semibold">
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
