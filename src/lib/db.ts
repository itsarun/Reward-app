import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  UserProfile,
  TaskItem,
  TaskCompletion,
  VideoAdItem,
  VideoAdView,
  SpinSegment,
  SpinRecord,
  WithdrawalRequest,
  TransactionRecord,
  PlatformSettings,
  AdPlacementConfig,
  NotificationItem,
  AdminAuditLog,
  WithdrawalMethod,
} from '../types';
import { getTodayDateString } from './format';

// Default platform settings
export const DEFAULT_SETTINGS: PlatformSettings = {
  referralCommission: 10, // 10%
  minimumWithdrawal: 50, // ৳50.00
  maximumWithdrawal: 10000, // ৳10,000.00
  withdrawalFeePercentage: 2, // 2%
  bKashEnabled: true,
  nagadEnabled: true,
  usdtEnabled: true,
  defaultDailySpinLimit: 10,
  defaultDailyVideoLimit: 15,
  maintenanceMode: false,
  announcement: 'Welcome to BDT Rewards! Complete daily tasks, watch video ads, and spin the lucky wheel to earn real ৳ BDT!',
};

// Default Ad placement configuration
export const DEFAULT_ADS: AdPlacementConfig = {
  taskAdEnabled: true,
  taskAdCode: `<!-- BDT Rewards Task Sponsor Ad -->\n<div class="p-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl border border-amber-500/30 text-center">\n  <p class="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Sponsored Partner</p>\n  <h4 class="text-base font-bold text-white mb-1">Special Discount Offer on Gadgets</h4>\n  <p class="text-xs text-slate-300">Shop top electronics with up to 50% discount across Bangladesh.</p>\n</div>`,
  videoAdEnabled: true,
  videoAdCode: `<!-- BDT Rewards Video Sponsor Ad -->\n<div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-300">Verified Sponsor Video Ad Stream</div>`,
  globalAdEnabled: true,
  globalAdCode: `<!-- Global Sponsor Banner -->\n<div class="w-full py-2 px-3 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs text-slate-300">\n  <span>Exclusive Ramadan & Eid Offers</span>\n  <span class="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px]">Claim</span>\n</div>`,
  socialBarEnabled: true,
  socialBarCode: `<!-- Interactive Social Notification Bar -->`,
  popunderEnabled: false,
  popunderCode: `<!-- Popunder Script Code -->`,
};

// Default Spin segments
export const DEFAULT_SPIN_SEGMENTS: SpinSegment[] = [
  { id: '1', reward: 0.1, label: '৳0.10', color: '#2563eb', weight: 35 },
  { id: '2', reward: 0.5, label: '৳0.50', color: '#059669', weight: 25 },
  { id: '3', reward: 1.0, label: '৳1.00', color: '#d97706', weight: 18 },
  { id: '4', reward: 2.0, label: '৳2.00', color: '#7c3aed', weight: 12 },
  { id: '5', reward: 5.0, label: '৳5.00', color: '#db2777', weight: 7 },
  { id: '6', reward: 10.0, label: '৳10.00', color: '#dc2626', weight: 3 },
];

// Initial default tasks for seeding
export const INITIAL_TASKS: Omit<TaskItem, 'id' | 'createdAt' | 'completionCount'>[] = [
  {
    title: 'Daily Check-in & Sponsor Visit',
    description: 'Keep the 10-second sponsor ad open, then complete 15-second daily activity.',
    reward: 2.0,
    timer: 15,
    dailyLimit: 3,
    adRequired: true,
    active: true,
    instructions: '1. Click Start Task to open the 10-second ad gate.\n2. Keep the ad window fully active without switching tabs.\n3. Once unlocked, stay on page for the 15-second timer to claim ৳2.00.',
    category: 'Daily',
  },
  {
    title: 'Explore Tech News Portal',
    description: 'Read the latest updates in Bangladeshi technology and mobile banking.',
    reward: 3.5,
    timer: 25,
    dailyLimit: 2,
    adRequired: true,
    active: true,
    instructions: '1. Unlock the ad gate by waiting 10 seconds.\n2. Read through the featured tech article.\n3. Wait for timer completion to receive ৳3.50.',
    category: 'Browsing',
  },
  {
    title: 'Review E-Commerce Products',
    description: 'Browse top deals on partner shopping platforms and explore deals.',
    reward: 5.0,
    timer: 35,
    dailyLimit: 2,
    adRequired: true,
    active: true,
    instructions: '1. Complete the mandatory 10-second sponsor gate.\n2. Browse partner product listings.\n3. Stay active until the timer hits 0 to credit ৳5.00 directly to your balance.',
    category: 'Special',
  },
  {
    title: 'Quick App Feedback Poll',
    description: 'Complete a brief 20-second engagement poll on our partner portal.',
    reward: 1.5,
    timer: 20,
    dailyLimit: 5,
    adRequired: true,
    active: true,
    instructions: '1. Watch the 10-second ad.\n2. Stay on the feedback screen.\n3. Confirm submission and get ৳1.50 instant reward.',
    category: 'Poll',
  },
];

// Initial default video ads for seeding
export const INITIAL_VIDEOS: Omit<VideoAdItem, 'id' | 'createdAt' | 'viewsCount'>[] = [
  {
    title: 'Fintech Mobile Banking Intro',
    reward: 1.0,
    watchTime: 20,
    dailyLimit: 10,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    active: true,
  },
  {
    title: 'Smart Gadgets Festival 2026',
    reward: 1.5,
    watchTime: 30,
    dailyLimit: 8,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    active: true,
  },
  {
    title: 'Quick 15s Supermarket Deals',
    reward: 0.8,
    watchTime: 15,
    dailyLimit: 12,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    active: true,
  },
];

/**
 * Seed initial Firestore collections if they are empty
 */
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    // Check settings
    const settingsDoc = await getDoc(doc(db, 'settings', 'platform'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, 'settings', 'platform'), DEFAULT_SETTINGS);
    }

    // Check ads
    const adsDoc = await getDoc(doc(db, 'ads', 'config'));
    if (!adsDoc.exists()) {
      await setDoc(doc(db, 'ads', 'config'), DEFAULT_ADS);
    }

    // Check spin segments
    const spinDoc = await getDoc(doc(db, 'settings', 'spinSegments'));
    if (!spinDoc.exists()) {
      await setDoc(doc(db, 'settings', 'spinSegments'), { segments: DEFAULT_SPIN_SEGMENTS });
    }

    // Check tasks
    const tasksSnapshot = await getDocs(query(collection(db, 'tasks'), limit(1)));
    if (tasksSnapshot.empty) {
      for (let i = 0; i < INITIAL_TASKS.length; i++) {
        const taskData = INITIAL_TASKS[i];
        const taskId = `task_${Date.now()}_${i}`;
        await setDoc(doc(db, 'tasks', taskId), {
          ...taskData,
          id: taskId,
          completionCount: 0,
          createdAt: Date.now() - i * 1000,
        });
      }
    }

    // Check video ads
    const videosSnapshot = await getDocs(query(collection(db, 'videoAds'), limit(1)));
    if (videosSnapshot.empty) {
      for (let i = 0; i < INITIAL_VIDEOS.length; i++) {
        const videoData = INITIAL_VIDEOS[i];
        const videoId = `video_${Date.now()}_${i}`;
        await setDoc(doc(db, 'videoAds', videoId), {
          ...videoData,
          id: videoId,
          viewsCount: 0,
          createdAt: Date.now() - i * 1000,
        });
      }
    }
  } catch (err) {
    console.warn('Seed initial data error (non-fatal, proceeding):', err);
  }
}

/**
 * Generate a clean unique referral code (e.g. BD7X9K2)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'BD';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Fetch or initialize a user profile
 */
export async function getOrCreateUserProfile(
  uid: string,
  email: string,
  username?: string,
  referralCodeUsed?: string
): Promise<UserProfile> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  const today = getTodayDateString();

  if (snap.exists()) {
    const data = snap.data() as UserProfile;
    // Check if daily counters need resetting
    if (data.lastEarningsDate !== today) {
      const updated: Partial<UserProfile> = {
        todayEarnings: 0,
        spinsToday: 0,
        videoViewsToday: 0,
        lastEarningsDate: today,
        lastActiveAt: Date.now(),
      };
      await updateDoc(userRef, updated);
      return { ...data, ...updated };
    }
    await updateDoc(userRef, { lastActiveAt: Date.now() });
    return data;
  }

  // Create new user profile
  let referredByUid: string | undefined = undefined;
  if (referralCodeUsed) {
    try {
      const q = query(
        collection(db, 'users'),
        where('referralCode', '==', referralCodeUsed.trim().toUpperCase()),
        limit(1)
      );
      const referrerSnap = await getDocs(q);
      if (!referrerSnap.empty) {
        referredByUid = referrerSnap.docs[0].id;
      }
    } catch {
      // ignore referral code lookup failure
    }
  }

  const newProfile: UserProfile = {
    uid,
    username: username || email.split('@')[0] || `User_${uid.slice(0, 5)}`,
    email,
    balance: 5.0, // Welcome signup bonus of ৳5.00!
    totalEarnings: 5.0,
    todayEarnings: 5.0,
    lastEarningsDate: today,
    referralCode: generateReferralCode(),
    referredBy: referredByUid,
    referralEarnings: 0,
    completedTasksCount: 0,
    spinsToday: 0,
    lastSpinDate: today,
    videoViewsToday: 0,
    lastVideoDate: today,
    status: 'active',
    role: 'user',
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };

  await setDoc(userRef, newProfile);

  // Create welcome transaction
  const welcomeTxId = `tx_${Date.now()}_welcome`;
  await setDoc(doc(db, 'transactions', welcomeTxId), {
    id: welcomeTxId,
    uid,
    type: 'admin_adjustment',
    amount: 5.0,
    status: 'completed',
    referenceId: 'WELCOME_BONUS',
    description: 'Welcome Registration Bonus',
    createdAt: Date.now(),
  } as TransactionRecord);

  // If referred, create referral record for referrer
  if (referredByUid) {
    const refId = `ref_${Date.now()}_${uid}`;
    await setDoc(doc(db, 'referrals', refId), {
      referrerUid: referredByUid,
      referredUid: uid,
      referredUsername: newProfile.username,
      commissionEarned: 0,
      createdAt: Date.now(),
    });
  }

  // Create welcome notification
  const notifId = `notif_${Date.now()}`;
  await setDoc(doc(db, 'notifications', notifId), {
    id: notifId,
    uid,
    title: 'Welcome to BDT Rewards!',
    message: 'You have received a ৳5.00 welcome bonus! Start earning more by completing tasks and watching ads.',
    type: 'system',
    read: false,
    createdAt: Date.now(),
  } as NotificationItem);

  return newProfile;
}

/**
 * Securely claim a Task reward with atomic transaction and referral commission
 */
export async function claimTaskReward(
  uid: string,
  taskId: string,
  _sessionId: string
): Promise<{ success: boolean; reward: number; message: string }> {
  const userRef = doc(db, 'users', uid);
  const taskRef = doc(db, 'tasks', taskId);
  const today = getTodayDateString();

  return await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) {
      throw new Error('User account not found');
    }
    const userData = userDoc.data() as UserProfile;
    if (userData.status === 'blocked') {
      throw new Error('Your account is currently suspended.');
    }

    const taskDoc = await transaction.get(taskRef);
    if (!taskDoc.exists()) {
      throw new Error('Task no longer exists.');
    }
    const taskData = taskDoc.data() as TaskItem;
    if (!taskData.active) {
      throw new Error('This task is currently inactive.');
    }

    // Check user daily completion for this task
    const completionsQuery = query(
      collection(db, 'taskCompletions'),
      where('uid', '==', uid),
      where('taskId', '==', taskId),
      where('dateStr', '==', today)
    );
    const completionsSnap = await getDocs(completionsQuery);
    if (completionsSnap.size >= taskData.dailyLimit) {
      throw new Error(`Daily limit reached (${taskData.dailyLimit}/${taskData.dailyLimit}) for this task.`);
    }

    const reward = Number(taskData.reward);
    const newBalance = (Number(userData.balance) || 0) + reward;
    const newTotal = (Number(userData.totalEarnings) || 0) + reward;
    const newToday =
      userData.lastEarningsDate === today ? (Number(userData.todayEarnings) || 0) + reward : reward;

    // Update user balance
    transaction.update(userRef, {
      balance: newBalance,
      totalEarnings: newTotal,
      todayEarnings: newToday,
      lastEarningsDate: today,
      completedTasksCount: (userData.completedTasksCount || 0) + 1,
      lastActiveAt: Date.now(),
    });

    // Update task completion count
    transaction.update(taskRef, {
      completionCount: (taskData.completionCount || 0) + 1,
    });

    // Create task completion record
    const completionId = `tc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const completionRef = doc(db, 'taskCompletions', completionId);
    transaction.set(completionRef, {
      id: completionId,
      uid,
      taskId,
      taskTitle: taskData.title,
      reward,
      completedAt: Date.now(),
      dateStr: today,
      sessionId: _sessionId,
    } as TaskCompletion);

    // Create transaction record
    const txId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const txRef = doc(db, 'transactions', txId);
    transaction.set(txRef, {
      id: txId,
      uid,
      type: 'task_reward',
      amount: reward,
      status: 'completed',
      referenceId: taskId,
      description: `Task Completed: ${taskData.title}`,
      createdAt: Date.now(),
    } as TransactionRecord);

    // Create user notification
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const notifRef = doc(db, 'notifications', notifId);
    transaction.set(notifRef, {
      id: notifId,
      uid,
      title: 'Task Reward Credited! 🎉',
      message: `You successfully completed "${taskData.title}" and earned ৳${reward.toFixed(2)}.`,
      type: 'task',
      read: false,
      createdAt: Date.now(),
    } as NotificationItem);

    // If user was referred by someone, calculate and credit commission
    if (userData.referredBy) {
      const referrerRef = doc(db, 'users', userData.referredBy);
      const referrerDoc = await transaction.get(referrerRef);
      if (referrerDoc.exists()) {
        const commissionRate = 10; // 10% standard or from settings
        const commissionAmount = Math.round(((reward * commissionRate) / 100) * 100) / 100;
        if (commissionAmount > 0) {
          const referrerData = referrerDoc.data() as UserProfile;
          transaction.update(referrerRef, {
            balance: (Number(referrerData.balance) || 0) + commissionAmount,
            totalEarnings: (Number(referrerData.totalEarnings) || 0) + commissionAmount,
            referralEarnings: (Number(referrerData.referralEarnings) || 0) + commissionAmount,
          });

          // Referrer transaction
          const refTxId = `tx_ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          transaction.set(doc(db, 'transactions', refTxId), {
            id: refTxId,
            uid: userData.referredBy,
            type: 'referral_commission',
            amount: commissionAmount,
            status: 'completed',
            referenceId: uid,
            description: `Referral Commission from ${userData.username}'s task completion`,
            createdAt: Date.now(),
          } as TransactionRecord);

          // Referrer notification
          const refNotifId = `notif_ref_${Date.now()}`;
          transaction.set(doc(db, 'notifications', refNotifId), {
            id: refNotifId,
            uid: userData.referredBy,
            title: 'Referral Commission Received! 💸',
            message: `Your referral ${userData.username} completed a task. You earned ৳${commissionAmount.toFixed(2)} commission!`,
            type: 'referral',
            read: false,
            createdAt: Date.now(),
          } as NotificationItem);
        }
      }
    }

    return {
      success: true,
      reward,
      message: `Task successfully verified! ৳${reward.toFixed(2)} added to your balance.`,
    };
  });
}

/**
 * Securely claim video ad watch reward
 */
export async function claimVideoReward(
  uid: string,
  adId: string
): Promise<{ success: boolean; reward: number; message: string }> {
  const userRef = doc(db, 'users', uid);
  const adRef = doc(db, 'videoAds', adId);
  const today = getTodayDateString();

  return await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error('User not found');
    const userData = userDoc.data() as UserProfile;
    if (userData.status === 'blocked') throw new Error('Account suspended');

    const adDoc = await transaction.get(adRef);
    if (!adDoc.exists()) throw new Error('Ad not found');
    const adData = adDoc.data() as VideoAdItem;
    if (!adData.active) throw new Error('Ad is inactive');

    // Check daily view limit for this user & ad
    const viewsQuery = query(
      collection(db, 'videoAdViews'),
      where('uid', '==', uid),
      where('adId', '==', adId),
      where('dateStr', '==', today)
    );
    const viewsSnap = await getDocs(viewsQuery);
    if (viewsSnap.size >= adData.dailyLimit) {
      throw new Error(`Daily limit reached (${adData.dailyLimit}/${adData.dailyLimit}) for this video ad.`);
    }

    const reward = Number(adData.reward);
    const newBalance = (Number(userData.balance) || 0) + reward;
    const newTotal = (Number(userData.totalEarnings) || 0) + reward;
    const newToday =
      userData.lastEarningsDate === today ? (Number(userData.todayEarnings) || 0) + reward : reward;
    const newViews =
      userData.lastVideoDate === today ? (Number(userData.videoViewsToday) || 0) + 1 : 1;

    transaction.update(userRef, {
      balance: newBalance,
      totalEarnings: newTotal,
      todayEarnings: newToday,
      videoViewsToday: newViews,
      lastEarningsDate: today,
      lastVideoDate: today,
      lastActiveAt: Date.now(),
    });

    transaction.update(adRef, {
      viewsCount: (adData.viewsCount || 0) + 1,
    });

    const viewId = `vav_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    transaction.set(doc(db, 'videoAdViews', viewId), {
      id: viewId,
      uid,
      adId,
      adTitle: adData.title,
      reward,
      watchedAt: Date.now(),
      dateStr: today,
    } as VideoAdView);

    const txId = `tx_vid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    transaction.set(doc(db, 'transactions', txId), {
      id: txId,
      uid,
      type: 'video_reward',
      amount: reward,
      status: 'completed',
      referenceId: adId,
      description: `Watched Video: ${adData.title}`,
      createdAt: Date.now(),
    } as TransactionRecord);

    const notifId = `notif_vid_${Date.now()}`;
    transaction.set(doc(db, 'notifications', notifId), {
      id: notifId,
      uid,
      title: 'Video Ad Reward! 🎬',
      message: `You earned ৳${reward.toFixed(2)} for watching "${adData.title}".`,
      type: 'ad',
      read: false,
      createdAt: Date.now(),
    } as NotificationItem);

    return {
      success: true,
      reward,
      message: `Video watched! ৳${reward.toFixed(2)} credited to your account.`,
    };
  });
}

/**
 * Execute Spin Wheel with atomic balance crediting
 */
export async function executeSpinReward(
  uid: string,
  segments: SpinSegment[],
  dailyLimit: number
): Promise<{ segmentIndex: number; reward: number; message: string }> {
  const userRef = doc(db, 'users', uid);
  const today = getTodayDateString();

  // Securely pick reward based on weights
  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
  let randomVal = Math.random() * totalWeight;
  let chosenIndex = 0;
  for (let i = 0; i < segments.length; i++) {
    if (randomVal < segments[i].weight) {
      chosenIndex = i;
      break;
    }
    randomVal -= segments[i].weight;
  }
  const chosenSegment = segments[chosenIndex];
  const reward = chosenSegment.reward;

  return await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error('User not found');
    const userData = userDoc.data() as UserProfile;
    if (userData.status === 'blocked') throw new Error('Account is suspended');

    const spinsToday = userData.lastSpinDate === today ? (userData.spinsToday || 0) : 0;
    if (spinsToday >= dailyLimit) {
      throw new Error(`Daily spin limit reached (${dailyLimit}/${dailyLimit}). Come back tomorrow!`);
    }

    const newBalance = (Number(userData.balance) || 0) + reward;
    const newTotal = (Number(userData.totalEarnings) || 0) + reward;
    const newToday =
      userData.lastEarningsDate === today ? (Number(userData.todayEarnings) || 0) + reward : reward;

    transaction.update(userRef, {
      balance: newBalance,
      totalEarnings: newTotal,
      todayEarnings: newToday,
      spinsToday: spinsToday + 1,
      lastSpinDate: today,
      lastEarningsDate: today,
      lastActiveAt: Date.now(),
    });

    const spinId = `spin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    transaction.set(doc(db, 'spins', spinId), {
      id: spinId,
      uid,
      reward,
      createdAt: Date.now(),
      dateStr: today,
    } as SpinRecord);

    const txId = `tx_spin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    transaction.set(doc(db, 'transactions', txId), {
      id: txId,
      uid,
      type: 'spin_reward',
      amount: reward,
      status: 'completed',
      referenceId: spinId,
      description: `Lucky Spin Reward: ৳${reward.toFixed(2)}`,
      createdAt: Date.now(),
    } as TransactionRecord);

    const notifId = `notif_spin_${Date.now()}`;
    transaction.set(doc(db, 'notifications', notifId), {
      id: notifId,
      uid,
      title: 'Lucky Spin Win! 🎡',
      message: `Congratulations! You spun the wheel and won ৳${reward.toFixed(2)}.`,
      type: 'spin',
      read: false,
      createdAt: Date.now(),
    } as NotificationItem);

    return {
      segmentIndex: chosenIndex,
      reward,
      message: `Awesome! You won ৳${reward.toFixed(2)}!`,
    };
  });
}

/**
 * Request a withdrawal with balance hold & validation
 */
export async function submitWithdrawalRequest(
  uid: string,
  method: WithdrawalMethod,
  account: string,
  amount: number,
  network?: string
): Promise<{ success: boolean; withdrawalId: string; message: string }> {
  const userRef = doc(db, 'users', uid);
  const settingsDoc = await getDoc(doc(db, 'settings', 'platform'));
  const settings = settingsDoc.exists() ? (settingsDoc.data() as PlatformSettings) : DEFAULT_SETTINGS;

  if (amount < settings.minimumWithdrawal) {
    throw new Error(`Minimum withdrawal amount is ৳${settings.minimumWithdrawal.toFixed(2)}`);
  }
  if (amount > settings.maximumWithdrawal) {
    throw new Error(`Maximum withdrawal amount is ৳${settings.maximumWithdrawal.toFixed(2)}`);
  }

  const fee = Math.round(((amount * settings.withdrawalFeePercentage) / 100) * 100) / 100;
  const netAmount = Math.round((amount - fee) * 100) / 100;

  return await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error('User not found');
    const userData = userDoc.data() as UserProfile;

    if (userData.status === 'blocked') throw new Error('Account is suspended');
    if (userData.balance < amount) {
      throw new Error(`Insufficient balance. You have ৳${userData.balance.toFixed(2)}, but requested ৳${amount.toFixed(2)}.`);
    }

    // Deduct balance (hold mechanism)
    transaction.update(userRef, {
      balance: userData.balance - amount,
      lastActiveAt: Date.now(),
    });

    const withdrawalId = `wdr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const withdrawalRef = doc(db, 'withdrawals', withdrawalId);
    transaction.set(withdrawalRef, {
      id: withdrawalId,
      uid,
      username: userData.username,
      email: userData.email,
      method,
      account,
      network: network || '',
      amount,
      fee,
      netAmount,
      status: 'pending',
      createdAt: Date.now(),
    } as WithdrawalRequest);

    // Create withdrawal transaction
    const txId = `tx_wdr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    transaction.set(doc(db, 'transactions', txId), {
      id: txId,
      uid,
      type: 'withdrawal',
      amount: -amount,
      status: 'pending',
      referenceId: withdrawalId,
      description: `Withdrawal to ${method.toUpperCase()} (${account})`,
      createdAt: Date.now(),
    } as TransactionRecord);

    // Create user notification
    const notifId = `notif_wdr_${Date.now()}`;
    transaction.set(doc(db, 'notifications', notifId), {
      id: notifId,
      uid,
      title: 'Withdrawal Submitted',
      message: `Your request for ৳${amount.toFixed(2)} via ${method.toUpperCase()} is received and pending admin approval.`,
      type: 'withdrawal',
      read: false,
      createdAt: Date.now(),
    } as NotificationItem);

    return {
      success: true,
      withdrawalId,
      message: `Withdrawal request for ৳${amount.toFixed(2)} submitted successfully! Net payout: ৳${netAmount.toFixed(2)}.`,
    };
  });
}

/**
 * ADMIN: Approve Withdrawal Request
 */
export async function adminApproveWithdrawal(
  adminId: string,
  withdrawalId: string,
  adminNote?: string
): Promise<void> {
  const wdrRef = doc(db, 'withdrawals', withdrawalId);

  await runTransaction(db, async (transaction) => {
    const wdrDoc = await transaction.get(wdrRef);
    if (!wdrDoc.exists()) throw new Error('Withdrawal request not found');
    const wdrData = wdrDoc.data() as WithdrawalRequest;

    if (wdrData.status !== 'pending') {
      throw new Error(`Cannot approve withdrawal with status: ${wdrData.status}`);
    }

    transaction.update(wdrRef, {
      status: 'approved',
      processedAt: Date.now(),
      adminNote: adminNote || 'Approved by Admin',
    });

    // Update transaction status
    const qTx = query(
      collection(db, 'transactions'),
      where('referenceId', '==', withdrawalId),
      where('type', '==', 'withdrawal')
    );
    const txSnap = await getDocs(qTx);
    txSnap.forEach((d) => {
      transaction.update(d.ref, { status: 'completed' });
    });

    // Notify user
    const notifId = `notif_wdr_app_${Date.now()}`;
    transaction.set(doc(db, 'notifications', notifId), {
      id: notifId,
      uid: wdrData.uid,
      title: 'Withdrawal Approved! 💰',
      message: `Your withdrawal of ৳${wdrData.amount.toFixed(2)} (Net: ৳${wdrData.netAmount.toFixed(2)}) via ${wdrData.method.toUpperCase()} has been approved and sent!`,
      type: 'withdrawal',
      read: false,
      createdAt: Date.now(),
    } as NotificationItem);

    // Audit log
    const auditId = `audit_${Date.now()}`;
    transaction.set(doc(db, 'adminAudit', auditId), {
      id: auditId,
      adminId,
      targetUid: wdrData.uid,
      action: 'APPROVE_WITHDRAWAL',
      amount: wdrData.amount,
      reason: `Approved payout of ৳${wdrData.amount} via ${wdrData.method} (${wdrData.account})`,
      createdAt: Date.now(),
    } as AdminAuditLog);
  });
}

/**
 * ADMIN: Reject Withdrawal Request & Refund held balance
 */
export async function adminRejectWithdrawal(
  adminId: string,
  withdrawalId: string,
  reason: string
): Promise<void> {
  const wdrRef = doc(db, 'withdrawals', withdrawalId);

  await runTransaction(db, async (transaction) => {
    const wdrDoc = await transaction.get(wdrRef);
    if (!wdrDoc.exists()) throw new Error('Withdrawal request not found');
    const wdrData = wdrDoc.data() as WithdrawalRequest;

    if (wdrData.status !== 'pending') {
      throw new Error(`Cannot reject withdrawal with status: ${wdrData.status}`);
    }

    const userRef = doc(db, 'users', wdrData.uid);
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error('User not found');
    const userData = userDoc.data() as UserProfile;

    // Refund held balance
    transaction.update(userRef, {
      balance: userData.balance + wdrData.amount,
    });

    transaction.update(wdrRef, {
      status: 'rejected',
      processedAt: Date.now(),
      adminNote: reason,
    });

    // Update transaction status
    const qTx = query(
      collection(db, 'transactions'),
      where('referenceId', '==', withdrawalId),
      where('type', '==', 'withdrawal')
    );
    const txSnap = await getDocs(qTx);
    txSnap.forEach((d) => {
      transaction.update(d.ref, { status: 'reversed' });
    });

    // Create reversal transaction
    const revTxId = `tx_rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    transaction.set(doc(db, 'transactions', revTxId), {
      id: revTxId,
      uid: wdrData.uid,
      type: 'withdrawal_reversal',
      amount: wdrData.amount,
      status: 'completed',
      referenceId: withdrawalId,
      description: `Withdrawal Refund: ${reason}`,
      createdAt: Date.now(),
    } as TransactionRecord);

    // Notify user
    const notifId = `notif_wdr_rej_${Date.now()}`;
    transaction.set(doc(db, 'notifications', notifId), {
      id: notifId,
      uid: wdrData.uid,
      title: 'Withdrawal Rejected (Refunded)',
      message: `Your withdrawal of ৳${wdrData.amount.toFixed(2)} was rejected. Reason: ${reason}. Funds have been refunded to your balance.`,
      type: 'withdrawal',
      read: false,
      createdAt: Date.now(),
    } as NotificationItem);

    // Audit log
    const auditId = `audit_${Date.now()}`;
    transaction.set(doc(db, 'adminAudit', auditId), {
      id: auditId,
      adminId,
      targetUid: wdrData.uid,
      action: 'REJECT_WITHDRAWAL',
      amount: wdrData.amount,
      reason: `Rejected withdrawal: ${reason}`,
      createdAt: Date.now(),
    } as AdminAuditLog);
  });
}

/**
 * ADMIN: Adjust user balance manually with audit record
 */
export async function adminAdjustUserBalance(
  adminId: string,
  targetUid: string,
  amount: number,
  reason: string
): Promise<void> {
  const userRef = doc(db, 'users', targetUid);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) throw new Error('User not found');
    const userData = userDoc.data() as UserProfile;

    const newBalance = userData.balance + amount;
    if (newBalance < 0) {
      throw new Error('Adjustment would result in negative balance');
    }

    transaction.update(userRef, {
      balance: newBalance,
      totalEarnings: amount > 0 ? userData.totalEarnings + amount : userData.totalEarnings,
    });

    const txId = `tx_adj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    transaction.set(doc(db, 'transactions', txId), {
      id: txId,
      uid: targetUid,
      type: 'admin_adjustment',
      amount,
      status: 'completed',
      referenceId: `ADJ_${Date.now()}`,
      description: `Admin Balance Adjustment: ${reason}`,
      createdAt: Date.now(),
    } as TransactionRecord);

    const auditId = `audit_${Date.now()}`;
    transaction.set(doc(db, 'adminAudit', auditId), {
      id: auditId,
      adminId,
      targetUid,
      action: amount >= 0 ? 'CREDIT_BALANCE' : 'DEBIT_BALANCE',
      amount,
      reason,
      createdAt: Date.now(),
    } as AdminAuditLog);

    const notifId = `notif_adj_${Date.now()}`;
    transaction.set(doc(db, 'notifications', notifId), {
      id: notifId,
      uid: targetUid,
      title: 'Balance Adjustment by Admin',
      message: `Your balance has been adjusted by ${amount >= 0 ? `+৳${amount.toFixed(2)}` : `-৳${Math.abs(amount).toFixed(2)}`}. Reason: ${reason}`,
      type: 'system',
      read: false,
      createdAt: Date.now(),
    } as NotificationItem);
  });
}

/**
 * ADMIN: Block or Unblock user
 */
export async function adminToggleUserBlock(
  adminId: string,
  targetUid: string,
  newStatus: 'active' | 'blocked',
  reason: string
): Promise<void> {
  const userRef = doc(db, 'users', targetUid);
  await updateDoc(userRef, { status: newStatus });

  const auditId = `audit_${Date.now()}`;
  await setDoc(doc(db, 'adminAudit', auditId), {
    id: auditId,
    adminId,
    targetUid,
    action: newStatus === 'blocked' ? 'BLOCK_USER' : 'UNBLOCK_USER',
    reason,
    createdAt: Date.now(),
  } as AdminAuditLog);
}

/**
 * Subscriptions & Realtime Listeners
 */
export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  return onSnapshot(doc(db, 'users', uid), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as UserProfile);
    } else {
      callback(null);
    }
  });
}

export function subscribeToPlatformSettings(callback: (settings: PlatformSettings) => void) {
  return onSnapshot(doc(db, 'settings', 'platform'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as PlatformSettings);
    } else {
      callback(DEFAULT_SETTINGS);
    }
  });
}

export function subscribeToAdsConfig(callback: (ads: AdPlacementConfig) => void) {
  return onSnapshot(doc(db, 'ads', 'config'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AdPlacementConfig);
    } else {
      callback(DEFAULT_ADS);
    }
  });
}

export function subscribeToTasks(callback: (tasks: TaskItem[]) => void) {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((d) => d.data() as TaskItem);
    callback(tasks);
  });
}

export function subscribeToVideoAds(callback: (ads: VideoAdItem[]) => void) {
  const q = query(collection(db, 'videoAds'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const ads = snapshot.docs.map((d) => d.data() as VideoAdItem);
    callback(ads);
  });
}

export function subscribeToUserTransactions(uid: string, callback: (txs: TransactionRecord[]) => void) {
  const q = query(collection(db, 'transactions'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const txs = snapshot.docs.map((d) => d.data() as TransactionRecord);
    callback(txs);
  });
}

export function subscribeToUserNotifications(uid: string, callback: (notifs: NotificationItem[]) => void) {
  const q = query(collection(db, 'notifications'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map((d) => d.data() as NotificationItem);
    callback(notifs);
  });
}

export function subscribeToUserWithdrawals(uid: string, callback: (wdrs: WithdrawalRequest[]) => void) {
  const q = query(collection(db, 'withdrawals'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(q, (snapshot) => {
    const wdrs = snapshot.docs.map((d) => d.data() as WithdrawalRequest);
    callback(wdrs);
  });
}

export function subscribeToAllUsers(callback: (users: UserProfile[]) => void) {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((d) => d.data() as UserProfile);
    callback(users);
  });
}

export function subscribeToAllWithdrawals(callback: (wdrs: WithdrawalRequest[]) => void) {
  const q = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const wdrs = snapshot.docs.map((d) => d.data() as WithdrawalRequest);
    callback(wdrs);
  });
}

export function subscribeToAllTransactions(callback: (txs: TransactionRecord[]) => void) {
  const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const txs = snapshot.docs.map((d) => d.data() as TransactionRecord);
    callback(txs);
  });
}

export function subscribeToSpinSegments(callback: (segments: SpinSegment[]) => void) {
  return onSnapshot(doc(db, 'settings', 'spinSegments'), (snap) => {
    if (snap.exists() && snap.data()?.segments) {
      callback(snap.data().segments as SpinSegment[]);
    } else {
      callback(DEFAULT_SPIN_SEGMENTS);
    }
  });
}

export const subscribeToAdConfig = subscribeToAdsConfig;

export async function saveSpinSegments(segments: SpinSegment[]): Promise<{ success: boolean; message: string }> {
  await setDoc(doc(db, 'settings', 'spinSegments'), { segments });
  return { success: true, message: 'Lucky Spin segments updated successfully!' };
}

export async function savePlatformSettings(settings: PlatformSettings): Promise<{ success: boolean; message: string }> {
  await setDoc(doc(db, 'settings', 'platform'), settings);
  return { success: true, message: 'Platform settings saved successfully!' };
}

export async function saveAdConfig(ads: AdPlacementConfig): Promise<{ success: boolean; message: string }> {
  await setDoc(doc(db, 'ads', 'config'), ads);
  return { success: true, message: 'Ad configurations saved successfully!' };
}

export async function saveTask(
  task: Omit<TaskItem, 'id' | 'createdAt'>,
  id?: string
): Promise<{ success: boolean; message: string }> {
  const taskId = id || `task_${Date.now()}`;
  await setDoc(
    doc(db, 'tasks', taskId),
    {
      ...task,
      id: taskId,
      createdAt: Date.now(),
      completionCount: 0,
    },
    { merge: true }
  );
  return { success: true, message: 'Task campaign saved successfully!' };
}

export async function deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
  await deleteDoc(doc(db, 'tasks', taskId));
  return { success: true, message: 'Task deleted successfully!' };
}

export async function saveVideoAd(
  videoAd: Omit<VideoAdItem, 'id' | 'createdAt'>,
  id?: string
): Promise<{ success: boolean; message: string }> {
  const videoId = id || `video_${Date.now()}`;
  await setDoc(
    doc(db, 'videoAds', videoId),
    {
      ...videoAd,
      id: videoId,
      createdAt: Date.now(),
      viewsCount: 0,
    },
    { merge: true }
  );
  return { success: true, message: 'Video ad campaign saved successfully!' };
}

export async function deleteVideoAd(id: string): Promise<{ success: boolean; message: string }> {
  await deleteDoc(doc(db, 'videoAds', id));
  return { success: true, message: 'Video ad deleted successfully!' };
}

export async function reviewWithdrawal(
  withdrawalId: string,
  status: 'approved' | 'rejected' | 'processing',
  adminNote?: string,
  txId?: string
): Promise<{ success: boolean; message: string }> {
  if (status === 'approved') {
    await adminApproveWithdrawal('admin', withdrawalId, adminNote ? `${adminNote}${txId ? ` (TXID: ${txId})` : ''}` : txId);
    return { success: true, message: 'Withdrawal request approved successfully!' };
  } else {
    await adminRejectWithdrawal('admin', withdrawalId, adminNote || 'Rejected by administrator');
    return { success: true, message: 'Withdrawal rejected and balance refunded.' };
  }
}

export async function adjustUserBalance(
  targetUid: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; message: string }> {
  await adminAdjustUserBalance('admin', targetUid, amount, reason);
  return { success: true, message: `Balance adjusted by ${amount >= 0 ? `+৳${amount}` : `-৳${Math.abs(amount)}`}` };
}

export async function updateUserStatus(
  targetUid: string,
  status: 'active' | 'blocked'
): Promise<{ success: boolean; message: string }> {
  await adminToggleUserBlock('admin', targetUid, status, 'Admin status toggled');
  return { success: true, message: `User status updated to ${status}` };
}

export async function markNotificationsAsRead(uid: string): Promise<void> {
  const q = query(collection(db, 'notifications'), where('uid', '==', uid), where('read', '==', false));
  const snap = await getDocs(q);
  const updates = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(updates);
}

export async function seedInitialData(): Promise<{ success: boolean; message: string }> {
  await seedInitialDataIfEmpty();
  return { success: true, message: 'Demo data seeded successfully!' };
}

export async function executeSpinTransaction(
  uid: string
): Promise<{ segmentIndex: number; reward: number; message: string }> {
  // Fetch current segments and settings
  const spinDoc = await getDoc(doc(db, 'settings', 'spinSegments'));
  const segments = (spinDoc.exists() && spinDoc.data()?.segments) || DEFAULT_SPIN_SEGMENTS;

  const settingsDoc = await getDoc(doc(db, 'settings', 'platform'));
  const settings = (settingsDoc.exists() && (settingsDoc.data() as PlatformSettings)) || DEFAULT_SETTINGS;

  return await executeSpinReward(uid, segments, settings.defaultDailySpinLimit || 10);
}
