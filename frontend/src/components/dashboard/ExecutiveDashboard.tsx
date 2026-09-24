import React from 'react';
import { DashboardData } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  HardHat,
  Star,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Layers
} from 'lucide-react';

interface ExecutiveDashboardProps {
  data: DashboardData | null;
  onSelectWorkOrder: (id: number) => void;
  onGoToDispatch: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  data,
  onSelectWorkOrder,
  onGoToDispatch,
}) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { kpis, statusDistribution, priorityDistribution, urgentSlaAlerts, recentActivities } = data;

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Facility Operations Command Center
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Live Monitor
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time status of commercial facility assets, work orders, SLA targets, and field crews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoToDispatch}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all"
          >
            <HardHat className="w-4 h-4" />
            Dispatch Technicians
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Open Work Orders */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Work Orders</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{kpis.openWorkOrders}</span>
            <span className="text-xs text-slate-400">of {kpis.totalWorkOrders} total</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-sky-400 font-semibold">{kpis.inProgressWorkOrders} In Progress</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{kpis.completedWorkOrders} Resolved</span>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SLA Compliance</span>
            <div className={`p-2 rounded-xl border ${
              kpis.breachedSlaCount > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {kpis.breachedSlaCount > 0 ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {kpis.slaComplianceRate}%
            </span>
            <span className="text-xs font-medium text-slate-400">Target 95%+</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            {kpis.breachedSlaCount > 0 ? (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {kpis.breachedSlaCount} Breached
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">Zero Breaches</span>
            )}
            <span>•</span>
            <span className="text-amber-400 font-medium">{kpis.atRiskSlaCount} Near Breach</span>
          </div>
        </div>

        {/* Crew Utilization */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Field Crews Active</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{kpis.activeTechnicians}</span>
            <span className="text-xs text-slate-400">of {kpis.totalTechnicians} on shift</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {kpis.totalTechnicians > 0
              ? `${Math.round((kpis.activeTechnicians / kpis.totalTechnicians) * 100)}% crew allocation`
              : 'No technicians logged'}
          </div>
        </div>

        {/* Total Cost & Rating */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Maintenance Spend (MTD)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              ${kpis.totalMaintenanceCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{kpis.averageRating} / 5.0 Tenant Satisfaction</span>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Urgent SLA Alerts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Urgent SLA Alerts & Escalation List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SLA Alerts Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">SLA Urgency Watchlist</h3>
                  <p className="text-xs text-slate-400">Tickets closest to deadline or past SLA target</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {urgentSlaAlerts.length} Action Items
              </span>
            </div>

            {urgentSlaAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                All active work orders are within healthy SLA margins.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 mt-2">
                {urgentSlaAlerts.map((alert) => (
                  <div
                    key={alert.workOrderId}
                    onClick={() => onSelectWorkOrder(alert.workOrderId)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer transition-all group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-slate-400 font-semibold">{alert.workOrderNumber}</span>
                        <PriorityBadge priority={alert.priority} showIcon={false} />
                        <StatusBadge status={alert.status} />
                      </div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-brand-400 transition-colors truncate">
                        {alert.title}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{alert.facilityName}</span>
                        <span>•</span>
                        <span>Assignee: {alert.technicianName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <SlaCountdown
                        dueTime={alert.resolutionSlaDue}
                        riskLevel={alert.riskLevel}
                      />
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Work Orders Status Distribution Visual */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-sm">
            <h3 className="text-base font-bold text-white mb-1">Work Order Lifecycle Pipeline</h3>
            <p className="text-xs text-slate-400 mb-4">Volume breakdown across resolution phases</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'OPEN', label: 'Open / New', color: 'bg-sky-500' },
                { key: 'TRIAGED', label: 'Triaged', color: 'bg-blue-500' },
                { key: 'ASSIGNED', label: 'Assigned', color: 'bg-indigo-500' },
                { key: 'ON_SITE', label: 'On Site / Active', color: 'bg-amber-500' },
              ].map((stage) => {
                const count = statusDistribution[stage.key] || 0;
                return (
                  <div key={stage.key} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${stage.color}`} />
                      <span className="text-xs text-slate-400 font-medium">{stage.label}</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Priority Distribution & Audit Stream */}
        <div className="space-y-6">
          
          {/* Priority Distribution Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-sm">
            <h3 className="text-base font-bold text-white mb-1">Priority Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Current backlog urgency</p>

            <div className="space-y-3">
              {[
                { key: 'CRITICAL', label: 'Critical P1', count: priorityDistribution['CRITICAL'] || 0, color: 'bg-rose-500', text: 'text-rose-400' },
                { key: 'HIGH', label: 'High P2', count: priorityDistribution['HIGH'] || 0, color: 'bg-orange-500', text: 'text-orange-400' },
                { key: 'MEDIUM', label: 'Medium P3', count: priorityDistribution['MEDIUM'] || 0, color: 'bg-amber-500', text: 'text-amber-400' },
                { key: 'LOW', label: 'Low P4', count: priorityDistribution['LOW'] || 0, color: 'bg-slate-500', text: 'text-slate-400' },
              ].map((p) => {
                const percent = kpis.totalWorkOrders > 0 ? Math.round((p.count / kpis.totalWorkOrders) * 100) : 0;
                return (
                  <div key={p.key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold ${p.text}`}>{p.label}</span>
                      <span className="text-slate-400">{p.count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`${p.color} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" />
                <h3 className="text-base font-bold text-white">Live Activity Stream</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">AUDIT LOG</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No recent activity logged.</p>
              ) : (
                recentActivities.slice(0, 7).map((act) => (
                  <div key={act.id} className="text-xs p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/60">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-slate-200">{act.performedByName}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300">{act.notes || act.action}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
