import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { AuthModal } from './AuthModal';
import { ThemeToggle } from './ThemeToggle';
import {
  Wrench,
  Users,
  ShieldCheck,
  Radio,
  Building2,
  HardHat,
  ChevronDown,
  RefreshCw,
  Sparkles,
  UserPlus,
  LogIn,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, isRefreshing = false }) => {
  const { user, role, quickSwitch, logout, isLoading } = useAuth();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const getRoleIcon = () => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'ROLE_DISPATCHER':
        return <Radio className="w-4 h-4 text-sky-400" />;
      case 'ROLE_TECHNICIAN':
        return <HardHat className="w-4 h-4 text-amber-400" />;
      case 'ROLE_CUSTOMER':
        return <Building2 className="w-4 h-4 text-purple-400" />;
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Operations Admin';
      case 'ROLE_DISPATCHER': return 'Dispatch Controller';
      case 'ROLE_TECHNICIAN': return 'Field Technician';
      case 'ROLE_CUSTOMER': return 'Facility Tenant Portal';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-sky-700 flex items-center justify-center shadow-lg shadow-brand-500/20 border border-brand-400/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">KEYSTONE</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  v1.0 FSM
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Commercial Facilities Maintenance Platform</p>
            </div>
          </div>

          {/* Center / Right controls: Role Switcher Bar */}
          <div className="flex items-center gap-3">

            {/* Quick Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-all text-sm font-medium"
                title="Switch active user persona"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs text-slate-400 hidden md:inline">Persona:</span>
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[80px] sm:max-w-none">
                    {user?.fullName || 'Select User'}
                  </span>
                </div>
                <div className="flex items-center gap-1 pl-1 border-l border-slate-700 shrink-0">
                  {getRoleIcon()}
                  <span className="text-xs text-slate-300 hidden sm:inline">{getRoleTitle()}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Persona Dropdown Menu */}
              {isPersonaMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setIsPersonaMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Switch Demo Role / Account
                    </p>
                    <p className="text-[11px] text-slate-400">Instant login without password re-entry</p>
                  </div>

                  <div className="space-y-1">
                    {DEMO_USERS.map((demo) => {
                      const isActive = user?.email === demo.email;
                      return (
                        <button
                          key={demo.email}
                          onClick={() => quickSwitch(demo.email)}
                          disabled={isLoading}
                          className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-2.5 ${
                            isActive
                              ? 'bg-brand-500/15 border border-brand-500/40 text-white'
                              : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div className="mt-0.5">
                            {demo.role === 'ROLE_ADMIN' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                            {demo.role === 'ROLE_DISPATCHER' && <Radio className="w-4 h-4 text-sky-400" />}
                            {demo.role === 'ROLE_TECHNICIAN' && <HardHat className="w-4 h-4 text-amber-400" />}
                            {demo.role === 'ROLE_CUSTOMER' && <Building2 className="w-4 h-4 text-purple-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold truncate">{demo.label}</p>
                              {isActive && (
                                <span className="text-[10px] font-bold text-brand-400 bg-brand-500/20 px-1.5 py-0.2 rounded">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{demo.desc}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{demo.email}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown Custom Account Actions */}
                  <div className="pt-2 mt-2 border-t border-slate-800 space-y-1">
                    <button
                      onClick={() => {
                        setAuthModalMode('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-brand-500/10 text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-2 transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register New User / Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setAuthModalMode('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In with Password</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Sign In / Register Button */}
            <button
              onClick={() => {
                setAuthModalMode('register');
                setIsAuthModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up / Login</span>
            </button>

            {/* Theme Toggle (Dark / Light) */}
            <ThemeToggle />

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
                title="Refresh system data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
              </button>
            )}

            {/* Backend status indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Online
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </header>
  );
};
