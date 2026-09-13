import React, { useState } from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { WithdrawalMethod, WithdrawalRequest, PlatformSettings } from '../../types';
import { formatBDT, formatRelativeTime } from '../../lib/format';

interface WithdrawViewProps {
  settings: PlatformSettings;
  userWithdrawals: WithdrawalRequest[];
  onSubmitWithdrawal: (
    method: WithdrawalMethod,
    account: string,
    amount: number,
    network?: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({
  settings,
  userWithdrawals,
  onSubmitWithdrawal,
}) => {
  const { userProfile } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod>('bkash');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [usdtNetwork, setUsdtNetwork] = useState<string>('TRC20');
  const [amountInput, setAmountInput] = useState<string>('100');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const numAmount = parseFloat(amountInput) || 0;
  const feePercent = settings.withdrawalFeePercentage || 2;
  const fee = Math.round(((numAmount * feePercent) / 100) * 100) / 100;
  const netReceive = Math.max(0, Math.round((numAmount - fee) * 100) / 100);

  const userBalance = userProfile?.balance || 0;
  const isBalanceEnough = userBalance >= numAmount;
  const meetsMin = numAmount >= settings.minimumWithdrawal;
  const meetsMax = numAmount <= settings.maximumWithdrawal;

  const quickAmounts = [50, 100, 250, 500, 1000, 2000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!accountNumber.trim()) {
      setErrorMessage(
        selectedMethod === 'usdt'
          ? 'Please enter your USDT wallet address.'
          : 'Please enter your 11-digit mobile wallet number.'
      );
      return;
    }

    if (!meetsMin) {
      setErrorMessage(`Minimum withdrawal is ${formatBDT(settings.minimumWithdrawal)}`);
      return;
    }

    if (!meetsMax) {
      setErrorMessage(`Maximum withdrawal is ${formatBDT(settings.maximumWithdrawal)}`);
      return;
    }

    if (!isBalanceEnough) {
      setErrorMessage(`Insufficient balance. You currently have ${formatBDT(userBalance)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmitWithdrawal(
        selectedMethod,
        accountNumber.trim(),
        numAmount,
        selectedMethod === 'usdt' ? usdtNetwork : undefined
      );
      if (res.success) {
        setSuccessMessage(res.message);
        setAccountNumber('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal submission failed';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20 animate-fade-in">
      {/* Available Balance Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-[#0c141e] border border-emerald-500/30 p-4 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
            Withdrawable Balance
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-white">
              {formatBDT(userBalance)}
            </span>
            <span className="text-xs text-emerald-400 font-bold">BDT</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Wallet className="w-5 h-5" />
        </div>
      </div>

      {/* METHOD SELECTOR */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Select Payout Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* bKash */}
          <button
            type="button"
            onClick={() => setSelectedMethod('bkash')}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
              selectedMethod === 'bkash'
                ? 'bg-[#e2136e]/15 border-[#e2136e] text-white shadow-lg shadow-[#e2136e]/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-[#e2136e] text-white flex items-center justify-center font-black text-xs mb-1">
              bK
            </div>
            <span className="text-xs font-bold">bKash</span>
            <span className="text-[9px] text-[#e2136e] font-semibold">Personal</span>
          </button>

          {/* Nagad */}
          <button
            type="button"
            onClick={() => setSelectedMethod('nagad')}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
              selectedMethod === 'nagad'
                ? 'bg-[#f7931e]/15 border-[#f7931e] text-white shadow-lg shadow-[#f7931e]/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-[#f7931e] text-white flex items-center justify-center font-black text-xs mb-1">
              Ng
            </div>
            <span className="text-xs font-bold">Nagad</span>
            <span className="text-[9px] text-[#f7931e] font-semibold">Personal</span>
          </button>

          {/* USDT */}
          <button
            type="button"
            onClick={() => setSelectedMethod('usdt')}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
              selectedMethod === 'usdt'
                ? 'bg-[#26a17b]/15 border-[#26a17b] text-white shadow-lg shadow-[#26a17b]/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-[#26a17b] text-white flex items-center justify-center font-black text-xs mb-1">
              ₮
            </div>
            <span className="text-xs font-bold">USDT</span>
            <span className="text-[9px] text-[#26a17b] font-semibold">Crypto</span>
          </button>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
        {/* Account / Phone number input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            {selectedMethod === 'usdt' ? 'USDT Wallet Address' : `${selectedMethod.toUpperCase()} Account Number`}
          </label>
          <input
            type="text"
            required
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={
              selectedMethod === 'usdt'
                ? 'e.g., TXYZ1234567890abcdef...'
                : 'e.g., 01712345678'
            }
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>

        {/* USDT Network selector if USDT */}
        {selectedMethod === 'usdt' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Network</label>
            <div className="flex gap-2">
              {['TRC20', 'BEP20', 'Polygon'].map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => setUsdtNetwork(net)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    usdtNetwork === net
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Withdrawal Amount (BDT)</label>
            <span className="text-[11px] text-slate-400">
              Min: {formatBDT(settings.minimumWithdrawal)}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
              ৳
            </span>
            <input
              type="number"
              min={settings.minimumWithdrawal}
              max={settings.maximumWithdrawal}
              step="1"
              required
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-8 pr-4 py-3 text-base text-white font-mono font-bold focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmountInput(String(q))}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                  amountInput === String(q)
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                ৳{q}
              </button>
            ))}
          </div>
        </div>

        {/* LIVE CALCULATION BREAKDOWN */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Requested Amount</span>
            <span className="font-mono font-bold text-slate-200">{formatBDT(numAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Processing Fee ({feePercent}%)</span>
            <span className="font-mono text-rose-400">-{formatBDT(fee)}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
            <span className="text-white">You will receive</span>
            <span className="font-mono text-emerald-400 font-black">{formatBDT(netReceive)}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isBalanceEnough || !meetsMin || !meetsMax}
          className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            !isBalanceEnough || !meetsMin || !meetsMax
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-slate-950 shadow-emerald-500/25'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Placing Withdrawal Request...</span>
            </>
          ) : !isBalanceEnough ? (
            <span>Insufficient Available Balance</span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Withdraw {formatBDT(numAmount)}</span>
            </>
          )}
        </button>
      </form>

      {/* WITHDRAWAL HISTORY */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Withdrawal Requests History
        </h3>

        {userWithdrawals.length === 0 ? (
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            No withdrawal requests made yet.
          </div>
        ) : (
          <div className="space-y-2">
            {userWithdrawals.map((wdr) => (
              <div
                key={wdr.id}
                className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-white uppercase">{wdr.method}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({wdr.account})</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    {formatRelativeTime(wdr.createdAt)} • Net: {formatBDT(wdr.netAmount)}
                  </p>
                  {wdr.adminNote && (
                    <p className="text-[10px] text-amber-300 mt-0.5 italic">Note: {wdr.adminNote}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-bold font-mono text-sm text-white block">
                    {formatBDT(wdr.amount)}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      wdr.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : wdr.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {wdr.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
