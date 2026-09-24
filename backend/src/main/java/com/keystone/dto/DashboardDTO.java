package com.keystone.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public class DashboardDTO {

    public static class KpiSummaryDTO {
        private long totalWorkOrders;
        private long openWorkOrders;
        private long inProgressWorkOrders;
        private long completedWorkOrders;
        private long criticalWorkOrders;
        private long breachedSlaCount;
        private long atRiskSlaCount;
        private long activeTechnicians;
        private long totalTechnicians;
        private BigDecimal totalMaintenanceCost;
        private BigDecimal slaComplianceRate;
        private double averageRating;

        public KpiSummaryDTO() {}

        public static KpiSummaryDTOBuilder builder() { return new KpiSummaryDTOBuilder(); }
        public static class KpiSummaryDTOBuilder {
            private KpiSummaryDTO dto = new KpiSummaryDTO();
            public KpiSummaryDTOBuilder totalWorkOrders(long v) { dto.totalWorkOrders = v; return this; }
            public KpiSummaryDTOBuilder openWorkOrders(long v) { dto.openWorkOrders = v; return this; }
            public KpiSummaryDTOBuilder inProgressWorkOrders(long v) { dto.inProgressWorkOrders = v; return this; }
            public KpiSummaryDTOBuilder completedWorkOrders(long v) { dto.completedWorkOrders = v; return this; }
            public KpiSummaryDTOBuilder criticalWorkOrders(long v) { dto.criticalWorkOrders = v; return this; }
            public KpiSummaryDTOBuilder breachedSlaCount(long v) { dto.breachedSlaCount = v; return this; }
            public KpiSummaryDTOBuilder atRiskSlaCount(long v) { dto.atRiskSlaCount = v; return this; }
            public KpiSummaryDTOBuilder activeTechnicians(long v) { dto.activeTechnicians = v; return this; }
            public KpiSummaryDTOBuilder totalTechnicians(long v) { dto.totalTechnicians = v; return this; }
            public KpiSummaryDTOBuilder totalMaintenanceCost(BigDecimal v) { dto.totalMaintenanceCost = v; return this; }
            public KpiSummaryDTOBuilder slaComplianceRate(BigDecimal v) { dto.slaComplianceRate = v; return this; }
            public KpiSummaryDTOBuilder averageRating(double v) { dto.averageRating = v; return this; }
            public KpiSummaryDTO build() { return dto; }
        }

        public long getTotalWorkOrders() { return totalWorkOrders; }
        public void setTotalWorkOrders(long totalWorkOrders) { this.totalWorkOrders = totalWorkOrders; }
        public long getOpenWorkOrders() { return openWorkOrders; }
        public void setOpenWorkOrders(long openWorkOrders) { this.openWorkOrders = openWorkOrders; }
        public long getInProgressWorkOrders() { return inProgressWorkOrders; }
        public void setInProgressWorkOrders(long inProgressWorkOrders) { this.inProgressWorkOrders = inProgressWorkOrders; }
        public long getCompletedWorkOrders() { return completedWorkOrders; }
        public void setCompletedWorkOrders(long completedWorkOrders) { this.completedWorkOrders = completedWorkOrders; }
        public long getCriticalWorkOrders() { return criticalWorkOrders; }
        public void setCriticalWorkOrders(long criticalWorkOrders) { this.criticalWorkOrders = criticalWorkOrders; }
        public long getBreachedSlaCount() { return breachedSlaCount; }
        public void setBreachedSlaCount(long breachedSlaCount) { this.breachedSlaCount = breachedSlaCount; }
        public long getAtRiskSlaCount() { return atRiskSlaCount; }
        public void setAtRiskSlaCount(long atRiskSlaCount) { this.atRiskSlaCount = atRiskSlaCount; }
        public long getActiveTechnicians() { return activeTechnicians; }
        public void setActiveTechnicians(long activeTechnicians) { this.activeTechnicians = activeTechnicians; }
        public long getTotalTechnicians() { return totalTechnicians; }
        public void setTotalTechnicians(long totalTechnicians) { this.totalTechnicians = totalTechnicians; }
        public BigDecimal getTotalMaintenanceCost() { return totalMaintenanceCost; }
        public void setTotalMaintenanceCost(BigDecimal totalMaintenanceCost) { this.totalMaintenanceCost = totalMaintenanceCost; }
        public BigDecimal getSlaComplianceRate() { return slaComplianceRate; }
        public void setSlaComplianceRate(BigDecimal slaComplianceRate) { this.slaComplianceRate = slaComplianceRate; }
        public double getAverageRating() { return averageRating; }
        public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
    }

    public static class SlaAlertDTO {
        private Long workOrderId;
        private String workOrderNumber;
        private String title;
        private String priority;
        private String status;
        private String facilityName;
        private String technicianName;
        private Instant resolutionSlaDue;
        private Long remainingMinutes;
        private String riskLevel;

        public SlaAlertDTO() {}

        public static SlaAlertDTOBuilder builder() { return new SlaAlertDTOBuilder(); }
        public static class SlaAlertDTOBuilder {
            private SlaAlertDTO dto = new SlaAlertDTO();
            public SlaAlertDTOBuilder workOrderId(Long id) { dto.workOrderId = id; return this; }
            public SlaAlertDTOBuilder workOrderNumber(String num) { dto.workOrderNumber = num; return this; }
            public SlaAlertDTOBuilder title(String t) { dto.title = t; return this; }
            public SlaAlertDTOBuilder priority(String p) { dto.priority = p; return this; }
            public SlaAlertDTOBuilder status(String s) { dto.status = s; return this; }
            public SlaAlertDTOBuilder facilityName(String f) { dto.facilityName = f; return this; }
            public SlaAlertDTOBuilder technicianName(String tn) { dto.technicianName = tn; return this; }
            public SlaAlertDTOBuilder resolutionSlaDue(Instant r) { dto.resolutionSlaDue = r; return this; }
            public SlaAlertDTOBuilder remainingMinutes(Long m) { dto.remainingMinutes = m; return this; }
            public SlaAlertDTOBuilder riskLevel(String rl) { dto.riskLevel = rl; return this; }
            public SlaAlertDTO build() { return dto; }
        }

        public Long getWorkOrderId() { return workOrderId; }
        public void setWorkOrderId(Long workOrderId) { this.workOrderId = workOrderId; }
        public String getWorkOrderNumber() { return workOrderNumber; }
        public void setWorkOrderNumber(String workOrderNumber) { this.workOrderNumber = workOrderNumber; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getFacilityName() { return facilityName; }
        public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
        public String getTechnicianName() { return technicianName; }
        public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }
        public Instant getResolutionSlaDue() { return resolutionSlaDue; }
        public void setResolutionSlaDue(Instant resolutionSlaDue) { this.resolutionSlaDue = resolutionSlaDue; }
        public Long getRemainingMinutes() { return remainingMinutes; }
        public void setRemainingMinutes(Long remainingMinutes) { this.remainingMinutes = remainingMinutes; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    }

    public static class DashboardResponseDTO {
        private KpiSummaryDTO kpis;
        private Map<String, Long> statusDistribution;
        private Map<String, Long> priorityDistribution;
        private List<SlaAlertDTO> urgentSlaAlerts;
        private List<WorkOrderDTO.AuditLogDTO> recentActivities;

        public DashboardResponseDTO() {}

        public static DashboardResponseDTOBuilder builder() { return new DashboardResponseDTOBuilder(); }
        public static class DashboardResponseDTOBuilder {
            private DashboardResponseDTO dto = new DashboardResponseDTO();
            public DashboardResponseDTOBuilder kpis(KpiSummaryDTO k) { dto.kpis = k; return this; }
            public DashboardResponseDTOBuilder statusDistribution(Map<String, Long> sd) { dto.statusDistribution = sd; return this; }
            public DashboardResponseDTOBuilder priorityDistribution(Map<String, Long> pd) { dto.priorityDistribution = pd; return this; }
            public DashboardResponseDTOBuilder urgentSlaAlerts(List<SlaAlertDTO> a) { dto.urgentSlaAlerts = a; return this; }
            public DashboardResponseDTOBuilder recentActivities(List<WorkOrderDTO.AuditLogDTO> act) { dto.recentActivities = act; return this; }
            public DashboardResponseDTO build() { return dto; }
        }

        public KpiSummaryDTO getKpis() { return kpis; }
        public void setKpis(KpiSummaryDTO kpis) { this.kpis = kpis; }
        public Map<String, Long> getStatusDistribution() { return statusDistribution; }
        public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }
        public Map<String, Long> getPriorityDistribution() { return priorityDistribution; }
        public void setPriorityDistribution(Map<String, Long> priorityDistribution) { this.priorityDistribution = priorityDistribution; }
        public List<SlaAlertDTO> getUrgentSlaAlerts() { return urgentSlaAlerts; }
        public void setUrgentSlaAlerts(List<SlaAlertDTO> urgentSlaAlerts) { this.urgentSlaAlerts = urgentSlaAlerts; }
        public List<WorkOrderDTO.AuditLogDTO> getRecentActivities() { return recentActivities; }
        public void setRecentActivities(List<WorkOrderDTO.AuditLogDTO> recentActivities) { this.recentActivities = recentActivities; }
    }
}
