import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Award,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PlatformSettings } from '../../types';
import { formatBDT } from '../../lib/format';

interface ReferralViewProps {
  settings: PlatformSettings;
}

export const ReferralView: React.FC<ReferralViewProps> = ({ settings }) => {
  const { userProfile } = useAuth();
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const referralCode = userProfile?.referralCode || 'BD77889';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Earn Daily BDT with me on BDT Rewards!',
          text: `Join BDT Rewards using my invite code ${referralCode} to claim a ৳5.00 welcome bonus and earn real Bangladeshi Taka daily!`,
          url: referralLink,
        });
      } catch {}
    } else {
      copyToClipboard(referralLink, true);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-blue-950/50 border border-cyan-500/20 p-5 shadow-lg text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Gift className="w-3.5 h-3.5" />
          <span>Refer & Earn Program</span>
        </div>
        <h2 className="text-2xl font-black text-white">Invite Friends & Earn</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
          Get <strong className="text-cyan-300 font-bold">{settings.referralCommission}% lifetime commission</strong> on every completed task from your invited members!
        </p>
      </div>

      {/* Referral Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
          <span className="text-[10px] text-slate-300 block mb-1">Commission</span>
          <span className="text-lg font-black font-mono text-cyan-400">
            {settings.referralCommission}%
          </span>
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
          <span className="text-[10px] text-slate-300 block mb-1">Total Referrals</span>
          <span className="text-lg font-black font-mono text-white">
            {userProfile?.referredBy ? '1+' : '0'}
          </span>
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
          <span className="text-[10px] text-slate-300 block mb-1">Ref Earnings</span>
          <span className="text-lg font-black font-mono text-emerald-400">
            {formatBDT(userProfile?.referralEarnings ?? 0)}
          </span>
        </div>
      </div>

      {/* Referral Code Box */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Your Unique Referral Code
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 font-mono font-black text-lg text-cyan-300 tracking-wider text-center select-all">
            {referralCode}
          </div>
          <button
            onClick={() => copyToClipboard(referralCode, false)}
            className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
            title="Copy Referral Code"
          >
            {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Referral Link Box */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Your Direct Referral Link
        </span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 font-mono truncate focus:outline-none"
          />
          <button
            onClick={() => copyToClipboard(referralLink, true)}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <button
          onClick={shareNative}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Invitation Link</span>
        </button>
      </div>

      {/* How it works Steps */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>How Referral Commission Works</span>
        </h4>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <p>Share your referral code or link with friends, family, or social media groups.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <p>When they register, they automatically get a ৳5.00 welcome bonus.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <p>
              Every time they complete a task, you get {settings.referralCommission}% instant commission credited directly to your BDT balance!
            </p>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center gap-2.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Self-referral and clone accounts are monitored and automatically disqualified.</span>
      </div>
    </div>
  );
};
