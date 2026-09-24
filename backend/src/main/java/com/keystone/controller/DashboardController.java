package com.keystone.controller;

import com.keystone.dto.DashboardDTO;
import com.keystone.service.DashboardService;
import com.keystone.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardDTO.DashboardResponseDTO> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = (principal != null) ? (principal.getAdminId() != null ? principal.getAdminId() : principal.getId()) : null;
        return ResponseEntity.ok(dashboardService.getDashboardData(adminId));
    }
}
