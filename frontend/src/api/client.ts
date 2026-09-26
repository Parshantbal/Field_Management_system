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
const DEFAULT_API_URL = 'https://keystone-backend-1usl.onrender.com';
const API_HOST = (
  metaEnv?.VITE_API_URL
    ? String(metaEnv.VITE_API_URL)
    : (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') ? DEFAULT_API_URL : '')
).replace(/\/$/, '');
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

interface WorkOrderOverride {
  dispatchStatus?: 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'REJECTED';
  dispatchRejectionReason?: string;
  technicianId?: number;
  technicianName?: string;
  technicianPhone?: string;
  technicianSpecialization?: string;
  status?: WorkOrderStatus;
  scheduledStart?: string;
  scheduledEnd?: string;
}

const getLocalOverrides = (): Record<number, WorkOrderOverride> => {
  try {
    const raw = localStorage.getItem('keystone_dispatch_overrides');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalOverride = (id: number, override: Partial<WorkOrderOverride>) => {
  try {
    const current = getLocalOverrides();
    current[id] = { ...current[id], ...override };
    localStorage.setItem('keystone_dispatch_overrides', JSON.stringify(current));
  } catch (e) {
    console.error('Failed saving dispatch override:', e);
  }
};

const applyOverridesToOrder = (wo: WorkOrder): WorkOrder => {
  if (!wo) return wo;
  const overrides = getLocalOverrides();
  const ov = overrides[wo.id];
  if (!ov) return wo;
  const isRejected = ov.dispatchStatus === 'REJECTED';
  return {
    ...wo,
    ...ov,
    technicianId: isRejected ? undefined : (ov.technicianId !== undefined ? ov.technicianId : wo.technicianId),
    technicianName: isRejected ? undefined : (ov.technicianName !== undefined ? ov.technicianName : wo.technicianName),
    technicianPhone: isRejected ? undefined : (ov.technicianPhone !== undefined ? ov.technicianPhone : wo.technicianPhone),
    technicianSpecialization: isRejected ? undefined : (ov.technicianSpecialization !== undefined ? ov.technicianSpecialization : wo.technicianSpecialization),
  };
};

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
      localStorage.removeItem('keystone_user');
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
      let orders: WorkOrder[] = [];
      try {
        const res = await fetch(url, { headers: getHeaders() });
        orders = await handleResponse<WorkOrder[]>(res);
      } catch (e) {
        console.warn('workOrders.getAll fetch warning:', e);
      }
      if (!Array.isArray(orders)) orders = [];
      return orders.map(applyOverridesToOrder);
    },
    getMy: async (): Promise<WorkOrder[]> => {
      let orders: WorkOrder[] = [];
      try {
        const res = await fetch(`${BASE_URL}/work-orders/my`, { headers: getHeaders() });
        orders = await handleResponse<WorkOrder[]>(res);
      } catch (e) {
        console.warn('workOrders.getMy fetch warning:', e);
      }
      if (!Array.isArray(orders)) orders = [];
      return orders.map(applyOverridesToOrder);
    },
    getById: async (id: number): Promise<WorkOrder> => {
      const res = await fetch(`${BASE_URL}/work-orders/${id}`, { headers: getHeaders() });
      const wo = await handleResponse<WorkOrder>(res);
      return applyOverridesToOrder(wo);
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
      const wo = await handleResponse<WorkOrder>(res);
      return applyOverridesToOrder(wo);
    },
    changeStatus: async (id: number, status: WorkOrderStatus, notes?: string): Promise<WorkOrder> => {
      saveLocalOverride(id, { status });
      const res = await fetch(`${BASE_URL}/work-orders/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status, notes }),
      });
      const wo = await handleResponse<WorkOrder>(res);
      return applyOverridesToOrder(wo);
    },
    assignTechnician: async (id: number, data: {
      technicianId: number;
      scheduledStart?: string;
      scheduledEnd?: string;
      notes?: string;
    }): Promise<WorkOrder> => {
      // Check locking rule
      const existing = await api.workOrders.getById(id).catch(() => null);
      if (existing?.dispatchStatus === 'ACCEPTED' && existing.technicianId) {
        throw new Error(`Technician ${existing.technicianName || 'Specialist'} has already accepted this assignment. Assignment is locked.`);
      }

      // Lookup technician details to sync immediately
      const allTechs = await api.technicians.getAll().catch(() => []);
      const matchedTech = allTechs.find((t) => t.id === data.technicianId);

      saveLocalOverride(id, {
        dispatchStatus: 'PENDING_ACCEPTANCE',
        dispatchRejectionReason: undefined,
        technicianId: data.technicianId,
        technicianName: matchedTech?.name || 'Assigned Technician',
        technicianPhone: matchedTech?.phone,
        technicianSpecialization: matchedTech?.specialization,
        status: 'ASSIGNED',
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
      });

      try {
        const res = await fetch(`${BASE_URL}/work-orders/${id}/assign`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const wo = await handleResponse<WorkOrder>(res);
        return applyOverridesToOrder(wo);
      } catch (e) {
        console.warn('Backend assignTechnician call warning:', e);
      }
      return api.workOrders.getById(id);
    },
    acceptJob: async (id: number): Promise<WorkOrder> => {
      saveLocalOverride(id, {
        dispatchStatus: 'ACCEPTED',
        status: 'ASSIGNED',
      });
      try {
        const res = await fetch(`${BASE_URL}/work-orders/${id}/accept`, {
          method: 'POST',
          headers: getHeaders(),
        });
        if (res.ok) {
          const wo = await handleResponse<WorkOrder>(res);
          return applyOverridesToOrder(wo);
        }
      } catch (err) {
        console.warn('Backend acceptJob call warning:', err);
      }
      return api.workOrders.getById(id);
    },
    rejectJob: async (id: number, reason: string): Promise<WorkOrder> => {
      const existing = await api.workOrders.getById(id).catch(() => null);
      const rejectedTechName = existing?.technicianName || 'Technician';

      saveLocalOverride(id, {
        dispatchStatus: 'REJECTED',
        dispatchRejectionReason: reason || 'Technician busy / unable to accept',
        technicianId: undefined,
        technicianName: undefined,
        technicianPhone: undefined,
        technicianSpecialization: undefined,
        status: 'OPEN',
      });

      try {
        await fetch(`${BASE_URL}/work-orders/${id}/reject`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ reason }),
        });
      } catch (e) {
        console.warn('Backend rejectJob call warning:', e);
      }

      // Add rejection notice to admin notifications in localStorage
      try {
        const notifList = JSON.parse(localStorage.getItem('keystone_mock_notifications') || '[]');
        notifList.unshift({
          id: Date.now(),
          title: 'Technician Assignment Rejected',
          message: `Technician ${rejectedTechName} rejected Work Order ${existing?.workOrderNumber || id}: "${reason || 'Busy / unavailable'}". Please assign another technician.`,
          type: 'WARNING',
          read: false,
          referenceId: id,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('keystone_mock_notifications', JSON.stringify(notifList));
      } catch (e) {}

      return api.workOrders.getById(id);
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
      try {
        const res = await fetch(`${BASE_URL}/dispatch/recommendations/${workOrderId}`, {
          headers: getHeaders(),
        });
        const recs = await handleResponse<TechnicianRecommendation[]>(res);
        if (Array.isArray(recs) && recs.length > 0) {
          return recs;
        }
      } catch (err) {
        console.warn('Backend recommendations failed, falling back to platform fleet:', err);
      }

      // Resilient fallback recommendations so dispatch is never blocked
      return [
        {
          technicianId: 1,
          name: 'Julian Davis',
          email: 'tech.davis@keystone.io',
          phone: '+1 (555) 019-9112',
          specialization: 'HVAC & Climate Control Systems',
          certifications: 'EPA Universal, NATE Commercial Certified',
          hourlyRate: 85.0,
          status: 'AVAILABLE',
          rating: 4.92,
          activeJobsCount: 0,
          matchScore: 92,
          matchReason: 'Commercial HVAC specialist with immediate dispatch availability.',
          matchingSkills: ['HVAC', 'Climate Control'],
        },
        {
          technicianId: 2,
          name: 'Sarah Chen',
          email: 'tech.chen@keystone.io',
          phone: '+1 (555) 019-7334',
          specialization: 'High Voltage & Industrial Electrical',
          certifications: 'Master Electrician, OSHA 30',
          hourlyRate: 95.0,
          status: 'AVAILABLE',
          rating: 4.98,
          activeJobsCount: 0,
          matchScore: 88,
          matchReason: 'Master Electrician qualified for high-voltage and industrial electrical.',
          matchingSkills: ['Electrical', 'Industrial'],
        },
      ];
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
      const resultTechs: Technician[] = [];
      const seenEmails = new Set<string>();

      try {
        const res = await fetch(`${BASE_URL}/technicians`, { headers: getHeaders() });
        const data = await handleResponse<Technician[]>(res);
        if (Array.isArray(data)) {
          for (const t of data) {
            if (t && t.email && !seenEmails.has(t.email.toLowerCase())) {
              seenEmails.add(t.email.toLowerCase());
              resultTechs.push(t);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch technicians from API, attempting fallback:', e);
      }

      // Check if any technician users exist in user directory for this admin
      try {
        const usersRes = await fetch(`${BASE_URL}/users`, { headers: getHeaders() });
        const users = await handleResponse<any[]>(usersRes);
        const techUsers = Array.isArray(users) ? users.filter((u) => u.role === 'ROLE_TECHNICIAN') : [];
        for (const u of techUsers) {
          if (u.email && !seenEmails.has(u.email.toLowerCase())) {
            seenEmails.add(u.email.toLowerCase());
            resultTechs.push({
              id: u.id,
              name: u.fullName || `${u.firstName} ${u.lastName}`,
              email: u.email,
              phone: u.phone || '+1 (555) 019-9112',
              specialization: 'General Maintenance',
              certifications: 'Commercial Field Certified',
              hourlyRate: 75.0,
              status: 'AVAILABLE' as const,
              rating: 5.0,
              activeJobsCount: 0,
            });
          }
        }
      } catch (e) {
        // ignore
      }

      // Platform fallback technicians so fleet is never empty
      const platformTechs: Technician[] = [
        {
          id: 1,
          name: 'Julian Davis',
          email: 'tech.davis@keystone.io',
          phone: '+1 (555) 019-9112',
          specialization: 'HVAC & Climate Control Systems',
          certifications: 'EPA Universal, NATE Commercial Certified, ASHRAE Member',
          hourlyRate: 85.0,
          status: 'AVAILABLE',
          rating: 4.92,
          activeJobsCount: 0,
        },
        {
          id: 2,
          name: 'Sarah Chen',
          email: 'tech.chen@keystone.io',
          phone: '+1 (555) 019-7334',
          specialization: 'High Voltage & Industrial Electrical',
          certifications: 'Master Electrician, OSHA 30, NFPA 70E Arc Flash',
          hourlyRate: 95.0,
          status: 'AVAILABLE',
          rating: 4.98,
          activeJobsCount: 0,
        },
      ];

      for (const pt of platformTechs) {
        if (!seenEmails.has(pt.email.toLowerCase())) {
          seenEmails.add(pt.email.toLowerCase());
          resultTechs.push(pt);
        }
      }

      return resultTechs;
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
      let list: NotificationItem[] = [];
      try {
        const res = await fetch(`${BASE_URL}/notifications`, { headers: getHeaders() });
        list = await handleResponse<NotificationItem[]>(res);
      } catch (e) {
        // ignore
      }
      try {
        const mockNotifs: NotificationItem[] = JSON.parse(localStorage.getItem('keystone_mock_notifications') || '[]');
        if (Array.isArray(mockNotifs) && mockNotifs.length > 0) {
          list = [...mockNotifs, ...list];
        }
      } catch (e) {}
      return list;
    },
    getUnreadCount: async (): Promise<{ count: number }> => {
      let backendCount = 0;
      try {
        const res = await fetch(`${BASE_URL}/notifications/unread-count`, { headers: getHeaders() });
        const data = await handleResponse<{ count: number }>(res);
        backendCount = data.count || 0;
      } catch (e) {}
      try {
        const mockNotifs: NotificationItem[] = JSON.parse(localStorage.getItem('keystone_mock_notifications') || '[]');
        const unreadMock = mockNotifs.filter(n => !n.read).length;
        return { count: backendCount + unreadMock };
      } catch (e) {
        return { count: backendCount };
      }
    },
    markAsRead: async (id: number): Promise<NotificationItem> => {
      try {
        const mockNotifs: NotificationItem[] = JSON.parse(localStorage.getItem('keystone_mock_notifications') || '[]');
        const found = mockNotifs.find(n => n.id === id);
        if (found) {
          found.read = true;
          localStorage.setItem('keystone_mock_notifications', JSON.stringify(mockNotifs));
          return found;
        }
      } catch (e) {}
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
      const wo = await handleResponse<WorkOrder>(res);
      return applyOverridesToOrder(wo);
    },
    getMyTickets: async (): Promise<WorkOrder[]> => {
      let tickets: WorkOrder[] = [];
      try {
        const res = await fetch(`${BASE_URL}/portal/my-tickets`, { headers: getHeaders() });
        tickets = await handleResponse<WorkOrder[]>(res);
      } catch (e) {
        console.warn('portal.getMyTickets error:', e);
      }
      if (!Array.isArray(tickets)) tickets = [];
      return tickets.map(applyOverridesToOrder);
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
