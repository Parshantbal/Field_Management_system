package com.keystone.service;

import com.keystone.dto.ReportDTO;
import com.keystone.model.Facility;
import com.keystone.model.Technician;
import com.keystone.model.WorkOrder;
import com.keystone.model.WorkOrderStatus;
import com.keystone.repository.FacilityRepository;
import com.keystone.repository.TechnicianRepository;
import com.keystone.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final WorkOrderRepository workOrderRepository;
    private final FacilityRepository facilityRepository;
    private final TechnicianRepository technicianRepository;

    public ReportService(
            WorkOrderRepository workOrderRepository,
            FacilityRepository facilityRepository,
            TechnicianRepository technicianRepository
    ) {
        this.workOrderRepository = workOrderRepository;
        this.facilityRepository = facilityRepository;
        this.technicianRepository = technicianRepository;
    }

    @Transactional(readOnly = true)
    public ReportDTO.ExecutiveReportDTO generateSummaryReport() {
        return generateSummaryReport(null);
    }

    @Transactional(readOnly = true)
    public ReportDTO.ExecutiveReportDTO generateSummaryReport(Long adminId) {
        List<WorkOrder> allOrders = (adminId != null) ? workOrderRepository.findByAdminId(adminId) : workOrderRepository.findAll();
        long total = allOrders.size();
        long completed = allOrders.stream().filter(w -> w.getStatus() == WorkOrderStatus.COMPLETED || w.getStatus() == WorkOrderStatus.CLOSED).count();
        long open = allOrders.stream().filter(w -> w.getStatus() != WorkOrderStatus.COMPLETED && w.getStatus() != WorkOrderStatus.CLOSED && w.getStatus() != WorkOrderStatus.CANCELLED).count();
        Instant now = Instant.now();
        long breached = (adminId != null) ? workOrderRepository.countBreachedWorkOrdersByAdminId(now, adminId) : workOrderRepository.countBreachedWorkOrders(now);

        double compliance = (total > 0) ? Math.round(((double) (total - breached) / total * 100.0) * 10.0) / 10.0 : 100.0;

        BigDecimal totalLabor = allOrders.stream().map(WorkOrder::getTotalLaborCost).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalParts = allOrders.stream().map(WorkOrder::getTotalPartsCost).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal grandTotal = allOrders.stream().map(WorkOrder::getTotalCost).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> priorityMap = allOrders.stream()
                .collect(Collectors.groupingBy(w -> w.getPriority().name(), Collectors.counting()));

        Map<String, Long> statusMap = allOrders.stream()
                .collect(Collectors.groupingBy(w -> w.getStatus().name(), Collectors.counting()));

        List<Facility> facList = (adminId != null) ? facilityRepository.findByAdminId(adminId) : facilityRepository.findAll();
        List<ReportDTO.FacilityCostDTO> facilityList = facList.stream().map(fac -> {
            List<WorkOrder> facOrders = allOrders.stream()
                    .filter(w -> w.getFacility() != null && w.getFacility().getId().equals(fac.getId()))
                    .collect(Collectors.toList());
            BigDecimal cost = facOrders.stream().map(WorkOrder::getTotalCost).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            return new ReportDTO.FacilityCostDTO(fac.getName(), facOrders.size(), cost);
        }).collect(Collectors.toList());

        List<Technician> techSourceList = (adminId != null) ? technicianRepository.findByAdminId(adminId) : technicianRepository.findAll();
        List<ReportDTO.TechnicianMetricDTO> techList = techSourceList.stream().map(tech -> {
            List<WorkOrder> techOrders = allOrders.stream()
                    .filter(w -> w.getAssignedTechnician() != null && w.getAssignedTechnician().getId().equals(tech.getId()))
                    .collect(Collectors.toList());
            double avgRating = techOrders.stream()
                    .filter(w -> w.getCustomerRating() != null)
                    .mapToInt(WorkOrder::getCustomerRating)
                    .average()
                    .orElse(5.0);
            return new ReportDTO.TechnicianMetricDTO(tech.getName(), tech.getSpecialization(), techOrders.size(), Math.round(avgRating * 10.0) / 10.0);
        }).collect(Collectors.toList());

        ReportDTO.ExecutiveReportDTO report = new ReportDTO.ExecutiveReportDTO();
        report.setTotalWorkOrders(total);
        report.setCompletedWorkOrders(completed);
        report.setOpenWorkOrders(open);
        report.setBreachedWorkOrders(breached);
        report.setSlaCompliancePercentage(compliance);
        report.setTotalLaborCost(totalLabor);
        report.setTotalPartsCost(totalParts);
        report.setGrandTotalCost(grandTotal);
        report.setPriorityBreakdown(priorityMap);
        report.setStatusBreakdown(statusMap);
        report.setFacilityBreakdown(facilityList);
        report.setTechnicianMetrics(techList);

        return report;
    }
}
