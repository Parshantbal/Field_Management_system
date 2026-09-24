import React, { useState, useEffect } from 'react';
import { WorkOrder, TimeEntry, Part, WorkOrderStatus } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  HardHat,
  Play,
  Square,
  Boxes,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  Navigation,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface TechnicianFieldViewProps {
  workOrders: WorkOrder[];
  partsCatalog: Part[];
  onRefresh: () => void;
  onSelectWorkOrder: (id: number) => void;
}

export const TechnicianFieldView: React.FC<TechnicianFieldViewProps> = ({
  workOrders,
  partsCatalog,
  onRefresh,
  onSelectWorkOrder,
}) => {
  const { user } = useAuth();
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [isTimerLoading, setIsTimerLoading] = useState<boolean>(false);
  const [selectedWoForPart, setSelectedWoForPart] = useState<WorkOrder | null>(null);
  const [partId, setPartId] = useState<number>(0);
  const [partQty, setPartQty] = useState<number>(1);
  const [resolvingWo, setResolvingWo] = useState<WorkOrder | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const fetchActiveTimer = async () => {
    try {
      const timer = await api.technicians.getActiveTimer();
      setActiveTimer(timer);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchActiveTimer();
    const interval = setInterval(fetchActiveTimer, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders where technician is assigned or active
  const myAssignedOrders = workOrders.filter(
    (wo) =>
      wo.technicianName === user?.fullName ||
      (wo.status === 'ASSIGNED' ||
        wo.status === 'EN_ROUTE' ||
        wo.status === 'ON_SITE' ||
        wo.status === 'ON_HOLD')
  );

  const handleStartTimer = async (workOrderId: number, type: 'TRAVEL' | 'ON_SITE') => {
    setIsTimerLoading(true);
    try {
      await api.technicians.startTimer(workOrderId, type);
      await fetchActiveTimer();
      onRefresh();
    } catch (err: any) {
      alert(`Could not start timer: ${err.message}`);
    } finally {
      setIsTimerLoading(false);
    }
  };

  const handleStopTimer = async () => {
    setIsTimerLoading(true);
    try {
      await api.technicians.stopTimer('Clocked out by technician');
      setActiveTimer(null);
      onRefresh();
    } catch (err: any) {
      alert(`Could not stop timer: ${err.message}`);
    } finally {
      setIsTimerLoading(false);
    }
  };

  const handleStatusTransition = async (woId: number, status: WorkOrderStatus) => {
    try {
      await api.workOrders.changeStatus(woId, status);
      onRefresh();
    } catch (err: any) {
      alert(`Status transition failed: ${err.message}`);
    }
  };

  const handleConsumePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWoForPart || !partId) return;
    try {
      await api.inventory.consumePart(selectedWoForPart.id, partId, partQty);
      setSelectedWoForPart(null);
      setPartId(0);
      setPartQty(1);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to log part: ${err.message}`);
    }
  };

  const handleCompleteWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingWo || !resolutionNotes.trim()) return;
    try {
      if (activeTimer) {
        await api.technicians.stopTimer('Completed job');
      }
      await api.workOrders.resolve(resolvingWo.id, resolutionNotes);
      setResolvingWo(null);
      setResolutionNotes('');
      onRefresh();
    } catch (err: any) {
      alert(`Failed to complete work order: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Technician Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 shadow-xs">
              <HardHat className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Technician Field Console</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Logged in as: <strong className="text-slate-900 dark:text-slate-200">{user?.fullName}</strong> ({user?.email})
          </p>
        </div>

        {/* Live Active Clock Widget */}
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${
          activeTimer
            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 animate-pulse'
            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider block">Job Clock Status</span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {activeTimer ? `ACTIVE (${activeTimer.entryType})` : 'NO CLOCK ACTIVE'}
            </p>
          </div>

          {activeTimer && (
            <button
              onClick={handleStopTimer}
              disabled={isTimerLoading}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Clock Out
            </button>
          )}
        </div>
      </div>

      {/* Active Work Orders */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>My Active Field Jobs ({myAssignedOrders.length})</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Sorted by urgency</span>
        </h2>

        {myAssignedOrders.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-500 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            No active work orders currently assigned to you.
          </div>
        ) : (
          <div className="space-y-4">
            {myAssignedOrders.map((wo) => {
              const isOnSite = wo.status === 'ON_SITE';
              const isEnRoute = wo.status === 'EN_ROUTE';
              const isAssigned = wo.status === 'ASSIGNED';

              return (
                <div
                  key={wo.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 transition-all space-y-4 shadow-sm"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-300 dark:border-amber-500/20">
                        {wo.workOrderNumber}
                      </span>
                      <PriorityBadge priority={wo.priority} />
                      <StatusBadge status={wo.status} />
                    </div>

                    <SlaCountdown
                      dueTime={wo.resolutionSlaDue}
                      resolvedAt={wo.resolvedAt}
                      riskLevel={wo.slaRiskLevel}
                    />
                  </div>

                  {/* Title & Facility */}
                  <div>
                    <h3
                      onClick={() => onSelectWorkOrder(wo.id)}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                    >
                      {wo.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        {wo.facilityName}
                      </span>
                      <span>•</span>
                      <span>{wo.facilityAddress}</span>
                      {wo.assetName && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 dark:text-amber-300 font-mono font-medium">Asset: {wo.assetName}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Scope of Work */}
                  <p className="text-xs text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-850/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
                    {wo.description}
                  </p>

                  {/* Parts and Labor Counters */}
                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <span>Parts: <strong className="text-slate-900 dark:text-white">{wo.partsUsed?.length || 0}</strong> logged</span>
                    <span>•</span>
                    <span>Total Cost: <strong className="text-amber-700 dark:text-brand-400 font-mono font-bold">${(wo.totalCost || 0).toFixed(2)}</strong></span>
                  </div>

                  {/* Field Actions Toolbar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {/* En Route button */}
                      {isAssigned && (
                        <button
                          onClick={() => {
                            handleStatusTransition(wo.id, 'EN_ROUTE');
                            handleStartTimer(wo.id, 'TRAVEL');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Start Travel (En Route)
                        </button>
                      )}

                      {/* Arrived On Site button */}
                      {isEnRoute && (
                        <button
                          onClick={() => {
                            handleStatusTransition(wo.id, 'ON_SITE');
                            if (activeTimer) handleStopTimer();
                            handleStartTimer(wo.id, 'ON_SITE');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Arrived On Site (Clock In)
                        </button>
                      )}

                      {/* Log Parts Consumption */}
                      {isOnSite && (
                        <button
                          onClick={() => setSelectedWoForPart(wo)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                        >
                          <Boxes className="w-3.5 h-3.5 text-brand-400" />
                          Log Parts Used
                        </button>
                      )}

                      {/* Resolve Work Order */}
                      {isOnSite && (
                        <button
                          onClick={() => setResolvingWo(wo)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete & Sign-off
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectWorkOrder(wo.id)}
                      className="text-xs text-slate-400 hover:text-white font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Part Consumption Modal */}
      {selectedWoForPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Deduct Warehouse Part
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For: <strong className="text-slate-900 dark:text-white font-mono">{selectedWoForPart.workOrderNumber}</strong> - {selectedWoForPart.title}
            </p>

            <form onSubmit={handleConsumePart} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-1">Part SKU / Item</label>
                <select
                  value={partId}
                  onChange={(e) => setPartId(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">-- Choose part from van inventory --</option>
                  {partsCatalog.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stockQuantity <= 0}>
                      {p.name} [{p.partNumber}] - ${p.unitPrice.toFixed(2)} ({p.stockQuantity} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-1">Quantity Used</label>
                <input
                  type="number"
                  min="1"
                  value={partQty}
                  onChange={(e) => setPartQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedWoForPart(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!partId}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingWo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Complete Work Order & Close Ticket
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Work Order: <strong className="text-slate-900 dark:text-white font-mono">{resolvingWo.workOrderNumber}</strong>
            </p>

            <form onSubmit={handleCompleteWorkOrder} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Technician Resolution Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail all repairs executed, replaced components, system pressure checks, and safety tests performed..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Clock timer will automatically stop and final labor cost will be computed.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolvingWo(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!resolutionNotes.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Finalize & Sign Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
