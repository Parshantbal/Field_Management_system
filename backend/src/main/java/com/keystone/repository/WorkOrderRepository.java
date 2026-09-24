package com.keystone.repository;

import com.keystone.model.Priority;
import com.keystone.model.WorkOrder;
import com.keystone.model.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    Optional<WorkOrder> findByWorkOrderNumber(String workOrderNumber);

    boolean existsByWorkOrderNumber(String workOrderNumber);

    List<WorkOrder> findByStatus(WorkOrderStatus status);

    List<WorkOrder> findByPriority(Priority priority);

    List<WorkOrder> findByAssignedTechnicianId(Long technicianId);

    List<WorkOrder> findByCustomerId(Long customerId);

    List<WorkOrder> findByFacilityId(Long facilityId);

    long countByStatus(WorkOrderStatus status);

    long countByPriority(Priority priority);

    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED')")
    long countOpenWorkOrders();

    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED') AND w.resolutionSlaDue < :now")
    long countBreachedWorkOrders(Instant now);

    @Query("SELECT w FROM WorkOrder w WHERE w.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED') AND w.resolutionSlaDue < :now ORDER BY w.resolutionSlaDue ASC")
    List<WorkOrder> findBreachedWorkOrders(Instant now);

    @Query("SELECT w FROM WorkOrder w WHERE w.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED') ORDER BY w.priority DESC, w.resolutionSlaDue ASC")
    List<WorkOrder> findActiveWorkOrders();

    @Query("SELECT w FROM WorkOrder w WHERE w.assignedTechnician.id = :technicianId AND w.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED') ORDER BY w.createdAt DESC")
    List<WorkOrder> findActiveByTechnicianId(Long technicianId);

    List<WorkOrder> findByAdminId(Long adminId);

    List<WorkOrder> findByStatusAndAdminId(WorkOrderStatus status, Long adminId);

    List<WorkOrder> findByPriorityAndAdminId(Priority priority, Long adminId);

    List<WorkOrder> findByFacilityIdAndAdminId(Long facilityId, Long adminId);

    @Query("SELECT COUNT(w) FROM WorkOrder w WHERE w.status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED') AND w.resolutionSlaDue < :now AND w.adminId = :adminId")
    long countBreachedWorkOrdersByAdminId(Instant now, Long adminId);
}
