import React, { useState, useEffect, useRef } from 'react';
import {
  PlayCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  Tv,
  Award,
} from 'lucide-react';
import { VideoAdItem, AdPlacementConfig } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatBDT } from '../../lib/format';
import confetti from 'canvas-confetti';
import { DynamicAdBanner } from '../common/DynamicAdBanner';

interface VideoAdsViewProps {
  videoAds: VideoAdItem[];
  adsConfig: AdPlacementConfig;
  onClaimVideo: (adId: string) => Promise<{ success: boolean; reward: number; message: string }>;
}

export const VideoAdsView: React.FC<VideoAdsViewProps> = ({
  videoAds,
  adsConfig,
  onClaimVideo,
}) => {
  const { userProfile } = useAuth();
  const [activeAd, setActiveAd] = useState<VideoAdItem | null>(null);
  const [watchCountdown, setWatchCountdown] = useState<number>(20);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isTabActive, setIsTabActive] = useState<boolean>(true);
  const [warning, setWarning] = useState<string | null>(null);
  const [successReward, setSuccessReward] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Tab visibility detection
  useEffect(() => {
    const handleVis = () => {
      if (document.hidden) {
        setIsTabActive(false);
        setWarning('Please keep the video ad screen visible to earn your reward.');
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      } else {
        setIsTabActive(true);
        if (videoRef.current && videoRef.current.paused && activeAd) {
          videoRef.current.play().catch(() => {});
        }
        setTimeout(() => setWarning(null), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, [activeAd]);

  // Watch timer countdown
  useEffect(() => {
    if (!activeAd) return;

    if (!isTabActive) return;

    if (watchCountdown <= 0) {
      setCanClaim(true);
      return;
    }

    const timer = setTimeout(() => {
      setWatchCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchCountdown, activeAd, isTabActive]);

  const handleStartWatch = (ad: VideoAdItem) => {
    setActiveAd(ad);
    setWatchCountdown(ad.watchTime || 20);
    setCanClaim(false);
    setSuccessReward(null);
    setErrorMsg(null);
  };

  const handleClaimReward = async () => {
    if (!activeAd || !canClaim || isClaiming) return;
    setIsClaiming(true);
    setErrorMsg(null);
    try {
      const res = await onClaimVideo(activeAd.id);
      if (res.success) {
        setSuccessReward(res.reward);
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Claim failed';
      setErrorMsg(msg);
    } finally {
      setIsClaiming(false);
    }
  };

  const activeAdsList = videoAds.filter((v) => v.active);

  return (
    <div className="p-4 space-y-4 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-emerald-950/50 border border-teal-500/20 p-4 shadow-lg">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Tv className="w-4 h-4" />
          <span>Sponsor Video Stream</span>
        </div>
        <h2 className="text-xl font-black text-white">Watch Ads & Earn ৳</h2>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
          <span>
            Today's Views: <strong className="text-teal-400">{userProfile?.videoViewsToday ?? 0}</strong>
          </span>
          <span>•</span>
          <span>Fast BDT Crediting</span>
        </div>
      </div>

      {/* Active Video Player Modal/Frame if user started watching */}
      {activeAd && (
        <div className="rounded-3xl bg-slate-900 border border-teal-500/40 overflow-hidden shadow-2xl p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-white truncate max-w-[200px]">
                {activeAd.title}
              </span>
            </div>
            <button
              onClick={() => setActiveAd(null)}
              className="text-xs text-slate-400 hover:text-white p-1"
            >
              ✕ Close
            </button>
          </div>

          {warning && (
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{warning}</span>
            </div>
          )}

          {/* HTML5 Video or Simulated Sponsor Player */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {activeAd.videoUrl?.endsWith('.mp4') ? (
              <video
                ref={videoRef}
                src={activeAd.videoUrl}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setCanClaim(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <PlayCircle className="w-12 h-12 text-teal-400 animate-pulse mb-2" />
                <p className="text-xs font-semibold text-white">Sponsor Video Stream Playing</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Keep active to unlock your ৳ reward
                </p>
              </div>
            )}

            {/* Countdown Overlay */}
            <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md border border-slate-700/60 rounded-full px-2.5 py-1 text-xs font-mono font-bold text-teal-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{watchCountdown}s</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-400 h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${
                  (((activeAd.watchTime || 20) - watchCountdown) / (activeAd.watchTime || 20)) * 100
                }%`,
              }}
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Success or Action Button */}
          {successReward !== null ? (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-center space-y-2">
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Credited {formatBDT(successReward)}!</span>
              </div>
              <p className="text-xs text-slate-300">Reward added directly to your BDT balance.</p>
              <button
                onClick={() => setActiveAd(null)}
                className="w-full py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Watch Another Video
              </button>
            </div>
          ) : (
            <button
              disabled={!canClaim || isClaiming}
              onClick={handleClaimReward}
              className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                canClaim && !isClaiming
                  ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 active:scale-95 shadow-lg shadow-teal-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Crediting BDT...</span>
                </>
              ) : canClaim ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Claim {formatBDT(activeAd.reward)} Now</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Watch {watchCountdown}s to Unlock Reward</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Video Ads List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Available Video Ads ({activeAdsList.length})
        </h3>

        {activeAdsList.length === 0 ? (
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-3xl text-center space-y-2">
            <Tv className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No video campaigns available</h4>
            <p className="text-xs text-slate-300">Please check back in a short while.</p>
          </div>
        ) : (
          activeAdsList.map((ad) => (
            <div
              key={ad.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/30 transition-all flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{ad.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{ad.watchTime}s</span>
                    </span>
                    <span>•</span>
                    <span>Daily Limit: {ad.dailyLimit}x</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-sm font-black font-mono text-teal-400">
                  {formatBDT(ad.reward)}
                </span>
                <button
                  onClick={() => handleStartWatch(ad)}
                  className="py-1.5 px-3 bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  Watch
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <DynamicAdBanner placement="video" adsConfig={adsConfig} />
    </div>
  );
};
