import React, { useState } from 'react';
import { History, Search, Filter, Wallet, Sparkles, CheckSquare, PlayCircle, Disc3, Gift } from 'lucide-react';
import { TransactionRecord } from '../../types';
import { formatBDTWithSign, formatDate } from '../../lib/format';

interface AdminTransactionsTabProps {
  transactions: TransactionRecord[];
}

export const AdminTransactionsTab: React.FC<AdminTransactionsTabProps> = ({ transactions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filtered = transactions.filter((t) => {
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.referenceId.toLowerCase().includes(q) ||
        t.userId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white">System Transactions Audit Ledger</h2>
          <p className="text-xs text-slate-400">
            Immutable log of all BDT balance operations, payouts, and adjustments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search ref or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="task_reward">Task Rewards</option>
            <option value="video_reward">Video Ads</option>
            <option value="spin_reward">Spins</option>
            <option value="referral_commission">Referrals</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="withdrawal_reversal">Refunds</option>
            <option value="admin_adjustment">Admin Adjustments</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            No transactions match criteria.
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white line-clamp-1">{tx.description}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {tx.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>{formatDate(tx.createdAt)}</span>
                  <span>•</span>
                  <span>Ref: {tx.referenceId}</span>
                  <span>•</span>
                  <span className="truncate max-w-[90px]">User: {tx.userId}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`font-black font-mono text-sm block ${
                    tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatBDTWithSign(tx.amount)}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-500">{tx.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
