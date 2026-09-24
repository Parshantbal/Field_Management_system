package com.keystone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class NotificationDTO {

    public static class NotificationResponseDTO {
        private Long id;
        private Long recipientId;
        private String recipientName;
        private String title;
        private String message;
        private String type;
        private Long referenceId;
        private boolean read;
        private Instant createdAt;

        public NotificationResponseDTO() {}

        public NotificationResponseDTO(Long id, Long recipientId, String recipientName, String title, String message, String type, Long referenceId, boolean read, Instant createdAt) {
            this.id = id;
            this.recipientId = recipientId;
            this.recipientName = recipientName;
            this.title = title;
            this.message = message;
            this.type = type;
            this.referenceId = referenceId;
            this.read = read;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getRecipientId() { return recipientId; }
        public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

        public String getRecipientName() { return recipientName; }
        public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Long getReferenceId() { return referenceId; }
        public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

        public boolean isRead() { return read; }
        public void setRead(boolean read) { this.read = read; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class SendNotificationRequest {
        private Long recipientId;
        private String recipientEmail;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Message is required")
        private String message;

        private String type = "INFO";
        private Long referenceId;

        public SendNotificationRequest() {}

        public Long getRecipientId() { return recipientId; }
        public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

        public String getRecipientEmail() { return recipientEmail; }
        public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Long getReferenceId() { return referenceId; }
        public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    }
}
