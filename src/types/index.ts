export type UserStatus = 'active' | 'blocked';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  balance: number;
  totalEarnings: number;
  todayEarnings: number;
  lastEarningsDate: string; // YYYY-MM-DD
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  completedTasksCount: number;
  spinsToday: number;
  lastSpinDate: string; // YYYY-MM-DD
  videoViewsToday: number;
  lastVideoDate: string; // YYYY-MM-DD
  status: UserStatus;
  role: UserRole;
  createdAt: number;
  lastActiveAt: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  reward: number; // in BDT (৳)
  timer: number; // in seconds
  dailyLimit: number;
  startDate?: string;
  endDate?: string;
  adRequired: boolean;
  active: boolean;
  instructions: string;
  category?: string;
  completionCount: number;
  createdAt: number;
}

export interface TaskCompletion {
  id: string;
  uid: string;
  taskId: string;
  taskTitle: string;
  reward: number;
  completedAt: number;
  dateStr: string; // YYYY-MM-DD
  sessionId: string;
}

export interface VideoAdItem {
  id: string;
  title: string;
  reward: number;
  watchTime: number; // in seconds
  dailyLimit: number;
  videoUrl: string;
  adCode?: string;
  active: boolean;
  viewsCount: number;
  createdAt: number;
}

export interface VideoAdView {
  id: string;
  uid: string;
  adId: string;
  adTitle: string;
  reward: number;
  watchedAt: number;
  dateStr: string;
}

export interface SpinSegment {
  id: string;
  reward: number;
  label: string;
  color: string;
  weight: number; // probability weight
}

export interface SpinRecord {
  id: string;
  uid: string;
  reward: number;
  createdAt: number;
  dateStr: string;
}

export type WithdrawalMethod = 'bkash' | 'nagad' | 'usdt';
export type WithdrawalStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled';

export interface WithdrawalRequest {
  id: string;
  uid: string;
  username: string;
  email: string;
  method: WithdrawalMethod;
  account: string; // Phone number for bKash/Nagad or address for USDT
  network?: string; // TRC20, BEP20 etc for USDT
  amount: number;
  fee: number;
  netAmount: number;
  status: WithdrawalStatus;
  createdAt: number;
  processedAt?: number;
  adminNote?: string;
}

export type TransactionType =
  | 'task_reward'
  | 'video_reward'
  | 'spin_reward'
  | 'referral_commission'
  | 'withdrawal'
  | 'withdrawal_reversal'
  | 'admin_adjustment';

export interface TransactionRecord {
  id: string;
  uid: string;
  type: TransactionType;
  amount: number; // Positive for credits, negative for debits
  status: 'completed' | 'pending' | 'reversed';
  referenceId: string;
  description: string;
  createdAt: number;
}

export interface PlatformSettings {
  referralCommission: number; // percentage, e.g., 10 for 10%
  minimumWithdrawal: number;
  maximumWithdrawal: number;
  withdrawalFeePercentage: number;
  bKashEnabled: boolean;
  nagadEnabled: boolean;
  usdtEnabled: boolean;
  defaultDailySpinLimit: number;
  defaultDailyVideoLimit: number;
  announcement?: string;
  maintenanceMode: boolean;
}

export interface AdPlacementConfig {
  taskAdEnabled: boolean;
  taskAdCode: string;
  videoAdEnabled: boolean;
  videoAdCode: string;
  globalAdEnabled: boolean;
  globalAdCode: string;
  socialBarEnabled: boolean;
  socialBarCode: string;
  popunderEnabled: boolean;
  popunderCode: string;
}

export interface NotificationItem {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: 'task' | 'ad' | 'spin' | 'withdrawal' | 'referral' | 'system';
  read: boolean;
  createdAt: number;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  targetUid: string;
  action: string;
  amount?: number;
  reason: string;
  createdAt: number;
}
