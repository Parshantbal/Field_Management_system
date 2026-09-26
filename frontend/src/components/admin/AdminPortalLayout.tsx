import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  DashboardData,
  Facility,
  Part,
  Technician,
  WorkOrder
} from '../../types';
import {
  LayoutDashboard,
  ClipboardList,
  Radio,
  Boxes,
  Building,
  Users,
  Building2,
  BarChart3,
  Bell,
  Wrench,
  ShieldCheck,
  ChevronDown,
  LogOut,
  RefreshCw,
  Sparkles,
  Plus,
  Copy,
  Check,
  Menu,
  X
} from 'lucide-react';

import { ExecutiveDashboard } from '../dashboard/ExecutiveDashboard';
import { WorkOrderListView } from '../workorders/WorkOrderListView';
import { WorkOrderDetailModal } from '../workorders/WorkOrderDetailModal';
import { CreateWorkOrderModal } from '../workorders/CreateWorkOrderModal';
import { DispatchBoard } from '../dispatch/DispatchBoard';
import { InventoryCatalog } from '../inventory/InventoryCatalog';
import { UserManagementView } from './UserManagementView';
import { CustomerManagementView } from './CustomerManagementView';
import { FacilityManagementView } from './FacilityManagementView';
import { ReportsAnalyticsView } from './ReportsAnalyticsView';
import { NotificationCenterView } from './NotificationCenterView';
import { ThemeToggle } from '../common/ThemeToggle';

export type AdminTab =
  | 'dashboard'
  | 'work-orders'
  | 'dispatch'
  | 'users'
  | 'customers'
  | 'sites'
  | 'inventory'
  | 'reports'
  | 'notifications';

export const AdminPortalLayout: React.FC = () => {
  const { user, role, quickSwitch, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core datasets
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // Modals state
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [copiedAdminId, setCopiedAdminId] = useState<boolean>(false);

  const loadAllData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [stats, orders, techs, partsList, facs] = await Promise.all([
        api.dashboard.getStats().catch(() => null),
        api.workOrders.getAll().catch(() => []),
        api.technicians.getAll().catch(() => []),
        api.inventory.getParts().catch(() => []),
        api.facilities.getAll().catch(() => []),
      ]);

      if (stats) setDashboardData(stats);
      setWorkOrders(orders);
      setTechnicians(techs);
      setParts(partsList);
      setFacilities(facs);
    } catch (err) {
      console.error('Failed to fetch platform data:', err);
    } finally {
      setIsDataLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const selectedWorkOrder = workOrders.find((w) => w.id === selectedWorkOrderId) || null;

  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Operations Board',
      icon: LayoutDashboard,
    },
    {
      id: 'work-orders' as AdminTab,
      label: 'Work Orders',
      icon: ClipboardList,
      badge: dashboardData?.kpis?.openWorkOrders || undefined,
    },
    {
      id: 'dispatch' as AdminTab,
      label: 'Smart Dispatch',
      icon: Radio,
      badge: dashboardData?.kpis?.breachedSlaCount ? `${dashboardData.kpis.breachedSlaCount} SLA` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'users' as AdminTab,
      label: 'User Management',
      icon: Users,
    },
    {
      id: 'customers' as AdminTab,
      label: 'Customer Directory',
      icon: Building2,
    },
    {
      id: 'sites' as AdminTab,
      label: 'Sites & Facilities',
      icon: Building,
    },
    {
      id: 'inventory' as AdminTab,
      label: 'Parts & Inventory',
      icon: Boxes,
    },
    {
      id: 'reports' as AdminTab,
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'notifications' as AdminTab,
      label: 'Broadcast Alerts',
      icon: Bell,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Mobile Menu Button */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Mobile Hamburger Drawer Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                aria-label="Toggle navigation drawer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30 shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl font-bold tracking-tight text-white">KEYSTONE</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">Central Control & Field Oversight Console</p>
              </div>
            </div>

            {/* Right Controls: Only ThemeToggle on mobile; full controls on desktop */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle (Dark / Light) */}
              <ThemeToggle />

              {/* Refresh button (Desktop only, mobile has it in drawer) */}
              <button
                onClick={loadAllData}
                disabled={isRefreshing}
                className="hidden md:flex p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 transition-all cursor-pointer"
                title="Refresh datasets"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
              </button>

              {/* Persona switcher (Desktop only, mobile has it in drawer) */}
              {user?.email === 'admin@keystone.io' ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-300 font-semibold truncate">{user?.fullName || 'Staff User'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>

                  {isPersonaMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                        Switch Role View
                      </div>
                      {DEMO_USERS.map((demo) => (
                        <button
                          key={demo.email}
                          onClick={async () => {
                            setIsPersonaMenuOpen(false);
                            await quickSwitch(demo.email);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-left text-xs transition-colors"
                        >
                          <span className="text-slate-200 font-semibold">{demo.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{demo.role.replace('ROLE_', '')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="text-slate-200 font-semibold truncate">{user?.fullName || 'Admin'}</span>
                </div>
              )}

              {/* Admin ID Badge (Desktop only, mobile has it in drawer) */}
              {user?.id && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(user.id));
                    setCopiedAdminId(true);
                    setTimeout(() => setCopiedAdminId(false), 2000);
                  }}
                  title="Click to copy your Admin ID to share with customers"
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono transition-all cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin ID: <strong>#{user.id}</strong></span>
                  {copiedAdminId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-purple-400/70" />}
                </button>
              )}

              {/* Sign Out (Desktop only, mobile has it in drawer) */}
              <button
                onClick={logout}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">KEYSTONE</span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">Admin Console</span>
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

            {/* User Profile & Admin ID Section inside Drawer */}
            <div className="p-3 mx-3 mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-brand-500/20 shrink-0">
                  {user?.firstName?.[0] || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.fullName || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Admin ID Badge inside Drawer */}
              {user?.id && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(user.id));
                    setCopiedAdminId(true);
                    setTimeout(() => setCopiedAdminId(false), 2000);
                  }}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-mono transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                    <span>Admin ID: <strong>#{user.id}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-sans">
                    {copiedAdminId ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Copied!
                      </span>
                    ) : (
                      <span className="text-purple-400 flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Tap to copy
                      </span>
                    )}
                  </div>
                </button>
              )}

              {/* Role Persona Switcher for demo admin inside Drawer */}
              {user?.email === 'admin@keystone.io' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
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
                              ? 'bg-brand-600/15 text-brand-600 dark:text-brand-400 font-bold border border-brand-500/30'
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

            {/* Nav Items */}
            <div className="p-3 space-y-1 overflow-y-auto flex-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Console Modules
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'admin-nav-active bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold shadow-md shadow-brand-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer Actions (Create Work Order, Refresh & Logout) */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCreateModalOpen(true);
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Work Order</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loadAllData();
                }}
                disabled={isRefreshing}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-500' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>

              {/* Logout button inside Hamburger Drawer */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Left Sidebar */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        {/* Desktop Left Sidebar (hidden on mobile) */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 min-h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-1.5 flex-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Admin Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'admin-nav-active bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold shadow-md shadow-brand-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Work Order</span>
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {isDataLoading && !dashboardData ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
              <p className="text-xs text-slate-400 font-mono">Loading Keystone Administrative Datasets...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <ExecutiveDashboard
                  data={dashboardData}
                  onSelectWorkOrder={(id) => setSelectedWorkOrderId(id)}
                  onGoToDispatch={() => setActiveTab('dispatch')}
                />
              )}

              {activeTab === 'work-orders' && (
                <WorkOrderListView
                  workOrders={workOrders}
                  onSelectWorkOrder={(id) => setSelectedWorkOrderId(id)}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                />
              )}

              {activeTab === 'dispatch' && (
                <DispatchBoard
                  workOrders={workOrders}
                  technicians={technicians}
                  onRefresh={loadAllData}
                  onSelectWorkOrder={(id) => setSelectedWorkOrderId(id)}
                />
              )}

              {activeTab === 'users' && (
                <UserManagementView />
              )}

              {activeTab === 'customers' && (
                <CustomerManagementView />
              )}

              {activeTab === 'sites' && (
                <FacilityManagementView />
              )}

              {activeTab === 'inventory' && (
                <InventoryCatalog
                  parts={parts}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsAnalyticsView />
              )}

              {activeTab === 'notifications' && (
                <NotificationCenterView />
              )}
            </>
          )}
        </main>
      </div>

      {/* Work Order Inspection Modal */}
      {selectedWorkOrder && (
        <WorkOrderDetailModal
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrderId(null)}
          onRefresh={loadAllData}
          onOpenDispatchModal={() => {
            setSelectedWorkOrderId(null);
            setActiveTab('dispatch');
          }}
          partsCatalog={parts}
        />
      )}

      {/* Create Work Order Modal */}
      {isCreateModalOpen && (
        <CreateWorkOrderModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={loadAllData}
          facilities={facilities}
        />
      )}
    </div>
  );
};
