import React from 'react';
import { Priority } from '../../types';
import { AlertTriangle, AlertCircle, Clock, Info } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  const getConfig = () => {
    switch (priority) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-950/40',
          icon: AlertTriangle,
          label: 'Critical P1',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          icon: AlertCircle,
          label: 'High P2',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: Clock,
          label: 'Medium P3',
        };
      case 'LOW':
        return {
          bg: 'bg-slate-700/50 text-slate-300 border-slate-600',
          icon: Info,
          label: 'Low P4',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
};
