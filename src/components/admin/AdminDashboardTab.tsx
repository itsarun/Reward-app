import React from 'react';
import {
  Users,
  CheckSquare,
  PlayCircle,
  Disc3,
  Wallet,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Settings,
} from 'lucide-react';
import { AdminTab } from './AdminPanel';
import { formatBDT } from '../../lib/format';
import { WithdrawalRequest, UserProfile } from '../../types';

interface AdminDashboardTabProps {
  onNavigateTab: (tab: AdminTab) => void;
  users: UserProfile[];
  withdrawals: WithdrawalRequest[];
  tasksCount: number;
  videoAdsCount: number;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  onNavigateTab,
  users,
  withdrawals,
  tasksCount,
  videoAdsCount,
}) => {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;

  const totalCompletedTasks = users.reduce((acc, u) => acc + (u.completedTasksCount || 0), 0);
  const totalVideoViews = users.reduce((acc, u) => acc + (u.videoViewsToday || 0), 0);
  const totalSpins = users.reduce((acc, u) => acc + (u.spinsToday || 0), 0);
  const totalUserBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const pendingAmount = pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0);

  const approvedWithdrawals = withdrawals.filter((w) => w.status === 'approved');
  const totalPaidOut = approvedWithdrawals.reduce((acc, w) => acc + w.amount, 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Alert banner if pending withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <Clock className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>{pendingWithdrawals.length} withdrawal requests</strong> pending review ({formatBDT(pendingAmount)})
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('withdrawals')}
            className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors"
          >
            Review Now
          </button>
        </div>
      )}

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Users */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Total Members</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{totalUsers}</div>
          <span className="text-[10px] text-emerald-400 font-semibold">{activeUsers} Active</span>
        </div>

        {/* Total Paid Out */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Total Paid Out</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatBDT(totalPaidOut)}
          </div>
          <span className="text-[10px] text-slate-400">Approved withdrawals</span>
        </div>

        {/* Pending Withdrawals */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Pending Payouts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {formatBDT(pendingAmount)}
          </div>
          <span className="text-[10px] text-slate-400">{pendingWithdrawals.length} awaiting approval</span>
        </div>

        {/* Total Balance in Circulation */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Total User Balances</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {formatBDT(totalUserBalance)}
          </div>
          <span className="text-[10px] text-slate-400">Held in wallets</span>
        </div>
      </div>

      {/* ACTIVITY METRICS */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-2xl text-center">
          <CheckSquare className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="text-xs text-slate-400 block">Tasks Done</span>
          <span className="text-base font-black font-mono text-white">{totalCompletedTasks}</span>
        </div>
        <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-2xl text-center">
          <PlayCircle className="w-4 h-4 text-teal-400 mx-auto mb-1" />
          <span className="text-xs text-slate-400 block">Video Views</span>
          <span className="text-base font-black font-mono text-white">{totalVideoViews}</span>
        </div>
        <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-2xl text-center">
          <Disc3 className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <span className="text-xs text-slate-400 block">Wheel Spins</span>
          <span className="text-base font-black font-mono text-white">{totalSpins}</span>
        </div>
      </div>

      {/* QUICK ADMIN ACTIONS */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Quick Management Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onNavigateTab('tasks')}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left flex flex-col justify-between transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400 mb-2" />
            <div>
              <span className="text-xs font-bold text-white block">Manage Tasks</span>
              <span className="text-[10px] text-slate-400">{tasksCount} Active</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('ads')}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left flex flex-col justify-between transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 mb-2" />
            <div>
              <span className="text-xs font-bold text-white block">Adsterra & Ads</span>
              <span className="text-[10px] text-slate-400">10s Gate script</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('video_ads')}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left flex flex-col justify-between transition-colors"
          >
            <PlayCircle className="w-4 h-4 text-teal-400 mb-2" />
            <div>
              <span className="text-xs font-bold text-white block">Video Campaigns</span>
              <span className="text-[10px] text-slate-400">{videoAdsCount} Streams</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left flex flex-col justify-between transition-colors"
          >
            <Settings className="w-4 h-4 text-cyan-400 mb-2" />
            <div>
              <span className="text-xs font-bold text-white block">Platform Settings</span>
              <span className="text-[10px] text-slate-400">Fees, limits, BDT</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
