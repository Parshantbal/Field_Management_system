package com.keystone.service;

import com.keystone.dto.DashboardDTO;
import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.Priority;
import com.keystone.model.Technician;
import com.keystone.model.WorkOrder;
import com.keystone.model.WorkOrderStatus;
import com.keystone.repository.AuditLogRepository;
import com.keystone.repository.TechnicianRepository;
import com.keystone.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final WorkOrderRepository workOrderRepository;
    private final TechnicianRepository technicianRepository;
    private final AuditLogRepository auditLogRepository;
    private final SlaService slaService;

    public DashboardService(
            WorkOrderRepository workOrderRepository,
            TechnicianRepository technicianRepository,
            AuditLogRepository auditLogRepository,
            SlaService slaService
    ) {
        this.workOrderRepository = workOrderRepository;
        this.technicianRepository = technicianRepository;
        this.auditLogRepository = auditLogRepository;
        this.slaService = slaService;
    }

    @Transactional(readOnly = true)
    public DashboardDTO.DashboardResponseDTO getDashboardData() {
        return getDashboardData(null);
    }

    @Transactional(readOnly = true)
    public DashboardDTO.DashboardResponseDTO getDashboardData(Long adminId) {
        List<WorkOrder> allOrders = (adminId != null) ? workOrderRepository.findByAdminId(adminId) : workOrderRepository.findAll();
        List<Technician> allTechs;
        if (adminId != null) {
            allTechs = technicianRepository.findByAdminIdOrAdminIdIsNull(adminId);
            if (allTechs.isEmpty()) {
                allTechs = technicianRepository.findAll();
            }
        } else {
            allTechs = technicianRepository.findAll();
        }
        Instant now = Instant.now();

        long totalOrders = allOrders.size();
        long openOrders = 0;
        long inProgressOrders = 0;
        long completedOrders = 0;
        long criticalOrders = 0;
        long breachedCount = 0;
        long atRiskCount = 0;
        BigDecimal totalCost = BigDecimal.ZERO;
        double totalRating = 0;
        int ratingCount = 0;

        Map<String, Long> statusMap = new LinkedHashMap<>();
        for (WorkOrderStatus s : WorkOrderStatus.values()) {
            statusMap.put(s.name(), 0L);
        }

        Map<String, Long> priorityMap = new LinkedHashMap<>();
        for (Priority p : Priority.values()) {
            priorityMap.put(p.name(), 0L);
        }

        List<DashboardDTO.SlaAlertDTO> urgentAlerts = new ArrayList<>();

        for (WorkOrder wo : allOrders) {
            statusMap.put(wo.getStatus().name(), statusMap.getOrDefault(wo.getStatus().name(), 0L) + 1);
            priorityMap.put(wo.getPriority().name(), priorityMap.getOrDefault(wo.getPriority().name(), 0L) + 1);

            if (wo.getPriority() == Priority.CRITICAL) {
                criticalOrders++;
            }

            if (wo.getTotalCost() != null) {
                totalCost = totalCost.add(wo.getTotalCost());
            }

            if (wo.getCustomerRating() != null && wo.getCustomerRating() > 0) {
                totalRating += wo.getCustomerRating();
                ratingCount++;
            }

            boolean isClosed = wo.getStatus() == WorkOrderStatus.COMPLETED || wo.getStatus() == WorkOrderStatus.CLOSED || wo.getStatus() == WorkOrderStatus.CANCELLED;

            if (isClosed) {
                completedOrders++;
            } else {
                openOrders++;
                if (wo.getStatus() == WorkOrderStatus.ON_SITE || wo.getStatus() == WorkOrderStatus.EN_ROUTE) {
                    inProgressOrders++;
                }

                if (wo.getResolutionSlaDue() != null) {
                    long remainingMin = Duration.between(now, wo.getResolutionSlaDue()).toMinutes();
                    String risk = slaService.computeRiskLevel(wo.getResolutionSlaDue(), wo.getResolvedAt());

                    if ("BREACHED".equals(risk)) {
                        breachedCount++;
                        urgentAlerts.add(buildSlaAlert(wo, remainingMin, "BREACHED"));
                    } else if (remainingMin <= 90) {
                        atRiskCount++;
                        urgentAlerts.add(buildSlaAlert(wo, remainingMin, "WARNING"));
                    }
                }
            }
        }

        urgentAlerts.sort(Comparator.comparingLong(DashboardDTO.SlaAlertDTO::getRemainingMinutes));

        long totalTechCount = allTechs.size();
        long activeTechCount = allTechs.stream()
                .filter(t -> "ON_JOB".equalsIgnoreCase(t.getStatus()) || t.getActiveJobsCount() > 0)
                .count();

        BigDecimal complianceRate = new BigDecimal("100.00");
        if (totalOrders > 0) {
            long nonBreached = totalOrders - breachedCount;
            complianceRate = BigDecimal.valueOf(nonBreached)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalOrders), 1, RoundingMode.HALF_UP);
        }

        double avgRating = ratingCount > 0 ? (totalRating / ratingCount) : 4.8;

        DashboardDTO.KpiSummaryDTO kpis = DashboardDTO.KpiSummaryDTO.builder()
                .totalWorkOrders(totalOrders)
                .openWorkOrders(openOrders)
                .inProgressWorkOrders(inProgressOrders)
                .completedWorkOrders(completedOrders)
                .criticalWorkOrders(criticalOrders)
                .breachedSlaCount(breachedCount)
                .atRiskSlaCount(atRiskCount)
                .activeTechnicians(activeTechCount)
                .totalTechnicians(totalTechCount)
                .totalMaintenanceCost(totalCost)
                .slaComplianceRate(complianceRate)
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .build();

        List<WorkOrderDTO.AuditLogDTO> recentActivity = ((adminId != null) 
                ? auditLogRepository.findTop20ByWorkOrderAdminIdOrderByTimestampDesc(adminId)
                : auditLogRepository.findTop20ByOrderByTimestampDesc())
                .stream().map(a -> WorkOrderDTO.AuditLogDTO.builder()
                        .id(a.getId())
                        .performedByName(a.getPerformedBy() != null ? a.getPerformedBy().getFullName() : "System")
                        .action(a.getAction())
                        .fromStatus(a.getFromStatus())
                        .toStatus(a.getToStatus())
                        .notes(a.getNotes())
                        .timestamp(a.getTimestamp())
                        .build()).collect(Collectors.toList());

        return DashboardDTO.DashboardResponseDTO.builder()
                .kpis(kpis)
                .statusDistribution(statusMap)
                .priorityDistribution(priorityMap)
                .urgentSlaAlerts(urgentAlerts.stream().limit(10).collect(Collectors.toList()))
                .recentActivities(recentActivity)
                .build();
    }

    private DashboardDTO.SlaAlertDTO buildSlaAlert(WorkOrder wo, long remainingMinutes, String risk) {
        return DashboardDTO.SlaAlertDTO.builder()
                .workOrderId(wo.getId())
                .workOrderNumber(wo.getWorkOrderNumber())
                .title(wo.getTitle())
                .priority(wo.getPriority().name())
                .status(wo.getStatus().name())
                .facilityName(wo.getFacility() != null ? wo.getFacility().getName() : "Unknown")
                .technicianName(wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getName() : "Unassigned")
                .resolutionSlaDue(wo.getResolutionSlaDue())
                .remainingMinutes(remainingMinutes)
                .riskLevel(risk)
                .build();
    }
}
