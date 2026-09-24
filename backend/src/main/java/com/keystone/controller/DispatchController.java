package com.keystone.controller;

import com.keystone.dto.DispatchDTO;
import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.User;
import com.keystone.repository.UserRepository;
import com.keystone.security.UserPrincipal;
import com.keystone.service.DispatchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dispatch")
public class DispatchController {

    private final DispatchService dispatchService;
    private final UserRepository userRepository;

    public DispatchController(DispatchService dispatchService, UserRepository userRepository) {
        this.dispatchService = dispatchService;
        this.userRepository = userRepository;
    }

    @GetMapping("/recommendations/{workOrderId}")
    public ResponseEntity<List<DispatchDTO.TechnicianRecommendationDTO>> getRecommendations(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(dispatchService.recommendTechnicians(workOrderId));
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> scheduleDispatch(
            @Valid @RequestBody DispatchDTO.ScheduleDispatchRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        return ResponseEntity.ok(dispatchService.dispatchTechnician(request, user));
    }
}
