export type Role = 'ROLE_ADMIN' | 'ROLE_DISPATCHER' | 'ROLE_TECHNICIAN' | 'ROLE_CUSTOMER';

export type WorkOrderStatus =
  | 'OPEN'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'ON_SITE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  phone?: string;
  adminId?: number;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
  role: Role;
  technicianId?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
  adminId?: number;
  specialization?: string;
}

export interface Facility {
  id: number;
  name: string;
  code: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  contactPerson?: string;
  contactPhone?: string;
  totalSqFt?: number;
}

export interface Asset {
  id: number;
  facility: Facility;
  name: string;
  tagNumber: string;
  category: string;
  floor?: string;
  room?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  installDate?: string;
  status: string;
}

export interface Technician {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  certifications?: string;
  hourlyRate: number;
  status: 'AVAILABLE' | 'ON_JOB' | 'OFF_DUTY';
  rating: number;
  activeJobsCount: number;
  currentLatitude?: number;
  currentLongitude?: number;
}

export interface Part {
  id: number;
  partNumber: string;
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  unitOfMeasure: string;
  lowStock: boolean;
}

export interface WorkOrderPart {
  id: number;
  partId: number;
  partNumber: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  loggedAt: string;
}

export interface TimeEntry {
  id: number;
  technicianId: number;
  technicianName: string;
  entryType: 'TRAVEL' | 'ON_SITE';
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  hourlyRate: number;
  laborCost: number;
  notes?: string;
}

export interface AuditLog {
  id: number;
  performedByName: string;
  action: string;
  fromStatus?: WorkOrderStatus;
  toStatus?: WorkOrderStatus;
  notes?: string;
  timestamp: string;
}

export interface WorkOrder {
  id: number;
  workOrderNumber: string;
  title: string;
  description: string;
  priority: Priority;
  status: WorkOrderStatus;
  facilityId: number;
  facilityName: string;
  facilityCode: string;
  facilityAddress: string;
  assetId?: number;
  assetName?: string;
  assetTagNumber?: string;
  assetCategory?: string;
  assetLocation?: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  technicianId?: number;
  technicianName?: string;
  technicianSpecialization?: string;
  technicianPhone?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  responseSlaDue?: string;
  resolutionSlaDue?: string;
  respondedAt?: string;
  resolvedAt?: string;
  slaRiskLevel: 'SAFE' | 'WARNING' | 'BREACHED' | 'COMPLIED';
  responseRemainingMinutes?: number;
  resolutionRemainingMinutes?: number;
  responseBreached?: boolean;
  resolutionBreached?: boolean;
  resolutionNotes?: string;
  customerRating?: number;
  customerFeedback?: string;
  totalLaborCost: number;
  totalPartsCost: number;
  totalCost: number;
  partsUsed: WorkOrderPart[];
  timeEntries: TimeEntry[];
  auditLogs: AuditLog[];
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianRecommendation {
  technicianId: number;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  certifications?: string;
  hourlyRate: number;
  status: string;
  rating: number;
  activeJobsCount: number;
  matchScore: number;
  matchReason: string;
  matchingSkills: string[];
}

export interface KpiSummary {
  totalWorkOrders: number;
  openWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;
  criticalWorkOrders: number;
  breachedSlaCount: number;
  atRiskSlaCount: number;
  activeTechnicians: number;
  totalTechnicians: number;
  totalMaintenanceCost: number;
  slaComplianceRate: number;
  averageRating: number;
}

export interface SlaAlert {
  workOrderId: number;
  workOrderNumber: string;
  title: string;
  priority: Priority;
  status: WorkOrderStatus;
  facilityName: string;
  technicianName: string;
  resolutionSlaDue: string;
  remainingMinutes: number;
  riskLevel: 'SAFE' | 'WARNING' | 'BREACHED';
}

export interface DashboardData {
  kpis: KpiSummary;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  urgentSlaAlerts: SlaAlert[];
  recentActivities: AuditLog[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  createdAt: string;
  recipientEmail?: string;
}

export interface FacilityCostMetric {
  facilityName: string;
  workOrderCount: number;
  totalCost: number;
}

export interface TechnicianMetric {
  technicianName: string;
  specialization: string;
  assignedCount: number;
  averageRating: number;
}

export interface ReportSummary {
  totalWorkOrders: number;
  completedWorkOrders: number;
  openWorkOrders: number;
  breachedWorkOrders: number;
  slaCompliancePercentage: number;
  totalLaborCost: number;
  totalPartsCost: number;
  grandTotalCost: number;
  priorityBreakdown?: Record<string, number>;
  statusBreakdown?: Record<string, number>;
  facilityBreakdown?: FacilityCostMetric[];
  technicianMetrics?: TechnicianMetric[];
}

export interface AdminProvider {
  id: number;
  name: string;
  email: string;
  phone?: string;
}



