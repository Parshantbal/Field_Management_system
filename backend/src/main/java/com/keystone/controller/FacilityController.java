package com.keystone.controller;

import com.keystone.model.Asset;
import com.keystone.model.Facility;
import com.keystone.repository.AssetRepository;
import com.keystone.repository.FacilityRepository;
import com.keystone.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityRepository facilityRepository;
    private final AssetRepository assetRepository;

    public FacilityController(FacilityRepository facilityRepository, AssetRepository assetRepository) {
        this.facilityRepository = facilityRepository;
        this.assetRepository = assetRepository;
    }

    @GetMapping
    public ResponseEntity<List<Facility>> getAllFacilities(
            @RequestParam(required = false) Long adminId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (adminId != null) {
            return ResponseEntity.ok(facilityRepository.findByAdminId(adminId));
        }
        if (principal != null) {
            if (principal.getRole() == com.keystone.model.Role.ROLE_ADMIN) {
                return ResponseEntity.ok(facilityRepository.findByAdminId(principal.getId()));
            }
            if (principal.getAdminId() != null) {
                return ResponseEntity.ok(facilityRepository.findByAdminId(principal.getAdminId()));
            }
        }
        return ResponseEntity.ok(facilityRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Facility> getFacilityById(@PathVariable Long id) {
        return facilityRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/assets")
    public ResponseEntity<List<Asset>> getAssetsByFacility(@PathVariable Long id) {
        return ResponseEntity.ok(assetRepository.findByFacilityId(id));
    }

    @PostMapping
    public ResponseEntity<Facility> createSite(
            @jakarta.validation.Valid @RequestBody Facility facility,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (facilityRepository.existsByCode(facility.getCode())) {
            throw new IllegalArgumentException("Facility code already in use: " + facility.getCode());
        }
        if (principal != null) {
            facility.setAdminId(principal.getAdminId() != null ? principal.getAdminId() : principal.getId());
        }
        return ResponseEntity.ok(facilityRepository.save(facility));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Facility> updateSite(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody Facility updated
    ) {
        Facility existing = facilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Site not found with id: " + id));

        existing.setName(updated.getName());
        existing.setAddressLine(updated.getAddressLine());
        existing.setCity(updated.getCity());
        existing.setState(updated.getState());
        existing.setPostalCode(updated.getPostalCode());
        existing.setContactPerson(updated.getContactPerson());
        existing.setContactPhone(updated.getContactPhone());
        existing.setTotalSqFt(updated.getTotalSqFt());

        return ResponseEntity.ok(facilityRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new IllegalArgumentException("Site not found with id: " + id);
        }
        facilityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
