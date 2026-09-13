import React, { useState } from 'react';
import {
  Disc3,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { SpinSegment, PlatformSettings } from '../../types';
import { formatBDT } from '../../lib/format';

interface AdminSpinTabProps {
  segments: SpinSegment[];
  settings: PlatformSettings;
  onSaveSegments: (segments: SpinSegment[]) => Promise<{ success: boolean; message: string }>;
  onSaveSettings: (settings: PlatformSettings) => Promise<{ success: boolean; message: string }>;
}

export const AdminSpinTab: React.FC<AdminSpinTabProps> = ({
  segments,
  settings,
  onSaveSegments,
  onSaveSettings,
}) => {
  const [localSegments, setLocalSegments] = useState<SpinSegment[]>([...segments]);
  const [dailyLimit, setDailyLimit] = useState<number>(settings.defaultDailySpinLimit || 10);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleUpdateSegment = (idx: number, field: keyof SpinSegment, value: unknown) => {
    const updated = [...localSegments];
    updated[idx] = { ...updated[idx], [field]: value };
    setLocalSegments(updated);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      await onSaveSegments(localSegments);
      await onSaveSettings({ ...settings, defaultDailySpinLimit: dailyLimit });
      setFeedback('Lucky Spin configuration & wheel weights successfully updated!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setFeedback(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-white">Lucky Spin Wheel Configuration</h2>
        <p className="text-xs text-slate-400">
          Configure segments, probabilities, reward amounts and daily user limits
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-4">
        {/* Daily limit */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Daily Spin Limit Per User</span>
            <span className="text-[11px] text-slate-400">
              Users can spin this many times per calendar day
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="100"
            required
            value={dailyLimit}
            onChange={(e) => setDailyLimit(parseInt(e.target.value, 10) || 10)}
            className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:border-amber-500 focus:outline-none text-center"
          />
        </div>

        {/* Wheel Segments List */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Wheel Segments & Probability Weights
          </span>

          {localSegments.map((seg, idx) => (
            <div
              key={seg.id}
              className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3"
            >
              {/* Color swatch */}
              <div
                className="w-7 h-7 rounded-xl shrink-0 border border-white/20"
                style={{ backgroundColor: seg.color }}
              />

              {/* Label */}
              <div className="w-24">
                <span className="text-[10px] text-slate-500 block">Label</span>
                <input
                  type="text"
                  value={seg.label}
                  onChange={(e) => handleUpdateSegment(idx, 'label', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>

              {/* Reward */}
              <div className="w-24">
                <span className="text-[10px] text-slate-500 block">Reward (৳)</span>
                <input
                  type="number"
                  step="0.01"
                  value={seg.reward}
                  onChange={(e) =>
                    handleUpdateSegment(idx, 'reward', parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono font-bold text-emerald-400"
                />
              </div>

              {/* Weight / Probability */}
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 block">Probability Weight</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={seg.weight}
                  onChange={(e) =>
                    handleUpdateSegment(idx, 'weight', parseInt(e.target.value, 10) || 1)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-amber-400"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Lucky Spin Settings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
