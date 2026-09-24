import React, { useState, useEffect } from 'react';
import { Clock, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface SlaCountdownProps {
  dueTime?: string;
  resolvedAt?: string;
  riskLevel?: 'SAFE' | 'WARNING' | 'BREACHED' | 'COMPLIED';
  compact?: boolean;
}

export const SlaCountdown: React.FC<SlaCountdownProps> = ({
  dueTime,
  resolvedAt,
  riskLevel,
  compact = false,
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isOverdue, setIsOverdue] = useState<boolean>(false);

  useEffect(() => {
    if (resolvedAt) {
      setTimeLeftStr('Resolved');
      return;
    }

    if (!dueTime) {
      setTimeLeftStr('No SLA');
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const due = new Date(dueTime).getTime();
      const diff = due - now;

      if (diff <= 0) {
        setIsOverdue(true);
        const overdueMins = Math.abs(Math.floor(diff / 60000));
        const hours = Math.floor(overdueMins / 60);
        const mins = overdueMins % 60;
        setTimeLeftStr(hours > 0 ? `+${hours}h ${mins}m overdue` : `+${mins}m overdue`);
      } else {
        setIsOverdue(false);
        const totalMins = Math.floor(diff / 60000);
        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setTimeLeftStr(`${days}d ${hours % 24}h left`);
        } else if (hours > 0) {
          setTimeLeftStr(`${hours}h ${mins}m left`);
        } else {
          setTimeLeftStr(`${mins}m left`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [dueTime, resolvedAt]);

  if (resolvedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Resolved on time
      </span>
    );
  }

  if (isOverdue || riskLevel === 'BREACHED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/15 px-2.5 py-0.5 rounded border border-rose-300 dark:border-rose-500/30 animate-pulse">
        <AlertOctagon className="w-3.5 h-3.5" />
        {timeLeftStr || 'SLA Breached'}
      </span>
    );
  }

  if (riskLevel === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-300 dark:border-amber-500/30">
        <Clock className="w-3.5 h-3.5" />
        {timeLeftStr} (At Risk)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 px-2.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
      <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
      {compact ? timeLeftStr : `SLA: ${timeLeftStr}`}
    </span>
  );
};
