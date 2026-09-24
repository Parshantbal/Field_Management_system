import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import {
  Wrench,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ShieldCheck,
  Building2,
  HardHat,
  Radio,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Role } from '../../types';
import { ThemeToggle } from '../common/ThemeToggle';

export const AuthGateway: React.FC = () => {
  const { login, register, quickSwitch, isLoading } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('tab');
      if (p === 'signup' || p === 'signin') return p;
    }
    return 'signin';
  });
  const [error, setError] = useState<string | null>(null);

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('ROLE_CUSTOMER');

  const isSignIn = tab === 'signin';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: regRole,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    }
  };

  const handleQuickLogin = async (email: string) => {
    setError(null);
    try {
      await quickSwitch(email);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40">
        <ThemeToggle showLabel />
      </div>

      {/* Ambient background soft glow orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-brand-500/10 dark:bg-brand-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[480px] h-[480px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container: 50-50 Split Square Box */}
      <div className="relative w-full max-w-5xl rounded-[2.5rem] bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-2xl p-2.5 sm:p-3 z-10 overflow-hidden transition-colors duration-200">
        
        {/* ========================================================================= */}
        {/* ANIMATED SLIDING BACKGROUND COLOR PANEL                                  */}
        {/* Covers LEFT 50% when 'signin', smoothly shifts to RIGHT 50% when 'signup' */}
        {/* ========================================================================= */}
        <div
          className={`hidden md:block absolute top-2.5 bottom-2.5 w-[calc(50%-0.625rem)] rounded-[2rem] bg-gradient-to-br from-brand-600 via-indigo-600 to-sky-700 shadow-2xl shadow-brand-500/30 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none z-0 ${
            isSignIn ? 'left-2.5 translate-x-0' : 'left-2.5 translate-x-full'
          }`}
        >
          {/* Subtle glossy glass glow overlay inside the shifting background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 rounded-[2rem] border border-white/20 pointer-events-none" />
        </div>

        {/* Mobile Tab Switcher (Visible only on small screens) */}
        <div className="md:hidden relative p-1 bg-slate-200 dark:bg-slate-950/90 rounded-2xl border border-slate-300 dark:border-slate-800/80 flex items-center mb-3 select-none">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 shadow-md transition-transform duration-300 ease-out pointer-events-none ${
              isSignIn ? 'left-1 translate-x-0' : 'left-1 translate-x-full'
            }`}
          />
          <button
            type="button"
            onClick={() => { setTab('signin'); setError(null); }}
            className={`relative z-10 w-1/2 py-2 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 ${
              isSignIn ? 'text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(null); }}
            className={`relative z-10 w-1/2 py-2 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 ${
              !isSignIn ? 'text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Sign Up
          </button>
        </div>

        {/* Grid containing Left Side (Sign In) and Right Side (Sign Up) side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 relative z-10">

          {/* ========================================================================= */}
          {/* LEFT 50%: SIGN IN SECTION                                                */}
          {/* ========================================================================= */}
          <div
            onClick={() => {
              if (!isSignIn) {
                setTab('signin');
                setError(null);
              }
            }}
            className={`auth-panel p-6 sm:p-8 lg:p-9 flex flex-col justify-between rounded-[2rem] transition-all duration-500 select-none ${
              isSignIn
                ? 'auth-panel-active opacity-100'
                : 'auth-panel-inactive opacity-60 hover:opacity-90 cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 md:bg-transparent'
            }`}
          >
            <div>
              {/* Header Tab & Brand */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isSignIn
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-md border border-white/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-sm font-extrabold tracking-tight font-display transition-colors ${
                      isSignIn ? 'text-white' : 'text-slate-300'
                    }`}>
                      KEYSTONE
                    </span>
                    <span className={`block text-[10px] font-mono uppercase tracking-wider ${
                      isSignIn ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      Sign In Portal
                    </span>
                  </div>
                </div>

                {/* Clickable Section Badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTab('signin');
                    setError(null);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    isSignIn
                      ? 'auth-badge-active shadow-md'
                      : 'auth-badge-inactive border'
                  }`}
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </button>
              </div>

              {/* Title */}
              <div className="mb-5">
                <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight font-display transition-colors ${
                  isSignIn ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                }`}>
                  Welcome Back
                </h2>
                <p className={`text-xs mt-1 transition-colors ${
                  isSignIn ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  Enter your credentials to access operations dashboard.
                </p>
              </div>

              {/* Error banner (if on sign in) */}
              {error && isSignIn && (
                <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-2 text-rose-200 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5" onClick={(e) => isSignIn && e.stopPropagation()}>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1.5 transition-colors ${
                    isSignIn ? 'text-blue-100' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      isSignIn ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                    }`} />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={!isSignIn}
                      className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm transition-all focus:outline-none ${
                        isSignIn ? 'auth-input-active' : 'auth-input-inactive'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`text-[11px] font-semibold transition-colors ${
                      isSignIn ? 'text-blue-100' : 'text-slate-700 dark:text-slate-400'
                    }`}>
                      Password
                    </label>
                    {isSignIn && (
                      <span className="text-[10px] text-blue-200 hover:underline cursor-pointer">
                        Forgot?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      isSignIn ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                    }`} />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={!isSignIn}
                      className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm transition-all focus:outline-none ${
                        isSignIn ? 'auth-input-active' : 'auth-input-inactive'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      disabled={!isSignIn}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${
                        isSignIn ? 'text-blue-200 hover:text-white' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isSignIn}
                  className={`w-full mt-2 py-2.5 px-4 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    isSignIn
                      ? 'auth-btn-active hover:scale-[1.01] active:scale-[0.99]'
                      : 'auth-btn-inactive'
                  }`}
                >
                  {isLoading && isSignIn ? (
                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick 1-Click Demo Persona Logins */}
            <div className={`mt-5 pt-3.5 border-t transition-colors ${
              isSignIn ? 'border-white/20' : 'border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  isSignIn ? 'text-blue-100' : 'text-slate-500'
                }`}>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  1-Click Demo Logins
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.slice(0, 4).map((demo) => {
                  const getRoleDetails = () => {
                    switch (demo.role) {
                      case 'ROLE_ADMIN':
                        return {
                          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />,
                          tag: 'Admin'
                        };
                      case 'ROLE_DISPATCHER':
                        return {
                          icon: <Radio className="w-3.5 h-3.5 text-sky-300 shrink-0" />,
                          tag: 'Dispatch'
                        };
                      case 'ROLE_TECHNICIAN':
                        return {
                          icon: <HardHat className="w-3.5 h-3.5 text-amber-300 shrink-0" />,
                          tag: 'Technician'
                        };
                      case 'ROLE_CUSTOMER':
                        return {
                          icon: <Building2 className="w-3.5 h-3.5 text-purple-300 shrink-0" />,
                          tag: 'Customer'
                        };
                    }
                  };

                  const roleInfo = getRoleDetails();

                  return (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin(demo.email);
                      }}
                      disabled={isLoading}
                      className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-xl text-left transition-all ${
                        isSignIn ? 'auth-demo-btn-active' : 'auth-demo-btn-inactive'
                      }`}
                    >
                      {roleInfo.icon}
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold truncate">
                          {demo.label.split('(')[0]}
                        </div>
                        <div className={`text-[9px] truncate ${isSignIn ? 'text-blue-200/80' : 'text-slate-500'}`}>
                          {roleInfo.tag}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT 50%: SIGN UP SECTION                                               */}
          {/* ========================================================================= */}
          <div
            onClick={() => {
              if (isSignIn) {
                setTab('signup');
                setError(null);
              }
            }}
            className={`auth-panel p-6 sm:p-8 lg:p-9 flex flex-col justify-between rounded-[2rem] transition-all duration-500 select-none ${
              !isSignIn
                ? 'auth-panel-active opacity-100'
                : 'auth-panel-inactive opacity-60 hover:opacity-90 cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 md:bg-transparent'
            }`}
          >
            <div>
              {/* Header Tab & Brand */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    !isSignIn
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-md border border-white/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-sm font-extrabold tracking-tight font-display transition-colors ${
                      !isSignIn ? 'text-white' : 'text-slate-900 dark:text-slate-200'
                    }`}>
                      JOIN KEYSTONE
                    </span>
                    <span className={`block text-[10px] font-mono uppercase tracking-wider ${
                      !isSignIn ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      Create Account
                    </span>
                  </div>
                </div>

                {/* Clickable Section Badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTab('signup');
                    setError(null);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    !isSignIn
                      ? 'auth-badge-active shadow-md'
                      : 'auth-badge-inactive border'
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Sign Up</span>
                </button>
              </div>

              {/* Title */}
              <div className="mb-4">
                <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight font-display transition-colors ${
                  !isSignIn ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                }`}>
                  New Registration
                </h2>
                <p className={`text-xs mt-1 transition-colors ${
                  !isSignIn ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  Choose your role and register your operational portal.
                </p>
              </div>

              {/* Error banner (if on sign up) */}
              {error && !isSignIn && (
                <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-2 text-rose-200 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sign Up Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3" onClick={(e) => !isSignIn && e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 transition-colors ${
                      !isSignIn ? 'text-blue-100' : 'text-slate-700 dark:text-slate-400'
                    }`}>
                      First Name
                    </label>
                    <div className="relative">
                      <UserIcon className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                        !isSignIn ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                      }`} />
                      <input
                        type="text"
                        required
                        placeholder="Alex"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        disabled={isSignIn}
                        className={`w-full rounded-xl pl-8 pr-3 py-2 text-xs transition-all focus:outline-none ${
                          !isSignIn ? 'auth-input-active' : 'auth-input-inactive'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 transition-colors ${
                      !isSignIn ? 'text-blue-100' : 'text-slate-700 dark:text-slate-400'
                    }`}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Morgan"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      disabled={isSignIn}
                      className={`w-full rounded-xl px-3 py-2 text-xs transition-all focus:outline-none ${
                        !isSignIn ? 'auth-input-active' : 'auth-input-inactive'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold mb-1 transition-colors ${
                    !isSignIn ? 'text-blue-100' : 'text-slate-700 dark:text-slate-400'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                      !isSignIn ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                    }`} />
                    <input
                      type="email"
                      required
                      placeholder="alex.morgan@domain.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      disabled={isSignIn}
                      className={`w-full rounded-xl pl-8 pr-3 py-2 text-xs transition-all focus:outline-none ${
                        !isSignIn ? 'auth-input-active' : 'auth-input-inactive'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 transition-colors ${
                      !isSignIn ? 'text-blue-100' : 'text-slate-700 dark:text-slate-400'
                    }`}>
                      Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                        !isSignIn ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                      }`} />
                      <input
                        type="tel"
                        placeholder="+91 98765"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        disabled={isSignIn}
                        className={`w-full rounded-xl pl-8 pr-3 py-2 text-xs transition-all focus:outline-none ${
                          !isSignIn ? 'auth-input-active' : 'auth-input-inactive'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 transition-colors ${
                      !isSignIn ? 'text-blue-100' : 'text-slate-700 dark:text-slate-400'
                    }`}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                        !isSignIn ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                      }`} />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 chars"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        disabled={isSignIn}
                        className={`w-full rounded-xl pl-8 pr-7 py-2 text-xs transition-all focus:outline-none ${
                          !isSignIn ? 'auth-input-active' : 'auth-input-inactive'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        disabled={isSignIn}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 transition-colors ${
                          !isSignIn ? 'text-blue-200 hover:text-white' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Role Selector */}
                <div>
                  <label className={`block text-[11px] font-semibold mb-1.5 transition-colors ${
                    !isSignIn ? 'text-blue-100' : 'text-slate-700 dark:text-slate-400'
                  }`}>
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('ROLE_CUSTOMER')}
                      disabled={isSignIn}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        regRole === 'ROLE_CUSTOMER'
                          ? (!isSignIn ? 'auth-role-active-selected' : 'auth-role-inactive-selected')
                          : (!isSignIn ? 'auth-role-active-unselected' : 'auth-role-inactive-unselected')
                      }`}
                    >
                      <Building2 className={`w-3.5 h-3.5 mb-0.5 ${regRole === 'ROLE_CUSTOMER' && !isSignIn ? 'text-purple-600' : 'text-purple-400'}`} />
                      <div className="text-[11px]">Customer</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('ROLE_TECHNICIAN')}
                      disabled={isSignIn}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        regRole === 'ROLE_TECHNICIAN'
                          ? (!isSignIn ? 'auth-role-active-selected' : 'auth-role-inactive-selected')
                          : (!isSignIn ? 'auth-role-active-unselected' : 'auth-role-inactive-unselected')
                      }`}
                    >
                      <HardHat className={`w-3.5 h-3.5 mb-0.5 ${regRole === 'ROLE_TECHNICIAN' && !isSignIn ? 'text-amber-600' : 'text-amber-400'}`} />
                      <div className="text-[11px]">Technician</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('ROLE_ADMIN')}
                      disabled={isSignIn}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        regRole === 'ROLE_ADMIN'
                          ? (!isSignIn ? 'auth-role-active-selected' : 'auth-role-inactive-selected')
                          : (!isSignIn ? 'auth-role-active-unselected' : 'auth-role-inactive-unselected')
                      }`}
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 mb-0.5 ${regRole === 'ROLE_ADMIN' && !isSignIn ? 'text-emerald-600' : 'text-emerald-400'}`} />
                      <div className="text-[11px]">Admin</div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isSignIn}
                  className={`w-full mt-2 py-2.5 px-4 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    !isSignIn
                      ? 'auth-btn-active hover:scale-[1.01] active:scale-[0.99]'
                      : 'auth-btn-inactive'
                  }`}
                >
                  {isLoading && !isSignIn ? (
                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className={`mt-4 pt-2.5 border-t text-center transition-colors ${
              !isSignIn ? 'border-white/20' : 'border-slate-800/80'
            }`}>
              <p className={`text-[10px] ${!isSignIn ? 'text-blue-100/70' : 'text-slate-500'}`}>
                Enterprise Multi-Tenant Field Service Platform
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-5 text-center flex items-center justify-center gap-3 text-[11px] text-slate-500 font-medium">
        <span>KEYSTONE FSM</span>
        <span>&bull;</span>
        <span>Commercial Operations</span>
        <span>&bull;</span>
        <span>v2.5</span>
      </div>
    </div>
  );
};
