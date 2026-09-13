import React, { useState } from 'react';
import {
  PlayCircle,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tv,
} from 'lucide-react';
import { VideoAdItem } from '../../types';
import { formatBDT } from '../../lib/format';

interface AdminVideoAdsTabProps {
  videoAds: VideoAdItem[];
  onSaveVideoAd: (
    videoAd: Omit<VideoAdItem, 'id' | 'createdAt'>,
    id?: string
  ) => Promise<{ success: boolean; message: string }>;
  onDeleteVideoAd: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const AdminVideoAdsTab: React.FC<AdminVideoAdsTabProps> = ({
  videoAds,
  onSaveVideoAd,
  onDeleteVideoAd,
}) => {
  const [editingAd, setEditingAd] = useState<VideoAdItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState('');
  const [reward, setReward] = useState('1.00');
  const [watchTime, setWatchTime] = useState('20');
  const [dailyLimit, setDailyLimit] = useState('10');
  const [videoUrl, setVideoUrl] = useState('');
  const [active, setActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingAd(null);
    setTitle('');
    setReward('1.00');
    setWatchTime('20');
    setDailyLimit('10');
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    setActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad: VideoAdItem) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setReward(String(ad.reward));
    setWatchTime(String(ad.watchTime));
    setDailyLimit(String(ad.dailyLimit));
    setVideoUrl(ad.videoUrl || '');
    setActive(ad.active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const data = {
        title: title.trim(),
        reward: parseFloat(reward) || 1.0,
        watchTime: parseInt(watchTime, 10) || 20,
        dailyLimit: parseInt(dailyLimit, 10) || 10,
        videoUrl: videoUrl.trim(),
        active,
      };

      await onSaveVideoAd(data, editingAd?.id);
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save video ad';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this video campaign?')) return;
    try {
      await onDeleteVideoAd(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Video Ads Campaigns</h2>
          <p className="text-xs text-slate-400">
            Set video watch times, BDT rewards, and daily per-user limits
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="py-2 px-3.5 bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Video Ad</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {videoAds.map((ad) => (
          <div
            key={ad.id}
            className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      ad.active
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ad.active ? 'Active' : 'Disabled'}
                  </span>
                  <span className="text-xs font-bold text-white">{ad.title}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> {ad.watchTime}s watch duration
                  </span>
                  <span>•</span>
                  <span>Daily limit: {ad.dailyLimit}x</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
              <div className="text-left md:text-right">
                <span className="text-[10px] text-slate-400 block">Reward</span>
                <span className="text-base font-black font-mono text-teal-400">
                  {formatBDT(ad.reward)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(ad)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                  title="Edit Video Ad"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
                  title="Delete Video Ad"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d121b] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingAd ? 'Edit Video Campaign' : 'Create Video Campaign'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Watch Partner Commercial"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Reward (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-teal-400 focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Duration (Sec)</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    required
                    value={watchTime}
                    onChange={(e) => setWatchTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Daily Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Video Stream URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Direct .mp4 link or video URL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-500 bg-slate-950 border-slate-700"
                />
                <span>Campaign Active</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{editingAd ? 'Save Campaign' : 'Create Campaign'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
