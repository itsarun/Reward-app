import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Copy,
  Check,
  LogOut,
  HelpCircle,
  History,
  Wallet,
  Gift,
  ChevronRight,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserTab } from '../common/BottomNavigation';
import { formatBDT, formatDate } from '../../lib/format';

interface ProfileViewProps {
  onNavigate: (tab: UserTab) => void;
  onOpenAdmin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate, onOpenAdmin }) => {
  const { userProfile, logoutUser } = useAuth();
  const [copiedUid, setCopiedUid] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  const copyText = (text: string, isRef: boolean) => {
    navigator.clipboard.writeText(text);
    if (isRef) {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20 animate-fade-in">
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#0e141e] to-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[2px] shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-xl text-emerald-400">
              {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black text-white truncate">
                {userProfile?.username || 'Member'}
              </h2>
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate mt-0.5">{userProfile?.email}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
              <span>Joined {userProfile?.createdAt ? formatDate(userProfile.createdAt).split(',')[0] : 'Today'}</span>
            </div>
          </div>
        </div>

        {/* UID & Referral Code Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            onClick={() => copyText(userProfile?.referralCode || '', true)}
            className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <span className="text-[10px] text-slate-400">Ref:</span>
            <span className="font-mono font-bold text-cyan-400">
              {userProfile?.referralCode}
            </span>
            {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
          </button>

          <button
            onClick={() => copyText(userProfile?.uid || '', false)}
            className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <span className="text-[10px] text-slate-400">UID:</span>
            <span className="font-mono text-slate-400">
              {userProfile?.uid ? `${userProfile.uid.slice(0, 6)}...` : 'N/A'}
            </span>
            {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Account Balance Summary */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Account Balance Overview
        </span>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-300 block mb-0.5">Available Balance</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {formatBDT(userProfile?.balance ?? 0)}
            </span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-300 block mb-0.5">Lifetime Earnings</span>
            <span className="text-lg font-black font-mono text-white">
              {formatBDT(userProfile?.totalEarnings ?? 0)}
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('withdraw')}
          className="w-full py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Manage Withdrawals (bKash, Nagad, USDT)</span>
        </button>
      </div>

      {/* Menu Options */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/80 shadow-sm">
        {/* History */}
        <button
          onClick={() => onNavigate('history')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <History className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Financial Transactions</h4>
              <p className="text-[10px] text-slate-300">View credits, task claims & payouts</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>

        {/* Referral */}
        <button
          onClick={() => onNavigate('referral')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <Gift className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Refer & Earn Program</h4>
              <p className="text-[10px] text-slate-300">Invite friends & earn lifetime commission</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>

        {/* Support */}
        <button
          onClick={() => onNavigate('support')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <HelpCircle className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Help & Support Desk</h4>
              <p className="text-[10px] text-slate-300">FAQ, Telegram channel & inquiry ticket</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>

        {/* Admin Portal Gateway */}
        <button
          onClick={onOpenAdmin}
          className="w-full p-4 flex items-center justify-between hover:bg-amber-500/10 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                Administration Portal
              </h4>
              <p className="text-[10px] text-slate-400">Authorized platform control & approvals</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-amber-500/60" />
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={logoutUser}
        className="w-full py-3.5 px-4 bg-slate-900/60 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out Account</span>
      </button>

      {/* App Version Info */}
      <div className="text-center text-[10px] text-slate-400 pt-2 space-y-0.5">
        <p>BDT Rewards Platform v3.4 Pro • Android Mobile Web</p>
        <p>Protected by Firebase Security Rules & AES Sessions</p>
      </div>
    </div>
  );
};
