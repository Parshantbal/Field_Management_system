package com.keystone.service;

import com.keystone.model.Priority;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class SlaService {

    public Instant calculateResponseSlaDue(Priority priority, Instant baseTime) {
        if (baseTime == null) baseTime = Instant.now();
        return switch (priority) {
            case CRITICAL -> baseTime.plus(1, ChronoUnit.HOURS);
            case HIGH -> baseTime.plus(4, ChronoUnit.HOURS);
            case MEDIUM -> baseTime.plus(8, ChronoUnit.HOURS);
            case LOW -> baseTime.plus(24, ChronoUnit.HOURS);
        };
    }

    public Instant calculateResolutionSlaDue(Priority priority, Instant baseTime) {
        if (baseTime == null) baseTime = Instant.now();
        return switch (priority) {
            case CRITICAL -> baseTime.plus(4, ChronoUnit.HOURS);
            case HIGH -> baseTime.plus(24, ChronoUnit.HOURS);
            case MEDIUM -> baseTime.plus(48, ChronoUnit.HOURS);
            case LOW -> baseTime.plus(120, ChronoUnit.HOURS); // 5 days
        };
    }

    public String computeRiskLevel(Instant resolutionDue, Instant resolvedAt) {
        if (resolvedAt != null) {
            return (resolutionDue != null && resolvedAt.isAfter(resolutionDue)) ? "BREACHED" : "COMPLIED";
        }
        if (resolutionDue == null) return "SAFE";

        Instant now = Instant.now();
        if (now.isAfter(resolutionDue)) {
            return "BREACHED";
        }

        long remainingMinutes = Duration.between(now, resolutionDue).toMinutes();
        if (remainingMinutes < 60) {
            return "WARNING"; // Within 1 hour of breach
        }
        return "SAFE";
    }

    public Long calculateRemainingMinutes(Instant target) {
        if (target == null) return null;
        return Duration.between(Instant.now(), target).toMinutes();
    }
}
