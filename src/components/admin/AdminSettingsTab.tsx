import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  BellRing,
  ShieldAlert,
} from 'lucide-react';
import { PlatformSettings } from '../../types';
import { formatBDT } from '../../lib/format';

interface AdminSettingsTabProps {
  settings: PlatformSettings;
  onSaveSettings: (settings: PlatformSettings) => Promise<{ success: boolean; message: string }>;
  onResetDemoData: () => Promise<{ success: boolean; message: string }>;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  onSaveSettings,
  onResetDemoData,
}) => {
  const [form, setForm] = useState<PlatformSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      await onSaveSettings(form);
      setFeedback('Platform settings updated successfully!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setFeedback(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        'Warning: This will reload default demo tasks, video ads, spin wheel sectors and platform settings. Continue?'
      )
    ) {
      return;
    }

    setIsResetting(true);
    setFeedback(null);
    try {
      const res = await onResetDemoData();
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      setFeedback(msg);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-white">Global Platform Configuration</h2>
        <p className="text-xs text-slate-400">
          Manage currency parameters, withdrawal bounds, gateway fees, and announcements
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core details */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">General Branding</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Platform Name</label>
              <input
                type="text"
                required
                value={form.appName}
                onChange={(e) => setForm({ ...form, appName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Currency Symbol</label>
              <input
                type="text"
                required
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Financial Rules */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Withdrawal Thresholds & Fees
          </h3>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Min Payout (৳)</label>
              <input
                type="number"
                min="10"
                step="1"
                required
                value={form.minimumWithdrawal}
                onChange={(e) =>
                  setForm({ ...form, minimumWithdrawal: parseFloat(e.target.value) || 50 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Max Payout (৳)</label>
              <input
                type="number"
                min="100"
                step="1"
                required
                value={form.maximumWithdrawal}
                onChange={(e) =>
                  setForm({ ...form, maximumWithdrawal: parseFloat(e.target.value) || 5000 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Gateway Fee (%)</label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                required
                value={form.withdrawalFeePercentage}
                onChange={(e) =>
                  setForm({ ...form, withdrawalFeePercentage: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-rose-400 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Welcome Bonus for New Users (৳)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={form.welcomeBonus}
                onChange={(e) =>
                  setForm({ ...form, welcomeBonus: parseFloat(e.target.value) || 5 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-teal-400 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Referral Commission (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                required
                value={form.referralCommission}
                onChange={(e) =>
                  setForm({ ...form, referralCommission: parseInt(e.target.value, 10) || 10 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Global Announcement Banner */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <BellRing className="w-4 h-4 text-emerald-400" />
            <span>Top Marquee Announcement</span>
          </label>
          <textarea
            rows={2}
            value={form.announcement || ''}
            onChange={(e) => setForm({ ...form, announcement: e.target.value })}
            placeholder="Broadcast message to all active users on their dashboard..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-300 focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>

        {/* Maintenance Mode Toggle */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-white block">Maintenance Lockdown Mode</span>
              <span className="text-[10px] text-slate-400">
                Prevent new task completions and withdrawals during updates
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
              className="w-5 h-5 rounded text-amber-500 bg-slate-950 border-slate-700"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save All Platform Settings</span>}
        </button>
      </form>

      {/* Database Reset Danger Zone */}
      <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2.5">
        <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>System Reset & Seed Tools</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Need to restore initial demo tasks, video ads campaigns, lucky spin sectors, and default test data?
        </p>
        <button
          type="button"
          disabled={isResetting}
          onClick={handleReset}
          className="py-2 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors"
        >
          {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
          <span>Reseed Default Platform Data</span>
        </button>
      </div>
    </div>
  );
};
