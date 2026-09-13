import React, { useState } from 'react';
import {
  ShieldAlert,
  Code,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { AdPlacementConfig } from '../../types';

interface AdminAdsTabProps {
  adsConfig: AdPlacementConfig;
  onSaveAdsConfig: (newConfig: AdPlacementConfig) => Promise<{ success: boolean; message: string }>;
}

export const AdminAdsTab: React.FC<AdminAdsTabProps> = ({ adsConfig, onSaveAdsConfig }) => {
  const [config, setConfig] = useState<AdPlacementConfig>({ ...adsConfig });
  const [previewPlacement, setPreviewPlacement] = useState<'task' | 'global' | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await onSaveAdsConfig(config);
      if (res.success) {
        setFeedback(res.message);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save ad configuration';
      setFeedback(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Adsterra & Monetization Manager</h2>
          <p className="text-xs text-slate-400">
            Configure scripts, banners and the 10-second Task Ad Gate integration
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* 1. TASK AD GATE CODE (CORE FEATURE) */}
        <div className="p-5 bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl space-y-3 relative shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-white">10-Second Task Ad Gate Code</h3>
                <p className="text-[11px] text-amber-400 font-semibold">
                  Rendered on every task during the mandatory 10-second unlock gate
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-slate-300">
                {config.taskAdEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <input
                type="checkbox"
                checked={config.taskAdEnabled}
                onChange={(e) => setConfig({ ...config, taskAdEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-amber-500 bg-slate-950 border-slate-700"
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
              <span>Paste Adsterra / HTML Banner / Pop-under Code Here:</span>
              <button
                type="button"
                onClick={() => setPreviewPlacement(previewPlacement === 'task' ? null : 'task')}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{previewPlacement === 'task' ? 'Hide Preview' : 'Test Preview'}</span>
              </button>
            </label>
            <textarea
              rows={4}
              value={config.taskAdCode}
              onChange={(e) => setConfig({ ...config, taskAdCode: e.target.value })}
              placeholder="<!-- Paste Adsterra script tag, iframe, or responsive ad container HTML -->"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-amber-300 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Test preview box */}
          {previewPlacement === 'task' && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Live Gate Render Test:
              </span>
              {config.taskAdCode ? (
                <div
                  className="ad-preview p-2 border border-dashed border-amber-500/30 rounded-xl"
                  dangerouslySetInnerHTML={{ __html: config.taskAdCode }}
                />
              ) : (
                <p className="text-xs text-slate-500 italic">No code entered yet.</p>
              )}
            </div>
          )}
        </div>

        {/* 2. GLOBAL AD BANNER CODE */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Global Dashboard Ad Placement</h3>
              <p className="text-[11px] text-slate-400">
                Shown below quick actions on the user dashboard
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-slate-300">
                {config.globalAdEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <input
                type="checkbox"
                checked={config.globalAdEnabled}
                onChange={(e) => setConfig({ ...config, globalAdEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-emerald-500 bg-slate-950 border-slate-700"
              />
            </label>
          </div>

          <textarea
            rows={3}
            value={config.globalAdCode}
            onChange={(e) => setConfig({ ...config, globalAdCode: e.target.value })}
            placeholder="<!-- Global banner script or HTML -->"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>

        {/* 3. VIDEO ADS BANNER CODE */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Video Ads Page Banner</h3>
              <p className="text-[11px] text-slate-400">
                Shown below video ad campaigns on the Watch Ads tab
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-slate-300">
                {config.videoAdEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <input
                type="checkbox"
                checked={config.videoAdEnabled}
                onChange={(e) => setConfig({ ...config, videoAdEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-teal-500 bg-slate-950 border-slate-700"
              />
            </label>
          </div>

          <textarea
            rows={3}
            value={config.videoAdCode}
            onChange={(e) => setConfig({ ...config, videoAdCode: e.target.value })}
            placeholder="<!-- Video stream ad code or social bar code -->"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-teal-300 focus:border-teal-500 focus:outline-none resize-none"
          />
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Apply Advertisement Placements</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
