package com.brahmaniflower.shiprocket;

import com.brahmaniflower.entity.Order;
import com.brahmaniflower.entity.ShipmentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Centralized mapper from Shiprocket provider status strings to our internal ShipmentStatus enum.
 *
 * Shiprocket statuses are sourced from:
 * - Webhook payloads
 * - Tracking API responses (sr-status-label field)
 *
 * Unknown statuses are mapped to UNKNOWN and logged for investigation.
 * This class is the ONLY place where Shiprocket status strings are translated.
 */
@Component
@Slf4j
public class ShiprocketStatusMapper {

    /**
     * Maps known Shiprocket status strings (case-insensitive) to internal ShipmentStatus.
     * Based on Shiprocket API documentation and real response patterns.
     */
    private static final Map<String, ShipmentStatus> STATUS_MAP = Map.ofEntries(
            // Pickup / pre-transit
            Map.entry("new",                          ShipmentStatus.PICKUP_PENDING),
            Map.entry("pending",                      ShipmentStatus.PICKUP_PENDING),
            Map.entry("pickup pending",               ShipmentStatus.PICKUP_PENDING),
            Map.entry("pickup scheduled",             ShipmentStatus.PICKUP_PENDING),
            Map.entry("pickup queued",                ShipmentStatus.PICKUP_PENDING),
            Map.entry("manifest generated",           ShipmentStatus.PICKUP_PENDING),
            Map.entry("picked up",                    ShipmentStatus.PICKED_UP),
            Map.entry("pickup complete",              ShipmentStatus.PICKED_UP),

            // In transit
            Map.entry("in transit",                   ShipmentStatus.IN_TRANSIT),
            Map.entry("reached at destination hub",   ShipmentStatus.IN_TRANSIT),
            Map.entry("arrived at destination",       ShipmentStatus.IN_TRANSIT),
            Map.entry("dispatched",                   ShipmentStatus.IN_TRANSIT),

            // Out for delivery
            Map.entry("out for delivery",             ShipmentStatus.OUT_FOR_DELIVERY),

            // Delivered
            Map.entry("delivered",                    ShipmentStatus.DELIVERED),

            // Cancelled
            Map.entry("cancelled",                    ShipmentStatus.CANCELLED),
            Map.entry("shipment cancelled",           ShipmentStatus.CANCELLED),
            Map.entry("order cancelled",              ShipmentStatus.CANCELLED),

            // RTO
            Map.entry("rto initiated",                ShipmentStatus.RTO_INITIATED),
            Map.entry("rto",                          ShipmentStatus.RTO_INITIATED),
            Map.entry("return to origin",             ShipmentStatus.RTO_INITIATED),
            Map.entry("rto delivered",                ShipmentStatus.RTO_DELIVERED),

            // Exception
            Map.entry("undelivered",                  ShipmentStatus.EXCEPTION),
            Map.entry("misrouted",                    ShipmentStatus.EXCEPTION),
            Map.entry("shipment delayed",             ShipmentStatus.EXCEPTION),
            Map.entry("shipment held",                ShipmentStatus.EXCEPTION),
            Map.entry("lost",                         ShipmentStatus.EXCEPTION)
    );

    /**
     * Map a Shiprocket provider status string to our internal ShipmentStatus.
     * Returns UNKNOWN for unrecognized statuses and logs them.
     */
    public ShipmentStatus map(String providerStatus) {
        if (providerStatus == null || providerStatus.isBlank()) {
            return ShipmentStatus.UNKNOWN;
        }
        String normalized = providerStatus.trim().toLowerCase();
        ShipmentStatus mapped = STATUS_MAP.get(normalized);
        if (mapped == null) {
            log.warn("[ShiprocketStatusMapper] Unknown Shiprocket status: '{}'. Mapping to UNKNOWN.", providerStatus);
            return ShipmentStatus.UNKNOWN;
        }
        return mapped;
    }

    /**
     * Determines if a shipment status transition should trigger an Order status update.
     * Only certain shipment transitions propagate to order status.
     */
    public Order.OrderStatus deriveOrderStatus(ShipmentStatus shipmentStatus) {
        return switch (shipmentStatus) {
            case PICKED_UP, IN_TRANSIT, PICKUP_PENDING -> Order.OrderStatus.SHIPPED;
            case OUT_FOR_DELIVERY                       -> Order.OrderStatus.OUT_FOR_DELIVERY;
            case DELIVERED                              -> Order.OrderStatus.DELIVERED;
            case CANCELLED                             -> Order.OrderStatus.CANCELLED;
            default -> null; // No order status change needed
        };
    }

    /**
     * Human-readable label for a shipment status.
     */
    public String getLabel(ShipmentStatus status) {
        if (status == null) return "Unknown";
        return switch (status) {
            case CREATED          -> "Order Created";
            case PICKUP_PENDING   -> "Pickup Pending";
            case PICKED_UP        -> "Picked Up";
            case IN_TRANSIT       -> "In Transit";
            case OUT_FOR_DELIVERY -> "Out for Delivery";
            case DELIVERED        -> "Delivered";
            case CANCELLED        -> "Cancelled";
            case RTO_INITIATED    -> "Return Initiated";
            case RTO_DELIVERED    -> "Returned to Origin";
            case EXCEPTION        -> "Delivery Exception";
            case UNKNOWN          -> "Status Unknown";
        };
    }
}
