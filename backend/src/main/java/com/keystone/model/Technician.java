package com.keystone.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "technicians")
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(length = 255)
    private String certifications;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate = new BigDecimal("75.00");

    @Column(nullable = false, length = 30)
    private String status = "AVAILABLE"; // AVAILABLE, ON_JOB, OFF_DUTY

    private Double currentLatitude;
    private Double currentLongitude;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating = new BigDecimal("5.00");

    private Integer activeJobsCount = 0;

    @Column
    private Long adminId;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    public Technician() {}

    public Technician(Long id, User user, String specialization, String certifications, BigDecimal hourlyRate, String status, Double currentLatitude, Double currentLongitude, BigDecimal rating, Integer activeJobsCount) {
        this(id, user, specialization, certifications, hourlyRate, status, currentLatitude, currentLongitude, rating, activeJobsCount, null);
    }

    public Technician(Long id, User user, String specialization, String certifications, BigDecimal hourlyRate, String status, Double currentLatitude, Double currentLongitude, BigDecimal rating, Integer activeJobsCount, Long adminId) {
        this.id = id;
        this.user = user;
        this.specialization = specialization;
        this.certifications = certifications;
        this.hourlyRate = (hourlyRate != null) ? hourlyRate : new BigDecimal("75.00");
        this.status = (status != null) ? status : "AVAILABLE";
        this.currentLatitude = currentLatitude;
        this.currentLongitude = currentLongitude;
        this.rating = (rating != null) ? rating : new BigDecimal("5.00");
        this.activeJobsCount = (activeJobsCount != null) ? activeJobsCount : 0;
        this.adminId = adminId;
    }

    public static TechnicianBuilder builder() {
        return new TechnicianBuilder();
    }

    public static class TechnicianBuilder {
        private Long id;
        private User user;
        private String specialization;
        private String certifications;
        private BigDecimal hourlyRate = new BigDecimal("75.00");
        private String status = "AVAILABLE";
        private Double currentLatitude;
        private Double currentLongitude;
        private BigDecimal rating = new BigDecimal("5.00");
        private Integer activeJobsCount = 0;
        private Long adminId;

        public TechnicianBuilder id(Long id) { this.id = id; return this; }
        public TechnicianBuilder user(User user) { this.user = user; return this; }
        public TechnicianBuilder specialization(String specialization) { this.specialization = specialization; return this; }
        public TechnicianBuilder certifications(String certifications) { this.certifications = certifications; return this; }
        public TechnicianBuilder hourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; return this; }
        public TechnicianBuilder status(String status) { this.status = status; return this; }
        public TechnicianBuilder currentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; return this; }
        public TechnicianBuilder currentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; return this; }
        public TechnicianBuilder rating(BigDecimal rating) { this.rating = rating; return this; }
        public TechnicianBuilder activeJobsCount(Integer activeJobsCount) { this.activeJobsCount = activeJobsCount; return this; }
        public TechnicianBuilder adminId(Long adminId) { this.adminId = adminId; return this; }
        public Technician build() {
            return new Technician(id, user, specialization, certifications, hourlyRate, status, currentLatitude, currentLongitude, rating, activeJobsCount, adminId);
        }
    }

    public String getName() {
        return user != null ? user.getFullName() : "Unknown Technician";
    }

    public String getEmail() {
        return user != null ? user.getEmail() : "";
    }

    public String getPhone() {
        return user != null ? user.getPhone() : "";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }

    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }

    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getActiveJobsCount() { return activeJobsCount; }
    public void setActiveJobsCount(Integer activeJobsCount) { this.activeJobsCount = activeJobsCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }
}
