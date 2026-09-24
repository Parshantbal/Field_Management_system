import React from 'react';
import { WorkOrderStatus } from '../../types';

interface StatusBadgeProps {
  status: WorkOrderStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'OPEN':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'TRIAGED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ASSIGNED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'EN_ROUTE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse';
      case 'ON_SITE':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40 font-semibold';
      case 'ON_HOLD':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-semibold';
      case 'CLOSED':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getFormatLabel = () => {
    switch (status) {
      case 'EN_ROUTE': return 'En Route';
      case 'ON_SITE': return 'On Site';
      case 'ON_HOLD': return 'On Hold';
      default: return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {getFormatLabel()}
    </span>
  );
};
