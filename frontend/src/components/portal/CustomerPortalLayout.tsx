import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CustomerPortalView } from './CustomerPortalView';
import { Facility, NotificationItem, WorkOrder } from '../../types';
import { api } from '../../api/client';
import {
  Wrench,
  Building2,
  LogOut,
  Bell,
  Check,
  X,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { WorkOrderDetailModal } from '../workorders/WorkOrderDetailModal';
import { ThemeToggle } from '../common/ThemeToggle';

export const CustomerPortalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<WorkOrder | null>(null);

  const loadData = async () => {
    try {
      const facs = await api.facilities.getAll().catch(() => []);
      setFacilities(facs);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const loadNotifications = async () => {
    try {
      const list = await api.notifications.getAll().catch(() => []);
      setNotifications(list);
      const unread = await api.notifications.getUnreadCount().catch(() => ({ count: 0 }));
      setUnreadCount(unread.count);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.notifications.markAsRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectWorkOrder = async (id: number) => {
    setSelectedTicketId(id);
    try {
      const wo = await api.workOrders.getById(id);
      setSelectedTicket(wo);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Customer Isolated Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-md shadow-purple-500/20 border border-purple-400/40">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">KEYSTONE</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                    Customer Portal
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Facilities Maintenance & Tenant Requests</p>
              </div>
            </div>

            {/* Right User Bar - Strictly Customer info and Logout, NO ADMIN ID */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle (Dark / Light) */}
              <ThemeToggle />

              {/* Notifications dropdown toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 relative transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Drawer */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                      </div>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-6">No notifications yet</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-xl border text-xs transition-all ${
                              notif.read
                                ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400'
                                : 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-500/30 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-200">{notif.title}</span>
                              {!notif.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="text-[10px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-0.5"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" /> Read
                                </button>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-mono">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tenant Details */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-700 dark:text-purple-300">
                  {user?.firstName?.[0] || 'C'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{user?.fullName || 'Customer'}</div>
                  <div className="text-[10px] font-medium text-purple-600 dark:text-purple-400">{user?.email}</div>
                </div>
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <CustomerPortalView
          facilities={facilities}
          onSelectWorkOrder={handleSelectWorkOrder}
        />
      </main>

      {/* Ticket Details Inspection Modal if Customer Clicks Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">{selectedTicket.workOrderNumber}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTicket.title}</h3>
              </div>
              <button
                onClick={() => { setSelectedTicket(null); setSelectedTicketId(null); }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Status</span>
                  <p className="font-bold text-slate-900 dark:text-slate-200">{selectedTicket.status}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Facility</span>
                  <p className="font-bold text-slate-900 dark:text-slate-200">{selectedTicket.facilityName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Assigned Technician</span>
                  <p className="font-bold text-slate-900 dark:text-slate-200">{selectedTicket.technicianName || 'Pending Assignment'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Priority</span>
                  <p className="font-bold text-slate-900 dark:text-slate-200">{selectedTicket.priority}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Description</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-950/30 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.resolutionNotes && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Technician Resolution Notes</span>
                  <p className="text-emerald-900 dark:text-emerald-200 text-sm mt-1">{selectedTicket.resolutionNotes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => { setSelectedTicket(null); setSelectedTicketId(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
