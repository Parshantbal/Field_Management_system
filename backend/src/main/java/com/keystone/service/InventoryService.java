package com.keystone.service;

import com.keystone.dto.InventoryDTO;
import com.keystone.dto.WorkOrderDTO;
import com.keystone.model.*;
import com.keystone.repository.AuditLogRepository;
import com.keystone.repository.PartRepository;
import com.keystone.repository.WorkOrderPartRepository;
import com.keystone.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final PartRepository partRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderPartRepository workOrderPartRepository;
    private final AuditLogRepository auditLogRepository;
    private final WorkOrderService workOrderService;

    public InventoryService(
            PartRepository partRepository,
            WorkOrderRepository workOrderRepository,
            WorkOrderPartRepository workOrderPartRepository,
            AuditLogRepository auditLogRepository,
            WorkOrderService workOrderService
    ) {
        this.partRepository = partRepository;
        this.workOrderRepository = workOrderRepository;
        this.workOrderPartRepository = workOrderPartRepository;
        this.auditLogRepository = auditLogRepository;
        this.workOrderService = workOrderService;
    }

    @Transactional
    public InventoryDTO.PartResponseDTO createPart(InventoryDTO.CreatePartRequest request) {
        if (partRepository.findByPartNumber(request.getPartNumber()).isPresent()) {
            throw new IllegalArgumentException("Part number already exists: " + request.getPartNumber());
        }

        Part part = Part.builder()
                .partNumber(request.getPartNumber().toUpperCase().trim())
                .name(request.getName().trim())
                .description(request.getDescription())
                .category(request.getCategory().toUpperCase().trim())
                .unitPrice(request.getUnitPrice())
                .stockQuantity(request.getStockQuantity())
                .reorderLevel(request.getReorderLevel())
                .unitOfMeasure(request.getUnitOfMeasure() != null ? request.getUnitOfMeasure() : "EACH")
                .build();

        return mapToDTO(partRepository.save(part));
    }

    @Transactional
    public InventoryDTO.PartResponseDTO adjustStock(Long partId, InventoryDTO.UpdateStockRequest request) {
        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new IllegalArgumentException("Part not found: " + partId));

        int newQty = part.getStockQuantity() + request.getAdjustment();
        if (newQty < 0) {
            throw new IllegalArgumentException("Cannot reduce stock below zero");
        }
        part.setStockQuantity(newQty);
        return mapToDTO(partRepository.save(part));
    }

    @Transactional
    public InventoryDTO.PartResponseDTO updatePart(Long id, InventoryDTO.CreatePartRequest request) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Part not found with id: " + id));

        part.setName(request.getName().trim());
        part.setDescription(request.getDescription());
        part.setCategory(request.getCategory().toUpperCase().trim());
        part.setUnitPrice(request.getUnitPrice());
        part.setStockQuantity(request.getStockQuantity());
        part.setReorderLevel(request.getReorderLevel());
        if (request.getUnitOfMeasure() != null) {
            part.setUnitOfMeasure(request.getUnitOfMeasure());
        }

        return mapToDTO(partRepository.save(part));
    }

    @Transactional
    public void deletePart(Long id) {
        if (!partRepository.existsById(id)) {
            throw new IllegalArgumentException("Part not found with id: " + id);
        }
        partRepository.deleteById(id);
    }

    @Transactional
    public WorkOrderDTO.WorkOrderResponseDTO consumePart(Long workOrderId, InventoryDTO.ConsumePartRequest request, User currentUser) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Work order not found: " + workOrderId));

        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new IllegalArgumentException("Part not found: " + request.getPartId()));

        if (part.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient inventory for part: " + part.getName() +
                    ". Available: " + part.getStockQuantity() + ", Requested: " + request.getQuantity());
        }

        // Deduct inventory
        part.setStockQuantity(part.getStockQuantity() - request.getQuantity());
        partRepository.save(part);

        // Record line item
        BigDecimal totalLineCost = part.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
        WorkOrderPart woPart = WorkOrderPart.builder()
                .workOrder(workOrder)
                .part(part)
                .quantityUsed(request.getQuantity())
                .unitPriceAtUse(part.getUnitPrice())
                .totalCost(totalLineCost)
                .build();
        workOrderPartRepository.save(woPart);

        workOrder.getPartsUsed().add(woPart);
        workOrder.recalculateTotals();
        WorkOrder saved = workOrderRepository.save(workOrder);

        // Audit Log
        AuditLog log = AuditLog.builder()
                .workOrder(saved)
                .performedBy(currentUser)
                .action("PARTS_CONSUMED")
                .notes("Added " + request.getQuantity() + "x " + part.getName() + " ($" + totalLineCost + ")")
                .build();
        auditLogRepository.save(log);

        return workOrderService.mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<InventoryDTO.PartResponseDTO> getAllParts(String category) {
        List<Part> list = (category != null && !category.isBlank())
                ? partRepository.findByCategory(category.toUpperCase().trim())
                : partRepository.findAll();

        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private InventoryDTO.PartResponseDTO mapToDTO(Part part) {
        return InventoryDTO.PartResponseDTO.builder()
                .id(part.getId())
                .partNumber(part.getPartNumber())
                .name(part.getName())
                .description(part.getDescription())
                .category(part.getCategory())
                .unitPrice(part.getUnitPrice())
                .stockQuantity(part.getStockQuantity())
                .reorderLevel(part.getReorderLevel())
                .unitOfMeasure(part.getUnitOfMeasure())
                .lowStock(part.isLowStock())
                .build();
    }
}
