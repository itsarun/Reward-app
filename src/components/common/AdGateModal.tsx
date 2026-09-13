import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TaskItem, AdPlacementConfig } from '../../types';
import { formatBDT } from '../../lib/format';
import confetti from 'canvas-confetti';

interface AdGateModalProps {
  task: TaskItem;
  adsConfig: AdPlacementConfig;
  onClose: () => void;
  onCompleteTask: (taskId: string, sessionId: string) => Promise<{ success: boolean; message: string }>;
}

export const AdGateModal: React.FC<AdGateModalProps> = ({
  task,
  adsConfig,
  onClose,
  onCompleteTask,
}) => {
  // Phase: 'gate' (10-second ad countdown) | 'active_task' (task execution timer) | 'reward_claimed'
  const [phase, setPhase] = useState<'gate' | 'active_task' | 'reward_claimed'>('gate');
  const [adCountdown, setAdCountdown] = useState<number>(10);
  const [isTabActive, setIsTabActive] = useState<boolean>(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Task execution timer
  const [taskCountdown, setTaskCountdown] = useState<number>(task.timer || 15);
  const [isTaskTimerDone, setIsTaskTimerDone] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionIdRef = useRef<string>(`gate_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  // Detect window/tab visibility changes to prevent cheating
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
        setWarningMessage('Please keep the advertisement open to continue.');
      } else {
        setIsTabActive(true);
        // Clear warning after 3 seconds
        setTimeout(() => setWarningMessage(null), 3000);
      }
    };

    const handleBlur = () => {
      setIsTabActive(false);
      setWarningMessage('Please keep the advertisement open to continue.');
    };

    const handleFocus = () => {
      setIsTabActive(true);
      setTimeout(() => setWarningMessage(null), 3000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 10-Second Ad Gate countdown logic
  useEffect(() => {
    if (phase !== 'gate') return;

    if (!isTabActive) {
      return; // Pause timer if tab is inactive or hidden
    }

    if (adCountdown <= 0) {
      // 10 seconds completed
      setPhase('active_task');
      return;
    }

    const timer = setTimeout(() => {
      setAdCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [adCountdown, isTabActive, phase]);

  // Task execution countdown logic (once unlocked)
  useEffect(() => {
    if (phase !== 'active_task') return;

    if (taskCountdown <= 0) {
      setIsTaskTimerDone(true);
      return;
    }

    const timer = setTimeout(() => {
      setTaskCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [taskCountdown, phase]);

  const handleClaimReward = async () => {
    if (!isTaskTimerDone || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await onCompleteTask(task.id, sessionIdRef.current);
      if (res.success) {
        setPhase('reward_claimed');
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore confetti issue
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Task verification failed. Please retry.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const adProgressPercent = ((10 - adCountdown) / 10) * 100;
  const taskProgressPercent = (((task.timer || 15) - taskCountdown) / (task.timer || 15)) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#0f141c] border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            {phase === 'gate' ? (
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lock className="w-4 h-4" />
              </span>
            ) : phase === 'active_task' ? (
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Unlock className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-[220px]">{task.title}</h3>
              <p className="text-[11px] text-emerald-400 font-semibold font-mono">
                Reward: {formatBDT(task.reward)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Warning Toast if user leaves tab */}
        {warningMessage && (
          <div className="mx-4 mt-3 p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-medium animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{warningMessage}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* PHASE 1: 10-SECOND ADVERTISEMENT GATE */}
          {phase === 'gate' && (
            <div className="space-y-4 text-center">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Advertisement Gate</span>
                </div>
                <h4 className="text-lg font-black text-white">Please keep the advertisement open</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Task will unlock after <strong className="text-amber-300">10 seconds</strong>
                </p>

                {/* Circular Progress & Big Number */}
                <div className="my-5 flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-amber-400 transition-all duration-1000 ease-linear"
                        strokeWidth="8"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * adProgressPercent) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black font-mono text-white tracking-tighter">
                        {adCountdown}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">sec</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Verifying active window engagement...</span>
                </div>
              </div>

              {/* Dynamic Advertisement Render Block */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">
                  <span>Sponsored Advertisement</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Adsterra / Sponsor
                  </span>
                </div>

                {/* If custom ad HTML is provided, render safely, else show interactive partner banner */}
                {adsConfig.taskAdCode && adsConfig.taskAdEnabled ? (
                  <div
                    className="ad-container text-xs text-slate-200"
                    dangerouslySetInnerHTML={{ __html: adsConfig.taskAdCode }}
                  />
                ) : (
                  <div className="p-4 bg-gradient-to-br from-indigo-950/60 to-purple-950/60 rounded-xl border border-indigo-500/30 text-center">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                      Verified Campaign
                    </span>
                    <h5 className="text-sm font-bold text-white mt-2">
                      Bkash & Nagad Cashback Partner Offer
                    </h5>
                    <p className="text-xs text-slate-300 mt-1">
                      Enjoy up to 20% instant cashback on utilities and top-up recharges across Bangladesh.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PHASE 2: TASK UNLOCKED & ACTIVE TIMER */}
          {phase === 'active_task' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Task Unlocked!</span>
                </div>
                <h4 className="text-base font-bold text-white">{task.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{task.description}</p>

                {/* Progress countdown */}
                <div className="my-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> Required Timer
                    </span>
                    <span className="font-bold text-emerald-400">{taskCountdown}s remaining</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${taskProgressPercent}%` }}
                    />
                  </div>
                </div>

                {isTaskTimerDone ? (
                  <p className="text-xs text-emerald-400 font-semibold animate-pulse">
                    ✓ Task time requirement fulfilled! You may now claim your reward.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Stay on this screen until the timer reaches 0 to verify.
                  </p>
                )}
              </div>

              {/* Task Instructions */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Instructions
                </h5>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {task.instructions || 'Review the details and complete the activity before timer expires.'}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Claim Reward Button */}
              <button
                disabled={!isTaskTimerDone || isSubmitting}
                onClick={handleClaimReward}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
                  isTaskTimerDone && !isSubmitting
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black active:scale-95 shadow-emerald-500/25'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Crediting BDT...</span>
                  </>
                ) : isTaskTimerDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Claim {formatBDT(task.reward)} Now</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Wait {taskCountdown}s to Claim</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* PHASE 3: SUCCESS CELEBRATION */}
          {phase === 'reward_claimed' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">Reward Credited! 🎉</h4>
                <p className="text-sm text-emerald-400 font-bold font-mono mt-1">
                  +{formatBDT(task.reward)} BDT
                </p>
                <p className="text-xs text-slate-300 mt-2">
                  Successfully added to your available balance. Keep completing tasks to earn more!
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-sm transition-all active:scale-95"
              >
                Done / Back to Tasks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
