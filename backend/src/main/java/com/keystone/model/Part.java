package com.keystone.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "parts")
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 60)
    private String partNumber;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    @Column(nullable = false, length = 60)
    private String category;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @NotNull
    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @NotNull
    @Column(nullable = false)
    private Integer reorderLevel = 5;

    @Column(length = 20)
    private String unitOfMeasure = "EACH";

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    public Part() {}

    public Part(Long id, String partNumber, String name, String description, String category, BigDecimal unitPrice, Integer stockQuantity, Integer reorderLevel, String unitOfMeasure) {
        this.id = id;
        this.partNumber = partNumber;
        this.name = name;
        this.description = description;
        this.category = category;
        this.unitPrice = unitPrice;
        this.stockQuantity = (stockQuantity != null) ? stockQuantity : 0;
        this.reorderLevel = (reorderLevel != null) ? reorderLevel : 5;
        this.unitOfMeasure = (unitOfMeasure != null) ? unitOfMeasure : "EACH";
    }

    public static PartBuilder builder() {
        return new PartBuilder();
    }

    public static class PartBuilder {
        private Long id;
        private String partNumber;
        private String name;
        private String description;
        private String category;
        private BigDecimal unitPrice;
        private Integer stockQuantity = 0;
        private Integer reorderLevel = 5;
        private String unitOfMeasure = "EACH";

        public PartBuilder id(Long id) { this.id = id; return this; }
        public PartBuilder partNumber(String partNumber) { this.partNumber = partNumber; return this; }
        public PartBuilder name(String name) { this.name = name; return this; }
        public PartBuilder description(String description) { this.description = description; return this; }
        public PartBuilder category(String category) { this.category = category; return this; }
        public PartBuilder unitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; return this; }
        public PartBuilder stockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; return this; }
        public PartBuilder reorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; return this; }
        public PartBuilder unitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; return this; }
        public Part build() {
            return new Part(id, partNumber, name, description, category, unitPrice, stockQuantity, reorderLevel, unitOfMeasure);
        }
    }

    public boolean isLowStock() {
        return stockQuantity <= reorderLevel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPartNumber() { return partNumber; }
    public void setPartNumber(String partNumber) { this.partNumber = partNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }

    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
