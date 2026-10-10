package com.brahmaniflower.entity;

/**
 * Outcome of the centralized serviceability check performed by DeliveryServiceabilityService.
 */
public enum ServiceabilityStatus {
    /** Delivery is available to the destination */
    SERVICEABLE,
    /** Product cannot be delivered to this destination (business rule) */
    NOT_SERVICEABLE,
    /** Destination data is invalid or missing */
    INVALID_DESTINATION,
    /** Pincode format is invalid */
    INVALID_PINCODE,
    /** Destination information is required but not provided */
    LOCATION_REQUIRED,
    /** Provider is temporarily unavailable; outcome is uncertain */
    TEMPORARILY_UNAVAILABLE,
    /** Logistics provider returned an error */
    PROVIDER_ERROR
}
