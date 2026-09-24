import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Radio,
  Boxes,
  Building2,
  HardHat,
  PlusCircle,
  ClockAlert
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'work-orders'
  | 'dispatch'
  | 'inventory'
  | 'technician-field'
  | 'customer-portal';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openOrdersCount?: number;
  breachedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openOrdersCount = 0,
  breachedCount = 0,
}) => {
  const { role } = useAuth();

  const isCustomer = role === 'ROLE_CUSTOMER';
  const isTech = role === 'ROLE_TECHNICIAN';

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Operations Board',
      icon: LayoutDashboard,
      visible: !isCustomer,
    },
    {
      id: 'work-orders' as NavTab,
      label: 'Work Orders',
      icon: ClipboardList,
      badge: openOrdersCount > 0 ? openOrdersCount : undefined,
      visible: !isCustomer,
    },
    {
      id: 'dispatch' as NavTab,
      label: 'Smart Dispatch',
      icon: Radio,
      badge: breachedCount > 0 ? `${breachedCount} SLA!` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      visible: role === 'ROLE_ADMIN' || role === 'ROLE_DISPATCHER',
    },
    {
      id: 'technician-field' as NavTab,
      label: 'Tech Field Portal',
      icon: HardHat,
      highlight: true,
      visible: isTech || role === 'ROLE_ADMIN' || role === 'ROLE_DISPATCHER',
    },
    {
      id: 'inventory' as NavTab,
      label: 'Parts & Inventory',
      icon: Boxes,
      visible: !isCustomer,
    },
    {
      id: 'customer-portal' as NavTab,
      label: isCustomer ? 'Customer Portal' : 'Customer View',
      icon: Building2,
      visible: true,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>

        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Role Context Card in footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Compliance Target</span>
            <span className="text-xs font-bold text-emerald-400">99.0% SLA</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <ClockAlert className="w-3 h-3 text-amber-400" />
            Active monitoring & escalation
          </p>
        </div>
      </div>
    </aside>
  );
};
