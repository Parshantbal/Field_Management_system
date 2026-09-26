package com.keystone.controller;

import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.Priority;
import com.keystone.model.User;
import com.keystone.model.WorkOrderStatus;
import com.keystone.repository.UserRepository;
import com.keystone.security.UserPrincipal;
import com.keystone.service.WorkOrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final UserRepository userRepository;

    public WorkOrderController(WorkOrderService workOrderService, UserRepository userRepository) {
        this.workOrderService = workOrderService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<WorkOrderDTO.WorkOrderResponseDTO>> getAllWorkOrders(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long facilityId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = (principal != null) ? (principal.getAdminId() != null ? principal.getAdminId() : principal.getId()) : null;
        return ResponseEntity.ok(workOrderService.getAllWorkOrders(status, priority, facilityId, adminId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<WorkOrderDTO.WorkOrderResponseDTO>> getMyWorkOrders(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + principal.getId()));
        return ResponseEntity.ok(workOrderService.getMyWorkOrders(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> getWorkOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }

    @PostMapping
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> createWorkOrder(
            @Valid @RequestBody WorkOrderDTO.CreateWorkOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + principal.getId()));
        return ResponseEntity.ok(workOrderService.createWorkOrder(request, user));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderDTO.AssignTechnicianRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + principal.getId()));
        return ResponseEntity.ok(workOrderService.assignTechnician(id, request, user));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> acceptJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + principal.getId()));
        return ResponseEntity.ok(workOrderService.acceptJob(id, user));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> rejectJob(
            @PathVariable Long id,
            @RequestBody(required = false) WorkOrderDTO.RejectJobRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + principal.getId()));
        String reason = (request != null && request.getReason() != null) ? request.getReason() : "Technician busy / unable to accept";
        return ResponseEntity.ok(workOrderService.rejectJob(id, reason, user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderDTO.ChangeStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + principal.getId()));
        return ResponseEntity.ok(workOrderService.changeStatus(id, request, user));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> resolveWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderDTO.ResolutionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + principal.getId()));
        return ResponseEntity.ok(workOrderService.resolveWorkOrder(id, request, user));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderDTO.CustomerFeedbackRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + principal.getId()));
        return ResponseEntity.ok(workOrderService.submitFeedback(id, request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderDTO.UpdateWorkOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        User user = userRepository.findById(principal.getId()).orElseThrow();
        return ResponseEntity.ok(workOrderService.updateWorkOrder(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkOrder(@PathVariable Long id) {
        workOrderService.deleteWorkOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> cancelWorkOrder(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        User user = userRepository.findById(principal.getId()).orElseThrow();
        String reason = (body != null) ? body.get("reason") : "Work order cancelled";
        return ResponseEntity.ok(workOrderService.cancelWorkOrder(id, reason, user));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> startWork(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        User user = userRepository.findById(principal.getId()).orElseThrow();
        WorkOrderDTO.ChangeStatusRequest req = new WorkOrderDTO.ChangeStatusRequest(WorkOrderStatus.ON_SITE, "Technician started work on site");
        return ResponseEntity.ok(workOrderService.changeStatus(id, req, user));
    }

    @PostMapping("/{id}/hold")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> holdWork(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        User user = userRepository.findById(principal.getId()).orElseThrow();
        String reason = (body != null && body.get("reason") != null) ? body.get("reason") : "Work placed on hold";
        WorkOrderDTO.ChangeStatusRequest req = new WorkOrderDTO.ChangeStatusRequest(WorkOrderStatus.ON_HOLD, reason);
        return ResponseEntity.ok(workOrderService.changeStatus(id, req, user));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> resumeWork(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        User user = userRepository.findById(principal.getId()).orElseThrow();
        WorkOrderDTO.ChangeStatusRequest req = new WorkOrderDTO.ChangeStatusRequest(WorkOrderStatus.ON_SITE, "Work resumed by technician");
        return ResponseEntity.ok(workOrderService.changeStatus(id, req, user));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> completeWork(
            @PathVariable Long id,
            @RequestBody(required = false) WorkOrderDTO.ResolutionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        User user = userRepository.findById(principal.getId()).orElseThrow();
        WorkOrderDTO.ResolutionRequest resReq = request != null ? request : new WorkOrderDTO.ResolutionRequest("Work completed successfully");
        return ResponseEntity.ok(workOrderService.resolveWorkOrder(id, resReq, user));
    }
}
