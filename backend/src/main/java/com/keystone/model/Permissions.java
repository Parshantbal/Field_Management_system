package com.keystone.model;

/**
 * Enterprise Access Control Permissions matching the Keystone project specification.
 */
public enum Permissions {
    LOGIN,
    LOGOUT,

    CREATE_USER,
    UPDATE_USER,
    VIEW_USER,
    DELETE_USER,

    CREATE_CUSTOMER,
    UPDATE_CUSTOMER,
    VIEW_CUSTOMER,
    DELETE_CUSTOMER,

    CREATE_SITE,
    UPDATE_SITE,
    VIEW_SITE,
    DELETE_SITE,

    CREATE_WO,
    UPDATE_WO,
    VIEW_WO,
    DELETE_WO,
    ASSIGN_WO,
    CANCEL_WO,

    START_WORK,
    HOLD_WORK,
    RESUME_WORK,
    COMPLETE_WORK,

    ADD_PARTS,
    UPDATE_PARTS,
    DELETE_PARTS,
    VIEW_PARTS,
    USE_PARTS,

    ADD_TIME_LOGS,
    VIEW_TIME_LOGS,

    VIEW_DASHBOARD,
    VIEW_REPORT,

    SEND_NOTIFICATION,

    REQUEST_RAISE,
    VIEW_OWN_REQUEST
}
