import React, { useState } from 'react';
import { WorkOrder, WorkOrderStatus, Part, Technician } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Building2,
  Cpu,
  Clock,
  HardHat,
  Boxes,
  History,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Send,
  Star,
  Plus
} from 'lucide-react';

interface WorkOrderDetailModalProps {
  workOrder: WorkOrder | null;
  onClose: () => void;
  onRefresh: () => void;
  onOpenDispatchModal?: (workOrderId: number) => void;
  partsCatalog?: Part[];
  technicians?: Technician[];
}

const LIFECYCLE_STEPS: WorkOrderStatus[] = [
  'OPEN',
  'TRIAGED',
  'ASSIGNED',
  'EN_ROUTE',
  'ON_SITE',
  'COMPLETED',
  'CLOSED'
];

export const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({
  workOrder,
  onClose,
  onRefresh,
  onOpenDispatchModal,
  partsCatalog = [],
  technicians = [],
}) => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'labor' | 'audit'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigningTech, setIsAssigningTech] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);

  // Add Part state
  const [showAddPart, setShowAddPart] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<number>(0);
  const [partQty, setPartQty] = useState<number>(1);

  const handleQuickAssignTechnician = async (techId: number) => {
    if (!workOrder || !techId) return;
    setIsAssigningTech(true);
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 2 * 3600000);
      await api.workOrders.assignTechnician(workOrder.id, {
        technicianId: techId,
        scheduledStart: now.toISOString(),
        scheduledEnd: end.toISOString(),
        notes: 'Assigned via Operations Console',
      });
      onRefresh();
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setIsAssigningTech(false);
    }
  };

  if (!workOrder) return null;

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(workOrder.status);

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    setIsUpdating(true);
    try {
      await api.workOrders.changeStatus(workOrder.id, newStatus);
      onRefresh();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionText.trim()) return;
    setIsUpdating(true);
    try {
      await api.workOrders.resolve(workOrder.id, resolutionText);
      setShowResolutionForm(false);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to resolve work order: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || partQty < 1) return;
    setIsUpdating(true);
    try {
      await api.inventory.consumePart(workOrder.id, selectedPartId, partQty);
      setShowAddPart(false);
      setPartQty(1);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to consume part: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-850/40">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <span className="font-mono text-sm font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                {workOrder.workOrderNumber}
              </span>
              <PriorityBadge priority={workOrder.priority} />
              <StatusBadge status={workOrder.status} />
              <SlaCountdown
                dueTime={workOrder.resolutionSlaDue}
                resolvedAt={workOrder.resolvedAt}
                riskLevel={workOrder.slaRiskLevel}
              />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{workOrder.title}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {workOrder.facilityName}
              </span>
              {workOrder.assetName && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    {workOrder.assetName} ({workOrder.assetTagNumber})
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lifecycle Stepper Bar */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] gap-2">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = currentStepIndex >= idx;
              const isCurrent = workOrder.status === step;

              return (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-brand-500 text-white ring-4 ring-brand-500/20'
                          : isPast
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isPast && !isCurrent ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold mt-1 whitespace-nowrap ${
                        isCurrent ? 'text-brand-400' : isPast ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {step.replace('_', ' ')}
                    </span>
                  </div>

                  {idx < LIFECYCLE_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mb-3 transition-colors ${
                        currentStepIndex > idx ? 'bg-emerald-500/70' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-850/20 flex items-center gap-6">
          {[
            { id: 'overview', label: 'Overview & Details', icon: Building2 },
            { id: 'parts', label: `Parts Consumed (${workOrder.partsUsed?.length || 0})`, icon: Boxes },
            { id: 'labor', label: `Labor & Time (${workOrder.timeEntries?.length || 0})`, icon: Clock },
            { id: 'audit', label: `Audit Trail (${workOrder.auditLogs?.length || 0})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  isTabActive
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Description */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Problem Description & Diagnostics
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {workOrder.description}
                </p>
              </div>

              {/* Grid: Facility Details & Assigned Technician */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Facility & Asset Info */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Facility & Location</h4>
                  <div className="text-xs space-y-1.5 text-slate-300">
                    <p><strong className="text-slate-400">Complex:</strong> {workOrder.facilityName} ({workOrder.facilityCode})</p>
                    <p><strong className="text-slate-400">Address:</strong> {workOrder.facilityAddress}</p>
                    {workOrder.assetLocation && (
                      <p><strong className="text-slate-400">Zone / Room:</strong> {workOrder.assetLocation}</p>
                    )}
                    {workOrder.assetCategory && (
                      <p><strong className="text-slate-400">Category:</strong> {workOrder.assetCategory}</p>
                    )}
                  </div>
                </div>

                {/* Technician & Dispatch Info */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Crew</h4>
                    {onOpenDispatchModal && (role === 'ROLE_ADMIN' || role === 'ROLE_DISPATCHER') && (
                      <button
                        onClick={() => onOpenDispatchModal(workOrder.id)}
                        className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                      >
                        {workOrder.technicianId ? 'Reassign Tech' : 'Dispatch Now'}
                      </button>
                    )}
                  </div>

                  {workOrder.technicianName ? (
                    <div className="text-xs space-y-1.5 text-slate-300">
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <HardHat className="w-4 h-4 text-amber-400" />
                        {workOrder.technicianName}
                      </p>
                      <p><strong className="text-slate-400">Specialization:</strong> {workOrder.technicianSpecialization}</p>
                      {workOrder.technicianPhone && (
                        <p><strong className="text-slate-400">Phone:</strong> {workOrder.technicianPhone}</p>
                      )}
                      {workOrder.scheduledStart && (
                        <p><strong className="text-slate-400">Scheduled:</strong> {new Date(workOrder.scheduledStart).toLocaleDateString()} {new Date(workOrder.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      )}
                    </div>
                  ) : (
                    <div className="py-3 text-center text-xs text-slate-500">
                      No technician currently assigned to this order.
                    </div>
                  )}

                  {/* Quick Direct Assign/Switch for Admin */}
                  {(role === 'ROLE_ADMIN' || role === 'ROLE_DISPATCHER') && technicians.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-700/60 mt-2 space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 block">
                        Quick Assign / Change Fleet Crew:
                      </label>
                      <select
                        value={workOrder.technicianId || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val) handleQuickAssignTechnician(val);
                        }}
                        disabled={isAssigningTech}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500 font-medium disabled:opacity-50"
                      >
                        <option value="" disabled>-- Select Fleet Technician --</option>
                        {technicians.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} — {t.specialization} ({t.status.replace('_', ' ')})
                          </option>
                        ))}
                      </select>
                      {isAssigningTech && (
                        <p className="text-[10px] text-brand-400 animate-pulse font-mono">
                          Assigning crew to work order...
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* Financial Summary */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Accumulated Job Costs
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-850/60 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Labor Cost</span>
                    <span className="font-mono text-base font-bold text-slate-200">
                      ${(workOrder.totalLaborCost || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-850/60 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Parts Cost</span>
                    <span className="font-mono text-base font-bold text-slate-200">
                      ${(workOrder.totalPartsCost || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/30">
                    <span className="text-xs text-brand-300 block mb-1">Total Maintenance</span>
                    <span className="font-mono text-base font-extrabold text-brand-400">
                      ${(workOrder.totalCost || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolution Notes & Feedback (if completed) */}
              {workOrder.resolutionNotes && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Resolution Summary
                  </h4>
                  <p className="text-sm text-slate-200">{workOrder.resolutionNotes}</p>

                  {workOrder.customerRating && (
                    <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center gap-3">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= (workOrder.customerRating || 0) ? 'fill-amber-400' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-300 italic">
                        "{workOrder.customerFeedback || 'No written feedback'}"
                      </span>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB: PARTS */}
          {activeTab === 'parts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Parts & Consumables Logged</h4>
                <button
                  onClick={() => setShowAddPart(!showAddPart)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Part Consumption
                </button>
              </div>

              {showAddPart && (
                <form onSubmit={handleAddPart} className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Select Part from Inventory</label>
                      <select
                        value={selectedPartId}
                        onChange={(e) => setSelectedPartId(Number(e.target.value))}
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        <option value="">-- Choose part --</option>
                        {partsCatalog.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.stockQuantity <= 0}>
                            {p.name} ({p.partNumber}) - ${p.unitPrice.toFixed(2)} ({p.stockQuantity} in stock)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-medium">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={partQty}
                        onChange={(e) => setPartQty(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPart(false)}
                      className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating || !selectedPartId}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                    >
                      Confirm Deduction
                    </button>
                  </div>
                </form>
              )}

              {workOrder.partsUsed?.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No parts recorded for this work order yet.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-850 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Part Details</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {workOrder.partsUsed?.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-200 block">{item.partName}</span>
                            <span className="font-mono text-[10px] text-slate-500">{item.partNumber}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-300">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono">${(item.unitPrice || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-brand-400 font-mono font-semibold">${(item.totalCost || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: LABOR */}
          {activeTab === 'labor' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">Technician Time Logs</h4>

              {workOrder.timeEntries?.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No labor time recorded for this job.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-850 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Technician</th>
                        <th className="py-2.5 px-3">Entry Type</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Hourly Rate</th>
                        <th className="py-2.5 px-3 text-right">Labor Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {workOrder.timeEntries?.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2.5 px-3 font-medium text-slate-200">{t.technicianName}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 border border-slate-700 text-slate-300">
                              {t.entryType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-mono">{t.durationMinutes || 0} mins</td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono">${(t.hourlyRate || 0).toFixed(2)}/hr</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-mono font-semibold">
                            ${(t.laborCost || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Immutable Event Timeline</h4>
              
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {workOrder.auditLogs?.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-slate-900" />
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">
                          {log.performedByName} • <span className="text-brand-400">{log.action}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300">{log.notes || 'Status transitioned'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer: Status Transition Quick Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Current Status: <span className="font-semibold text-white">{workOrder.status}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {workOrder.status === 'OPEN' && (
              <button
                onClick={() => handleStatusChange('TRIAGED')}
                disabled={isUpdating}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Mark Triaged
              </button>
            )}

            {workOrder.status === 'ASSIGNED' && (
              <button
                onClick={() => handleStatusChange('EN_ROUTE')}
                disabled={isUpdating}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Start Travel (En Route)
              </button>
            )}

            {workOrder.status === 'EN_ROUTE' && (
              <button
                onClick={() => handleStatusChange('ON_SITE')}
                disabled={isUpdating}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Arrive On Site
              </button>
            )}

            {(workOrder.status === 'ON_SITE' || workOrder.status === 'ON_HOLD') && !showResolutionForm && (
              <>
                <button
                  onClick={() => handleStatusChange(workOrder.status === 'ON_HOLD' ? 'ON_SITE' : 'ON_HOLD')}
                  disabled={isUpdating}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  {workOrder.status === 'ON_HOLD' ? 'Resume Work' : 'Place On Hold'}
                </button>
                <button
                  onClick={() => setShowResolutionForm(true)}
                  disabled={isUpdating}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Resolve & Complete
                </button>
              </>
            )}

            {workOrder.status === 'COMPLETED' && (
              <button
                onClick={() => handleStatusChange('CLOSED')}
                disabled={isUpdating}
                className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Close & Archive
              </button>
            )}
          </div>
        </div>

        {/* Inline Resolution Notes Submission Overlay */}
        {showResolutionForm && (
          <div className="p-4 bg-slate-850 border-t border-slate-700">
            <form onSubmit={handleResolve} className="space-y-3">
              <label className="text-xs font-semibold text-white block">
                Work Resolution Notes (Required to complete work order):
              </label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Describe corrective actions taken, parts installed, tests performed..."
                rows={2}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolutionForm(false)}
                  className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !resolutionText.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  Submit Completion
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
