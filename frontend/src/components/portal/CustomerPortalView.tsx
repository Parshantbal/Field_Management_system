import React, { useState, useEffect } from 'react';
import { WorkOrder, Facility, Asset, Priority, AdminProvider } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Plus,
  Clock,
  Star,
  CheckCircle2,
  Send,
  MessageSquare,
  HardHat,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface CustomerPortalViewProps {
  facilities: Facility[];
  onSelectWorkOrder: (id: number) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  facilities,
  onSelectWorkOrder,
}) => {
  const { user } = useAuth();
  const [myTickets, setMyTickets] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  // New Request Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [admins, setAdmins] = useState<AdminProvider[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<number | undefined>(undefined);
  const [adminFacilities, setAdminFacilities] = useState<Facility[]>(facilities);
  const [facilityId, setFacilityId] = useState<number>(facilities[0]?.id || 1);
  const [assetId, setAssetId] = useState<number | undefined>(undefined);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback Modal
  const [feedbackTicket, setFeedbackTicket] = useState<WorkOrder | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedbackComments, setFeedbackComments] = useState<string>('');

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const tickets = await api.portal.getMyTickets();
      setMyTickets(tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const list = await api.portal.getAdmins();
      setAdmins(list);
      if (list && list.length > 0) {
        // Prefer user's existing adminId or the first admin
        const initial = list.find(a => a.id === user?.adminId)?.id || list[0].id;
        setSelectedAdminId(initial);
      }
    } catch (err) {
      console.error('Failed to load operations admins:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchAdmins();
  }, []);

  // When selectedAdminId changes, load facilities belonging to this admin
  useEffect(() => {
    if (selectedAdminId) {
      api.facilities.getAll(selectedAdminId)
        .then((facs) => {
          setAdminFacilities(facs);
          if (facs && facs.length > 0) {
            setFacilityId(facs[0].id);
          }
        })
        .catch(console.error);
    } else if (facilities && facilities.length > 0) {
      setAdminFacilities(facilities);
      setFacilityId(facilities[0].id);
    }
  }, [selectedAdminId, facilities]);

  useEffect(() => {
    if (facilityId) {
      api.facilities.getAssets(facilityId).then(setAssets).catch(console.error);
    } else {
      setAssets([]);
    }
  }, [facilityId]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.portal.submitRequest({
        title: title.trim(),
        description: description.trim(),
        priority,
        facilityId: facilityId || (adminFacilities[0]?.id || undefined),
        assetId: assetId || undefined,
        adminId: selectedAdminId,
      });
      setShowNewRequestModal(false);
      setTitle('');
      setDescription('');
      await fetchTickets();
    } catch (err: any) {
      alert(`Request submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTicket) return;
    try {
      await api.portal.submitFeedback(feedbackTicket.id, rating, feedbackComments);
      setFeedbackTicket(null);
      setFeedbackComments('');
      await fetchTickets();
    } catch (err: any) {
      alert(`Feedback submission failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 shadow-xs">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Facility Tenant Self-Service Portal</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Welcome, <strong className="text-slate-900 dark:text-slate-200">{user?.fullName}</strong>. Submit maintenance requests, monitor technician dispatches, and review completed work.
          </p>
        </div>

        <button
          onClick={() => setShowNewRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/25 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Submit Service Request
        </button>
      </div>

      {/* Active Service Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">My Maintenance Requests ({myTickets.length})</h2>
          <button
            onClick={fetchTickets}
            className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-bold transition-colors cursor-pointer"
          >
            Refresh Tickets
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">Loading your service tickets...</div>
        ) : myTickets.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-500 shadow-sm">
            <Building2 className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-bold text-slate-900 dark:text-white">No active requests logged.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Need repairs, temperature adjustment, or equipment inspection? Click "Submit Service Request" above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myTickets.map((ticket) => {
              const isResolved = ticket.status === 'COMPLETED' || ticket.status === 'CLOSED';
              const needsRating = ticket.status === 'COMPLETED' && !ticket.customerRating;

              return (
                <div
                  key={ticket.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 transition-all space-y-3.5 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-200 dark:border-purple-500/20">
                        {ticket.workOrderNumber}
                      </span>
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>

                    <SlaCountdown
                      dueTime={ticket.resolutionSlaDue}
                      resolvedAt={ticket.resolvedAt}
                      riskLevel={ticket.slaRiskLevel}
                    />
                  </div>

                  <div>
                    <h3
                      onClick={() => onSelectWorkOrder(ticket.id)}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
                    >
                      {ticket.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.facilityName}</span>
                      {ticket.assetName && (
                        <>
                          <span>•</span>
                          <span>Asset: {ticket.assetName}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
                    {ticket.description}
                  </p>

                  {/* Technician ETA / Assigned info */}
                  {ticket.technicianName && (
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-slate-800/40 border border-amber-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <HardHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Assigned Specialist: <strong className="text-slate-900 dark:text-white font-bold">{ticket.technicianName}</strong></span>
                      </div>
                      {ticket.technicianPhone && (
                        <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">{ticket.technicianPhone}</span>
                      )}
                    </div>
                  )}

                  {/* Resolution Notes */}
                  {ticket.resolutionNotes && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-slate-800 dark:text-slate-200">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">Technician Resolution Summary:</strong>
                      {ticket.resolutionNotes}
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80">
                    {needsRating ? (
                      <button
                        onClick={() => setFeedbackTicket(ticket)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-bold rounded-xl border border-amber-300 dark:border-amber-500/40 transition-all cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        Rate Completed Service
                      </button>
                    ) : ticket.customerRating ? (
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Your rating:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (ticket.customerRating || 0) ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                        Submitted {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    )}

                    <button
                      onClick={() => onSelectWorkOrder(ticket.id)}
                      className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-bold cursor-pointer"
                    >
                      View Live Timeline →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Submit New Facility Service Request
              </h3>
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5">
              {/* Operations Admin / Service Provider Selector */}
              <div className="bg-purple-50/70 dark:bg-slate-950/80 p-3.5 rounded-xl border border-purple-200 dark:border-purple-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Target Operations Admin / Provider *
                  </label>
                  {selectedAdminId && (
                    <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded border border-purple-300 dark:border-purple-800 font-bold">
                      Admin ID: #{selectedAdminId}
                    </span>
                  )}
                </div>
                <select
                  value={selectedAdminId || ''}
                  onChange={(e) => setSelectedAdminId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  required
                >
                  <option value="" disabled>-- Select Operations Admin --</option>
                  {admins.map((adm) => (
                    <option key={adm.id} value={adm.id}>
                      {adm.name} (Admin ID: #{adm.id}) {adm.email ? `- ${adm.email}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  This complaint will be routed directly to this Admin for review and technician dispatch.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Issue Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14th Floor Conference Room AC Blowing Warm Air"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Urgency / Priority *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="CRITICAL">Critical (Safety hazard, outage)</option>
                    <option value="HIGH">High (Major discomfort, partial system)</option>
                    <option value="MEDIUM">Medium (General repair)</option>
                    <option value="LOW">Low (Cosmetic, scheduled)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Facility *</label>
                  <select
                    value={facilityId}
                    onChange={(e) => setFacilityId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    {adminFacilities && adminFacilities.length > 0 ? (
                      adminFacilities.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))
                    ) : (
                      <option value={1}>Primary Service Hub (Auto-created)</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Impacted Equipment / Area</label>
                <select
                  value={assetId || ''}
                  onChange={(e) => setAssetId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">-- General area / Not sure --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe location (suite, floor), specific symptoms, and any immediate business impact..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Feedback Modal */}
      {feedbackTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Rate Completed Maintenance Service
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Work Order: <strong className="text-slate-900 dark:text-white font-mono">{feedbackTicket.workOrderNumber}</strong>
            </p>

            <form onSubmit={handleSendFeedback} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Service Satisfaction Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setRating(starVal)}
                      className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          starVal <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Feedback Comments</label>
                <textarea
                  rows={3}
                  placeholder="How was the response time, technician professionalism, and resolution quality?"
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFeedbackTicket(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
