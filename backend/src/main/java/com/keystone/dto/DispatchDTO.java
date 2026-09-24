package com.keystone.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class DispatchDTO {

    public static class TechnicianRecommendationDTO {
        private Long technicianId;
        private String name;
        private String email;
        private String phone;
        private String specialization;
        private String certifications;
        private BigDecimal hourlyRate;
        private String status;
        private BigDecimal rating;
        private Integer activeJobsCount;
        private Double currentLatitude;
        private Double currentLongitude;

        private Integer matchScore;
        private String matchReason;
        private List<String> matchingSkills;

        public TechnicianRecommendationDTO() {}

        public static TechnicianRecommendationDTOBuilder builder() { return new TechnicianRecommendationDTOBuilder(); }
        public static class TechnicianRecommendationDTOBuilder {
            private TechnicianRecommendationDTO dto = new TechnicianRecommendationDTO();
            public TechnicianRecommendationDTOBuilder technicianId(Long id) { dto.technicianId = id; return this; }
            public TechnicianRecommendationDTOBuilder name(String n) { dto.name = n; return this; }
            public TechnicianRecommendationDTOBuilder email(String e) { dto.email = e; return this; }
            public TechnicianRecommendationDTOBuilder phone(String p) { dto.phone = p; return this; }
            public TechnicianRecommendationDTOBuilder specialization(String s) { dto.specialization = s; return this; }
            public TechnicianRecommendationDTOBuilder certifications(String c) { dto.certifications = c; return this; }
            public TechnicianRecommendationDTOBuilder hourlyRate(BigDecimal h) { dto.hourlyRate = h; return this; }
            public TechnicianRecommendationDTOBuilder status(String st) { dto.status = st; return this; }
            public TechnicianRecommendationDTOBuilder rating(BigDecimal r) { dto.rating = r; return this; }
            public TechnicianRecommendationDTOBuilder activeJobsCount(Integer c) { dto.activeJobsCount = c; return this; }
            public TechnicianRecommendationDTOBuilder currentLatitude(Double lat) { dto.currentLatitude = lat; return this; }
            public TechnicianRecommendationDTOBuilder currentLongitude(Double lon) { dto.currentLongitude = lon; return this; }
            public TechnicianRecommendationDTOBuilder matchScore(Integer ms) { dto.matchScore = ms; return this; }
            public TechnicianRecommendationDTOBuilder matchReason(String mr) { dto.matchReason = mr; return this; }
            public TechnicianRecommendationDTOBuilder matchingSkills(List<String> skills) { dto.matchingSkills = skills; return this; }
            public TechnicianRecommendationDTO build() { return dto; }
        }

        public Long getTechnicianId() { return technicianId; }
        public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
        public String getCertifications() { return certifications; }
        public void setCertifications(String certifications) { this.certifications = certifications; }
        public BigDecimal getHourlyRate() { return hourlyRate; }
        public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public BigDecimal getRating() { return rating; }
        public void setRating(BigDecimal rating) { this.rating = rating; }
        public Integer getActiveJobsCount() { return activeJobsCount; }
        public void setActiveJobsCount(Integer activeJobsCount) { this.activeJobsCount = activeJobsCount; }
        public Double getCurrentLatitude() { return currentLatitude; }
        public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }
        public Double getCurrentLongitude() { return currentLongitude; }
        public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }
        public Integer getMatchScore() { return matchScore; }
        public void setMatchScore(Integer matchScore) { this.matchScore = matchScore; }
        public String getMatchReason() { return matchReason; }
        public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
        public List<String> getMatchingSkills() { return matchingSkills; }
        public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }
    }

    public static class ScheduleDispatchRequest {
        @NotNull
        private Long workOrderId;

        @NotNull
        private Long technicianId;

        @NotNull
        private Instant scheduledStart;

        @NotNull
        private Instant scheduledEnd;

        private String dispatcherNotes;

        public ScheduleDispatchRequest() {}

        public Long getWorkOrderId() { return workOrderId; }
        public void setWorkOrderId(Long workOrderId) { this.workOrderId = workOrderId; }
        public Long getTechnicianId() { return technicianId; }
        public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }
        public Instant getScheduledStart() { return scheduledStart; }
        public void setScheduledStart(Instant scheduledStart) { this.scheduledStart = scheduledStart; }
        public Instant getScheduledEnd() { return scheduledEnd; }
        public void setScheduledEnd(Instant scheduledEnd) { this.scheduledEnd = scheduledEnd; }
        public String getDispatcherNotes() { return dispatcherNotes; }
        public void setDispatcherNotes(String dispatcherNotes) { this.dispatcherNotes = dispatcherNotes; }
    }
}
