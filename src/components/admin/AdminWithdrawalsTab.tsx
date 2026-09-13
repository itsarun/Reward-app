import React, { useState } from 'react';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { WithdrawalRequest, WithdrawalStatus, WithdrawalMethod } from '../../types';
import { formatBDT, formatDate } from '../../lib/format';

interface AdminWithdrawalsTabProps {
  withdrawals: WithdrawalRequest[];
  onReviewWithdrawal: (
    withdrawalId: string,
    status: WithdrawalStatus,
    adminNote?: string,
    txId?: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const AdminWithdrawalsTab: React.FC<AdminWithdrawalsTabProps> = ({
  withdrawals,
  onReviewWithdrawal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected for review modal
  const [selectedReq, setSelectedReq] = useState<WithdrawalRequest | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [actionType, setActionType] = useState<WithdrawalStatus>('approved');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredList = withdrawals.filter((w) => {
    if (filterStatus !== 'all' && w.status !== filterStatus) return false;
    if (filterMethod !== 'all' && w.method !== filterMethod) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        w.account.toLowerCase().includes(q) ||
        w.username.toLowerCase().includes(q) ||
        w.userId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenReview = (w: WithdrawalRequest, action: WithdrawalStatus) => {
    setSelectedReq(w);
    setActionType(action);
    setAdminNote(
      action === 'approved'
        ? 'Processed successfully via gateway'
        : 'Invalid mobile wallet number or details'
    );
    setTxId(action === 'approved' ? `TXN_${Date.now().toString(36).toUpperCase()}` : '');
    setFeedback(null);
  };

  const handleConfirmReview = async () => {
    if (!selectedReq) return;
    setIsProcessing(true);
    setFeedback(null);

    try {
      const res = await onReviewWithdrawal(
        selectedReq.id,
        actionType,
        adminNote.trim(),
        txId.trim() || undefined
      );
      if (res.success) {
        setFeedback(res.message);
        setTimeout(() => {
          setSelectedReq(null);
          setFeedback(null);
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setFeedback(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white">Payout & Withdrawals Desk</h2>
          <p className="text-xs text-slate-400">
            Review, approve or refund requested BDT mobile and crypto payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Method filter */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Gateways</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="usdt">USDT</option>
          </select>
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            No withdrawal requests match current filters.
          </div>
        ) : (
          filteredList.map((w) => (
            <div
              key={w.id}
              className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:border-slate-700 transition-all"
            >
              {/* Request Details */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      w.method === 'bkash'
                        ? 'bg-[#e2136e]/20 text-[#e2136e]'
                        : w.method === 'nagad'
                        ? 'bg-[#f7931e]/20 text-[#f7931e]'
                        : 'bg-[#26a17b]/20 text-[#26a17b]'
                    }`}
                  >
                    {w.method} {w.network ? `(${w.network})` : ''}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      w.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : w.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-white">@{w.username}</span>
                  <span className="text-xs font-mono text-cyan-300 font-semibold">{w.account}</span>
                </div>

                <p className="text-[10px] text-slate-500 mt-0.5">
                  Requested: {formatDate(w.createdAt)}
                  {w.txId && ` • TXID: ${w.txId}`}
                </p>
                {w.adminNote && (
                  <p className="text-[10px] text-amber-300 mt-0.5 italic">Note: {w.adminNote}</p>
                )}
              </div>

              {/* Amounts & Action Buttons */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                <div className="text-left md:text-right">
                  <span className="text-base font-black font-mono text-white block">
                    {formatBDT(w.amount)}
                  </span>
                  <span className="text-[10px] text-emerald-400 block font-mono">
                    Net: {formatBDT(w.netAmount)} (Fee: {formatBDT(w.fee)})
                  </span>
                </div>

                {/* Review actions if pending */}
                {w.status === 'pending' ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenReview(w, 'approved')}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleOpenReview(w, 'rejected')}
                      className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject & Refund</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Resolved</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CONFIRMATION / REVIEW MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0d121b] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {actionType === 'approved' ? 'Approve Withdrawal' : 'Reject & Refund Balance'}
              </h3>
              <button
                onClick={() => setSelectedReq(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>User:</span>
                <span className="font-bold text-white">@{selectedReq.username}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Destination:</span>
                <span className="font-mono text-cyan-300">{selectedReq.account} ({selectedReq.method})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross / Net Payout:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatBDT(selectedReq.amount)} / {formatBDT(selectedReq.netAmount)}
                </span>
              </div>
            </div>

            {actionType === 'rejected' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300">
                Note: Rejecting will automatically refund <strong>{formatBDT(selectedReq.amount)}</strong> back to the user's available balance.
              </div>
            )}

            {feedback && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
                {feedback}
              </div>
            )}

            <div className="space-y-3">
              {actionType === 'approved' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Transaction ID / Ref</label>
                  <input
                    type="text"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="e.g., BKASH_TRX998812"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Admin Note for User</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Completed via bKash personal send money"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmReview}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  actionType === 'approved'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>
                    {actionType === 'approved'
                      ? 'Confirm & Mark Approved'
                      : 'Confirm Rejection & Refund'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
