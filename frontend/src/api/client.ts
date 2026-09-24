import {
  AuthResponse,
  RegisterRequest,
  DashboardData,
  Facility,
  Asset,
  Part,
  Technician,
  TechnicianRecommendation,
  TimeEntry,
  User,
  WorkOrder,
  WorkOrderStatus,
  Priority,
  NotificationItem,
  ReportSummary,
  AdminProvider
} from '../types';

const metaEnv = (import.meta as any)?.env;
const API_HOST = metaEnv?.VITE_API_URL ? String(metaEnv.VITE_API_URL).replace(/\/$/, '') : '';
const BASE_URL = `${API_HOST}/api`;

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('keystone_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errText = await res.text();
      try {
        const errJson = JSON.parse(errText);
        errorMsg = errJson.message || errJson.error || errText;
      } catch {
        if (errText && !errText.includes('<!DOCTYPE') && !errText.includes('<html')) {
          errorMsg = errText;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  if (contentType && !contentType.includes('application/json')) {
    const text = await res.text();
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      throw new Error("Cannot reach Backend API. Please check if VITE_API_URL is configured in Vercel and your backend is live.");
    }
  }

  return res.json();
}

export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse<AuthResponse>(res);
      localStorage.setItem('keystone_token', data.token);
      return data;
    },
    quickSwitch: async (email: string): Promise<AuthResponse> => {
      const res = await fetch(`${BASE_URL}/auth/quick-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await handleResponse<AuthResponse>(res);
      localStorage.setItem('keystone_token', data.token);
      return data;
    },
    getMe: async (): Promise<User> => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getHeaders(),
      });
      return handleResponse<User>(res);
    },
    register: async (req: RegisterRequest): Promise<AuthResponse> => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      const data = await handleResponse<AuthResponse>(res);
      localStorage.setItem('keystone_token', data.token);
      return data;
    },
    logout: () => {
      localStorage.removeItem('keystone_token');
    }
  },

  // Dashboard & Analytics
  dashboard: {
    getStats: async (): Promise<DashboardData> => {
      const res = await fetch(`${BASE_URL}/dashboard/stats`, {
        headers: getHeaders(),
      });
      return handleResponse<DashboardData>(res);
    }
  },

  // Work Orders
  workOrders: {
    getAll: async (params?: { status?: WorkOrderStatus; priority?: Priority; facilityId?: number }): Promise<WorkOrder[]> => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.priority) query.append('priority', params.priority);
      if (params?.facilityId) query.append('facilityId', params.facilityId.toString());
      const url = `${BASE_URL}/work-orders${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse<WorkOrder[]>(res);
    },
    getMy: async (): Promise<WorkOrder[]> => {
      const res = await fetch(`${BASE_URL}/work-orders/my`, { headers: getHeaders() });
      return handleResponse<WorkOrder[]>(res);
    },
    getById: async (id: number): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}`, { headers: getHeaders() });
      return handleResponse<WorkOrder>(res);
    },
    create: async (data: {
      title: string;
      description: string;
      priority: Priority;
      facilityId: number;
      assetId?: number;
      technicianId?: number;
      scheduledStart?: string;
      scheduledEnd?: string;
    }): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<WorkOrder>(res);
    },
    changeStatus: async (id: number, status: WorkOrderStatus, notes?: string): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status, notes }),
      });
      return handleResponse<WorkOrder>(res);
    },
    assignTechnician: async (id: number, data: {
      technicianId: number;
      scheduledStart?: string;
      scheduledEnd?: string;
      notes?: string;
    }): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}/assign`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<WorkOrder>(res);
    },
    resolve: async (id: number, resolutionNotes: string): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}/resolve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ resolutionNotes }),
      });
      return handleResponse<WorkOrder>(res);
    },
    submitFeedback: async (id: number, rating: number, feedback?: string): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}/feedback`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ rating, feedback }),
      });
      return handleResponse<WorkOrder>(res);
    },
    update: async (id: number, data: Partial<WorkOrder>): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<WorkOrder>(res);
    },
    cancel: async (id: number, notes?: string): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ notes }),
      });
      return handleResponse<WorkOrder>(res);
    },
    delete: async (id: number): Promise<void> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete work order');
    },
    start: async (id: number): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}/start`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse<WorkOrder>(res);
    },
    hold: async (id: number, notes?: string): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}/hold`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ notes }),
      });
      return handleResponse<WorkOrder>(res);
    },
    resume: async (id: number): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}/resume`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse<WorkOrder>(res);
    },
    complete: async (id: number, resolutionNotes: string): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}/complete`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ resolutionNotes }),
      });
      return handleResponse<WorkOrder>(res);
    }
  },

  // Dispatching
  dispatch: {
    getRecommendations: async (workOrderId: number): Promise<TechnicianRecommendation[]> => {
      const res = await fetch(`${BASE_URL}/dispatch/recommendations/${workOrderId}`, {
        headers: getHeaders(),
      });
      return handleResponse<TechnicianRecommendation[]>(res);
    },
    schedule: async (data: {
      workOrderId: number;
      technicianId: number;
      scheduledStart: string;
      scheduledEnd: string;
      dispatcherNotes?: string;
    }): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/dispatch/schedule`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<WorkOrder>(res);
    }
  },

  // Inventory & Parts
  inventory: {
    getParts: async (category?: string): Promise<Part[]> => {
      const url = `${BASE_URL}/inventory/parts${category ? `?category=${encodeURIComponent(category)}` : ''}`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse<Part[]>(res);
    },
    createPart: async (data: Omit<Part, 'id' | 'lowStock'>): Promise<Part> => {
      const res = await fetch(`${BASE_URL}/inventory/parts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<Part>(res);
    },
    adjustStock: async (partId: number, adjustment: number, reason?: string): Promise<Part> => {
      const res = await fetch(`${BASE_URL}/inventory/parts/${partId}/stock`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ adjustment, reason }),
      });
      return handleResponse<Part>(res);
    },
    updatePart: async (id: number, data: Partial<Part>): Promise<Part> => {
      const res = await fetch(`${BASE_URL}/inventory/parts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<Part>(res);
    },
    deletePart: async (id: number): Promise<void> => {
      const res = await fetch(`${BASE_URL}/inventory/parts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete part');
    },
    consumePart: async (workOrderId: number, partId: number, quantity: number): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/inventory/work-orders/${workOrderId}/consume`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ partId, quantity }),
      });
      return handleResponse<WorkOrder>(res);
    }
  },

  // Technicians & Time Tracking
  technicians: {
    getAll: async (): Promise<Technician[]> => {
      const res = await fetch(`${BASE_URL}/technicians`, { headers: getHeaders() });
      return handleResponse<Technician[]>(res);
    },
    getActiveTimer: async (): Promise<TimeEntry | null> => {
      const res = await fetch(`${BASE_URL}/technicians/active-timer`, { headers: getHeaders() });
      return handleResponse<TimeEntry | null>(res);
    },
    startTimer: async (workOrderId: number, entryType: 'TRAVEL' | 'ON_SITE', notes?: string): Promise<TimeEntry> => {
      const res = await fetch(`${BASE_URL}/technicians/time-tracker/start`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ workOrderId, entryType, notes }),
      });
      return handleResponse<TimeEntry>(res);
    },
    stopTimer: async (notes?: string): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/technicians/time-tracker/stop`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ notes }),
      });
      return handleResponse<WorkOrder>(res);
    }
  },

  // Facilities & Assets
  facilities: {
    getAll: async (adminId?: number): Promise<Facility[]> => {
      const url = adminId ? `${BASE_URL}/facilities?adminId=${adminId}` : `${BASE_URL}/facilities`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse<Facility[]>(res);
    },
    create: async (data: Partial<Facility>): Promise<Facility> => {
      const res = await fetch(`${BASE_URL}/facilities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<Facility>(res);
    },
    update: async (id: number, data: Partial<Facility>): Promise<Facility> => {
      const res = await fetch(`${BASE_URL}/facilities/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<Facility>(res);
    },
    delete: async (id: number): Promise<void> => {
      const res = await fetch(`${BASE_URL}/facilities/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete facility');
    },
    getAssets: async (facilityId: number): Promise<Asset[]> => {
      const res = await fetch(`${BASE_URL}/facilities/${facilityId}/assets`, { headers: getHeaders() });
      return handleResponse<Asset[]>(res);
    }
  },

  // User & Customer Management
  users: {
    getAll: async (role?: string): Promise<User[]> => {
      const url = `${BASE_URL}/users${role ? `?role=${role}` : ''}`;
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse<User[]>(res);
    },
    create: async (data: any): Promise<User> => {
      const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<User>(res);
    },
    update: async (id: number, data: any): Promise<User> => {
      const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<User>(res);
    },
    delete: async (id: number): Promise<void> => {
      const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete user');
    },
    getCustomers: async (): Promise<User[]> => {
      const res = await fetch(`${BASE_URL}/users/customers`, { headers: getHeaders() });
      return handleResponse<User[]>(res);
    },
    createCustomer: async (data: any): Promise<User> => {
      const res = await fetch(`${BASE_URL}/users/customers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<User>(res);
    },
    updateCustomer: async (id: number, data: any): Promise<User> => {
      const res = await fetch(`${BASE_URL}/users/customers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<User>(res);
    },
    deleteCustomer: async (id: number): Promise<void> => {
      const res = await fetch(`${BASE_URL}/users/customers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete customer');
    }
  },

  // Reports
  reports: {
    getSummary: async (): Promise<ReportSummary> => {
      const res = await fetch(`${BASE_URL}/reports/summary`, { headers: getHeaders() });
      return handleResponse<ReportSummary>(res);
    }
  },

  // Notifications
  notifications: {
    getAll: async (): Promise<NotificationItem[]> => {
      const res = await fetch(`${BASE_URL}/notifications`, { headers: getHeaders() });
      return handleResponse<NotificationItem[]>(res);
    },
    getUnreadCount: async (): Promise<{ count: number }> => {
      const res = await fetch(`${BASE_URL}/notifications/unread-count`, { headers: getHeaders() });
      return handleResponse<{ count: number }>(res);
    },
    markAsRead: async (id: number): Promise<NotificationItem> => {
      const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse<NotificationItem>(res);
    },
    send: async (data: { recipientEmail?: string; title: string; message: string; type?: string }): Promise<NotificationItem> => {
      const res = await fetch(`${BASE_URL}/notifications/send`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<NotificationItem>(res);
    }
  },

  // Customer Self-Service Portal
  portal: {
    getAdmins: async (): Promise<AdminProvider[]> => {
      const res = await fetch(`${BASE_URL}/portal/admins`, { headers: getHeaders() });
      return handleResponse<AdminProvider[]>(res);
    },
    submitRequest: async (data: {
      title: string;
      description: string;
      priority: Priority;
      facilityId?: number;
      assetId?: number;
      adminId?: number;
    }): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/portal/requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<WorkOrder>(res);
    },
    getMyTickets: async (): Promise<WorkOrder[]> => {
      const res = await fetch(`${BASE_URL}/portal/my-tickets`, { headers: getHeaders() });
      return handleResponse<WorkOrder[]>(res);
    },
    submitFeedback: async (workOrderId: number, rating: number, feedback?: string): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/portal/tickets/${workOrderId}/feedback`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ rating, feedback }),
      });
      return handleResponse<WorkOrder>(res);
    }
  }
};
