package com.keystone.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_orders")
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 50)
    private String workOrderNumber;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Priority priority;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WorkOrderStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "technician_id")
    private Technician assignedTechnician;

    private Instant scheduledStart;
    private Instant scheduledEnd;

    private Instant responseSlaDue;
    private Instant resolutionSlaDue;
    private Instant respondedAt;
    private Instant resolvedAt;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    private Integer customerRating;

    @Column(columnDefinition = "TEXT")
    private String customerFeedback;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalLaborCost = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalPartsCost = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkOrderPart> partsUsed = new ArrayList<>();

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimeEntry> timeEntries = new ArrayList<>();

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp DESC")
    private List<AuditLog> auditLogs = new ArrayList<>();

    @Column
    private Long adminId;

    @Column(length = 30)
    private String dispatchStatus;

    @Column(length = 500)
    private String dispatchRejectionReason;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public WorkOrder() {}

    public static WorkOrderBuilder builder() {
        return new WorkOrderBuilder();
    }

    public static class WorkOrderBuilder {
        private Long id;
        private String workOrderNumber;
        private String title;
        private String description;
        private Priority priority;
        private WorkOrderStatus status;
        private Facility facility;
        private Asset asset;
        private User customer;
        private Technician assignedTechnician;
        private Instant scheduledStart;
        private Instant scheduledEnd;
        private Instant responseSlaDue;
        private Instant resolutionSlaDue;
        private Instant respondedAt;
        private Instant resolvedAt;
        private String resolutionNotes;
        private Integer customerRating;
        private String customerFeedback;
        private BigDecimal totalLaborCost = BigDecimal.ZERO;
        private BigDecimal totalPartsCost = BigDecimal.ZERO;
        private BigDecimal totalCost = BigDecimal.ZERO;
        private List<WorkOrderPart> partsUsed = new ArrayList<>();
        private List<TimeEntry> timeEntries = new ArrayList<>();
        private List<AuditLog> auditLogs = new ArrayList<>();
        private Long adminId;
        private String dispatchStatus;
        private String dispatchRejectionReason;

        public WorkOrderBuilder id(Long id) { this.id = id; return this; }
        public WorkOrderBuilder workOrderNumber(String workOrderNumber) { this.workOrderNumber = workOrderNumber; return this; }
        public WorkOrderBuilder title(String title) { this.title = title; return this; }
        public WorkOrderBuilder description(String description) { this.description = description; return this; }
        public WorkOrderBuilder priority(Priority priority) { this.priority = priority; return this; }
        public WorkOrderBuilder status(WorkOrderStatus status) { this.status = status; return this; }
        public WorkOrderBuilder facility(Facility facility) { this.facility = facility; return this; }
        public WorkOrderBuilder asset(Asset asset) { this.asset = asset; return this; }
        public WorkOrderBuilder customer(User customer) { this.customer = customer; return this; }
        public WorkOrderBuilder assignedTechnician(Technician assignedTechnician) { this.assignedTechnician = assignedTechnician; return this; }
        public WorkOrderBuilder scheduledStart(Instant scheduledStart) { this.scheduledStart = scheduledStart; return this; }
        public WorkOrderBuilder scheduledEnd(Instant scheduledEnd) { this.scheduledEnd = scheduledEnd; return this; }
        public WorkOrderBuilder responseSlaDue(Instant responseSlaDue) { this.responseSlaDue = responseSlaDue; return this; }
        public WorkOrderBuilder resolutionSlaDue(Instant resolutionSlaDue) { this.resolutionSlaDue = resolutionSlaDue; return this; }
        public WorkOrderBuilder respondedAt(Instant respondedAt) { this.respondedAt = respondedAt; return this; }
        public WorkOrderBuilder resolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; return this; }
        public WorkOrderBuilder resolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; return this; }
        public WorkOrderBuilder customerRating(Integer customerRating) { this.customerRating = customerRating; return this; }
        public WorkOrderBuilder customerFeedback(String customerFeedback) { this.customerFeedback = customerFeedback; return this; }
        public WorkOrderBuilder totalLaborCost(BigDecimal totalLaborCost) { this.totalLaborCost = totalLaborCost; return this; }
        public WorkOrderBuilder totalPartsCost(BigDecimal totalPartsCost) { this.totalPartsCost = totalPartsCost; return this; }
        public WorkOrderBuilder totalCost(BigDecimal totalCost) { this.totalCost = totalCost; return this; }
        public WorkOrderBuilder partsUsed(List<WorkOrderPart> partsUsed) { this.partsUsed = partsUsed; return this; }
        public WorkOrderBuilder timeEntries(List<TimeEntry> timeEntries) { this.timeEntries = timeEntries; return this; }
        public WorkOrderBuilder auditLogs(List<AuditLog> auditLogs) { this.auditLogs = auditLogs; return this; }
        public WorkOrderBuilder adminId(Long adminId) { this.adminId = adminId; return this; }
        public WorkOrderBuilder dispatchStatus(String dispatchStatus) { this.dispatchStatus = dispatchStatus; return this; }
        public WorkOrderBuilder dispatchRejectionReason(String dispatchRejectionReason) { this.dispatchRejectionReason = dispatchRejectionReason; return this; }

        public WorkOrder build() {
            WorkOrder wo = new WorkOrder();
            wo.id = this.id;
            wo.workOrderNumber = this.workOrderNumber;
            wo.title = this.title;
            wo.description = this.description;
            wo.priority = this.priority;
            wo.status = this.status;
            wo.facility = this.facility;
            wo.asset = this.asset;
            wo.customer = this.customer;
            wo.assignedTechnician = this.assignedTechnician;
            wo.scheduledStart = this.scheduledStart;
            wo.scheduledEnd = this.scheduledEnd;
            wo.responseSlaDue = this.responseSlaDue;
            wo.resolutionSlaDue = this.resolutionSlaDue;
            wo.respondedAt = this.respondedAt;
            wo.resolvedAt = this.resolvedAt;
            wo.resolutionNotes = this.resolutionNotes;
            wo.customerRating = this.customerRating;
            wo.customerFeedback = this.customerFeedback;
            wo.totalLaborCost = (this.totalLaborCost != null) ? this.totalLaborCost : BigDecimal.ZERO;
            wo.totalPartsCost = (this.totalPartsCost != null) ? this.totalPartsCost : BigDecimal.ZERO;
            wo.totalCost = (this.totalCost != null) ? this.totalCost : BigDecimal.ZERO;
            wo.partsUsed = (this.partsUsed != null) ? this.partsUsed : new ArrayList<>();
            wo.timeEntries = (this.timeEntries != null) ? this.timeEntries : new ArrayList<>();
            wo.auditLogs = (this.auditLogs != null) ? this.auditLogs : new ArrayList<>();
            wo.adminId = this.adminId;
            wo.dispatchStatus = this.dispatchStatus;
            wo.dispatchRejectionReason = this.dispatchRejectionReason;
            return wo;
        }
    }

    public void recalculateTotals() {
        BigDecimal partsSum = BigDecimal.ZERO;
        if (partsUsed != null) {
            for (WorkOrderPart p : partsUsed) {
                if (p.getTotalCost() != null) {
                    partsSum = partsSum.add(p.getTotalCost());
                }
            }
        }
        this.totalPartsCost = partsSum;

        BigDecimal laborSum = BigDecimal.ZERO;
        if (timeEntries != null) {
            for (TimeEntry t : timeEntries) {
                if (t.getLaborCost() != null) {
                    laborSum = laborSum.add(t.getLaborCost());
                }
            }
        }
        this.totalLaborCost = laborSum;

        this.totalCost = this.totalPartsCost.add(this.totalLaborCost);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getWorkOrderNumber() { return workOrderNumber; }
    public void setWorkOrderNumber(String workOrderNumber) { this.workOrderNumber = workOrderNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public WorkOrderStatus getStatus() { return status; }
    public void setStatus(WorkOrderStatus status) { this.status = status; }

    public Facility getFacility() { return facility; }
    public void setFacility(Facility facility) { this.facility = facility; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public Technician getAssignedTechnician() { return assignedTechnician; }
    public void setAssignedTechnician(Technician assignedTechnician) { this.assignedTechnician = assignedTechnician; }

    public Instant getScheduledStart() { return scheduledStart; }
    public void setScheduledStart(Instant scheduledStart) { this.scheduledStart = scheduledStart; }

    public Instant getScheduledEnd() { return scheduledEnd; }
    public void setScheduledEnd(Instant scheduledEnd) { this.scheduledEnd = scheduledEnd; }

    public Instant getResponseSlaDue() { return responseSlaDue; }
    public void setResponseSlaDue(Instant responseSlaDue) { this.responseSlaDue = responseSlaDue; }

    public Instant getResolutionSlaDue() { return resolutionSlaDue; }
    public void setResolutionSlaDue(Instant resolutionSlaDue) { this.resolutionSlaDue = resolutionSlaDue; }

    public Instant getRespondedAt() { return respondedAt; }
    public void setRespondedAt(Instant respondedAt) { this.respondedAt = respondedAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public Integer getCustomerRating() { return customerRating; }
    public void setCustomerRating(Integer customerRating) { this.customerRating = customerRating; }

    public String getCustomerFeedback() { return customerFeedback; }
    public void setCustomerFeedback(String customerFeedback) { this.customerFeedback = customerFeedback; }

    public BigDecimal getTotalLaborCost() { return totalLaborCost; }
    public void setTotalLaborCost(BigDecimal totalLaborCost) { this.totalLaborCost = totalLaborCost; }

    public BigDecimal getTotalPartsCost() { return totalPartsCost; }
    public void setTotalPartsCost(BigDecimal totalPartsCost) { this.totalPartsCost = totalPartsCost; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public List<WorkOrderPart> getPartsUsed() { return partsUsed; }
    public void setPartsUsed(List<WorkOrderPart> partsUsed) { this.partsUsed = partsUsed; }

    public List<TimeEntry> getTimeEntries() { return timeEntries; }
    public void setTimeEntries(List<TimeEntry> timeEntries) { this.timeEntries = timeEntries; }

    public List<AuditLog> getAuditLogs() { return auditLogs; }
    public void setAuditLogs(List<AuditLog> auditLogs) { this.auditLogs = auditLogs; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public String getDispatchStatus() { return dispatchStatus; }
    public void setDispatchStatus(String dispatchStatus) { this.dispatchStatus = dispatchStatus; }

    public String getDispatchRejectionReason() { return dispatchRejectionReason; }
    public void setDispatchRejectionReason(String dispatchRejectionReason) { this.dispatchRejectionReason = dispatchRejectionReason; }
}
