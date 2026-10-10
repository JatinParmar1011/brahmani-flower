package com.brahmaniflower.service;

import com.brahmaniflower.dto.response.ShipmentResponse;
import com.brahmaniflower.dto.response.TrackingResult;
import com.brahmaniflower.entity.Order;
import com.brahmaniflower.entity.Shipment;
import com.brahmaniflower.entity.ShipmentStatus;

/**
 * Manages shipment lifecycle: creation, status updates, tracking.
 * Separates shipment concerns from order business logic.
 */
public interface ShipmentService {

    /**
     * Create a Shiprocket shipment for a placed order.
     * Idempotent — safe to call multiple times for the same order.
     */
    Shipment createShipmentForOrder(Order order);

    /**
     * Update shipment status from provider data.
     * Records history and triggers order status update where applicable.
     */
    void updateShipmentStatus(Shipment shipment, String providerStatus, String source);

    /**
     * Get tracking information for an order's shipment.
     */
    TrackingResult getTrackingForOrder(Long orderId, String userIdentifier);

    /**
     * Get shipment details for a given order (customer-safe view).
     */
    ShipmentResponse getShipmentForOrder(Long orderId, String userIdentifier);

    /**
     * Get shipment details for admin view.
     */
    ShipmentResponse getShipmentForAdmin(Long orderId);

    /**
     * Sync status for a single shipment from provider.
     */
    void syncShipmentStatus(Shipment shipment);
}
