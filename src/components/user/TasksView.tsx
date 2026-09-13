import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info,
  Filter,
} from 'lucide-react';
import { TaskItem, AdPlacementConfig } from '../../types';
import { formatBDT } from '../../lib/format';
import { AdGateModal } from '../common/AdGateModal';
import { DynamicAdBanner } from '../common/DynamicAdBanner';

interface TasksViewProps {
  tasks: TaskItem[];
  adsConfig: AdPlacementConfig;
  onClaimTask: (taskId: string, sessionId: string) => Promise<{ success: boolean; message: string }>;
  loading?: boolean;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  adsConfig,
  onClaimTask,
  loading = false,
}) => {
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'Daily', 'Browsing', 'Special', 'Poll'];

  const filteredTasks = tasks.filter((t) => {
    if (!t.active) return false;
    if (activeCategory === 'all') return true;
    return t.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="p-4 space-y-4 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-[#0d141e] border border-emerald-500/20 p-4 shadow-lg">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Zap className="w-4 h-4" />
          <span>Timed Tasks & Missions</span>
        </div>
        <h2 className="text-xl font-black text-white">Earn Real ৳ per Task</h2>
        <p className="text-xs text-slate-300 mt-1">
          Every task requires passing the <strong className="text-amber-300">10-second sponsor gate</strong> before task activation.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-slate-300 text-xs flex items-center gap-1 pl-1">
          <Filter className="w-3 h-3" />
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
          <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No active tasks in this category</h3>
          <p className="text-xs text-slate-300">Check back shortly or view other categories.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all duration-200 shadow-sm flex flex-col justify-between gap-3"
            >
              {/* Top Row: Title, reward badge, category */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {task.category && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/20">
                        {task.category}
                      </span>
                    )}
                    {task.adRequired && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> 10s Ad Gate
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white">{task.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {task.description}
                  </p>
                </div>

                {/* Big Reward Pill */}
                <div className="shrink-0 text-right bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-2xl">
                  <span className="text-xs text-slate-400 block -mb-0.5">Reward</span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    {formatBDT(task.reward)}
                  </span>
                </div>
              </div>

              {/* Bottom Meta & Action */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{task.timer}s timer</span>
                  </span>
                  <span>Daily limit: {task.dailyLimit}x</span>
                </div>

                <button
                  onClick={() => setSelectedTask(task)}
                  className="py-1.5 px-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  <span>Start Task</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Guidelines Card */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-300">Rules & Anti-Fraud Notice</p>
          <p className="leading-relaxed">
            Do not refresh or minimize during the 10-second advertisement countdown. All completions are verified on server records to ensure fair rewards.
          </p>
        </div>
      </div>

      <DynamicAdBanner placement="task" adsConfig={adsConfig} />

      {/* 10-Second Ad Gate Modal */}
      {selectedTask && (
        <AdGateModal
          task={selectedTask}
          adsConfig={adsConfig}
          onClose={() => setSelectedTask(null)}
          onCompleteTask={async (taskId, sessionId) => {
            const res = await onClaimTask(taskId, sessionId);
            return res;
          }}
        />
      )}
    </div>
  );
};
