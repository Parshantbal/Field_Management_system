package com.keystone.model;

public enum WorkOrderStatus {
    OPEN,        // Newly submitted service request
    TRIAGED,     // Reviewed by dispatcher, verified requirements
    ASSIGNED,    // Assigned to a technician and scheduled
    EN_ROUTE,    // Technician traveling to site
    ON_SITE,     // Work in progress on premises
    ON_HOLD,     // Waiting for parts or customer access
    COMPLETED,   // Work concluded, awaiting review
    CLOSED,      // Confirmed, signed off, and billed
    CANCELLED    // Cancelled or duplicate
}
