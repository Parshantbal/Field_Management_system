package com.keystone.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ReportDTO {

    public static class ExecutiveReportDTO {
        private long totalWorkOrders;
        private long completedWorkOrders;
        private long openWorkOrders;
        private long breachedWorkOrders;
        private double slaCompliancePercentage;
        private BigDecimal totalLaborCost;
        private BigDecimal totalPartsCost;
        private BigDecimal grandTotalCost;
        private Map<String, Long> priorityBreakdown;
        private Map<String, Long> statusBreakdown;
        private List<FacilityCostDTO> facilityBreakdown;
        private List<TechnicianMetricDTO> technicianMetrics;

        public ExecutiveReportDTO() {}

        public long getTotalWorkOrders() { return totalWorkOrders; }
        public void setTotalWorkOrders(long totalWorkOrders) { this.totalWorkOrders = totalWorkOrders; }

        public long getCompletedWorkOrders() { return completedWorkOrders; }
        public void setCompletedWorkOrders(long completedWorkOrders) { this.completedWorkOrders = completedWorkOrders; }

        public long getOpenWorkOrders() { return openWorkOrders; }
        public void setOpenWorkOrders(long openWorkOrders) { this.openWorkOrders = openWorkOrders; }

        public long getBreachedWorkOrders() { return breachedWorkOrders; }
        public void setBreachedWorkOrders(long breachedWorkOrders) { this.breachedWorkOrders = breachedWorkOrders; }

        public double getSlaCompliancePercentage() { return slaCompliancePercentage; }
        public void setSlaCompliancePercentage(double slaCompliancePercentage) { this.slaCompliancePercentage = slaCompliancePercentage; }

        public BigDecimal getTotalLaborCost() { return totalLaborCost; }
        public void setTotalLaborCost(BigDecimal totalLaborCost) { this.totalLaborCost = totalLaborCost; }

        public BigDecimal getTotalPartsCost() { return totalPartsCost; }
        public void setTotalPartsCost(BigDecimal totalPartsCost) { this.totalPartsCost = totalPartsCost; }

        public BigDecimal getGrandTotalCost() { return grandTotalCost; }
        public void setGrandTotalCost(BigDecimal grandTotalCost) { this.grandTotalCost = grandTotalCost; }

        public Map<String, Long> getPriorityBreakdown() { return priorityBreakdown; }
        public void setPriorityBreakdown(Map<String, Long> priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }

        public Map<String, Long> getStatusBreakdown() { return statusBreakdown; }
        public void setStatusBreakdown(Map<String, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }

        public List<FacilityCostDTO> getFacilityBreakdown() { return facilityBreakdown; }
        public void setFacilityBreakdown(List<FacilityCostDTO> facilityBreakdown) { this.facilityBreakdown = facilityBreakdown; }

        public List<TechnicianMetricDTO> getTechnicianMetrics() { return technicianMetrics; }
        public void setTechnicianMetrics(List<TechnicianMetricDTO> technicianMetrics) { this.technicianMetrics = technicianMetrics; }
    }

    public static class FacilityCostDTO {
        private String facilityName;
        private long workOrderCount;
        private BigDecimal totalCost;

        public FacilityCostDTO() {}
        public FacilityCostDTO(String facilityName, long workOrderCount, BigDecimal totalCost) {
            this.facilityName = facilityName;
            this.workOrderCount = workOrderCount;
            this.totalCost = totalCost;
        }

        public String getFacilityName() { return facilityName; }
        public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

        public long getWorkOrderCount() { return workOrderCount; }
        public void setWorkOrderCount(long workOrderCount) { this.workOrderCount = workOrderCount; }

        public BigDecimal getTotalCost() { return totalCost; }
        public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    }

    public static class TechnicianMetricDTO {
        private String technicianName;
        private String specialization;
        private long assignedCount;
        private double averageRating;

        public TechnicianMetricDTO() {}
        public TechnicianMetricDTO(String technicianName, String specialization, long assignedCount, double averageRating) {
            this.technicianName = technicianName;
            this.specialization = specialization;
            this.assignedCount = assignedCount;
            this.averageRating = averageRating;
        }

        public String getTechnicianName() { return technicianName; }
        public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }

        public long getAssignedCount() { return assignedCount; }
        public void setAssignedCount(long assignedCount) { this.assignedCount = assignedCount; }

        public double getAverageRating() { return averageRating; }
        public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
    }
}
