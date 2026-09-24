package com.keystone.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "work_order_parts")
public class WorkOrderPart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    @JsonIgnore
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @NotNull
    @Column(nullable = false)
    private Integer quantityUsed = 1;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceAtUse;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant loggedAt;

    public WorkOrderPart() {}

    public WorkOrderPart(Long id, WorkOrder workOrder, Part part, Integer quantityUsed, BigDecimal unitPriceAtUse, BigDecimal totalCost) {
        this.id = id;
        this.workOrder = workOrder;
        this.part = part;
        this.quantityUsed = (quantityUsed != null) ? quantityUsed : 1;
        this.unitPriceAtUse = unitPriceAtUse;
        this.totalCost = totalCost;
    }

    public static WorkOrderPartBuilder builder() {
        return new WorkOrderPartBuilder();
    }

    public static class WorkOrderPartBuilder {
        private Long id;
        private WorkOrder workOrder;
        private Part part;
        private Integer quantityUsed = 1;
        private BigDecimal unitPriceAtUse;
        private BigDecimal totalCost;

        public WorkOrderPartBuilder id(Long id) { this.id = id; return this; }
        public WorkOrderPartBuilder workOrder(WorkOrder workOrder) { this.workOrder = workOrder; return this; }
        public WorkOrderPartBuilder part(Part part) { this.part = part; return this; }
        public WorkOrderPartBuilder quantityUsed(Integer quantityUsed) { this.quantityUsed = quantityUsed; return this; }
        public WorkOrderPartBuilder unitPriceAtUse(BigDecimal unitPriceAtUse) { this.unitPriceAtUse = unitPriceAtUse; return this; }
        public WorkOrderPartBuilder totalCost(BigDecimal totalCost) { this.totalCost = totalCost; return this; }
        public WorkOrderPart build() {
            return new WorkOrderPart(id, workOrder, part, quantityUsed, unitPriceAtUse, totalCost);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WorkOrder getWorkOrder() { return workOrder; }
    public void setWorkOrder(WorkOrder workOrder) { this.workOrder = workOrder; }

    public Part getPart() { return part; }
    public void setPart(Part part) { this.part = part; }

    public Integer getQuantityUsed() { return quantityUsed; }
    public void setQuantityUsed(Integer quantityUsed) { this.quantityUsed = quantityUsed; }

    public BigDecimal getUnitPriceAtUse() { return unitPriceAtUse; }
    public void setUnitPriceAtUse(BigDecimal unitPriceAtUse) { this.unitPriceAtUse = unitPriceAtUse; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public Instant getLoggedAt() { return loggedAt; }
    public void setLoggedAt(Instant loggedAt) { this.loggedAt = loggedAt; }
}
