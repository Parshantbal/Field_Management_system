package com.keystone.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;

@Entity
@Table(name = "time_entries")
public class TimeEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    @JsonIgnore
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "technician_id", nullable = false)
    private Technician technician;

    @NotBlank
    @Column(nullable = false, length = 30)
    private String entryType = "ON_SITE"; // TRAVEL, ON_SITE

    @NotNull
    @Column(nullable = false)
    private Instant startTime;

    private Instant endTime;

    private Long durationMinutes;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(precision = 10, scale = 2)
    private BigDecimal laborCost = BigDecimal.ZERO;

    @Column(length = 255)
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    public TimeEntry() {}

    public TimeEntry(Long id, WorkOrder workOrder, Technician technician, String entryType, Instant startTime, Instant endTime, Long durationMinutes, BigDecimal hourlyRate, BigDecimal laborCost, String notes) {
        this.id = id;
        this.workOrder = workOrder;
        this.technician = technician;
        this.entryType = (entryType != null) ? entryType : "ON_SITE";
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.hourlyRate = hourlyRate;
        this.laborCost = (laborCost != null) ? laborCost : BigDecimal.ZERO;
        this.notes = notes;
    }

    public static TimeEntryBuilder builder() {
        return new TimeEntryBuilder();
    }

    public static class TimeEntryBuilder {
        private Long id;
        private WorkOrder workOrder;
        private Technician technician;
        private String entryType = "ON_SITE";
        private Instant startTime;
        private Instant endTime;
        private Long durationMinutes;
        private BigDecimal hourlyRate;
        private BigDecimal laborCost = BigDecimal.ZERO;
        private String notes;

        public TimeEntryBuilder id(Long id) { this.id = id; return this; }
        public TimeEntryBuilder workOrder(WorkOrder workOrder) { this.workOrder = workOrder; return this; }
        public TimeEntryBuilder technician(Technician technician) { this.technician = technician; return this; }
        public TimeEntryBuilder entryType(String entryType) { this.entryType = entryType; return this; }
        public TimeEntryBuilder startTime(Instant startTime) { this.startTime = startTime; return this; }
        public TimeEntryBuilder endTime(Instant endTime) { this.endTime = endTime; return this; }
        public TimeEntryBuilder durationMinutes(Long durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public TimeEntryBuilder hourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; return this; }
        public TimeEntryBuilder laborCost(BigDecimal laborCost) { this.laborCost = laborCost; return this; }
        public TimeEntryBuilder notes(String notes) { this.notes = notes; return this; }
        public TimeEntry build() {
            return new TimeEntry(id, workOrder, technician, entryType, startTime, endTime, durationMinutes, hourlyRate, laborCost, notes);
        }
    }

    public void completeEntry(Instant end) {
        this.endTime = end;
        if (startTime != null && endTime != null) {
            long minutes = Duration.between(startTime, endTime).toMinutes();
            if (minutes < 1) minutes = 1; // Minimum 1 minute
            this.durationMinutes = minutes;
            BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            this.laborCost = hours.multiply(this.hourlyRate).setScale(2, RoundingMode.HALF_UP);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WorkOrder getWorkOrder() { return workOrder; }
    public void setWorkOrder(WorkOrder workOrder) { this.workOrder = workOrder; }

    public Technician getTechnician() { return technician; }
    public void setTechnician(Technician technician) { this.technician = technician; }

    public String getEntryType() { return entryType; }
    public void setEntryType(String entryType) { this.entryType = entryType; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public Long getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Long durationMinutes) { this.durationMinutes = durationMinutes; }

    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

    public BigDecimal getLaborCost() { return laborCost; }
    public void setLaborCost(BigDecimal laborCost) { this.laborCost = laborCost; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
