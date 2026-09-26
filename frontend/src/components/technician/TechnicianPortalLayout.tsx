import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TechnicianFieldView } from './TechnicianFieldView';
import { WorkOrder, Part, NotificationItem } from '../../types';
import { api } from '../../api/client';
import {
  HardHat,
  LogOut,
  Bell,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import { WorkOrderDetailModal } from '../workorders/WorkOrderDetailModal';
import { ThemeToggle } from '../common/ThemeToggle';

export const TechnicianPortalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<number | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [allOrders, myOrders, partsList] = await Promise.all([
        api.workOrders.getAll().catch(() => []),
        api.workOrders.getMy().catch(() => []),
        api.inventory.getParts().catch(() => []),
      ]);
      const orderMap = new Map<number, WorkOrder>();
      [...allOrders, ...myOrders].forEach((wo) => {
        if (wo && wo.id) orderMap.set(wo.id, wo);
      });
      setWorkOrders(Array.from(orderMap.values()));
      setParts(partsList);
      loadNotifications();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
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

  const selectedWorkOrder = workOrders.find((w) => w.id === selectedWorkOrderId) || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Technician Isolated Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-400/40 shrink-0">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">KEYSTONE</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 sm:px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 whitespace-nowrap">
                    Technician
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Mobile Dispatch & On-Site Execution</p>
              </div>
            </div>

            {/* Right Technician Bar */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Theme Toggle (Dark / Light) */}
              <ThemeToggle />

              {/* Refresh button */}
              <button
                onClick={loadData}
                disabled={isRefreshing}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                title="Refresh jobs"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600 dark:text-amber-400' : ''}`} />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 relative transition-all cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
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
                        <p className="text-xs text-slate-500 text-center py-6">No notifications</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-xl border text-xs transition-all ${
                              notif.read
                                ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-200">{notif.title}</span>
                              {!notif.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="text-[10px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-0.5"
                                >
                                  <Check className="w-3 h-3" /> Read
                                </button>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{notif.message}</p>
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

              {/* Technician Info */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center font-bold text-xs text-amber-800 dark:text-amber-300">
                  {user?.firstName?.[0] || 'T'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{user?.fullName || 'Technician'}</div>
                  <div className="text-[10px] font-medium text-amber-600 dark:text-amber-400">{user?.email}</div>
                </div>
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer"
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
        <TechnicianFieldView
          workOrders={workOrders}
          partsCatalog={parts}
          onRefresh={loadData}
          onSelectWorkOrder={(id) => setSelectedWorkOrderId(id)}
        />
      </main>

      {/* Work Order Inspection Modal */}
      {selectedWorkOrder && (
        <WorkOrderDetailModal
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrderId(null)}
          onRefresh={loadData}
          partsCatalog={parts}
        />
      )}
    </div>
  );
};
