package com.keystone.dto;

import com.keystone.model.Priority;
import com.keystone.model.WorkOrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class WorkOrderDTO {

    public static class CreateWorkOrderRequest {
        @NotBlank
        private String title;

        @NotBlank
        private String description;

        @NotNull
        private Priority priority;

        private Long facilityId;

        private Long assetId;
        private Long customerId;
        private Long technicianId;
        private Long adminId;

        private Instant scheduledStart;
        private Instant scheduledEnd;

        public CreateWorkOrderRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Priority getPriority() { return priority; }
        public void setPriority(Priority priority) { this.priority = priority; }
        public Long getFacilityId() { return facilityId; }
        public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
        public Long getAssetId() { return assetId; }
        public void setAssetId(Long assetId) { this.assetId = assetId; }
        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }
        public Long getTechnicianId() { return technicianId; }
        public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }
        public Long getAdminId() { return adminId; }
        public void setAdminId(Long adminId) { this.adminId = adminId; }
        public Instant getScheduledStart() { return scheduledStart; }
        public void setScheduledStart(Instant scheduledStart) { this.scheduledStart = scheduledStart; }
        public Instant getScheduledEnd() { return scheduledEnd; }
        public void setScheduledEnd(Instant scheduledEnd) { this.scheduledEnd = scheduledEnd; }
    }

    public static class AdminProviderDTO {
        private Long id;
        private String name;
        private String email;
        private String phone;

        public AdminProviderDTO() {}
        public AdminProviderDTO(Long id, String name, String email, String phone) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.phone = phone;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    public static class UpdateWorkOrderRequest {
        private String title;
        private String description;
        private Priority priority;
        private Long assetId;
        private Instant scheduledStart;
        private Instant scheduledEnd;

        public UpdateWorkOrderRequest() {}
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Priority getPriority() { return priority; }
        public void setPriority(Priority priority) { this.priority = priority; }
        public Long getAssetId() { return assetId; }
        public void setAssetId(Long assetId) { this.assetId = assetId; }
        public Instant getScheduledStart() { return scheduledStart; }
        public void setScheduledStart(Instant scheduledStart) { this.scheduledStart = scheduledStart; }
        public Instant getScheduledEnd() { return scheduledEnd; }
        public void setScheduledEnd(Instant scheduledEnd) { this.scheduledEnd = scheduledEnd; }
    }

    public static class AssignTechnicianRequest {
        @NotNull
        private Long technicianId;
        private Instant scheduledStart;
        private Instant scheduledEnd;
        private String notes;

        public AssignTechnicianRequest() {}
        public AssignTechnicianRequest(Long technicianId, Instant scheduledStart, Instant scheduledEnd, String notes) {
            this.technicianId = technicianId;
            this.scheduledStart = scheduledStart;
            this.scheduledEnd = scheduledEnd;
            this.notes = notes;
        }

        public static AssignTechnicianRequestBuilder builder() { return new AssignTechnicianRequestBuilder(); }
        public static class AssignTechnicianRequestBuilder {
            private Long technicianId;
            private Instant scheduledStart;
            private Instant scheduledEnd;
            private String notes;

            public AssignTechnicianRequestBuilder technicianId(Long technicianId) { this.technicianId = technicianId; return this; }
            public AssignTechnicianRequestBuilder scheduledStart(Instant scheduledStart) { this.scheduledStart = scheduledStart; return this; }
            public AssignTechnicianRequestBuilder scheduledEnd(Instant scheduledEnd) { this.scheduledEnd = scheduledEnd; return this; }
            public AssignTechnicianRequestBuilder notes(String notes) { this.notes = notes; return this; }
            public AssignTechnicianRequest build() {
                return new AssignTechnicianRequest(technicianId, scheduledStart, scheduledEnd, notes);
            }
        }

        public Long getTechnicianId() { return technicianId; }
        public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }
        public Instant getScheduledStart() { return scheduledStart; }
        public void setScheduledStart(Instant scheduledStart) { this.scheduledStart = scheduledStart; }
        public Instant getScheduledEnd() { return scheduledEnd; }
        public void setScheduledEnd(Instant scheduledEnd) { this.scheduledEnd = scheduledEnd; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class ChangeStatusRequest {
        @NotNull
        private WorkOrderStatus status;
        private String notes;

        public ChangeStatusRequest() {}
        public ChangeStatusRequest(WorkOrderStatus status, String notes) {
            this.status = status;
            this.notes = notes;
        }
        public WorkOrderStatus getStatus() { return status; }
        public void setStatus(WorkOrderStatus status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class ResolutionRequest {
        @NotBlank
        private String resolutionNotes;

        public ResolutionRequest() {}
        public ResolutionRequest(String resolutionNotes) {
            this.resolutionNotes = resolutionNotes;
        }
        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    }

    public static class CustomerFeedbackRequest {
        @NotNull
        private Integer rating;
        private String feedback;

        public CustomerFeedbackRequest() {}
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getFeedback() { return feedback; }
        public void setFeedback(String feedback) { this.feedback = feedback; }
    }

    public static class WorkOrderResponseDTO {
        private Long id;
        private String workOrderNumber;
        private String title;
        private String description;
        private Priority priority;
        private WorkOrderStatus status;

        private Long facilityId;
        private String facilityName;
        private String facilityCode;
        private String facilityAddress;

        private Long assetId;
        private String assetName;
        private String assetTagNumber;
        private String assetCategory;
        private String assetLocation;

        private Long customerId;
        private String customerName;
        private String customerEmail;
        private String customerPhone;

        private Long technicianId;
        private String technicianName;
        private String technicianSpecialization;
        private String technicianPhone;

        private Instant scheduledStart;
        private Instant scheduledEnd;

        private Instant responseSlaDue;
        private Instant resolutionSlaDue;
        private Instant respondedAt;
        private Instant resolvedAt;
        private String slaRiskLevel;
        private Long responseRemainingMinutes;
        private Long resolutionRemainingMinutes;
        private Boolean responseBreached;
        private Boolean resolutionBreached;

        private String resolutionNotes;
        private Integer customerRating;
        private String customerFeedback;

        private BigDecimal totalLaborCost;
        private BigDecimal totalPartsCost;
        private BigDecimal totalCost;

        private List<WorkOrderPartDTO> partsUsed;
        private List<TimeEntryResponseDTO> timeEntries;
        private List<AuditLogDTO> auditLogs;

        private Instant createdAt;
        private Instant updatedAt;
        private String dispatchStatus;
        private String dispatchRejectionReason;

        public WorkOrderResponseDTO() {}

        public static WorkOrderResponseDTOBuilder builder() { return new WorkOrderResponseDTOBuilder(); }

        public static class WorkOrderResponseDTOBuilder {
            private WorkOrderResponseDTO dto = new WorkOrderResponseDTO();

            public WorkOrderResponseDTOBuilder id(Long id) { dto.id = id; return this; }
            public WorkOrderResponseDTOBuilder workOrderNumber(String num) { dto.workOrderNumber = num; return this; }
            public WorkOrderResponseDTOBuilder title(String title) { dto.title = title; return this; }
            public WorkOrderResponseDTOBuilder description(String desc) { dto.description = desc; return this; }
            public WorkOrderResponseDTOBuilder priority(Priority p) { dto.priority = p; return this; }
            public WorkOrderResponseDTOBuilder status(WorkOrderStatus s) { dto.status = s; return this; }
            public WorkOrderResponseDTOBuilder facilityId(Long fId) { dto.facilityId = fId; return this; }
            public WorkOrderResponseDTOBuilder facilityName(String fName) { dto.facilityName = fName; return this; }
            public WorkOrderResponseDTOBuilder facilityCode(String fCode) { dto.facilityCode = fCode; return this; }
            public WorkOrderResponseDTOBuilder facilityAddress(String fAddr) { dto.facilityAddress = fAddr; return this; }
            public WorkOrderResponseDTOBuilder assetId(Long aId) { dto.assetId = aId; return this; }
            public WorkOrderResponseDTOBuilder assetName(String aName) { dto.assetName = aName; return this; }
            public WorkOrderResponseDTOBuilder assetTagNumber(String aTag) { dto.assetTagNumber = aTag; return this; }
            public WorkOrderResponseDTOBuilder assetCategory(String aCat) { dto.assetCategory = aCat; return this; }
            public WorkOrderResponseDTOBuilder assetLocation(String aLoc) { dto.assetLocation = aLoc; return this; }
            public WorkOrderResponseDTOBuilder customerId(Long cId) { dto.customerId = cId; return this; }
            public WorkOrderResponseDTOBuilder customerName(String cName) { dto.customerName = cName; return this; }
            public WorkOrderResponseDTOBuilder customerEmail(String cEmail) { dto.customerEmail = cEmail; return this; }
            public WorkOrderResponseDTOBuilder customerPhone(String cPhone) { dto.customerPhone = cPhone; return this; }
            public WorkOrderResponseDTOBuilder technicianId(Long tId) { dto.technicianId = tId; return this; }
            public WorkOrderResponseDTOBuilder technicianName(String tName) { dto.technicianName = tName; return this; }
            public WorkOrderResponseDTOBuilder technicianSpecialization(String tSpec) { dto.technicianSpecialization = tSpec; return this; }
            public WorkOrderResponseDTOBuilder technicianPhone(String tPhone) { dto.technicianPhone = tPhone; return this; }
            public WorkOrderResponseDTOBuilder scheduledStart(Instant s) { dto.scheduledStart = s; return this; }
            public WorkOrderResponseDTOBuilder scheduledEnd(Instant e) { dto.scheduledEnd = e; return this; }
            public WorkOrderResponseDTOBuilder responseSlaDue(Instant r) { dto.responseSlaDue = r; return this; }
            public WorkOrderResponseDTOBuilder resolutionSlaDue(Instant r) { dto.resolutionSlaDue = r; return this; }
            public WorkOrderResponseDTOBuilder respondedAt(Instant r) { dto.respondedAt = r; return this; }
            public WorkOrderResponseDTOBuilder resolvedAt(Instant r) { dto.resolvedAt = r; return this; }
            public WorkOrderResponseDTOBuilder slaRiskLevel(String risk) { dto.slaRiskLevel = risk; return this; }
            public WorkOrderResponseDTOBuilder responseRemainingMinutes(Long min) { dto.responseRemainingMinutes = min; return this; }
            public WorkOrderResponseDTOBuilder resolutionRemainingMinutes(Long min) { dto.resolutionRemainingMinutes = min; return this; }
            public WorkOrderResponseDTOBuilder responseBreached(Boolean b) { dto.responseBreached = b; return this; }
            public WorkOrderResponseDTOBuilder resolutionBreached(Boolean b) { dto.resolutionBreached = b; return this; }
            public WorkOrderResponseDTOBuilder resolutionNotes(String notes) { dto.resolutionNotes = notes; return this; }
            public WorkOrderResponseDTOBuilder customerRating(Integer rating) { dto.customerRating = rating; return this; }
            public WorkOrderResponseDTOBuilder customerFeedback(String fb) { dto.customerFeedback = fb; return this; }
            public WorkOrderResponseDTOBuilder totalLaborCost(BigDecimal cost) { dto.totalLaborCost = cost; return this; }
            public WorkOrderResponseDTOBuilder totalPartsCost(BigDecimal cost) { dto.totalPartsCost = cost; return this; }
            public WorkOrderResponseDTOBuilder totalCost(BigDecimal cost) { dto.totalCost = cost; return this; }
            public WorkOrderResponseDTOBuilder partsUsed(List<WorkOrderPartDTO> parts) { dto.partsUsed = parts; return this; }
            public WorkOrderResponseDTOBuilder timeEntries(List<TimeEntryResponseDTO> times) { dto.timeEntries = times; return this; }
            public WorkOrderResponseDTOBuilder auditLogs(List<AuditLogDTO> logs) { dto.auditLogs = logs; return this; }
            public WorkOrderResponseDTOBuilder createdAt(Instant c) { dto.createdAt = c; return this; }
            public WorkOrderResponseDTOBuilder updatedAt(Instant u) { dto.updatedAt = u; return this; }
            public WorkOrderResponseDTOBuilder dispatchStatus(String ds) { dto.dispatchStatus = ds; return this; }
            public WorkOrderResponseDTOBuilder dispatchRejectionReason(String dr) { dto.dispatchRejectionReason = dr; return this; }
            public WorkOrderResponseDTO build() { return dto; }
        }

        // Getters and Setters
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
        public Long getFacilityId() { return facilityId; }
        public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
        public String getFacilityName() { return facilityName; }
        public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
        public String getFacilityCode() { return facilityCode; }
        public void setFacilityCode(String facilityCode) { this.facilityCode = facilityCode; }
        public String getFacilityAddress() { return facilityAddress; }
        public void setFacilityAddress(String facilityAddress) { this.facilityAddress = facilityAddress; }
        public Long getAssetId() { return assetId; }
        public void setAssetId(Long assetId) { this.assetId = assetId; }
        public String getAssetName() { return assetName; }
        public void setAssetName(String assetName) { this.assetName = assetName; }
        public String getAssetTagNumber() { return assetTagNumber; }
        public void setAssetTagNumber(String assetTagNumber) { this.assetTagNumber = assetTagNumber; }
        public String getAssetCategory() { return assetCategory; }
        public void setAssetCategory(String assetCategory) { this.assetCategory = assetCategory; }
        public String getAssetLocation() { return assetLocation; }
        public void setAssetLocation(String assetLocation) { this.assetLocation = assetLocation; }
        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
        public Long getTechnicianId() { return technicianId; }
        public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }
        public String getTechnicianName() { return technicianName; }
        public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }
        public String getTechnicianSpecialization() { return technicianSpecialization; }
        public void setTechnicianSpecialization(String technicianSpecialization) { this.technicianSpecialization = technicianSpecialization; }
        public String getTechnicianPhone() { return technicianPhone; }
        public void setTechnicianPhone(String technicianPhone) { this.technicianPhone = technicianPhone; }
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
        public String getSlaRiskLevel() { return slaRiskLevel; }
        public void setSlaRiskLevel(String slaRiskLevel) { this.slaRiskLevel = slaRiskLevel; }
        public Long getResponseRemainingMinutes() { return responseRemainingMinutes; }
        public void setResponseRemainingMinutes(Long responseRemainingMinutes) { this.responseRemainingMinutes = responseRemainingMinutes; }
        public Long getResolutionRemainingMinutes() { return resolutionRemainingMinutes; }
        public void setResolutionRemainingMinutes(Long resolutionRemainingMinutes) { this.resolutionRemainingMinutes = resolutionRemainingMinutes; }
        public Boolean getResponseBreached() { return responseBreached; }
        public void setResponseBreached(Boolean responseBreached) { this.responseBreached = responseBreached; }
        public Boolean getResolutionBreached() { return resolutionBreached; }
        public void setResolutionBreached(Boolean resolutionBreached) { this.resolutionBreached = resolutionBreached; }
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
        public List<WorkOrderPartDTO> getPartsUsed() { return partsUsed; }
        public void setPartsUsed(List<WorkOrderPartDTO> partsUsed) { this.partsUsed = partsUsed; }
        public List<TimeEntryResponseDTO> getTimeEntries() { return timeEntries; }
        public void setTimeEntries(List<TimeEntryResponseDTO> timeEntries) { this.timeEntries = timeEntries; }
        public List<AuditLogDTO> getAuditLogs() { return auditLogs; }
        public void setAuditLogs(List<AuditLogDTO> auditLogs) { this.auditLogs = auditLogs; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
        public String getDispatchStatus() { return dispatchStatus; }
        public void setDispatchStatus(String dispatchStatus) { this.dispatchStatus = dispatchStatus; }
        public String getDispatchRejectionReason() { return dispatchRejectionReason; }
        public void setDispatchRejectionReason(String dispatchRejectionReason) { this.dispatchRejectionReason = dispatchRejectionReason; }
    }

    public static class RejectJobRequest {
        private String reason;

        public RejectJobRequest() {}
        public RejectJobRequest(String reason) { this.reason = reason; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class WorkOrderPartDTO {
        private Long id;
        private Long partId;
        private String partNumber;
        private String partName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalCost;
        private Instant loggedAt;

        public WorkOrderPartDTO() {}

        public static WorkOrderPartDTOBuilder builder() { return new WorkOrderPartDTOBuilder(); }
        public static class WorkOrderPartDTOBuilder {
            private WorkOrderPartDTO dto = new WorkOrderPartDTO();
            public WorkOrderPartDTOBuilder id(Long id) { dto.id = id; return this; }
            public WorkOrderPartDTOBuilder partId(Long partId) { dto.partId = partId; return this; }
            public WorkOrderPartDTOBuilder partNumber(String partNumber) { dto.partNumber = partNumber; return this; }
            public WorkOrderPartDTOBuilder partName(String partName) { dto.partName = partName; return this; }
            public WorkOrderPartDTOBuilder quantity(Integer quantity) { dto.quantity = quantity; return this; }
            public WorkOrderPartDTOBuilder unitPrice(BigDecimal unitPrice) { dto.unitPrice = unitPrice; return this; }
            public WorkOrderPartDTOBuilder totalCost(BigDecimal totalCost) { dto.totalCost = totalCost; return this; }
            public WorkOrderPartDTOBuilder loggedAt(Instant loggedAt) { dto.loggedAt = loggedAt; return this; }
            public WorkOrderPartDTO build() { return dto; }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getPartId() { return partId; }
        public void setPartId(Long partId) { this.partId = partId; }
        public String getPartNumber() { return partNumber; }
        public void setPartNumber(String partNumber) { this.partNumber = partNumber; }
        public String getPartName() { return partName; }
        public void setPartName(String partName) { this.partName = partName; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public BigDecimal getTotalCost() { return totalCost; }
        public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
        public Instant getLoggedAt() { return loggedAt; }
        public void setLoggedAt(Instant loggedAt) { this.loggedAt = loggedAt; }
    }

    public static class TimeEntryResponseDTO {
        private Long id;
        private Long technicianId;
        private String technicianName;
        private String entryType;
        private Instant startTime;
        private Instant endTime;
        private Long durationMinutes;
        private BigDecimal hourlyRate;
        private BigDecimal laborCost;
        private String notes;

        public TimeEntryResponseDTO() {}

        public static TimeEntryResponseDTOBuilder builder() { return new TimeEntryResponseDTOBuilder(); }
        public static class TimeEntryResponseDTOBuilder {
            private TimeEntryResponseDTO dto = new TimeEntryResponseDTO();
            public TimeEntryResponseDTOBuilder id(Long id) { dto.id = id; return this; }
            public TimeEntryResponseDTOBuilder technicianId(Long technicianId) { dto.technicianId = technicianId; return this; }
            public TimeEntryResponseDTOBuilder technicianName(String technicianName) { dto.technicianName = technicianName; return this; }
            public TimeEntryResponseDTOBuilder entryType(String entryType) { dto.entryType = entryType; return this; }
            public TimeEntryResponseDTOBuilder startTime(Instant startTime) { dto.startTime = startTime; return this; }
            public TimeEntryResponseDTOBuilder endTime(Instant endTime) { dto.endTime = endTime; return this; }
            public TimeEntryResponseDTOBuilder durationMinutes(Long durationMinutes) { dto.durationMinutes = durationMinutes; return this; }
            public TimeEntryResponseDTOBuilder hourlyRate(BigDecimal hourlyRate) { dto.hourlyRate = hourlyRate; return this; }
            public TimeEntryResponseDTOBuilder laborCost(BigDecimal laborCost) { dto.laborCost = laborCost; return this; }
            public TimeEntryResponseDTOBuilder notes(String notes) { dto.notes = notes; return this; }
            public TimeEntryResponseDTO build() { return dto; }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getTechnicianId() { return technicianId; }
        public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }
        public String getTechnicianName() { return technicianName; }
        public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }
        public String getEntryType() { return entryType; }
        public void setEntryType(String entryType) { this.entryType = entryType; }
        public Instant getStartTime() { return startTime; }
        public void setStartTime(Instant startTime) { this.startTime = startTime; }
        public Instant getEndTime() { return endTime; }
        public void setEndTime(Instant endTime) { this.endTime = endTime; }
        public Long getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Long durationMinutes) { this.durationMinutes = durationMinutes; }
        public BigDecimal getHourlyRate() { return hourlyRate; }
        public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }
        public BigDecimal getLaborCost() { return laborCost; }
        public void setLaborCost(BigDecimal laborCost) { this.laborCost = laborCost; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class AuditLogDTO {
        private Long id;
        private String performedByName;
        private String action;
        private WorkOrderStatus fromStatus;
        private WorkOrderStatus toStatus;
        private String notes;
        private Instant timestamp;

        public AuditLogDTO() {}

        public static AuditLogDTOBuilder builder() { return new AuditLogDTOBuilder(); }
        public static class AuditLogDTOBuilder {
            private AuditLogDTO dto = new AuditLogDTO();
            public AuditLogDTOBuilder id(Long id) { dto.id = id; return this; }
            public AuditLogDTOBuilder performedByName(String name) { dto.performedByName = name; return this; }
            public AuditLogDTOBuilder action(String action) { dto.action = action; return this; }
            public AuditLogDTOBuilder fromStatus(WorkOrderStatus from) { dto.fromStatus = from; return this; }
            public AuditLogDTOBuilder toStatus(WorkOrderStatus to) { dto.toStatus = to; return this; }
            public AuditLogDTOBuilder notes(String notes) { dto.notes = notes; return this; }
            public AuditLogDTOBuilder timestamp(Instant ts) { dto.timestamp = ts; return this; }
            public AuditLogDTO build() { return dto; }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getPerformedByName() { return performedByName; }
        public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public WorkOrderStatus getFromStatus() { return fromStatus; }
        public void setFromStatus(WorkOrderStatus fromStatus) { this.fromStatus = fromStatus; }
        public WorkOrderStatus getToStatus() { return toStatus; }
        public void setToStatus(WorkOrderStatus toStatus) { this.toStatus = toStatus; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }
}
