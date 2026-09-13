import React, { useState } from 'react';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Edit,
  UserX,
  UserCheck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { formatBDT, formatDate } from '../../lib/format';

interface AdminUsersTabProps {
  users: UserProfile[];
  onAdjustBalance: (
    targetUid: string,
    amount: number,
    reason: string
  ) => Promise<{ success: boolean; message: string }>;
  onUpdateStatus: (
    targetUid: string,
    status: 'active' | 'blocked'
  ) => Promise<{ success: boolean; message: string }>;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onAdjustBalance,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Balance adjust modal state
  const [adjustAmount, setAdjustAmount] = useState<string>('50');
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('Bonus reward adjustment');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.referralCode?.toLowerCase().includes(q) ||
      u.uid?.toLowerCase().includes(q)
    );
  });

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const num = parseFloat(adjustAmount);
    if (!num || num <= 0) return;

    const finalAmount = adjustType === 'add' ? num : -num;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await onAdjustBalance(selectedUser.uid, finalAmount, adjustReason);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setSelectedUser(null);
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to adjust balance';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBlock = async (u: UserProfile) => {
    const newStatus = u.status === 'blocked' ? 'active' : 'blocked';
    try {
      await onUpdateStatus(u.uid, newStatus);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white">User Accounts Directory</h2>
          <p className="text-xs text-slate-400">
            Total {users.length} registered members in database
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by username, email, ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Users List Cards */}
      <div className="space-y-2.5">
        {filteredUsers.length === 0 ? (
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            No matching users found.
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div
              key={u.uid}
              className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:border-slate-700 transition-all"
            >
              {/* User meta */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-white text-sm shrink-0">
                  {u.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">@{u.username}</h4>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        u.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {u.status}
                    </span>
                    {u.role === 'admin' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{u.email}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>Ref: <strong className="text-cyan-400 font-mono">{u.referralCode}</strong></span>
                    <span>•</span>
                    <span>Tasks: {u.completedTasksCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Financial balances */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800/80">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-400 block">Balance</span>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    {formatBDT(u.balance || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Earned: {formatBDT(u.totalEarnings || 0)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setFeedback(null);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                    title="Adjust Balance"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleBlock(u)}
                    className={`p-2 rounded-xl border transition-colors ${
                      u.status === 'blocked'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                    }`}
                    title={u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                  >
                    {u.status === 'blocked' ? (
                      <UserCheck className="w-3.5 h-3.5" />
                    ) : (
                      <UserX className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADJUST BALANCE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0d121b] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Adjust User Balance</h3>
                <p className="text-xs text-slate-400">@{selectedUser.username}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between">
              <span className="text-slate-400">Current Balance:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatBDT(selectedUser.balance || 0)}
              </span>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              {/* Type Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    adjustType === 'add'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + Add BDT (Credit)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('deduct')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    adjustType === 'deduct'
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  - Deduct BDT (Debit)
                </button>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Amount (৳)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Audit Reason / Note</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Apply Balance Adjustment</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
