package com.keystone.repository;

import com.keystone.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByFacilityId(Long facilityId);
    Optional<Asset> findByTagNumber(String tagNumber);
}
