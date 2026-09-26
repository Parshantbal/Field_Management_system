import React, { useState } from 'react';
import { WorkOrder, Technician, TechnicianRecommendation } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import { api } from '../../api/client';
import {
  Radio,
  HardHat,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  X,
  Phone,
  Award,
  Zap,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface DispatchBoardProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  onRefresh: () => void;
  onSelectWorkOrder: (id: number) => void;
}

export const DispatchBoard: React.FC<DispatchBoardProps> = ({
  workOrders,
  technicians,
  onRefresh,
  onSelectWorkOrder,
}) => {
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<WorkOrder | null>(null);
  const [recommendations, setRecommendations] = useState<TechnicianRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  // Scheduling inputs
  const [dispatchTechId, setDispatchTechId] = useState<number | null>(null);
  const [scheduledStart, setScheduledStart] = useState<string>('');
  const [scheduledEnd, setScheduledEnd] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Unassigned, rejected, or pending acceptance orders needing dispatch attention
  const unassignedOrders = workOrders.filter(
    (wo) =>
      wo.dispatchStatus === 'REJECTED' ||
      wo.status === 'OPEN' ||
      wo.status === 'TRIAGED' ||
      (!wo.technicianId && wo.dispatchStatus !== 'ACCEPTED') ||
      wo.dispatchStatus === 'PENDING_ACCEPTANCE'
  );

  const handleOpenSmartDispatch = async (wo: WorkOrder) => {
    if (wo.dispatchStatus === 'ACCEPTED') {
      alert(`Technician ${wo.technicianName || 'Specialist'} has already accepted this assignment. Assignment is locked.`);
      return;
    }
    setSelectedOrderForDispatch(wo);
    setIsLoadingRecs(true);
    try {
      const recs = await api.dispatch.getRecommendations(wo.id);
      setRecommendations(recs);
      if (recs.length > 0) {
        setDispatchTechId(recs[0].technicianId);
      } else if (technicians.length > 0) {
        setDispatchTechId(technicians[0].id);
      }
      // Set default schedule to next 2 hours
      const now = new Date();
      const later = new Date(now.getTime() + 2 * 3600000);
      setScheduledStart(now.toISOString().slice(0, 16));
      setScheduledEnd(later.toISOString().slice(0, 16));
    } catch (err: any) {
      alert(`Failed to compute recommendations: ${err.message}`);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDispatch || !dispatchTechId) return;

    setIsDispatching(true);
    try {
      await api.dispatch.schedule({
        workOrderId: selectedOrderForDispatch.id,
        technicianId: dispatchTechId,
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: new Date(scheduledEnd).toISOString(),
        dispatcherNotes: notes,
      });
      setSelectedOrderForDispatch(null);
      onRefresh();
    } catch (err: any) {
      alert(`Dispatch failed: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-brand-400" />
            Smart Dispatch Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Algorithmic technician skill-matching, availability scheduling, and dispatch routing.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{technicians.filter((t) => t.status === 'AVAILABLE').length} Available Crews</span>
        </div>
      </div>

      {/* Main Grid: Unassigned Queue on Left, Technician Fleet on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Unassigned Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">Pending Dispatch Queue</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {unassignedOrders.length} Waiting
            </span>
          </div>

          {unassignedOrders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              All active tickets have been dispatched to field crews.
            </div>
          ) : (
            <div className="space-y-3">
              {unassignedOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-bold text-brand-400">{wo.workOrderNumber}</span>
                      <PriorityBadge priority={wo.priority} />
                      <StatusBadge status={wo.status} />
                    </div>

                    <h4
                      onClick={() => onSelectWorkOrder(wo.id)}
                      className="text-sm font-bold text-white hover:text-brand-400 transition-colors cursor-pointer truncate"
                    >
                      {wo.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {wo.facilityName}
                      </span>
                      {wo.assetCategory && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-slate-300">Require: {wo.assetCategory}</span>
                        </>
                      )}
                    </div>

                    {/* Rejection Alert */}
                    {wo.dispatchStatus === 'REJECTED' && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <div>
                          <strong className="text-rose-200">Assignment Declined:</strong> {wo.dispatchRejectionReason || 'Technician busy / unable to accept'}. Please assign another technician.
                        </div>
                      </div>
                    )}

                    {/* Pending Acceptance Indicator */}
                    {wo.dispatchStatus === 'PENDING_ACCEPTANCE' && (
                      <div className="mt-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                        <span>Request sent to <strong>{wo.technicianName}</strong> — Awaiting technician confirmation.</span>
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <SlaCountdown
                      dueTime={wo.resolutionSlaDue}
                      riskLevel={wo.slaRiskLevel}
                    />

                    {wo.dispatchStatus === 'ACCEPTED' ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Locked (Accepted)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenSmartDispatch(wo)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-xl shadow-md transition-all ${
                          wo.dispatchStatus === 'REJECTED'
                            ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                            : 'bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 shadow-brand-600/30'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        {wo.dispatchStatus === 'REJECTED' ? 'Reassign Tech' : (wo.dispatchStatus === 'PENDING_ACCEPTANCE' ? 'Update Dispatch' : 'Smart Dispatch')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Technician Fleet Directory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-sky-400" />
              <h3 className="text-base font-bold text-white">Technician Fleet Status</h3>
            </div>
            <span className="text-xs text-slate-400">{technicians.length} Field Technicians</span>
          </div>

          <div className="space-y-3">
            {technicians.map((tech) => {
              const isAvail = tech.status === 'AVAILABLE';
              const isOnJob = tech.status === 'ON_JOB';

              return (
                <div
                  key={tech.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{tech.name}</h4>
                      <p className="text-xs text-slate-400">{tech.specialization}</p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        isAvail
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isOnJob
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-700 text-slate-400 border-slate-600'
                      }`}
                    >
                      {tech.status.replace('_', ' ')}
                    </span>
                  </div>

                  {tech.certifications && (
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{tech.certifications}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono font-semibold text-slate-300">${tech.hourlyRate.toFixed(2)}/hr</span>
                    <span>{tech.activeJobsCount} Active Jobs</span>
                    <span className="text-amber-400 font-semibold">★ {tech.rating.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Smart Dispatch Recommendation Modal */}
      {selectedOrderForDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Smart Dispatch Recommendation</h3>
                  <p className="text-xs text-slate-400">Matching {selectedOrderForDispatch.workOrderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForDispatch(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleConfirmDispatch} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Order quick overview */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-1">
                <p className="font-bold text-white">{selectedOrderForDispatch.title}</p>
                <p className="text-slate-400">
                  Facility: <span className="text-slate-200">{selectedOrderForDispatch.facilityName}</span> |
                  Category: <span className="text-brand-400 font-semibold">{selectedOrderForDispatch.assetCategory || 'General'}</span>
                </p>
              </div>

              {/* Recommendations list */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Ranked Technician Matches (By Skill Fit & Availability)
                </label>

                {isLoadingRecs ? (
                  <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    Calculating skill match scores...
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      No automated skill match found
                    </p>
                    <p className="text-slate-400">
                      Please manually select a technician from your fleet dropdown below to assign this ticket.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recommendations.map((rec) => {
                      const isSelected = dispatchTechId === rec.technicianId;
                      return (
                        <div
                          key={rec.technicianId}
                          onClick={() => setDispatchTechId(rec.technicianId)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-brand-500/15 border-brand-500 text-white shadow-md ring-1 ring-brand-500/50'
                              : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{rec.name}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  rec.status === 'AVAILABLE'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {rec.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{rec.specialization}</p>
                            <p className="text-[11px] text-brand-300/80 mt-1 italic">{rec.matchReason}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-lg font-extrabold text-emerald-400">
                              {rec.matchScore}%
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                              Match Score
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Direct Fleet Selection Dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>Selected Field Technician *</span>
                  <span className="text-[11px] text-slate-400">
                    {technicians.length} technician{technicians.length !== 1 ? 's' : ''} in fleet
                  </span>
                </label>
                <select
                  value={dispatchTechId || ''}
                  onChange={(e) => setDispatchTechId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="" disabled>-- Select a Technician --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.specialization} ({t.status.replace('_', ' ')}) [${t.hourlyRate?.toFixed(2)}/hr]
                    </option>
                  ))}
                </select>
              </div>

              {/* Scheduling window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Schedule Window Start</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Schedule Window End</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledEnd}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Dispatcher Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Check in with security at loading dock B2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDispatch(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching || !dispatchTechId}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/30 disabled:opacity-50"
                >
                  {isDispatching ? 'Assigning...' : 'Confirm Dispatch Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
