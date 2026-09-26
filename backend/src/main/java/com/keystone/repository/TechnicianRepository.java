package com.keystone.repository;

import com.keystone.model.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findByUserId(Long userId);
    List<Technician> findByStatus(String status);
    List<Technician> findByAdminId(Long adminId);
    List<Technician> findByAdminIdOrAdminIdIsNull(Long adminId);
}
