package com.keystone.repository;

import com.keystone.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByWorkOrderIdOrderByTimestampDesc(Long workOrderId);
    List<AuditLog> findTop20ByOrderByTimestampDesc();
    List<AuditLog> findTop20ByWorkOrderAdminIdOrderByTimestampDesc(Long adminId);
}
