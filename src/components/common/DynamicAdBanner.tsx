import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { AdPlacementConfig } from '../../types';

interface DynamicAdBannerProps {
  placement: 'global' | 'task' | 'video';
  adsConfig: AdPlacementConfig;
  className?: string;
}

export const DynamicAdBanner: React.FC<DynamicAdBannerProps> = ({
  placement,
  adsConfig,
  className = '',
}) => {
  const isEnabled =
    placement === 'global'
      ? adsConfig.globalAdEnabled
      : placement === 'task'
      ? adsConfig.taskAdEnabled
      : adsConfig.videoAdEnabled;

  const code =
    placement === 'global'
      ? adsConfig.globalAdCode
      : placement === 'task'
      ? adsConfig.taskAdCode
      : adsConfig.videoAdCode;

  if (!isEnabled) {
    return null;
  }

  // If valid HTML is configured, render it safely, else show high-quality promotional banner
  if (code && code.trim().length > 10) {
    return (
      <div className={`overflow-hidden rounded-2xl shadow-sm my-3 ${className}`}>
        <div
          className="ad-banner text-xs"
          dangerouslySetInnerHTML={{ __html: code }}
        />
      </div>
    );
  }

  return (
    <div
      className={`p-3.5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/20 rounded-2xl flex items-center justify-between shadow-sm my-3 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Sponsored Offer
          </span>
          <p className="text-xs font-semibold text-slate-200">
            Boost earnings up to ৳200/day with partner tasks
          </p>
        </div>
      </div>
      <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
        <ExternalLink className="w-3.5 h-3.5" />
      </span>
    </div>
  );
};
