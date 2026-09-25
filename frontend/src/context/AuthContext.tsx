import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthResponse, RegisterRequest, Role, User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  authData: AuthResponse | null;
  role: Role;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  quickSwitch: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS = [
  { email: 'admin@keystone.io', label: 'Admin (Elena Rostova)', role: 'ROLE_ADMIN' as Role, desc: 'Full system oversight & SLA tracking' },
  { email: 'dispatcher@keystone.io', label: 'Dispatcher (Marcus Vance)', role: 'ROLE_DISPATCHER' as Role, desc: 'Work order dispatching & scheduling' },
  { email: 'tech.davis@keystone.io', label: 'Technician (Julian Davis)', role: 'ROLE_TECHNICIAN' as Role, desc: 'HVAC field specialist' },
  { email: 'tech.chen@keystone.io', label: 'Technician (Sarah Chen)', role: 'ROLE_TECHNICIAN' as Role, desc: 'Electrical & automation specialist' },
  { email: 'client.apex@keystone.io', label: 'Customer (David Miller)', role: 'ROLE_CUSTOMER' as Role, desc: 'Apex Tower facility client portal' },
];

// Helper to decode JWT payload safely in the browser
function decodeJwt(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Read user synchronously from localStorage on initial render for 0ms instant loading
function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('keystone_token');
    if (!token) {
      localStorage.removeItem('keystone_user');
      return null;
    }

    // Check JWT expiry
    const payload = decodeJwt(token);
    if (payload && payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem('keystone_token');
      localStorage.removeItem('keystone_user');
      return null;
    }

    // Check cached user profile
    const cachedUserJson = localStorage.getItem('keystone_user');
    if (cachedUserJson) {
      const parsed = JSON.parse(cachedUserJson);
      if (parsed && parsed.email) {
        return parsed;
      }
    }

    // Fallback: derive user profile directly from JWT payload claims
    if (payload) {
      const fullName = payload.name || payload.sub || 'User';
      const [firstName = '', ...rest] = fullName.split(' ');
      const fallbackUser: User = {
        id: Number(payload.userId) || 1,
        email: payload.sub || '',
        firstName,
        lastName: rest.join(' '),
        fullName,
        role: (payload.role as Role) || 'ROLE_ADMIN',
      };
      localStorage.setItem('keystone_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  } catch (err) {
    console.warn('Error reading initial auth state:', err);
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [authData, setAuthData] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Background verification, warm-up, and keep-alive
  useEffect(() => {
    // 1. Silent warm-up ping to wake up sleeping Render backend if needed
    fetch('https://keystone-backend-1usl.onrender.com/api/health', { mode: 'cors' }).catch(() => {});

    // 2. Periodic keep-alive ping every 10 minutes to prevent Render free-tier from idling while user has tab open
    const keepAliveTimer = setInterval(() => {
      fetch('https://keystone-backend-1usl.onrender.com/api/health', { mode: 'cors' }).catch(() => {});
    }, 10 * 60 * 1000);

    // 3. Check for demo query parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const demoParam = urlParams.get('demo');
      if (demoParam) {
        const demoEmail = demoParam.includes('@') ? demoParam : `${demoParam}@keystone.io`;
        api.auth.login(demoEmail, 'password123')
          .then(async (res) => {
            setAuthData(res);
            const u = await api.auth.getMe().catch(() => ({
              id: res.userId,
              email: res.email,
              firstName: res.name.split(' ')[0] || '',
              lastName: res.name.split(' ').slice(1).join(' '),
              fullName: res.name,
              role: res.role,
            }));
            setUser(u);
            localStorage.setItem('keystone_user', JSON.stringify(u));
          })
          .catch((err) => console.warn('Demo auto-login failed:', err));
        return () => clearInterval(keepAliveTimer);
      }
    }

    // 4. Silent non-blocking session validation if user has a token
    const token = localStorage.getItem('keystone_token');
    if (token) {
      api.auth.getMe()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem('keystone_user', JSON.stringify(freshUser));
        })
        .catch((err) => {
          // Only clear session if token was rejected as explicitly unauthorized (401/403)
          const isUnauthorized =
            err?.message?.includes('401') ||
            err?.message?.includes('403') ||
            err?.message?.includes('Unauthorized');
          if (isUnauthorized) {
            console.warn('Session expired on server, clearing session:', err);
            localStorage.removeItem('keystone_token');
            localStorage.removeItem('keystone_user');
            setUser(null);
            setAuthData(null);
          } else {
            // Cold start or temporary network glitch: do NOT log out the user
            console.info('Backend wake-up in progress; retaining cached session');
          }
        });
    }

    return () => clearInterval(keepAliveTimer);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, pass);
      setAuthData(res);
      let u: User;
      try {
        u = await api.auth.getMe();
      } catch {
        const [firstName = '', ...rest] = (res.name || '').split(' ');
        u = {
          id: res.userId,
          email: res.email,
          firstName,
          lastName: rest.join(' '),
          fullName: res.name || res.email,
          role: res.role,
        };
      }
      setUser(u);
      localStorage.setItem('keystone_user', JSON.stringify(u));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (req: RegisterRequest) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(req);
      setAuthData(res);
      let u: User;
      try {
        u = await api.auth.getMe();
      } catch {
        u = {
          id: res.userId,
          email: res.email,
          firstName: req.firstName,
          lastName: req.lastName,
          fullName: `${req.firstName} ${req.lastName}`.trim(),
          role: res.role || req.role || 'ROLE_CUSTOMER',
        };
      }
      setUser(u);
      localStorage.setItem('keystone_user', JSON.stringify(u));
    } finally {
      setIsLoading(false);
    }
  };

  const quickSwitch = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.quickSwitch(email);
      setAuthData(res);
      let u: User;
      try {
        u = await api.auth.getMe();
      } catch {
        const [firstName = '', ...rest] = (res.name || '').split(' ');
        u = {
          id: res.userId,
          email: res.email,
          firstName,
          lastName: rest.join(' '),
          fullName: res.name || res.email,
          role: res.role,
        };
      }
      setUser(u);
      localStorage.setItem('keystone_user', JSON.stringify(u));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    api.auth.logout();
    localStorage.removeItem('keystone_token');
    localStorage.removeItem('keystone_user');
    setUser(null);
    setAuthData(null);
  }, []);

  const refreshUser = async () => {
    try {
      const u = await api.auth.getMe();
      setUser(u);
      localStorage.setItem('keystone_user', JSON.stringify(u));
    } catch (e) {
      console.error(e);
    }
  };

  const role: Role = user?.role || 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        authData,
        role,
        isLoading,
        login,
        register,
        quickSwitch,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
