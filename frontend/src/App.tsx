import React from 'react';
import { useAuth } from './context/AuthContext';
import { AuthGateway } from './components/auth/AuthGateway';
import { CustomerPortalLayout } from './components/portal/CustomerPortalLayout';
import { TechnicianPortalLayout } from './components/technician/TechnicianPortalLayout';
import { AdminPortalLayout } from './components/admin/AdminPortalLayout';

export const App: React.FC = () => {
  const { user, role } = useAuth();

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
