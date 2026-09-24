import React, { useState, useMemo } from 'react';
import { WorkOrder, WorkOrderStatus, Priority } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Building2,
  Cpu,
  User as UserIcon,
  ChevronRight,
  DollarSign
} from 'lucide-react';

interface WorkOrderListViewProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (id: number) => void;
  onOpenCreateModal: () => void;
}

export const WorkOrderListView: React.FC<WorkOrderListViewProps> = ({
  workOrders,
  onSelectWorkOrder,
  onOpenCreateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const filteredOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchesSearch =
        wo.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wo.technicianName && wo.technicianName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (wo.assetName && wo.assetName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || wo.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [workOrders, searchQuery, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Work Orders Registry</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage dispatch requests, field execution, parts consumption, and SLA compliance.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Work Order
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by WO#, title, facility, asset, or technician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="TRIAGED">Triaged</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="ON_SITE">On Site</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical (P1)</option>
              <option value="HIGH">High (P2)</option>
              <option value="MEDIUM">Medium (P3)</option>
              <option value="LOW">Low (P4)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Work Orders Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">WO Number & Title</th>
                <th className="py-3.5 px-4">Facility & Asset</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Tech</th>
                <th className="py-3.5 px-4">SLA Resolution</th>
                <th className="py-3.5 px-4 text-right">Cost</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No work orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((wo) => (
                  <tr
                    key={wo.id}
                    onClick={() => onSelectWorkOrder(wo.id)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Number & Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-bold text-brand-400">
                        {wo.workOrderNumber}
                      </div>
                      <div className="font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1 max-w-xs">
                        {wo.title}
                      </div>
                    </td>

                    {/* Facility & Asset */}
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium truncate max-w-[180px]">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{wo.facilityName}</span>
                      </div>
                      {wo.assetName && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5 truncate max-w-[180px]">
                          <Cpu className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{wo.assetName}</span>
                        </div>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={wo.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={wo.status} />
                    </td>

                    {/* Technician */}
                    <td className="py-3.5 px-4 text-xs">
                      {wo.technicianName ? (
                        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{wo.technicianName}</span>
                        </div>
                      ) : (
                        <span className="text-amber-400/80 italic text-xs">Unassigned</span>
                      )}
                    </td>

                    {/* SLA Resolution Timer */}
                    <td className="py-3.5 px-4">
                      <SlaCountdown
                        dueTime={wo.resolutionSlaDue}
                        resolvedAt={wo.resolvedAt}
                        riskLevel={wo.slaRiskLevel}
                        compact
                      />
                    </td>

                    {/* Total Cost */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-slate-300">
                      ${(wo.totalCost || 0).toFixed(2)}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectWorkOrder(wo.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="View Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="py-3 px-4 bg-slate-850/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredOrders.length} of {workOrders.length} work orders</span>
          <span className="font-mono">KEYSTONE FSM ENGINE</span>
        </div>
      </div>

    </div>
  );
};
