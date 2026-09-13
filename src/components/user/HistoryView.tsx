import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  Clock,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Gift,
  PlayCircle,
  Disc3,
  CheckSquare,
  Wallet,
} from 'lucide-react';
import { TransactionRecord, TransactionType } from '../../types';
import { formatBDTWithSign, formatDate } from '../../lib/format';

interface HistoryViewProps {
  transactions: TransactionRecord[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ transactions }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filterTabs: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'task_reward', label: 'Tasks' },
    { id: 'video_reward', label: 'Video Ads' },
    { id: 'spin_reward', label: 'Spins' },
    { id: 'referral_commission', label: 'Referrals' },
    { id: 'withdrawal', label: 'Withdrawals' },
  ];

  const filteredList = transactions.filter((t) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'withdrawal') {
      return t.type === 'withdrawal' || t.type === 'withdrawal_reversal';
    }
    return t.type === selectedFilter;
  });

  const getTxIcon = (type: TransactionType) => {
    switch (type) {
      case 'task_reward':
        return <CheckSquare className="w-4 h-4 text-emerald-400" />;
      case 'video_reward':
        return <PlayCircle className="w-4 h-4 text-teal-400" />;
      case 'spin_reward':
        return <Disc3 className="w-4 h-4 text-amber-400" />;
      case 'referral_commission':
        return <Gift className="w-4 h-4 text-cyan-400" />;
      case 'withdrawal':
        return <Wallet className="w-4 h-4 text-rose-400" />;
      case 'withdrawal_reversal':
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#0c131d] border border-slate-700/80 p-4 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Financial Ledger</span>
          </div>
          <h2 className="text-xl font-black text-white">Earnings & History</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Transparent logs of all BDT credits, bonuses & payouts.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === tab.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {filteredList.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No records found</h3>
          <p className="text-xs text-slate-300">No transactions in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredList.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 shadow-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                  {getTxIcon(tx.type)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{tx.description}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-0.5 font-mono">
                    <span>{formatDate(tx.createdAt)}</span>
                    <span>•</span>
                    <span className="text-slate-400 truncate max-w-[110px]">
                      Ref: {tx.referenceId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-sm font-black font-mono block ${
                    tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatBDTWithSign(tx.amount)}
                </span>
                <span
                  className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    tx.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : tx.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
