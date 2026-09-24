package com.keystone.controller;

import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.User;
import com.keystone.repository.UserRepository;
import com.keystone.security.UserPrincipal;
import com.keystone.service.WorkOrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portal")
public class CustomerPortalController {

    private final WorkOrderService workOrderService;
    private final UserRepository userRepository;
    private final com.keystone.service.NotificationService notificationService;

    public CustomerPortalController(WorkOrderService workOrderService, UserRepository userRepository, com.keystone.service.NotificationService notificationService) {
        this.workOrderService = workOrderService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @GetMapping("/admins")
    public ResponseEntity<List<WorkOrderDTO.AdminProviderDTO>> getAvailableAdmins() {
        List<WorkOrderDTO.AdminProviderDTO> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.keystone.model.Role.ROLE_ADMIN && u.isActive())
                .map(u -> new WorkOrderDTO.AdminProviderDTO(u.getId(), u.getFullName(), u.getEmail(), u.getPhone()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(admins);
    }

    @PostMapping("/requests")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> submitServiceRequest(
            @Valid @RequestBody WorkOrderDTO.CreateWorkOrderRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + principal.getId()));
        request.setCustomerId(user.getId());

        if (request.getAdminId() != null && user.getAdminId() == null) {
            user.setAdminId(request.getAdminId());
            userRepository.save(user);
        } else if (request.getAdminId() == null && user.getAdminId() != null) {
            request.setAdminId(user.getAdminId());
        }

        WorkOrderDTO.WorkOrderResponseDTO created = workOrderService.createWorkOrder(request, user);

        if (request.getAdminId() != null) {
            try {
                com.keystone.dto.NotificationDTO.SendNotificationRequest notif = new com.keystone.dto.NotificationDTO.SendNotificationRequest();
                notif.setRecipientId(request.getAdminId());
                notif.setTitle("New Service Complaint");
                notif.setMessage("Customer " + user.getFullName() + " filed ticket (" + created.getWorkOrderNumber() + "): " + created.getTitle());
                notif.setType("WORK_ORDER_CREATED");
                notif.setReferenceId(created.getId());
                notificationService.sendNotification(notif);
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok(created);
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<List<WorkOrderDTO.WorkOrderResponseDTO>> getMyTickets(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User account not found: " + principal.getId()));
        return ResponseEntity.ok(workOrderService.getMyWorkOrders(user));
    }

    @PostMapping("/tickets/{id}/feedback")
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
}
