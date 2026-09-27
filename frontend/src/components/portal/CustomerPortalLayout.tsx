import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { CustomerPortalView } from './CustomerPortalView';
import { Facility, NotificationItem, WorkOrder } from '../../types';
import { api } from '../../api/client';
import {
  Building2,
  LogOut,
  Bell,
  Check,
  X,
  Menu,
  Plus,
  RefreshCw,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

export const CustomerPortalLayout: React.FC = () => {
  const { user, logout, quickSwitch } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [tickets, setTickets] = useState<WorkOrder[]>([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<WorkOrder | null>(null);

  // Responsive Navigation & Filter States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState<boolean>(false);

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
      const [facs, tix] = await Promise.all([
        api.facilities.getAll().catch(() => []),
        api.portal.getMyTickets().catch(() => []),
      ]);
      setFacilities(facs);
      setTickets(tix);
      await loadNotifications();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
      setIsTicketsLoading(false);
    }
  }, [loadNotifications]);

  const handleFilterChange = (filter: 'ALL' | 'ACTIVE' | 'RESOLVED') => {
    setActiveFilter(filter);
    loadData();
  };

  useEffect(() => {
    loadData();
    // Poll data every 8s so customer sees live transitions (e.g. technician resolves request)
    const timer = setInterval(() => {
      loadData();
    }, 8000);
    return () => clearInterval(timer);
  }, [loadData]);

  useEffect(() => {
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

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

  const isTicketResolved = (status?: string) => {
    const s = (status || '').toUpperCase();
    return s === 'COMPLETED' || s === 'CLOSED' || s === 'RESOLVED';
  };

  // Ticket counts
  const allCount = tickets.length;
  const activeCount = tickets.filter(
    (t) => !isTicketResolved(t.status) && (t.status || '').toUpperCase() !== 'CANCELLED'
  ).length;
  const resolvedCount = tickets.filter(
    (t) => isTicketResolved(t.status)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Customer Isolated Top Header */}
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
                  <X className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-md shadow-purple-500/20 border border-purple-400/40 shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">KEYSTONE</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 sm:px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 whitespace-nowrap">
                    Customer
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Facilities Maintenance & Tenant Requests</p>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Theme Toggle (Dark / Light) */}
              <ThemeToggle />

              {/* Refresh button (Desktop only, mobile has it in drawer) */}
              <button
                type="button"
                onClick={loadData}
                disabled={isRefreshing}
                className="hidden md:flex p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                title="Refresh requests"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-600 dark:text-purple-400' : ''}`} />
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

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in">
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

              {/* Demo Persona Switcher (Desktop only, if demo account) */}
              {user?.email && DEMO_USERS.some(u => u.email === user.email) && (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[90px]">{user?.fullName || 'Customer'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>

                  {isPersonaMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                        Switch Demo Persona
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

              {/* Tenant Details (Desktop only) */}
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-700 dark:text-purple-300">
                  {user?.firstName?.[0] || 'C'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{user?.fullName || 'Customer'}</div>
                  <div className="text-[10px] font-medium text-purple-600 dark:text-purple-400 truncate max-w-[120px]">{user?.email}</div>
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">KEYSTONE</span>
                  <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
                    Customer Portal
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

            {/* Customer Profile Section inside Drawer */}
            <div className="p-3 mx-3 mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-purple-500/20 shrink-0">
                  {user?.firstName?.[0] || 'C'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.fullName || 'Customer Tenant'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Connected Admin ID Badge if present */}
              {user?.adminId && (
                <div className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                    <span>Connected Ops Admin:</span>
                  </div>
                  <span className="font-bold">#{user.adminId}</span>
                </div>
              )}

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
                              ? 'bg-purple-600/15 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/30'
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

            {/* Primary Action Button inside Drawer */}
            <div className="px-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCreateModalOpen(true);
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Service Request</span>
              </button>
            </div>

            {/* Nav Filter Items inside Drawer */}
            <div className="p-3 space-y-1 overflow-y-auto flex-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                My Request Views
              </div>

              {/* All Requests */}
              <button
                type="button"
                onClick={() => {
                  handleFilterChange('ALL');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  activeFilter === 'ALL'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/20'
                    : 'text-slate-700 dark:!text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className={`w-4 h-4 ${activeFilter === 'ALL' ? 'text-white' : 'text-purple-500 dark:text-purple-400'}`} />
                  <span>All Maintenance Requests</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeFilter === 'ALL' ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:!text-white border-slate-200 dark:border-slate-700'
                }`}>
                  {allCount}
                </span>
              </button>

              {/* In Progress */}
              <button
                type="button"
                onClick={() => {
                  handleFilterChange('ACTIVE');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  activeFilter === 'ACTIVE'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/20'
                    : 'text-slate-700 dark:!text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-4 h-4 ${activeFilter === 'ACTIVE' ? 'text-white' : 'text-amber-500 dark:text-amber-400'}`} />
                  <span>Active & In Progress</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeFilter === 'ACTIVE' ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:!text-white border-slate-200 dark:border-slate-700'
                }`}>
                  {activeCount}
                </span>
              </button>

              {/* Resolved */}
              <button
                type="button"
                onClick={() => {
                  handleFilterChange('RESOLVED');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  activeFilter === 'RESOLVED'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/20'
                    : 'text-slate-700 dark:!text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-4 h-4 ${activeFilter === 'RESOLVED' ? 'text-white' : 'text-emerald-500 dark:text-emerald-400'}`} />
                  <span>Resolved & History</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeFilter === 'RESOLVED' ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:!text-white border-slate-200 dark:border-slate-700'
                }`}>
                  {resolvedCount}
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
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-600 dark:text-purple-400' : ''}`} />
                <span>{isRefreshing ? 'Refreshing Tickets...' : 'Refresh Tickets'}</span>
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
        <CustomerPortalView
          facilities={facilities}
          onSelectWorkOrder={handleSelectWorkOrder}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          isCreateModalOpen={isCreateModalOpen}
          setIsCreateModalOpen={setIsCreateModalOpen}
          tickets={tickets}
          onRefreshTickets={loadData}
          isLoadingTickets={isTicketsLoading}
        />
      </main>

      {/* Ticket Details Inspection Modal if Customer Clicks Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">{selectedTicket.workOrderNumber}</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{selectedTicket.title}</h3>
              </div>
              <button
                onClick={() => { setSelectedTicket(null); setSelectedTicketId(null); }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer"
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
