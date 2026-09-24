package com.keystone.controller;

import com.keystone.dto.ReportDTO;
import com.keystone.service.ReportService;
import com.keystone.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<ReportDTO.ExecutiveReportDTO> getSummaryReport(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = (principal != null) ? (principal.getAdminId() != null ? principal.getAdminId() : principal.getId()) : null;
        return ResponseEntity.ok(reportService.generateSummaryReport(adminId));
    }
}
