package com.keystone.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank
    @Column(nullable = false, unique = true, length = 80)
    private String tagNumber;

    @NotBlank
    @Column(nullable = false, length = 60)
    private String category;

    @Column(length = 40)
    private String floor;

    @Column(length = 40)
    private String room;

    @Column(length = 100)
    private String manufacturer;

    @Column(length = 100)
    private String modelNumber;

    @Column(length = 100)
    private String serialNumber;

    private LocalDate installDate;

    @Column(length = 30)
    private String status = "OPERATIONAL";

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    public Asset() {}

    public Asset(Long id, Facility facility, String name, String tagNumber, String category, String floor, String room, String manufacturer, String modelNumber, String serialNumber, LocalDate installDate, String status) {
        this.id = id;
        this.facility = facility;
        this.name = name;
        this.tagNumber = tagNumber;
        this.category = category;
        this.floor = floor;
        this.room = room;
        this.manufacturer = manufacturer;
        this.modelNumber = modelNumber;
        this.serialNumber = serialNumber;
        this.installDate = installDate;
        this.status = (status != null) ? status : "OPERATIONAL";
    }

    public static AssetBuilder builder() {
        return new AssetBuilder();
    }

    public static class AssetBuilder {
        private Long id;
        private Facility facility;
        private String name;
        private String tagNumber;
        private String category;
        private String floor;
        private String room;
        private String manufacturer;
        private String modelNumber;
        private String serialNumber;
        private LocalDate installDate;
        private String status = "OPERATIONAL";

        public AssetBuilder id(Long id) { this.id = id; return this; }
        public AssetBuilder facility(Facility facility) { this.facility = facility; return this; }
        public AssetBuilder name(String name) { this.name = name; return this; }
        public AssetBuilder tagNumber(String tagNumber) { this.tagNumber = tagNumber; return this; }
        public AssetBuilder category(String category) { this.category = category; return this; }
        public AssetBuilder floor(String floor) { this.floor = floor; return this; }
        public AssetBuilder room(String room) { this.room = room; return this; }
        public AssetBuilder manufacturer(String manufacturer) { this.manufacturer = manufacturer; return this; }
        public AssetBuilder modelNumber(String modelNumber) { this.modelNumber = modelNumber; return this; }
        public AssetBuilder serialNumber(String serialNumber) { this.serialNumber = serialNumber; return this; }
        public AssetBuilder installDate(LocalDate installDate) { this.installDate = installDate; return this; }
        public AssetBuilder status(String status) { this.status = status; return this; }
        public Asset build() {
            return new Asset(id, facility, name, tagNumber, category, floor, room, manufacturer, modelNumber, serialNumber, installDate, status);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Facility getFacility() { return facility; }
    public void setFacility(Facility facility) { this.facility = facility; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTagNumber() { return tagNumber; }
    public void setTagNumber(String tagNumber) { this.tagNumber = tagNumber; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getModelNumber() { return modelNumber; }
    public void setModelNumber(String modelNumber) { this.modelNumber = modelNumber; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public LocalDate getInstallDate() { return installDate; }
    public void setInstallDate(LocalDate installDate) { this.installDate = installDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
