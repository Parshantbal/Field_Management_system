import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authData, setAuthData] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const demoParam = urlParams.get('demo');
      if (demoParam) {
        try {
          const demoEmail = demoParam.includes('@') ? demoParam : `${demoParam}@keystone.io`;
          const res = await api.auth.login(demoEmail, 'password123');
          setAuthData(res);
          const u = await api.auth.getMe();
          setUser(u);
          setIsLoading(false);
          return;
        } catch (err) {
          console.warn('Demo auto-login failed:', err);
        }
      }
    }
    const token = localStorage.getItem('keystone_token');
    if (token) {
      try {
        const u = await api.auth.getMe();
        setUser(u);
      } catch (err) {
        console.warn('Existing token invalid or expired, clearing session:', err);
        localStorage.removeItem('keystone_token');
        setUser(null);
        setAuthData(null);
      }
    } else {
      setUser(null);
      setAuthData(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, pass);
      setAuthData(res);
      const u = await api.auth.getMe();
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (req: RegisterRequest) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(req);
      setAuthData(res);
      const u = await api.auth.getMe();
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const quickSwitch = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.quickSwitch(email);
      setAuthData(res);
      const u = await api.auth.getMe();
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setAuthData(null);
  };

  const refreshUser = async () => {
    try {
      const u = await api.auth.getMe();
      setUser(u);
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
