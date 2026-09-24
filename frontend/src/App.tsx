import React from 'react';
import { useAuth } from './context/AuthContext';
import { AuthGateway } from './components/auth/AuthGateway';
import { CustomerPortalLayout } from './components/portal/CustomerPortalLayout';
import { TechnicianPortalLayout } from './components/technician/TechnicianPortalLayout';
import { AdminPortalLayout } from './components/admin/AdminPortalLayout';

export const App: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Connecting to Keystone Platform...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthGateway />;
  }

  if (role === 'ROLE_CUSTOMER') {
    return <CustomerPortalLayout />;
  }

  if (role === 'ROLE_TECHNICIAN') {
    return <TechnicianPortalLayout />;
  }

  return <AdminPortalLayout />;
};

export default App;
