package com.keystone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class InventoryDTO {

    public static class CreatePartRequest {
        @NotBlank
        private String partNumber;

        @NotBlank
        private String name;

        private String description;

        @NotBlank
        private String category;

        @NotNull
        private BigDecimal unitPrice;

        @NotNull
        @Min(0)
        private Integer stockQuantity;

        @NotNull
        @Min(0)
        private Integer reorderLevel;

        private String unitOfMeasure;

        public CreatePartRequest() {}

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
    }

    public static class UpdateStockRequest {
        @NotNull
        private Integer adjustment;
        private String reason;

        public UpdateStockRequest() {}
        public Integer getAdjustment() { return adjustment; }
        public void setAdjustment(Integer adjustment) { this.adjustment = adjustment; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class ConsumePartRequest {
        @NotNull
        private Long partId;

        @NotNull
        @Min(1)
        private Integer quantity;

        public ConsumePartRequest() {}
        public Long getPartId() { return partId; }
        public void setPartId(Long partId) { this.partId = partId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class PartResponseDTO {
        private Long id;
        private String partNumber;
        private String name;
        private String description;
        private String category;
        private BigDecimal unitPrice;
        private Integer stockQuantity;
        private Integer reorderLevel;
        private String unitOfMeasure;
        private boolean lowStock;

        public PartResponseDTO() {}

        public static PartResponseDTOBuilder builder() { return new PartResponseDTOBuilder(); }
        public static class PartResponseDTOBuilder {
            private PartResponseDTO dto = new PartResponseDTO();
            public PartResponseDTOBuilder id(Long id) { dto.id = id; return this; }
            public PartResponseDTOBuilder partNumber(String pn) { dto.partNumber = pn; return this; }
            public PartResponseDTOBuilder name(String n) { dto.name = n; return this; }
            public PartResponseDTOBuilder description(String d) { dto.description = d; return this; }
            public PartResponseDTOBuilder category(String c) { dto.category = c; return this; }
            public PartResponseDTOBuilder unitPrice(BigDecimal up) { dto.unitPrice = up; return this; }
            public PartResponseDTOBuilder stockQuantity(Integer sq) { dto.stockQuantity = sq; return this; }
            public PartResponseDTOBuilder reorderLevel(Integer rl) { dto.reorderLevel = rl; return this; }
            public PartResponseDTOBuilder unitOfMeasure(String uom) { dto.unitOfMeasure = uom; return this; }
            public PartResponseDTOBuilder lowStock(boolean ls) { dto.lowStock = ls; return this; }
            public PartResponseDTO build() { return dto; }
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
        public boolean isLowStock() { return lowStock; }
        public void setLowStock(boolean lowStock) { this.lowStock = lowStock; }
    }
}
