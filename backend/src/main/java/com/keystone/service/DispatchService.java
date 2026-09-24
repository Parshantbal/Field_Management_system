package com.keystone.service;

import com.keystone.dto.DispatchDTO;
import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.Technician;
import com.keystone.model.User;
import com.keystone.model.WorkOrder;
import com.keystone.repository.TechnicianRepository;
import com.keystone.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DispatchService {

    private final TechnicianRepository technicianRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderService workOrderService;

    public DispatchService(TechnicianRepository technicianRepository, WorkOrderRepository workOrderRepository, WorkOrderService workOrderService) {
        this.technicianRepository = technicianRepository;
        this.workOrderRepository = workOrderRepository;
        this.workOrderService = workOrderService;
    }

    @Transactional(readOnly = true)
    public List<DispatchDTO.TechnicianRecommendationDTO> recommendTechnicians(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + workOrderId));

        List<Technician> allTechs = (workOrder.getAdminId() != null)
                ? technicianRepository.findByAdminId(workOrder.getAdminId())
                : technicianRepository.findAll();
        String assetCategory = (workOrder.getAsset() != null && workOrder.getAsset().getCategory() != null)
                ? workOrder.getAsset().getCategory().toUpperCase()
                : "";
        String titleDesc = (workOrder.getTitle() + " " + workOrder.getDescription()).toUpperCase();

        List<DispatchDTO.TechnicianRecommendationDTO> recommendations = new ArrayList<>();

        for (Technician tech : allTechs) {
            int score = 40; // Base score
            List<String> matchedSkills = new ArrayList<>();
            StringBuilder reason = new StringBuilder();

            String spec = tech.getSpecialization().toUpperCase();
            String certs = (tech.getCertifications() != null) ? tech.getCertifications().toUpperCase() : "";

            // Specialization match
            if (!assetCategory.isEmpty() && (spec.contains(assetCategory) || certs.contains(assetCategory))) {
                score += 35;
                matchedSkills.add(assetCategory);
                reason.append("Direct asset category match (").append(assetCategory).append("). ");
            } else if (titleDesc.contains("HVAC") && (spec.contains("HVAC") || certs.contains("HVAC"))) {
                score += 30;
                matchedSkills.add("HVAC");
                reason.append("HVAC keyword match. ");
            } else if (titleDesc.contains("ELECTRICAL") && (spec.contains("ELECTRICAL") || certs.contains("ELECTRICIAN"))) {
                score += 30;
                matchedSkills.add("Electrical");
                reason.append("Electrical certification match. ");
            } else if (titleDesc.contains("PLUMB") && (spec.contains("PLUMB") || certs.contains("PLUMB"))) {
                score += 30;
                matchedSkills.add("Plumbing");
                reason.append("Plumbing specialization match. ");
            } else if (titleDesc.contains("FIRE") && (spec.contains("FIRE") || certs.contains("FIRE"))) {
                score += 30;
                matchedSkills.add("Fire Safety");
                reason.append("Fire systems qualification match. ");
            }

            // Status modifier
            if ("AVAILABLE".equalsIgnoreCase(tech.getStatus())) {
                score += 20;
                reason.append("Currently available for immediate dispatch. ");
            } else if ("ON_JOB".equalsIgnoreCase(tech.getStatus())) {
                score -= (tech.getActiveJobsCount() * 10);
                reason.append("Currently on active job (").append(tech.getActiveJobsCount()).append(" active). ");
            } else if ("OFF_DUTY".equalsIgnoreCase(tech.getStatus())) {
                score = Math.max(10, score - 50);
                reason.append("Currently off-duty. ");
            }

            // High rating boost
            if (tech.getRating() != null && tech.getRating().doubleValue() >= 4.8) {
                score += 5;
            }

            score = Math.max(5, Math.min(100, score));

            recommendations.add(DispatchDTO.TechnicianRecommendationDTO.builder()
                    .technicianId(tech.getId())
                    .name(tech.getName())
                    .email(tech.getEmail())
                    .phone(tech.getPhone())
                    .specialization(tech.getSpecialization())
                    .certifications(tech.getCertifications())
                    .hourlyRate(tech.getHourlyRate())
                    .status(tech.getStatus())
                    .rating(tech.getRating())
                    .activeJobsCount(tech.getActiveJobsCount())
                    .currentLatitude(tech.getCurrentLatitude())
                    .currentLongitude(tech.getCurrentLongitude())
                    .matchScore(score)
                    .matchReason(reason.toString().trim())
                    .matchingSkills(matchedSkills)
                    .build());
        }

        return recommendations.stream()
                .sorted(Comparator.comparingInt(DispatchDTO.TechnicianRecommendationDTO::getMatchScore).reversed())
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkOrderDTO.WorkOrderResponseDTO dispatchTechnician(DispatchDTO.ScheduleDispatchRequest request, User currentUser) {
        WorkOrderDTO.AssignTechnicianRequest assignReq = WorkOrderDTO.AssignTechnicianRequest.builder()
                .technicianId(request.getTechnicianId())
                .scheduledStart(request.getScheduledStart())
                .scheduledEnd(request.getScheduledEnd())
                .notes(request.getDispatcherNotes())
                .build();

        return workOrderService.assignTechnician(request.getWorkOrderId(), assignReq, currentUser);
    }
}
