import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Wallet,
  Gift,
  Disc3,
  PlayCircle,
  ShieldCheck,
  History,
  Settings,
  ArrowLeft,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserProfile,
  TaskItem,
  VideoAdItem,
  SpinSegment,
  WithdrawalRequest,
  TransactionRecord,
  PlatformSettings,
  AdPlacementConfig,
  WithdrawalStatus,
} from '../../types';
import {
  subscribeToAllUsers,
  subscribeToTasks,
  subscribeToVideoAds,
  subscribeToSpinSegments,
  subscribeToAllWithdrawals,
  subscribeToAllTransactions,
  subscribeToPlatformSettings,
  subscribeToAdConfig,
  saveTask,
  deleteTask,
  saveVideoAd,
  deleteVideoAd,
  saveSpinSegments,
  savePlatformSettings,
  saveAdConfig,
  reviewWithdrawal,
  adjustUserBalance,
  updateUserStatus,
  seedInitialData,
} from '../../lib/db';

import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminTasksTab } from './AdminTasksTab';
import { AdminWithdrawalsTab } from './AdminWithdrawalsTab';
import { AdminReferralsTab } from './AdminReferralsTab';
import { AdminSpinTab } from './AdminSpinTab';
import { AdminVideoAdsTab } from './AdminVideoAdsTab';
import { AdminAdsTab } from './AdminAdsTab';
import { AdminTransactionsTab } from './AdminTransactionsTab';
import { AdminSettingsTab } from './AdminSettingsTab';

export type AdminTab =
  | 'dashboard'
  | 'users'
  | 'tasks'
  | 'withdrawals'
  | 'referrals'
  | 'spin'
  | 'video_ads'
  | 'ads'
  | 'transactions'
  | 'settings';

interface AdminPanelProps {
  onReturnToUserApp: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onReturnToUserApp }) => {
  const { logoutAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Firestore real-time state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [videoAds, setVideoAds] = useState<VideoAdItem[]>([]);
  const [spinSegments, setSpinSegments] = useState<SpinSegment[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    appName: 'BDT Rewards Pro',
    currencySymbol: '৳',
    minimumWithdrawal: 50,
    maximumWithdrawal: 5000,
    withdrawalFeePercentage: 2,
    welcomeBonus: 5,
    referralCommission: 10,
    defaultDailySpinLimit: 10,
    announcement: 'Welcome to BDT Rewards! Instant payouts via bKash, Nagad & USDT.',
    maintenanceMode: false,
  });
  const [adsConfig, setAdsConfig] = useState<AdPlacementConfig>({
    globalAdEnabled: true,
    taskAdEnabled: true,
    videoAdEnabled: true,
  });

  // Real-time subscriptions
  useEffect(() => {
    const unsubUsers = subscribeToAllUsers((data) => setUsers(data));
    const unsubTasks = subscribeToTasks((data) => setTasks(data));
    const unsubVideos = subscribeToVideoAds((data) => setVideoAds(data));
    const unsubSegments = subscribeToSpinSegments((data) => setSpinSegments(data));
    const unsubWithdrawals = subscribeToAllWithdrawals((data) => setWithdrawals(data));
    const unsubTx = subscribeToAllTransactions((data) => setTransactions(data));
    const unsubSettings = subscribeToPlatformSettings((data) => setSettings(data));
    const unsubAds = subscribeToAdConfig((data) => setAdsConfig(data));

    return () => {
      unsubUsers();
      unsubTasks();
      unsubVideos();
      unsubSegments();
      unsubWithdrawals();
      unsubTx();
      unsubSettings();
      unsubAds();
    };
  }, []);

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'withdrawals', label: 'Withdrawals', icon: Wallet },
    { id: 'ads', label: 'Advertisements', icon: ShieldCheck },
    { id: 'video_ads', label: 'Video Ads', icon: PlayCircle },
    { id: 'spin', label: 'Lucky Spin', icon: Disc3 },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#0d121b]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            {isMobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white">Admin Control</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  PROTECTED
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Authenticated Session</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReturnToUserApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">User App</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main layout with sidebar + content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-[#0a0f16] border-r border-slate-800/80 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.id === 'withdrawals' && pendingWithdrawalsCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {pendingWithdrawalsCount}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile Horizontal Pill Navigation */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto p-2 bg-[#090e15] border-b border-slate-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.id === 'withdrawals' && pendingWithdrawalsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <AdminDashboardTab
              onNavigateTab={(tab) => setCurrentTab(tab)}
              users={users}
              withdrawals={withdrawals}
              tasksCount={tasks.length}
              videoAdsCount={videoAds.length}
            />
          )}

          {currentTab === 'users' && (
            <AdminUsersTab
              users={users}
              onAdjustBalance={adjustUserBalance}
              onUpdateStatus={updateUserStatus}
            />
          )}

          {currentTab === 'tasks' && (
            <AdminTasksTab
              tasks={tasks}
              onSaveTask={saveTask}
              onDeleteTask={deleteTask}
            />
          )}

          {currentTab === 'withdrawals' && (
            <AdminWithdrawalsTab
              withdrawals={withdrawals}
              onReviewWithdrawal={reviewWithdrawal}
            />
          )}

          {currentTab === 'ads' && (
            <AdminAdsTab
              adsConfig={adsConfig}
              onSaveAdsConfig={saveAdConfig}
            />
          )}

          {currentTab === 'video_ads' && (
            <AdminVideoAdsTab
              videoAds={videoAds}
              onSaveVideoAd={saveVideoAd}
              onDeleteVideoAd={deleteVideoAd}
            />
          )}

          {currentTab === 'spin' && (
            <AdminSpinTab
              segments={spinSegments}
              settings={settings}
              onSaveSegments={saveSpinSegments}
              onSaveSettings={savePlatformSettings}
            />
          )}

          {currentTab === 'referrals' && (
            <AdminReferralsTab
              users={users}
              settings={settings}
              onSaveSettings={savePlatformSettings}
            />
          )}

          {currentTab === 'transactions' && (
            <AdminTransactionsTab transactions={transactions} />
          )}

          {currentTab === 'settings' && (
            <AdminSettingsTab
              settings={settings}
              onSaveSettings={savePlatformSettings}
              onResetDemoData={seedInitialData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
