package com.keystone.repository;

import com.keystone.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findAllByOrderByCreatedAtDesc();

    long countByRecipientIdAndReadFalse(Long recipientId);
}
