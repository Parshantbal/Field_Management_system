package com.keystone.repository;

import com.keystone.model.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
    List<TimeEntry> findByWorkOrderId(Long workOrderId);
    List<TimeEntry> findByTechnicianId(Long technicianId);

    @Query("SELECT t FROM TimeEntry t WHERE t.technician.id = :technicianId AND t.endTime IS NULL")
    Optional<TimeEntry> findActiveEntryByTechnicianId(Long technicianId);
}
