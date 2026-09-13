import React, { useState } from 'react';
import { Disc3, Sparkles, Award, RotateCw, CheckCircle2, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SpinSegment, SpinRecord, PlatformSettings } from '../../types';
import { formatBDT, formatRelativeTime } from '../../lib/format';
import confetti from 'canvas-confetti';

interface SpinWheelViewProps {
  segments: SpinSegment[];
  settings: PlatformSettings;
  spinHistory: SpinRecord[];
  onExecuteSpin: () => Promise<{ segmentIndex: number; reward: number; message: string }>;
}

export const SpinWheelView: React.FC<SpinWheelViewProps> = ({
  segments,
  settings,
  spinHistory,
  onExecuteSpin,
}) => {
  const { userProfile } = useAuth();
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [winReward, setWinReward] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dailyLimit = settings.defaultDailySpinLimit || 10;
  const todaySpins = userProfile?.spinsToday || 0;
  const remainingSpins = Math.max(0, dailyLimit - todaySpins);

  const numSegments = segments.length;
  const segmentAngle = 360 / numSegments;

  const handleSpinClick = async () => {
    if (isSpinning || remainingSpins <= 0) return;

    setIsSpinning(true);
    setErrorMsg(null);
    setWinReward(null);

    try {
      // Backend/atomic transaction picks the winning segment
      const result = await onExecuteSpin();

      // Calculate rotation target to land on that segment
      // Pointer is at the top (270 degrees or 0 degrees). Let's calculate:
      // Segment i spans [i * segmentAngle, (i + 1) * segmentAngle]
      const targetSegmentIndex = result.segmentIndex;
      const targetCenterAngle = targetSegmentIndex * segmentAngle + segmentAngle / 2;

      // Spin at least 5-7 full revolutions (1800-2520 deg) + offset
      const extraSpins = 360 * 6;
      // To align with top pointer (270 deg)
      const targetRotation =
        rotationDegrees + extraSpins + (360 - (rotationDegrees % 360)) + (270 - targetCenterAngle);

      setRotationDegrees(targetRotation);

      // Wait for spin animation duration (4.5s)
      setTimeout(() => {
        setIsSpinning(false);
        setWinReward(result.reward);
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
      }, 4500);
    } catch (err: unknown) {
      setIsSpinning(false);
      const msg = err instanceof Error ? err.message : 'Spin error';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-yellow-950/40 border border-amber-500/20 p-4 shadow-lg text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Lucky BDT Wheel</span>
        </div>
        <h2 className="text-xl font-black text-white">Spin & Win Instant BDT</h2>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
          <span className="text-slate-300">
            Spins Used: <strong className="text-white">{todaySpins}/{dailyLimit}</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400 font-semibold">
            Remaining: <strong>{remainingSpins}</strong>
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* WHEEL CONTAINER */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        {/* Glow behind wheel */}
        <div className="absolute w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pointer / Needle at Top */}
        <div className="relative z-20 -mb-4 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]" />
        </div>

        {/* Circular Wheel */}
        <div className="relative w-72 h-72 rounded-full p-2 bg-gradient-to-b from-amber-500/30 via-slate-800 to-slate-950 shadow-2xl border-4 border-amber-500/40">
          {/* Rotating Wheel Body */}
          <div
            className="w-full h-full rounded-full overflow-hidden relative"
            style={{
              transform: `rotate(${rotationDegrees}deg)`,
              transition: isSpinning
                ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)'
                : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {segments.map((segment, index) => {
                const startAngle = index * segmentAngle;
                const endAngle = (index + 1) * segmentAngle;

                // SVG Arc Path
                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;

                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

                // Midpoint for text
                const midRad = (((startAngle + endAngle) / 2 - 90) * Math.PI) / 180;
                const textX = 50 + 32 * Math.cos(midRad);
                const textY = 50 + 32 * Math.sin(midRad);
                const textRotation = (startAngle + endAngle) / 2;

                return (
                  <g key={segment.id}>
                    <path
                      d={pathData}
                      fill={segment.color}
                      stroke="#0f141c"
                      strokeWidth="0.8"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${textRotation + 90}, ${textX}, ${textY})`}
                      className="font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                    >
                      {segment.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub / Button */}
          <button
            disabled={isSpinning || remainingSpins <= 0}
            onClick={handleSpinClick}
            className={`absolute inset-0 m-auto w-16 h-16 rounded-full flex flex-col items-center justify-center font-black text-xs z-30 transition-all shadow-xl ${
              remainingSpins <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-2 border-slate-700'
                : isSpinning
                ? 'bg-amber-600 text-slate-950 animate-pulse border-2 border-amber-300'
                : 'bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 active:scale-95 border-2 border-white shadow-amber-500/50'
            }`}
          >
            {isSpinning ? (
              <RotateCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Disc3 className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-tighter">SPIN</span>
              </>
            )}
          </button>
        </div>

        {/* Big Spin Action Button below */}
        <div className="w-full mt-6 max-w-xs">
          <button
            disabled={isSpinning || remainingSpins <= 0}
            onClick={handleSpinClick}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl ${
              remainingSpins <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : isSpinning
                ? 'bg-slate-800 text-amber-400 cursor-wait border border-amber-500/30'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 active:scale-95 shadow-amber-500/30'
            }`}
          >
            {isSpinning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Spinning the Wheel...</span>
              </>
            ) : remainingSpins <= 0 ? (
              <span>Daily Limit Reached (Come back tomorrow)</span>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>SPIN NOW ({remainingSpins} Left)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Win Celebration Modal Card */}
      {winReward !== null && (
        <div className="p-4 bg-gradient-to-br from-amber-500/20 via-slate-900 to-emerald-500/20 border border-amber-500/40 rounded-3xl text-center space-y-2 animate-bounce-short shadow-xl">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400 border border-amber-500/40">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-black text-white">Congratulations! 🎉</h4>
          <p className="text-2xl font-black font-mono text-amber-400">
            +{formatBDT(winReward)}
          </p>
          <p className="text-xs text-slate-300">
            Instant BDT reward has been credited to your available balance!
          </p>
          <button
            onClick={() => setWinReward(null)}
            className="mt-2 py-2 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
          >
            Awesome!
          </button>
        </div>
      )}

      {/* Spin History List */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <History className="w-4 h-4 text-amber-400" />
          <span>Recent Spins History</span>
        </div>

        {spinHistory.length === 0 ? (
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            No spin records yet. Spin the wheel to test your luck!
          </div>
        ) : (
          <div className="space-y-2">
            {spinHistory.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    ৳
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Lucky Spin Win</span>
                    <p className="text-[10px] text-slate-300">{formatRelativeTime(item.createdAt)}</p>
                  </div>
                </div>
                <span className="font-bold font-mono text-amber-400">
                  +{formatBDT(item.reward)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
