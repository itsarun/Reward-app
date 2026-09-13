import React, { useState } from 'react';
import { Users, Gift, Save, CheckCircle2, Award, Percent, Loader2 } from 'lucide-react';
import { UserProfile, PlatformSettings } from '../../types';
import { formatBDT } from '../../lib/format';

interface AdminReferralsTabProps {
  users: UserProfile[];
  settings: PlatformSettings;
  onSaveSettings: (settings: PlatformSettings) => Promise<{ success: boolean; message: string }>;
}

export const AdminReferralsTab: React.FC<AdminReferralsTabProps> = ({
  users,
  settings,
  onSaveSettings,
}) => {
  const [commissionRate, setCommissionRate] = useState<number>(settings.referralCommission || 10);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Users who have referred others or earned referral bonus
  const referrers = users
    .map((u) => {
      const referralsCount = users.filter((o) => o.referredBy === u.referralCode).length;
      return {
        ...u,
        referralsCount,
      };
    })
    .filter((u) => u.referralsCount > 0 || (u.referralEarnings && u.referralEarnings > 0))
    .sort((a, b) => (b.referralsCount || 0) - (a.referralsCount || 0));

  const handleSaveCommission = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await onSaveSettings({ ...settings, referralCommission: commissionRate });
      setFeedback(`Referral commission updated to ${commissionRate}%!`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update commission';
      setFeedback(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-white">Referrals & Affiliates Control</h2>
        <p className="text-xs text-slate-400">
          Configure multi-tier referral bonus percentage and audit top affiliates
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Commission setting card */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Percent className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-white">Global Referral Commission Rate</h3>
              <p className="text-[11px] text-slate-400">
                Percentage paid to referrers upon task completions
              </p>
            </div>
          </div>
          <span className="text-lg font-black font-mono text-cyan-400">{commissionRate}%</span>
        </div>

        {/* Quick rate options */}
        <div className="flex gap-2">
          {[5, 10, 15, 20, 25].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setCommissionRate(rate)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono border transition-all ${
                commissionRate === rate
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {rate}%
            </button>
          ))}
        </div>

        <button
          onClick={handleSaveCommission}
          disabled={isSaving}
          className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Commission Rate</span>}
        </button>
      </div>

      {/* Top Referrers Table */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>Top Referrers & Affiliates</span>
        </h3>

        {referrers.length === 0 ? (
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            No active referrers yet. New invites will populate here.
          </div>
        ) : (
          <div className="space-y-2">
            {referrers.map((r, i) => (
              <div
                key={r.uid}
                className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                    #{i + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-white">@{r.username}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">Code: {r.referralCode}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-cyan-400 font-mono block">
                    {r.referralsCount} Invites
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Earned: {formatBDT(r.referralEarnings || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
