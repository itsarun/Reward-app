import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react';
import { TaskItem } from '../../types';
import { formatBDT } from '../../lib/format';

interface AdminTasksTabProps {
  tasks: TaskItem[];
  onSaveTask: (task: Omit<TaskItem, 'id' | 'createdAt'>, id?: string) => Promise<{ success: boolean; message: string }>;
  onDeleteTask: (taskId: string) => Promise<{ success: boolean; message: string }>;
}

export const AdminTasksTab: React.FC<AdminTasksTabProps> = ({
  tasks,
  onSaveTask,
  onDeleteTask,
}) => {
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('2.00');
  const [timer, setTimer] = useState('15');
  const [dailyLimit, setDailyLimit] = useState('5');
  const [category, setCategory] = useState('Daily');
  const [instructions, setInstructions] = useState('');
  const [adRequired, setAdRequired] = useState(true);
  const [active, setActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setReward('2.00');
    setTimer('15');
    setDailyLimit('5');
    setCategory('Daily');
    setInstructions('Review the advertisement and complete verification countdown.');
    setAdRequired(true);
    setActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setReward(String(task.reward));
    setTimer(String(task.timer));
    setDailyLimit(String(task.dailyLimit));
    setCategory(task.category || 'Daily');
    setInstructions(task.instructions || '');
    setAdRequired(task.adRequired);
    setActive(task.active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        reward: parseFloat(reward) || 2.0,
        timer: parseInt(timer, 10) || 15,
        dailyLimit: parseInt(dailyLimit, 10) || 5,
        category,
        instructions: instructions.trim(),
        adRequired,
        active,
      };

      await onSaveTask(taskData, editingTask?.id);
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save task';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this task?')) return;
    try {
      await onDeleteTask(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Task Campaigns Manager</h2>
          <p className="text-xs text-slate-400">Configure timed earning missions with 10s Ad Gate</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    task.active
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.active ? 'Active' : 'Paused'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 bg-slate-800 rounded-full">
                  {task.category || 'Standard'}
                </span>
                {task.adRequired && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> 10s Gate
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white">{task.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {task.timer}s countdown
                </span>
                <span>•</span>
                <span>Daily Limit: {task.dailyLimit}x</span>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
              <div className="text-left md:text-right">
                <span className="text-[10px] text-slate-400 block">Reward</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {formatBDT(task.reward)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                  title="Edit Task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d121b] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingTask ? 'Edit Task Campaign' : 'Create New Timed Task'}
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
                <label className="text-[11px] font-semibold text-slate-300">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Visit Sponsor Website & Verify"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short overview of the task"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Timer (Sec)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    required
                    value={timer}
                    onChange={(e) => setTimer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Daily Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Daily">Daily</option>
                  <option value="Browsing">Browsing</option>
                  <option value="Special">Special</option>
                  <option value="Poll">Poll</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Instructions</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Step by step guide for the user"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={adRequired}
                    onChange={(e) => setAdRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                  />
                  <span>Require 10-Second Sponsor Ad Gate before unlocking</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                  />
                  <span>Task Active (visible in user panel)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
