package com.keystone.controller;

import com.keystone.dto.InventoryDTO;
import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.User;
import com.keystone.repository.UserRepository;
import com.keystone.security.UserPrincipal;
import com.keystone.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    public InventoryController(InventoryService inventoryService, UserRepository userRepository) {
        this.inventoryService = inventoryService;
        this.userRepository = userRepository;
    }

    @GetMapping("/parts")
    public ResponseEntity<List<InventoryDTO.PartResponseDTO>> getAllParts(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(inventoryService.getAllParts(category));
    }

    @PostMapping("/parts")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<InventoryDTO.PartResponseDTO> createPart(@Valid @RequestBody InventoryDTO.CreatePartRequest request) {
        return ResponseEntity.ok(inventoryService.createPart(request));
    }

    @PatchMapping("/parts/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<InventoryDTO.PartResponseDTO> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody InventoryDTO.UpdateStockRequest request
    ) {
        return ResponseEntity.ok(inventoryService.adjustStock(id, request));
    }

    @PutMapping("/parts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<InventoryDTO.PartResponseDTO> updatePart(
            @PathVariable Long id,
            @Valid @RequestBody InventoryDTO.CreatePartRequest request
    ) {
        return ResponseEntity.ok(inventoryService.updatePart(id, request));
    }

    @DeleteMapping("/parts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        inventoryService.deletePart(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/work-orders/{workOrderId}/consume")
    public ResponseEntity<WorkOrderDTO.WorkOrderResponseDTO> consumePart(
            @PathVariable Long workOrderId,
            @Valid @RequestBody InventoryDTO.ConsumePartRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        return ResponseEntity.ok(inventoryService.consumePart(workOrderId, request, user));
    }
}
