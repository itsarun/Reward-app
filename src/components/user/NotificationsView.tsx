import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Wallet,
  Gift,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { formatDate } from '../../lib/format';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'task':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'withdrawal':
        return <Wallet className="w-4 h-4 text-cyan-400" />;
      case 'spin':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'referral':
        return <Gift className="w-4 h-4 text-teal-400" />;
      default:
        return <Bell className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Notifications</h2>
          <p className="text-xs text-slate-300">Live alerts and earning updates</p>
        </div>
        {notifications.length > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No notifications yet</h3>
          <p className="text-xs text-slate-300">
            You will receive updates here when you earn rewards or withdraw funds.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                n.read
                  ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900 border-emerald-500/30 shadow-md shadow-emerald-500/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">
                    {formatDate(n.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
