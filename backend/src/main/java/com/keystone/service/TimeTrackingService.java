package com.keystone.service;

import com.keystone.dto.TimeEntryDTO;
import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.AuditLog;
import com.keystone.model.Technician;
import com.keystone.model.TimeEntry;
import com.keystone.model.WorkOrder;
import com.keystone.repository.AuditLogRepository;
import com.keystone.repository.TechnicianRepository;
import com.keystone.repository.TimeEntryRepository;
import com.keystone.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class TimeTrackingService {

    private final TimeEntryRepository timeEntryRepository;
    private final WorkOrderRepository workOrderRepository;
    private final TechnicianRepository technicianRepository;
    private final AuditLogRepository auditLogRepository;
    private final WorkOrderService workOrderService;

    public TimeTrackingService(
            TimeEntryRepository timeEntryRepository,
            WorkOrderRepository workOrderRepository,
            TechnicianRepository technicianRepository,
            AuditLogRepository auditLogRepository,
            WorkOrderService workOrderService
    ) {
        this.timeEntryRepository = timeEntryRepository;
        this.workOrderRepository = workOrderRepository;
        this.technicianRepository = technicianRepository;
        this.auditLogRepository = auditLogRepository;
        this.workOrderService = workOrderService;
    }

    @Transactional
    public WorkOrderDTO.TimeEntryResponseDTO startTimeTracking(Long technicianUserId, TimeEntryDTO.StartTimeRequest request) {
        Technician tech = technicianRepository.findByUserId(technicianUserId)
                .orElseThrow(() -> new IllegalArgumentException("Technician record not found for user: " + technicianUserId));

        Optional<TimeEntry> existing = timeEntryRepository.findActiveEntryByTechnicianId(tech.getId());
        if (existing.isPresent()) {
            throw new IllegalStateException("An active timer is already running for work order: " +
                    existing.get().getWorkOrder().getWorkOrderNumber());
        }

        WorkOrder workOrder = workOrderRepository.findById(request.getWorkOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + request.getWorkOrderId()));

        TimeEntry entry = TimeEntry.builder()
                .workOrder(workOrder)
                .technician(tech)
                .entryType(request.getEntryType())
                .startTime(Instant.now())
                .hourlyRate(tech.getHourlyRate())
                .notes(request.getNotes())
                .build();

        TimeEntry saved = timeEntryRepository.save(entry);

        AuditLog log = AuditLog.builder()
                .workOrder(workOrder)
                .performedBy(tech.getUser())
                .action("TIMER_STARTED")
                .notes("Started " + request.getEntryType() + " timer")
                .build();
        auditLogRepository.save(log);

        return mapToDTO(saved);
    }

    @Transactional
    public WorkOrderDTO.WorkOrderResponseDTO stopTimeTracking(Long technicianUserId, TimeEntryDTO.StopTimeRequest request) {
        Technician tech = technicianRepository.findByUserId(technicianUserId)
                .orElseThrow(() -> new IllegalArgumentException("Technician record not found for user: " + technicianUserId));

        TimeEntry active = timeEntryRepository.findActiveEntryByTechnicianId(tech.getId())
                .orElseThrow(() -> new IllegalStateException("No active timer running for this technician"));

        active.completeEntry(Instant.now());
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            active.setNotes((active.getNotes() != null ? active.getNotes() + " | " : "") + request.getNotes());
        }
        timeEntryRepository.save(active);

        WorkOrder workOrder = active.getWorkOrder();
        workOrder.recalculateTotals();
        WorkOrder updated = workOrderRepository.save(workOrder);

        AuditLog log = AuditLog.builder()
                .workOrder(updated)
                .performedBy(tech.getUser())
                .action("TIMER_STOPPED")
                .notes("Logged " + active.getDurationMinutes() + " mins (" + active.getEntryType() + "). Labor cost: $" + active.getLaborCost())
                .build();
        auditLogRepository.save(log);

        return workOrderService.mapToDTO(updated);
    }

    @Transactional(readOnly = true)
    public WorkOrderDTO.TimeEntryResponseDTO getActiveTimer(Long technicianUserId) {
        Technician tech = technicianRepository.findByUserId(technicianUserId).orElse(null);
        if (tech == null) return null;

        return timeEntryRepository.findActiveEntryByTechnicianId(tech.getId())
                .map(this::mapToDTO)
                .orElse(null);
    }

    private WorkOrderDTO.TimeEntryResponseDTO mapToDTO(TimeEntry t) {
        return WorkOrderDTO.TimeEntryResponseDTO.builder()
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
                .build();
    }
}
