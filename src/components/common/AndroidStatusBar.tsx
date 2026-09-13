import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, SignalHigh } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-7 bg-[#0b0e14] px-4 flex items-center justify-between text-[11px] font-semibold text-slate-300 select-none z-50 shrink-0 border-b border-white/[0.04]">
      <span>{currentTime || '12:00'}</span>
      <div className="flex items-center gap-1.5 opacity-90">
        <span className="text-[10px] text-emerald-400 font-bold tracking-tighter">5G</span>
        <SignalHigh className="w-3.5 h-3.5 text-slate-300" />
        <Wifi className="w-3.5 h-3.5 text-slate-300" />
        <BatteryMedium className="w-3.5 h-3.5 text-emerald-400 rotate-90" />
      </div>
    </div>
  );
};

export const AndroidNavBar: React.FC = () => {
  return (
    <div className="w-full h-5 bg-[#0b0e14] flex items-center justify-center select-none z-50 shrink-0">
      {/* Android modern navigation gesture bar */}
      <div className="w-32 h-1 bg-slate-600/70 rounded-full hover:bg-slate-400 transition-colors" />
    </div>
  );
};
