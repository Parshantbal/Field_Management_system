package com.keystone.service;

import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.*;
import com.keystone.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final FacilityRepository facilityRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final TechnicianRepository technicianRepository;
    private final AuditLogRepository auditLogRepository;
    private final SlaService slaService;
    private final NotificationService notificationService;

    private static final AtomicLong WO_SEQUENCE = new AtomicLong(100);

    public WorkOrderService(
            WorkOrderRepository workOrderRepository,
            FacilityRepository facilityRepository,
            AssetRepository assetRepository,
            UserRepository userRepository,
            TechnicianRepository technicianRepository,
            AuditLogRepository auditLogRepository,
            SlaService slaService,
            NotificationService notificationService
    ) {
        this.workOrderRepository = workOrderRepository;
        this.facilityRepository = facilityRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.technicianRepository = technicianRepository;
        this.auditLogRepository = auditLogRepository;
        this.slaService = slaService;
        this.notificationService = notificationService;
    }

    @jakarta.annotation.PostConstruct
    public void initSequence() {
        try {
            long max = workOrderRepository.findAll().stream()
                    .map(WorkOrder::getWorkOrderNumber)
                    .filter(java.util.Objects::nonNull)
                    .mapToLong(num -> {
                        try {
                            String[] parts = num.split("-");
                            return Long.parseLong(parts[parts.length - 1]);
                        } catch (Exception e) {
                            return 0L;
                        }
                    })
                    .max()
                    .orElse(100L);
            WO_SEQUENCE.set(Math.max(100L, max));
        } catch (Exception ignored) {
        }
    }

    public synchronized String generateWorkOrderNumber() {
        int year = java.time.Year.now().getValue();
        String candidate;
        do {
            long seq = WO_SEQUENCE.incrementAndGet();
            candidate = String.format("WO-%d-%05d", year, seq);
        } while (workOrderRepository.existsByWorkOrderNumber(candidate));
        return candidate;
    }

    @Transactional
    public WorkOrderDTO.WorkOrderResponseDTO createWorkOrder(WorkOrderDTO.CreateWorkOrderRequest request, User currentUser) {
        Long adminId = request.getAdminId();
        if (adminId == null) {
            adminId = currentUser.getAdminId();
        }
        if (adminId == null && currentUser.getRole() == Role.ROLE_ADMIN) {
            adminId = currentUser.getId();
        }

        Facility facility = null;
        if (request.getFacilityId() != null) {
            facility = facilityRepository.findById(request.getFacilityId()).orElse(null);
        }
        if (facility == null && adminId != null) {
            List<Facility> facList = facilityRepository.findByAdminId(adminId);
            if (!facList.isEmpty()) {
                facility = facList.get(0);
            }
        }
        if (facility == null) {
            facility = facilityRepository.findAll().stream().findFirst().orElse(null);
        }
        if (facility == null) {
            facility = facilityRepository.save(Facility.builder()
                    .name("Main Service Hub")
                    .code("HUB-" + (adminId != null ? adminId : 1) + "-" + (System.currentTimeMillis() % 10000))
                    .addressLine("Primary Operations Facility")
                    .city("Central")
                    .state("Metro")
                    .postalCode("10001")
                    .adminId(adminId != null ? adminId : 1L)
                    .build());
        }

        if (adminId == null && facility != null) {
            adminId = facility.getAdminId();
        }
        if (adminId == null) {
            adminId = 1L;
        }

        Asset asset = null;
        if (request.getAssetId() != null) {
            asset = assetRepository.findById(request.getAssetId()).orElse(null);
        }

        User customer = currentUser;
        if (request.getCustomerId() != null && (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_DISPATCHER)) {
            customer = userRepository.findById(request.getCustomerId()).orElse(currentUser);
        }

        Technician technician = null;
        if (request.getTechnicianId() != null) {
            technician = technicianRepository.findById(request.getTechnicianId()).orElse(null);
        }

        Instant now = Instant.now();
        Instant responseDue = slaService.calculateResponseSlaDue(request.getPriority(), now);
        Instant resolutionDue = slaService.calculateResolutionSlaDue(request.getPriority(), now);

        String woNumber = generateWorkOrderNumber();
        WorkOrderStatus initialStatus = (technician != null) ? WorkOrderStatus.ASSIGNED : WorkOrderStatus.OPEN;

        WorkOrder workOrder = WorkOrder.builder()
                .workOrderNumber(woNumber)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(initialStatus)
                .facility(facility)
                .asset(asset)
                .customer(customer)
                .assignedTechnician(technician)
                .scheduledStart(request.getScheduledStart())
                .scheduledEnd(request.getScheduledEnd())
                .responseSlaDue(responseDue)
                .resolutionSlaDue(resolutionDue)
                .adminId(adminId)
                .build();

        if (technician != null) {
            workOrder.setRespondedAt(now);
            technician.setActiveJobsCount(technician.getActiveJobsCount() + 1);
            technician.setStatus("ON_JOB");
            technicianRepository.save(technician);
        }

        WorkOrder saved = workOrderRepository.save(workOrder);

        AuditLog log = AuditLog.builder()
                .workOrder(saved)
                .performedBy(currentUser)
                .action("CREATED")
                .toStatus(initialStatus)
                .notes("Work order submitted with priority " + request.getPriority())
                .build();
        auditLogRepository.save(log);

        return mapToDTO(saved);
    }

    @Transactional
    public WorkOrderDTO.WorkOrderResponseDTO assignTechnician(Long workOrderId, WorkOrderDTO.AssignTechnicianRequest request, User currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + workOrderId));

        Technician technician = technicianRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new IllegalArgumentException("Technician not found: " + request.getTechnicianId()));

        Technician oldTech = workOrder.getAssignedTechnician();
        if (oldTech != null && !oldTech.getId().equals(technician.getId())) {
            oldTech.setActiveJobsCount(Math.max(0, oldTech.getActiveJobsCount() - 1));
            if (oldTech.getActiveJobsCount() == 0) oldTech.setStatus("AVAILABLE");
            technicianRepository.save(oldTech);
        }

        workOrder.setAssignedTechnician(technician);
        technician.setActiveJobsCount(technician.getActiveJobsCount() + 1);
        technician.setStatus("ON_JOB");
        technicianRepository.save(technician);

        if (request.getScheduledStart() != null) workOrder.setScheduledStart(request.getScheduledStart());
        if (request.getScheduledEnd() != null) workOrder.setScheduledEnd(request.getScheduledEnd());

        WorkOrderStatus oldStatus = workOrder.getStatus();
        workOrder.setStatus(WorkOrderStatus.ASSIGNED);
        if (workOrder.getRespondedAt() == null) {
            workOrder.setRespondedAt(Instant.now());
        }

        WorkOrder updated = workOrderRepository.save(workOrder);

        AuditLog log = AuditLog.builder()
                .workOrder(updated)
                .performedBy(currentUser)
                .action("ASSIGNED")
                .fromStatus(oldStatus)
                .toStatus(WorkOrderStatus.ASSIGNED)
                .notes("Assigned to " + technician.getName() + (request.getNotes() != null ? ": " + request.getNotes() : ""))
                .build();
        auditLogRepository.save(log);

        // Notify assigned technician
        if (technician.getUser() != null) {
            try {
                com.keystone.dto.NotificationDTO.SendNotificationRequest techNotif = new com.keystone.dto.NotificationDTO.SendNotificationRequest();
                techNotif.setRecipientId(technician.getUser().getId());
                techNotif.setTitle("New Job Assigned");
                techNotif.setMessage("You have been assigned to Work Order " + updated.getWorkOrderNumber() + ": " + updated.getTitle());
                techNotif.setType("DISPATCH");
                techNotif.setReferenceId(updated.getId());
                notificationService.sendNotification(techNotif);
            } catch (Exception ignored) {}
        }

        // Notify customer
        if (updated.getCustomer() != null) {
            try {
                com.keystone.dto.NotificationDTO.SendNotificationRequest custNotif = new com.keystone.dto.NotificationDTO.SendNotificationRequest();
                custNotif.setRecipientId(updated.getCustomer().getId());
                custNotif.setTitle("Technician Assigned");
                custNotif.setMessage("Technician " + technician.getName() + " has been assigned to your service request (" + updated.getWorkOrderNumber() + ").");
                custNotif.setType("STATUS_UPDATE");
                custNotif.setReferenceId(updated.getId());
                notificationService.sendNotification(custNotif);
            } catch (Exception ignored) {}
        }

        return mapToDTO(updated);
    }

    @Transactional
    public WorkOrderDTO.WorkOrderResponseDTO changeStatus(Long workOrderId, WorkOrderDTO.ChangeStatusRequest request, User currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + workOrderId));

        WorkOrderStatus oldStatus = workOrder.getStatus();
        WorkOrderStatus newStatus = request.getStatus();

        if (oldStatus == newStatus) {
            return mapToDTO(workOrder);
        }

        workOrder.setStatus(newStatus);
        Instant now = Instant.now();

        if (newStatus == WorkOrderStatus.EN_ROUTE || newStatus == WorkOrderStatus.ON_SITE) {
            if (workOrder.getRespondedAt() == null) {
                workOrder.setRespondedAt(now);
            }
        } else if (newStatus == WorkOrderStatus.COMPLETED || newStatus == WorkOrderStatus.CLOSED) {
            if (workOrder.getResolvedAt() == null) {
                workOrder.setResolvedAt(now);
            }
            if (workOrder.getAssignedTechnician() != null) {
                Technician tech = workOrder.getAssignedTechnician();
                tech.setActiveJobsCount(Math.max(0, tech.getActiveJobsCount() - 1));
                if (tech.getActiveJobsCount() == 0) {
                    tech.setStatus("AVAILABLE");
                }
                technicianRepository.save(tech);
            }
        }

        workOrder.recalculateTotals();
        WorkOrder updated = workOrderRepository.save(workOrder);

        AuditLog log = AuditLog.builder()
                .workOrder(updated)
                .performedBy(currentUser)
                .action("STATUS_CHANGE")
                .fromStatus(oldStatus)
                .toStatus(newStatus)
                .notes(request.getNotes() != null ? request.getNotes() : "Status transitioned to " + newStatus)
                .build();
        auditLogRepository.save(log);

        return mapToDTO(updated);
    }

    @Transactional
    public WorkOrderDTO.WorkOrderResponseDTO resolveWorkOrder(Long workOrderId, WorkOrderDTO.ResolutionRequest request, User currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + workOrderId));

        WorkOrderStatus oldStatus = workOrder.getStatus();
        workOrder.setStatus(WorkOrderStatus.COMPLETED);
        workOrder.setResolutionNotes(request.getResolutionNotes());
        workOrder.setResolvedAt(Instant.now());

        if (workOrder.getAssignedTechnician() != null) {
            Technician tech = workOrder.getAssignedTechnician();
            tech.setActiveJobsCount(Math.max(0, tech.getActiveJobsCount() - 1));
            if (tech.getActiveJobsCount() == 0) {
                tech.setStatus("AVAILABLE");
            }
            technicianRepository.save(tech);
        }

        workOrder.recalculateTotals();
        WorkOrder updated = workOrderRepository.save(workOrder);

        AuditLog log = AuditLog.builder()
                .workOrder(updated)
                .performedBy(currentUser)
                .action("RESOLVED")
                .fromStatus(oldStatus)
                .toStatus(WorkOrderStatus.COMPLETED)
                .notes("Work order resolved: " + request.getResolutionNotes())
                .build();
        auditLogRepository.save(log);

        return mapToDTO(updated);
    }

    @Transactional
    public WorkOrderDTO.WorkOrderResponseDTO submitFeedback(Long workOrderId, WorkOrderDTO.CustomerFeedbackRequest request, User currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + workOrderId));

        workOrder.setCustomerRating(request.getRating());
        workOrder.setCustomerFeedback(request.getFeedback());
        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED) {
            workOrder.setStatus(WorkOrderStatus.CLOSED);
        }

        WorkOrder updated = workOrderRepository.save(workOrder);

        AuditLog log = AuditLog.builder()
                .workOrder(updated)
                .performedBy(currentUser)
                .action("FEEDBACK_SUBMITTED")
                .notes("Rating: " + request.getRating() + "/5 stars. Feedback: " + request.getFeedback())
                .build();
        auditLogRepository.save(log);

        return mapToDTO(updated);
    }

    @Transactional
    public WorkOrderDTO.WorkOrderResponseDTO updateWorkOrder(Long id, WorkOrderDTO.UpdateWorkOrderRequest request, User currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + id));

        if (request.getTitle() != null && !request.getTitle().isBlank()) workOrder.setTitle(request.getTitle());
        if (request.getDescription() != null && !request.getDescription().isBlank()) workOrder.setDescription(request.getDescription());
        if (request.getPriority() != null) workOrder.setPriority(request.getPriority());
        if (request.getAssetId() != null) {
            Asset asset = assetRepository.findById(request.getAssetId()).orElse(null);
            workOrder.setAsset(asset);
        }
        if (request.getScheduledStart() != null) workOrder.setScheduledStart(request.getScheduledStart());
        if (request.getScheduledEnd() != null) workOrder.setScheduledEnd(request.getScheduledEnd());

        WorkOrder updated = workOrderRepository.save(workOrder);

        AuditLog log = AuditLog.builder()
                .workOrder(updated)
                .performedBy(currentUser)
                .action("UPDATED")
                .notes("Work order details updated")
                .build();
        auditLogRepository.save(log);

        return mapToDTO(updated);
    }

    @Transactional
    public WorkOrderDTO.WorkOrderResponseDTO cancelWorkOrder(Long id, String reason, User currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + id));

        WorkOrderStatus oldStatus = workOrder.getStatus();
        workOrder.setStatus(WorkOrderStatus.CANCELLED);

        if (workOrder.getAssignedTechnician() != null) {
            Technician tech = workOrder.getAssignedTechnician();
            tech.setActiveJobsCount(Math.max(0, tech.getActiveJobsCount() - 1));
            if (tech.getActiveJobsCount() == 0) tech.setStatus("AVAILABLE");
            technicianRepository.save(tech);
        }

        WorkOrder updated = workOrderRepository.save(workOrder);

        AuditLog log = AuditLog.builder()
                .workOrder(updated)
                .performedBy(currentUser)
                .action("CANCELLED")
                .fromStatus(oldStatus)
                .toStatus(WorkOrderStatus.CANCELLED)
                .notes(reason != null && !reason.isBlank() ? reason : "Work order cancelled")
                .build();
        auditLogRepository.save(log);

        return mapToDTO(updated);
    }

    @Transactional
    public void deleteWorkOrder(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + id));
        workOrderRepository.delete(workOrder);
    }

    @Transactional(readOnly = true)
    public List<WorkOrderDTO.WorkOrderResponseDTO> getAllWorkOrders(WorkOrderStatus status, Priority priority, Long facilityId) {
        return getAllWorkOrders(status, priority, facilityId, null);
    }

    @Transactional(readOnly = true)
    public List<WorkOrderDTO.WorkOrderResponseDTO> getAllWorkOrders(WorkOrderStatus status, Priority priority, Long facilityId, Long adminId) {
        List<WorkOrder> list;
        if (adminId != null) {
            if (status != null) {
                list = workOrderRepository.findByStatusAndAdminId(status, adminId);
            } else if (priority != null) {
                list = workOrderRepository.findByPriorityAndAdminId(priority, adminId);
            } else if (facilityId != null) {
                list = workOrderRepository.findByFacilityIdAndAdminId(facilityId, adminId);
            } else {
                list = workOrderRepository.findByAdminId(adminId);
            }
        } else {
            if (status != null) {
                list = workOrderRepository.findByStatus(status);
            } else if (priority != null) {
                list = workOrderRepository.findByPriority(priority);
            } else if (facilityId != null) {
                list = workOrderRepository.findByFacilityId(facilityId);
            } else {
                list = workOrderRepository.findAll();
            }
        }

        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkOrderDTO.WorkOrderResponseDTO> getMyWorkOrders(User user) {
        if (user.getRole() == Role.ROLE_TECHNICIAN) {
            return technicianRepository.findByUserId(user.getId())
                    .map(t -> workOrderRepository.findByAssignedTechnicianId(t.getId()))
                    .orElse(List.of())
                    .stream().map(this::mapToDTO).collect(Collectors.toList());
        } else if (user.getRole() == Role.ROLE_CUSTOMER) {
            return workOrderRepository.findByCustomerId(user.getId())
                    .stream().map(this::mapToDTO).collect(Collectors.toList());
        }
        Long adminId = user.getAdminId() != null ? user.getAdminId() : user.getId();
        return getAllWorkOrders(null, null, null, adminId);
    }

    @Transactional(readOnly = true)
    public WorkOrderDTO.WorkOrderResponseDTO getWorkOrderById(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + id));
        return mapToDTO(workOrder);
    }

    public WorkOrderDTO.WorkOrderResponseDTO mapToDTO(WorkOrder wo) {
        String riskLevel = slaService.computeRiskLevel(wo.getResolutionSlaDue(), wo.getResolvedAt());
        Long responseRemaining = slaService.calculateRemainingMinutes(wo.getResponseSlaDue());
        Long resolutionRemaining = slaService.calculateRemainingMinutes(wo.getResolutionSlaDue());

        boolean responseBreached = wo.getResponseSlaDue() != null &&
                (wo.getRespondedAt() != null ? wo.getRespondedAt().isAfter(wo.getResponseSlaDue()) : Instant.now().isAfter(wo.getResponseSlaDue()));
        boolean resolutionBreached = wo.getResolutionSlaDue() != null &&
                (wo.getResolvedAt() != null ? wo.getResolvedAt().isAfter(wo.getResolutionSlaDue()) : Instant.now().isAfter(wo.getResolutionSlaDue()));

        List<WorkOrderDTO.WorkOrderPartDTO> partsList = (wo.getPartsUsed() != null)
                ? wo.getPartsUsed().stream().map(p -> WorkOrderDTO.WorkOrderPartDTO.builder()
                        .id(p.getId())
                        .partId(p.getPart().getId())
                        .partNumber(p.getPart().getPartNumber())
                        .partName(p.getPart().getName())
                        .quantity(p.getQuantityUsed())
                        .unitPrice(p.getUnitPriceAtUse())
                        .totalCost(p.getTotalCost())
                        .loggedAt(p.getLoggedAt())
                        .build()).collect(Collectors.toList())
                : List.of();

        List<WorkOrderDTO.TimeEntryResponseDTO> timeList = (wo.getTimeEntries() != null)
                ? wo.getTimeEntries().stream().map(t -> WorkOrderDTO.TimeEntryResponseDTO.builder()
                        .id(t.getId())
                        .technicianId(t.getTechnician().getId())
                        .technicianName(t.getTechnician().getName())
                        .entryType(t.getEntryType())
                        .startTime(t.getStartTime())
                        .endTime(t.getEndTime())
                        .durationMinutes(t.getDurationMinutes())
                        .hourlyRate(t.getHourlyRate())
                        .laborCost(t.getLaborCost())
                        .notes(t.getNotes())
                        .build()).collect(Collectors.toList())
                : List.of();

        List<WorkOrderDTO.AuditLogDTO> auditList = (wo.getAuditLogs() != null)
                ? wo.getAuditLogs().stream().map(a -> WorkOrderDTO.AuditLogDTO.builder()
                        .id(a.getId())
                        .performedByName(a.getPerformedBy() != null ? a.getPerformedBy().getFullName() : "System")
                        .action(a.getAction())
                        .fromStatus(a.getFromStatus())
                        .toStatus(a.getToStatus())
                        .notes(a.getNotes())
                        .timestamp(a.getTimestamp())
                        .build()).collect(Collectors.toList())
                : List.of();

        return WorkOrderDTO.WorkOrderResponseDTO.builder()
                .id(wo.getId())
                .workOrderNumber(wo.getWorkOrderNumber())
                .title(wo.getTitle())
                .description(wo.getDescription())
                .priority(wo.getPriority())
                .status(wo.getStatus())
                .facilityId(wo.getFacility() != null ? wo.getFacility().getId() : null)
                .facilityName(wo.getFacility() != null ? wo.getFacility().getName() : null)
                .facilityCode(wo.getFacility() != null ? wo.getFacility().getCode() : null)
                .facilityAddress(wo.getFacility() != null ? wo.getFacility().getAddressLine() + ", " + wo.getFacility().getCity() : null)
                .assetId(wo.getAsset() != null ? wo.getAsset().getId() : null)
                .assetName(wo.getAsset() != null ? wo.getAsset().getName() : null)
                .assetTagNumber(wo.getAsset() != null ? wo.getAsset().getTagNumber() : null)
                .assetCategory(wo.getAsset() != null ? wo.getAsset().getCategory() : null)
                .assetLocation(wo.getAsset() != null ? (wo.getAsset().getFloor() + " - " + wo.getAsset().getRoom()) : null)
                .customerId(wo.getCustomer() != null ? wo.getCustomer().getId() : null)
                .customerName(wo.getCustomer() != null ? wo.getCustomer().getFullName() : null)
                .customerEmail(wo.getCustomer() != null ? wo.getCustomer().getEmail() : null)
                .customerPhone(wo.getCustomer() != null ? wo.getCustomer().getPhone() : null)
                .technicianId(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getId() : null)
                .technicianName(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getName() : null)
                .technicianSpecialization(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getSpecialization() : null)
                .technicianPhone(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getPhone() : null)
                .scheduledStart(wo.getScheduledStart())
                .scheduledEnd(wo.getScheduledEnd())
                .responseSlaDue(wo.getResponseSlaDue())
                .resolutionSlaDue(wo.getResolutionSlaDue())
                .respondedAt(wo.getRespondedAt())
                .resolvedAt(wo.getResolvedAt())
                .slaRiskLevel(riskLevel)
                .responseRemainingMinutes(responseRemaining)
                .resolutionRemainingMinutes(resolutionRemaining)
                .responseBreached(responseBreached)
                .resolutionBreached(resolutionBreached)
                .resolutionNotes(wo.getResolutionNotes())
                .customerRating(wo.getCustomerRating())
                .customerFeedback(wo.getCustomerFeedback())
                .totalLaborCost(wo.getTotalLaborCost())
                .totalPartsCost(wo.getTotalPartsCost())
                .totalCost(wo.getTotalCost())
                .partsUsed(partsList)
                .timeEntries(timeList)
                .auditLogs(auditList)
                .createdAt(wo.getCreatedAt())
                .updatedAt(wo.getUpdatedAt())
                .build();
    }
}
