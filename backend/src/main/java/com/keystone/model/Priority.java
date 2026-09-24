package com.keystone.model;

public enum Priority {
    CRITICAL,  // 1-hour response, 4-hour resolution target
    HIGH,      // 4-hour response, 24-hour resolution target
    MEDIUM,    // 8-hour response, 48-hour resolution target
    LOW        // 24-hour response, 5-day (120h) resolution target
}
