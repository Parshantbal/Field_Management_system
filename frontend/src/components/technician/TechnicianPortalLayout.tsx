import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { TechnicianFieldView } from './TechnicianFieldView';
import { WorkOrder, Part, NotificationItem, TimeEntry } from '../../types';
import { api } from '../../api/client';
import {
  HardHat,
  LogOut,
  Bell,
  Check,
  X,
  RefreshCw,
  Menu,
  Square,
  Boxes,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  Search,
  AlertCircle,
  Tag
} from 'lucide-react';
import { WorkOrderDetailModal } from '../workorders/WorkOrderDetailModal';
import { ThemeToggle } from '../common/ThemeToggle';

export const TechnicianPortalLayout: React.FC = () => {
  const { user, logout, quickSwitch } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<number | null>(null);

  // Responsive Navigation & Drawer States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OFFERS' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState<boolean>(false);

  // Active Timer Tracker
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [isTimerLoading, setIsTimerLoading] = useState<boolean>(false);

  // Van Inventory Modal
  const [showVanPartsModal, setShowVanPartsModal] = useState<boolean>(false);
  const [partsSearch, setPartsSearch] = useState<string>('');

  const fetchActiveTimer = useCallback(async () => {
    try {
      const timer = await api.technicians.getActiveTimer();
      setActiveTimer(timer);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const list = await api.notifications.getAll().catch(() => []);
      setNotifications(list);
      const unread = await api.notifications.getUnreadCount().catch(() => ({ count: 0 }));
      setUnreadCount(unread.count);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadData = useCallback(async () => {
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
      await Promise.all([
        loadNotifications(),
        fetchActiveTimer(),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadNotifications, fetchActiveTimer]);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadNotifications();
      fetchActiveTimer();
    }, 15000);
    return () => clearInterval(timer);
  }, [loadData, loadNotifications, fetchActiveTimer]);

  const handleStopTimer = async () => {
    setIsTimerLoading(true);
    try {
      await api.technicians.stopTimer('Clocked out from mobile drawer');
      setActiveTimer(null);
      await loadData();
    } catch (err: any) {
      alert(`Could not stop timer: ${err.message}`);
    } finally {
      setIsTimerLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.notifications.markAsRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Technician order matching & stats
  const isForMe = useCallback((wo: WorkOrder) => {
    if (!user) return false;
    if (user.technicianId && wo.technicianId === user.technicianId) return true;
    if (user.id && wo.technicianId === user.id) return true;
    if (wo.technicianName && user.fullName) {
      const wName = wo.technicianName.trim().toLowerCase();
      const uName = user.fullName.trim().toLowerCase();
      if (wName === uName || wName.includes(uName) || uName.includes(wName)) return true;
    }
    if (wo.technicianName && user.firstName) {
      if (wo.technicianName.toLowerCase().includes(user.firstName.toLowerCase())) return true;
    }
    if (wo.technicianName && user.email) {
      const prefix = user.email.split('@')[0].toLowerCase();
      if (wo.technicianName.toLowerCase().includes(prefix)) return true;
    }
    return false;
  }, [user]);

  const matchedOrders = workOrders.filter(isForMe);
  const effectiveOrders = matchedOrders.length > 0
    ? matchedOrders
    : workOrders.filter(wo => wo.status === 'ASSIGNED' || wo.dispatchStatus === 'PENDING_ACCEPTANCE');

  const pendingOffersCount = effectiveOrders.filter(
    (wo) => wo.dispatchStatus === 'PENDING_ACCEPTANCE'
  ).length;

  const activeJobsCount = effectiveOrders.filter(
    (wo) =>
      wo.dispatchStatus !== 'PENDING_ACCEPTANCE' &&
      wo.dispatchStatus !== 'REJECTED' &&
      (wo.status === 'ASSIGNED' ||
        wo.status === 'EN_ROUTE' ||
        wo.status === 'ON_SITE' ||
        wo.status === 'ON_HOLD')
  ).length;

  const completedJobsCount = effectiveOrders.filter(
    (wo) => wo.status === 'COMPLETED' || wo.status === 'CLOSED'
  ).length;

  const selectedWorkOrder = workOrders.find((w) => w.id === selectedWorkOrderId) || null;

  // Filtered parts for van inventory modal
  const filteredParts = parts.filter((p) => {
    if (!partsSearch.trim()) return true;
    const q = partsSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.partNumber.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Technician Isolated Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Mobile Hamburger Button & Brand Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Mobile Hamburger Drawer Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                aria-label="Toggle navigation drawer"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

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

              {/* Desktop Quick Navigation Pills */}
              <div className="hidden lg:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveFilter('ACTIVE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === 'ACTIVE'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Active Jobs</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeFilter === 'ACTIVE' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {activeJobsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('OFFERS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === 'OFFERS'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span>Job Offers</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeFilter === 'OFFERS' ? 'bg-white/20 text-white' : pendingOffersCount > 0 ? 'bg-amber-500 text-slate-950 font-bold animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {pendingOffersCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('COMPLETED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === 'COMPLETED'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeFilter === 'COMPLETED' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {completedJobsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowVanPartsModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Boxes className="w-3.5 h-3.5 text-amber-500" />
                  <span>Van Inventory</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {parts.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Desktop Active Timer Widget */}
              {activeTimer && (
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="font-bold uppercase tracking-wider text-[10px]">CLOCK ACTIVE ({activeTimer.entryType})</span>
                  <button
                    onClick={handleStopTimer}
                    disabled={isTimerLoading}
                    className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                    title="Stop Timer"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                </div>
              )}

              {/* Theme Toggle (Dark / Light) */}
              <ThemeToggle />

              {/* Refresh button (Desktop only, mobile has it in drawer) */}
              <button
                type="button"
                onClick={loadData}
                disabled={isRefreshing}
                className="hidden md:flex p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                title="Refresh jobs"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600 dark:text-amber-400' : ''}`} />
              </button>

              {/* Notifications dropdown toggle */}
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

              {/* Demo Persona Switcher (Desktop only) */}
              {user?.email && DEMO_USERS.some(u => u.email === user.email) && (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[90px]">{user?.fullName || 'Technician'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>

                  {isPersonaMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                        Switch Role Persona
                      </div>
                      {DEMO_USERS.map((demo) => (
                        <button
                          key={demo.email}
                          onClick={async () => {
                            setIsPersonaMenuOpen(false);
                            await quickSwitch(demo.email);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs transition-colors cursor-pointer"
                        >
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">{demo.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{demo.role.replace('ROLE_', '')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Technician Info (Desktop only) */}
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center font-bold text-xs text-amber-800 dark:text-amber-300">
                  {user?.firstName?.[0] || 'T'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{user?.fullName || 'Technician'}</div>
                  <div className="text-[10px] font-medium text-amber-600 dark:text-amber-400 truncate max-w-[120px]">{user?.email}</div>
                </div>
              </div>

              {/* Logout button (Desktop only, mobile has it in drawer) */}
              <button
                type="button"
                onClick={logout}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay (Just like Admin Portal!) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-xs">
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">KEYSTONE</span>
                  <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                    Technician Console
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Technician Profile Card inside Drawer */}
            <div className="p-3 mx-3 mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-amber-500/20 shrink-0">
                  {user?.firstName?.[0] || 'T'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.fullName || 'Field Technician'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Tech ID Badge */}
              <div className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-mono">
                <span>Specialist ID:</span>
                <span className="font-bold">#{user?.technicianId || user?.id}</span>
              </div>

              {/* Demo Persona Switcher inside Drawer */}
              {user?.email && DEMO_USERS.some(u => u.email === user.email) && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Quick Switch Persona</span>
                  </div>
                  <div className="space-y-1">
                    {DEMO_USERS.map((demo) => {
                      const isCurrent = user?.email === demo.email;
                      return (
                        <button
                          key={demo.email}
                          onClick={async () => {
                            setIsMobileMenuOpen(false);
                            await quickSwitch(demo.email);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-600/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30'
                              : 'hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="truncate">{demo.label}</span>
                          <span className="text-[9px] text-slate-400 font-mono ml-2 shrink-0">{demo.role.replace('ROLE_', '')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Live Job Clock Status in Drawer */}
            <div className="px-3 pt-3">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                activeTimer
                  ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 animate-pulse'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider block">Job Clock</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeTimer ? `ACTIVE (${activeTimer.entryType})` : 'Idle (Not Clocked In)'}
                  </span>
                </div>
                {activeTimer && (
                  <button
                    onClick={handleStopTimer}
                    disabled={isTimerLoading}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    Clock Out
                  </button>
                )}
              </div>
            </div>

            {/* Nav Items inside Drawer */}
            <div className="p-3 space-y-1 overflow-y-auto flex-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Field Tasks & Navigation
              </div>

              {/* Active Jobs */}
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('ACTIVE');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  activeFilter === 'ACTIVE'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-4 h-4 ${activeFilter === 'ACTIVE' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>Active Field Jobs</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeFilter === 'ACTIVE' ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  {activeJobsCount}
                </span>
              </button>

              {/* Incoming Offers */}
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('OFFERS');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  activeFilter === 'OFFERS'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HardHat className={`w-4 h-4 ${activeFilter === 'OFFERS' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>Incoming Job Offers</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeFilter === 'OFFERS' ? 'bg-white/20 text-white border-white/30' : pendingOffersCount > 0 ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  {pendingOffersCount}
                </span>
              </button>

              {/* Completed Jobs */}
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('COMPLETED');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  activeFilter === 'COMPLETED'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-4 h-4 ${activeFilter === 'COMPLETED' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>Completed Sign-offs</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeFilter === 'COMPLETED' ? 'bg-white/20 text-white border-white/30' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                }`}>
                  {completedJobsCount}
                </span>
              </button>

              {/* Van Parts Inventory */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowVanPartsModal(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Boxes className="w-4 h-4 text-amber-500" />
                  <span>Van Parts Inventory</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {parts.length} SKUs
                </span>
              </button>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  loadData();
                }}
                disabled={isRefreshing}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600 dark:text-amber-400' : ''}`} />
                <span>{isRefreshing ? 'Refreshing Jobs...' : 'Refresh Fleet & Jobs'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        <TechnicianFieldView
          workOrders={workOrders}
          partsCatalog={parts}
          onRefresh={loadData}
          onSelectWorkOrder={(id) => setSelectedWorkOrderId(id)}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onOpenInventory={() => setShowVanPartsModal(true)}
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

      {/* Van Parts Inventory Catalog Modal */}
      {showVanPartsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Van Parts & Stock Catalog</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Available warehouse and field stock items</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowVanPartsModal(false);
                  setPartsSearch('');
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={partsSearch}
                onChange={(e) => setPartsSearch(e.target.value)}
                placeholder="Search parts by name, SKU part number, or category..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Parts List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredParts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No parts found matching "{partsSearch}".
                </div>
              ) : (
                filteredParts.map((part) => {
                  const isOutOfStock = part.stockQuantity <= 0;
                  const isLowStock = part.stockQuantity > 0 && part.stockQuantity <= 5;

                  return (
                    <div
                      key={part.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {part.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {part.partNumber}
                          </span>
                          {part.category && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                              {part.category}
                            </span>
                          )}
                        </div>
                        {part.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {part.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Unit Price</span>
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
                            ${part.unitPrice.toFixed(2)}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            isOutOfStock
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                              : isLowStock
                              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                              : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : `${part.stockQuantity} in stock`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowVanPartsModal(false);
                  setPartsSearch('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
