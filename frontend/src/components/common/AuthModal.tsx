import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  Building2,
  HardHat,
  Radio,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('ROLE_CUSTOMER');
  const [adminId, setAdminId] = useState('');
  const [specialization, setSpecialization] = useState('General Maintenance');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          role,
          adminId: adminId ? parseInt(adminId, 10) : undefined,
          specialization: role === 'ROLE_TECHNICIAN' ? specialization : undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mode Switch Tabs */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/50">
          <div className="flex gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-5rem)]">
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">First Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Your Platform Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('ROLE_CUSTOMER')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                      role === 'ROLE_CUSTOMER'
                        ? 'bg-purple-500/15 border-purple-500/40 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">Customer</p>
                      <p className="text-[10px] text-slate-400">Facility tenant</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ROLE_TECHNICIAN')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                      role === 'ROLE_TECHNICIAN'
                        ? 'bg-amber-500/15 border-amber-500/40 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <HardHat className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">Technician</p>
                      <p className="text-[10px] text-slate-400">Field engineer</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ROLE_DISPATCHER')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                      role === 'ROLE_DISPATCHER'
                        ? 'bg-sky-500/15 border-sky-500/40 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Radio className="w-4 h-4 mt-0.5 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">Dispatcher</p>
                      <p className="text-[10px] text-slate-400">Coordination</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ROLE_ADMIN')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                      role === 'ROLE_ADMIN'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">Admin</p>
                      <p className="text-[10px] text-slate-400">Management</p>
                    </div>
                  </button>
                </div>

                {(role === 'ROLE_TECHNICIAN' || role === 'ROLE_CUSTOMER') && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-850/80 border border-slate-750 space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-300">
                          Operations Admin ID (Optional)
                        </label>
                        <span className="text-[10px] text-slate-400">e.g. 1, 2</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Leave blank or enter Admin ID"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    {role === 'ROLE_TECHNICIAN' && (
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Primary Specialization
                        </label>
                        <select
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
                        >
                          <option value="General Maintenance">General Maintenance</option>
                          <option value="HVAC & Climate Control Systems">HVAC & Climate Control Systems</option>
                          <option value="High Voltage & Industrial Electrical">High Voltage & Industrial Electrical</option>
                          <option value="Plumbing & Mechanical Systems">Plumbing & Mechanical Systems</option>
                          <option value="Fire Safety & Security Systems">Fire Safety & Security Systems</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Processing...'
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to KEYSTONE
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account & Sign In
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-1">
            {mode === 'login' ? (
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(null); }}
                  className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2"
                >
                  Sign Up Here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); }}
                  className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2"
                >
                  Sign In Here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
