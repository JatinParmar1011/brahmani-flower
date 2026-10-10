package com.brahmaniflower.entity;

/**
 * Internal shipment lifecycle states — separate from OrderStatus.
 * These are mapped from Shiprocket provider statuses via ShiprocketStatusMapper.
 */
public enum ShipmentStatus {
    /** Shipment record created in our system, Shiprocket order not yet submitted */
    CREATED,
    /** Shiprocket order created, awaiting pickup */
    PICKUP_PENDING,
    /** Courier has picked up the package */
    PICKED_UP,
    /** Package is moving through logistics network */
    IN_TRANSIT,
    /** Package is out for final delivery */
    OUT_FOR_DELIVERY,
    /** Package delivered successfully */
    DELIVERED,
    /** Shipment cancelled */
    CANCELLED,
    /** Return-to-origin initiated */
    RTO_INITIATED,
    /** Package returned to origin */
    RTO_DELIVERED,
    /** Exception/problem during transit */
    EXCEPTION,
    /** Unknown status — logged for investigation */
    UNKNOWN
}
