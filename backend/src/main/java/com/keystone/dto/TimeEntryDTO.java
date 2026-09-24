package com.keystone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class TimeEntryDTO {

    public static class StartTimeRequest {
        @NotNull
        private Long workOrderId;

        @NotBlank
        private String entryType = "ON_SITE";

        private String notes;

        public StartTimeRequest() {}

        public Long getWorkOrderId() { return workOrderId; }
        public void setWorkOrderId(Long workOrderId) { this.workOrderId = workOrderId; }
        public String getEntryType() { return entryType; }
        public void setEntryType(String entryType) { this.entryType = entryType; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class StopTimeRequest {
        private String notes;

        public StopTimeRequest() {}

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class ManualTimeEntryRequest {
        @NotNull
        private Long workOrderId;

        @NotBlank
        private String entryType;

        @NotNull
        private Instant startTime;

        @NotNull
        private Instant endTime;

        private String notes;

        public ManualTimeEntryRequest() {}

        public Long getWorkOrderId() { return workOrderId; }
        public void setWorkOrderId(Long workOrderId) { this.workOrderId = workOrderId; }
        public String getEntryType() { return entryType; }
        public void setEntryType(String entryType) { this.entryType = entryType; }
        public Instant getStartTime() { return startTime; }
        public void setStartTime(Instant startTime) { this.startTime = startTime; }
        public Instant getEndTime() { return endTime; }
        public void setEndTime(Instant endTime) { this.endTime = endTime; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
