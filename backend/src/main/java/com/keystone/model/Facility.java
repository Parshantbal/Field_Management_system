package com.keystone.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "facilities")
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String addressLine;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String city;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String state;

    @NotBlank
    @Column(nullable = false, length = 20)
    private String postalCode;

    @Column(length = 100)
    private String contactPerson;

    @Column(length = 30)
    private String contactPhone;

    private Integer totalSqFt;

    @Column
    private Long adminId;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    public Facility() {}

    public Facility(Long id, String name, String code, String addressLine, String city, String state, String postalCode, String contactPerson, String contactPhone, Integer totalSqFt) {
        this(id, name, code, addressLine, city, state, postalCode, contactPerson, contactPhone, totalSqFt, null);
    }

    public Facility(Long id, String name, String code, String addressLine, String city, String state, String postalCode, String contactPerson, String contactPhone, Integer totalSqFt, Long adminId) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.addressLine = addressLine;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.contactPerson = contactPerson;
        this.contactPhone = contactPhone;
        this.totalSqFt = totalSqFt;
        this.adminId = adminId;
    }

    public static FacilityBuilder builder() {
        return new FacilityBuilder();
    }

    public static class FacilityBuilder {
        private Long id;
        private String name;
        private String code;
        private String addressLine;
        private String city;
        private String state;
        private String postalCode;
        private String contactPerson;
        private String contactPhone;
        private Integer totalSqFt;
        private Long adminId;

        public FacilityBuilder id(Long id) { this.id = id; return this; }
        public FacilityBuilder name(String name) { this.name = name; return this; }
        public FacilityBuilder code(String code) { this.code = code; return this; }
        public FacilityBuilder addressLine(String addressLine) { this.addressLine = addressLine; return this; }
        public FacilityBuilder city(String city) { this.city = city; return this; }
        public FacilityBuilder state(String state) { this.state = state; return this; }
        public FacilityBuilder postalCode(String postalCode) { this.postalCode = postalCode; return this; }
        public FacilityBuilder contactPerson(String contactPerson) { this.contactPerson = contactPerson; return this; }
        public FacilityBuilder contactPhone(String contactPhone) { this.contactPhone = contactPhone; return this; }
        public FacilityBuilder totalSqFt(Integer totalSqFt) { this.totalSqFt = totalSqFt; return this; }
        public FacilityBuilder adminId(Long adminId) { this.adminId = adminId; return this; }
        public Facility build() {
            return new Facility(id, name, code, addressLine, city, state, postalCode, contactPerson, contactPhone, totalSqFt, adminId);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public Integer getTotalSqFt() { return totalSqFt; }
    public void setTotalSqFt(Integer totalSqFt) { this.totalSqFt = totalSqFt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }
}
