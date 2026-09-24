package com.keystone.service;

import com.keystone.dto.NotificationDTO;
import com.keystone.model.Notification;
import com.keystone.model.User;
import com.keystone.repository.NotificationRepository;
import com.keystone.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public NotificationDTO.NotificationResponseDTO sendNotification(NotificationDTO.SendNotificationRequest request) {
        User recipient = null;
        if (request.getRecipientId() != null) {
            recipient = userRepository.findById(request.getRecipientId()).orElse(null);
        } else if (request.getRecipientEmail() != null && !request.getRecipientEmail().isBlank()) {
            recipient = userRepository.findByEmail(request.getRecipientEmail()).orElse(null);
        }

        String type = (request.getType() != null && !request.getType().isBlank()) ? request.getType() : "INFO";

        if (recipient == null) {
            // Broadcast to all active users
            List<User> users = userRepository.findAll();
            Notification firstNotif = null;
            for (User u : users) {
                Notification n = notificationRepository.save(Notification.builder()
                        .recipient(u)
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .type(type)
                        .referenceId(request.getReferenceId())
                        .read(false)
                        .build());
                if (firstNotif == null) firstNotif = n;
            }
            return firstNotif != null ? mapToDTO(firstNotif) : null;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(request.getTitle())
                .message(request.getMessage())
                .type(type)
                .referenceId(request.getReferenceId())
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO.NotificationResponseDTO> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO.NotificationResponseDTO> getMyNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));
        if (n.getRecipient().getId().equals(userId)) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    private NotificationDTO.NotificationResponseDTO mapToDTO(Notification n) {
        return new NotificationDTO.NotificationResponseDTO(
                n.getId(),
                n.getRecipient().getId(),
                n.getRecipient().getFullName(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getReferenceId(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
