package com.keystone.controller;

import com.keystone.dto.TimeEntryDTO;
import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.Technician;
import com.keystone.repository.TechnicianRepository;
import com.keystone.security.UserPrincipal;
import com.keystone.service.TimeTrackingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {

    private final TechnicianRepository technicianRepository;
    private final TimeTrackingService timeTrackingService;

    public TechnicianController(TechnicianRepository technicianRepository, TimeTrackingService timeTrackingService) {
        this.technicianRepository = technicianRepository;
        this.timeTrackingService = timeTrackingService;
    }

    @GetMapping
    public ResponseEntity<List<Technician>> getAllTechnicians(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null) {
            Long adminId = principal.getAdminId() != null ? principal.getAdminId() : principal.getId();
            return ResponseEntity.ok(technicianRepository.findByAdminId(adminId));
        }
        return ResponseEntity.ok(technicianRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Technician> getTechnicianById(@PathVariable Long id) {
        return technicianRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active-timer")
    public ResponseEntity<WorkOrderDTO.TimeEntryResponseDTO> getActiveTimer(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(timeTrackingService.getActiveTimer(principal.getId()));
    }

    @PostMapping("/time-tracker/start")
    public ResponseEntity<WorkOrderDTO.TimeEntryResponseDTO> startTimer(
            @Valid @RequestBody TimeEntryDTO.StartTimeRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(timeTrackingService.startTimeTracking(principal.getId(), request));
    }

    @PostMapping("/time-tracker/stop")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> stopTimer(
            @Valid @RequestBody TimeEntryDTO.StopTimeRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(timeTrackingService.stopTimeTracking(principal.getId(), request));
    }
}
