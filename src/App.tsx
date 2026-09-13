import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AndroidStatusBar } from './components/common/AndroidStatusBar';
import { TopHeader } from './components/common/TopHeader';
import { BottomNavigation, UserTab } from './components/common/BottomNavigation';
import { AuthModal } from './components/user/AuthModal';
import { DashboardView } from './components/user/DashboardView';
import { TasksView } from './components/user/TasksView';
import { VideoAdsView } from './components/user/VideoAdsView';
import { SpinWheelView } from './components/user/SpinWheelView';
import { WithdrawView } from './components/user/WithdrawView';
import { ReferralView } from './components/user/ReferralView';
import { HistoryView } from './components/user/HistoryView';
import { ProfileView } from './components/user/ProfileView';
import { NotificationsView } from './components/user/NotificationsView';
import { SupportView } from './components/user/SupportView';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

import {
  TaskItem,
  VideoAdItem,
  SpinSegment,
  WithdrawalRequest,
  TransactionRecord,
  NotificationItem,
  PlatformSettings,
  AdPlacementConfig,
  WithdrawalMethod,
} from './types';

import {
  subscribeToTasks,
  subscribeToVideoAds,
  subscribeToSpinSegments,
  subscribeToPlatformSettings,
  subscribeToAdConfig,
  subscribeToUserTransactions,
  subscribeToUserWithdrawals,
  subscribeToUserNotifications,
  claimTaskReward,
  claimVideoReward,
  executeSpinTransaction,
  submitWithdrawalRequest,
  markNotificationsAsRead,
  seedInitialData,
} from './lib/db';

import { ShieldAlert, ArrowLeft } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { userProfile, isAdminAuthenticated, loading: authLoading } = useAuth();

  // App mode: 'user' or 'admin'
  const [appMode, setAppMode] = useState<'user' | 'admin'>('user');
  const [currentTab, setCurrentTab] = useState<UserTab>('home');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Real-time Firestore Collections
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [videoAds, setVideoAds] = useState<VideoAdItem[]>([]);
  const [spinSegments, setSpinSegments] = useState<SpinSegment[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    appName: 'BDT Rewards Pro',
    currencySymbol: '৳',
    minimumWithdrawal: 50,
    maximumWithdrawal: 5000,
    withdrawalFeePercentage: 2,
    welcomeBonus: 5,
    referralCommission: 10,
    defaultDailySpinLimit: 10,
    announcement: 'Welcome to BDT Rewards! Daily task earnings with 10s Ad Gate & instant payouts.',
    maintenanceMode: false,
  });
  const [adsConfig, setAdsConfig] = useState<AdPlacementConfig>({
    globalAdEnabled: true,
    taskAdEnabled: true,
    videoAdEnabled: true,
    taskAdCode: '',
    globalAdCode: '',
    videoAdCode: '',
  });

  // User-specific subscriptions
  const [userTransactions, setUserTransactions] = useState<TransactionRecord[]>([]);
  const [userWithdrawals, setUserWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [userNotifications, setUserNotifications] = useState<NotificationItem[]>([]);

  // Check URL query on mount for direct admin access (?admin=1 or /admin)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1' || window.location.pathname.startsWith('/admin')) {
      if (isAdminAuthenticated) {
        setAppMode('admin');
      } else {
        setIsAdminLoginOpen(true);
      }
    }
  }, [isAdminAuthenticated]);

  // Seed initial tasks/ads if database is completely empty
  useEffect(() => {
    seedInitialData().catch(() => {});
  }, []);

  // Global listeners
  useEffect(() => {
    const unsubTasks = subscribeToTasks((data) => setTasks(data));
    const unsubVideos = subscribeToVideoAds((data) => setVideoAds(data));
    const unsubSegments = subscribeToSpinSegments((data) => setSpinSegments(data));
    const unsubSettings = subscribeToPlatformSettings((data) => setSettings(data));
    const unsubAds = subscribeToAdConfig((data) => setAdsConfig(data));

    return () => {
      unsubTasks();
      unsubVideos();
      unsubSegments();
      unsubSettings();
      unsubAds();
    };
  }, []);

  // User-specific listeners
  useEffect(() => {
    if (!userProfile?.uid) {
      setUserTransactions([]);
      setUserWithdrawals([]);
      setUserNotifications([]);
      return;
    }

    const unsubTx = subscribeToUserTransactions(userProfile.uid, (data) =>
      setUserTransactions(data)
    );
    const unsubWdr = subscribeToUserWithdrawals(userProfile.uid, (data) =>
      setUserWithdrawals(data)
    );
    const unsubNotif = subscribeToUserNotifications(userProfile.uid, (data) =>
      setUserNotifications(data)
    );

    return () => {
      unsubTx();
      unsubWdr();
      unsubNotif();
    };
  }, [userProfile?.uid]);

  // Actions
  const handleClaimTask = async (taskId: string, sessionId: string) => {
    if (!userProfile?.uid) {
      setIsAuthModalOpen(true);
      throw new Error('Please sign in or create an account to claim task rewards.');
    }
    return await claimTaskReward(taskId, userProfile.uid, sessionId);
  };

  const handleClaimVideo = async (adId: string) => {
    if (!userProfile?.uid) {
      setIsAuthModalOpen(true);
      throw new Error('Please sign in to earn video rewards.');
    }
    return await claimVideoReward(adId, userProfile.uid);
  };

  const handleExecuteSpin = async () => {
    if (!userProfile?.uid) {
      setIsAuthModalOpen(true);
      throw new Error('Please sign in to spin the wheel.');
    }
    return await executeSpinTransaction(userProfile.uid);
  };

  const handleSubmitWithdrawal = async (
    method: WithdrawalMethod,
    account: string,
    amount: number,
    network?: string
  ) => {
    if (!userProfile?.uid) {
      setIsAuthModalOpen(true);
      throw new Error('Please sign in to withdraw your balance.');
    }
    return await submitWithdrawalRequest(
      userProfile.uid,
      method,
      account,
      amount,
      network
    );
  };

  const unreadNotifsCount = userNotifications.filter((n) => !n.read).length;
  const pendingWithdrawalsTotal = userWithdrawals
    .filter((w) => w.status === 'pending')
    .reduce((acc, w) => acc + w.amount, 0);

  // Check Maintenance Mode
  if (settings.maintenanceMode && !isAdminAuthenticated && appMode !== 'admin') {
    return (
      <div className="min-h-screen bg-[#070b10] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black">{settings.appName}</h1>
        <p className="text-amber-400 font-bold text-sm mt-1">Platform Under Maintenance</p>
        <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
          We are currently upgrading server systems and database optimizations. Please check back in a few minutes.
        </p>
        <button
          onClick={() => setIsAdminLoginOpen(true)}
          className="mt-6 text-xs text-slate-500 hover:text-amber-400 underline font-mono"
        >
          Staff & Admin Portal Login
        </button>

        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onSuccess={() => {
            setIsAdminLoginOpen(false);
            setAppMode('admin');
          }}
        />
      </div>
    );
  }

  // ADMIN MODE
  if (appMode === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-[#070b10] flex flex-col items-center justify-center p-4 text-center">
          <p className="text-sm text-slate-400 mb-4">Admin authorization required</p>
          <button
            onClick={() => setIsAdminLoginOpen(true)}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
          >
            Authenticate Admin
          </button>
          <button
            onClick={() => setAppMode('user')}
            className="mt-4 text-xs text-slate-500 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to User Application</span>
          </button>

          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => {
              setIsAdminLoginOpen(false);
              setAppMode('user');
            }}
            onSuccess={() => {
              setIsAdminLoginOpen(false);
              setAppMode('admin');
            }}
          />
        </div>
      );
    }

    return (
      <AdminPanel onReturnToUserApp={() => setAppMode('user')} />
    );
  }

  // USER MODE
  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl border-x border-slate-800/40">
      {/* Android Native Status Bar */}
      <AndroidStatusBar />

      {/* Top Header */}
      <TopHeader
        onOpenNotifications={() => setCurrentTab('notifications')}
        onOpenWithdraw={() => setCurrentTab('withdraw')}
        onOpenAdmin={() => {
          if (isAdminAuthenticated) {
            setAppMode('admin');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Tab Content */}
      <main className="flex-1 overflow-x-hidden">
        {currentTab === 'home' && (
          <DashboardView
            onNavigate={(tab) => setCurrentTab(tab)}
            recentTransactions={userTransactions}
            pendingWithdrawalsTotal={pendingWithdrawalsTotal}
            settings={settings}
            adsConfig={adsConfig}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            adsConfig={adsConfig}
            onClaimTask={handleClaimTask}
          />
        )}

        {currentTab === 'ads' && (
          <VideoAdsView
            videoAds={videoAds}
            adsConfig={adsConfig}
            onClaimVideo={handleClaimVideo}
          />
        )}

        {currentTab === 'spin' && (
          <SpinWheelView
            segments={spinSegments}
            settings={settings}
            spinHistory={userTransactions
              .filter((t) => t.type === 'spin_reward')
              .map((t) => ({
                id: t.id,
                userId: t.userId,
                reward: t.amount,
                segmentLabel: t.description,
                createdAt: t.createdAt,
              }))}
            onExecuteSpin={handleExecuteSpin}
          />
        )}

        {currentTab === 'withdraw' && (
          <WithdrawView
            settings={settings}
            userWithdrawals={userWithdrawals}
            onSubmitWithdrawal={handleSubmitWithdrawal}
          />
        )}

        {currentTab === 'referral' && <ReferralView settings={settings} />}

        {currentTab === 'history' && <HistoryView transactions={userTransactions} />}

        {currentTab === 'profile' && (
          <ProfileView
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenAdmin={() => {
              if (isAdminAuthenticated) {
                setAppMode('admin');
              } else {
                setIsAdminLoginOpen(true);
              }
            }}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationsView
            notifications={userNotifications}
            onMarkAllRead={() => {
              if (userProfile?.uid) {
                markNotificationsAsRead(userProfile.uid).catch(() => {});
              }
            }}
          />
        )}

        {currentTab === 'support' && <SupportView />}
      </main>

      {/* Android Bottom Navigation */}
      <BottomNavigation
        currentTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab)}
      />

      {/* Auth Modal (Login / Register / Quick Demo) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Admin Login Modal (admin / admin123) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setAppMode('admin');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
