package com.brahmaniflower.service;

import com.brahmaniflower.dto.response.ServiceabilityResult;
import com.brahmaniflower.dto.response.ShipmentCreationResult;
import com.brahmaniflower.dto.response.TrackingResult;
import com.brahmaniflower.entity.Order;

/**
 * Abstraction over logistics/courier providers.
 * Currently implemented by ShiprocketLogisticsProvider.
 * Can be extended for future providers (Delhivery, etc.) without changing business logic.
 */
public interface LogisticsProvider {

    /**
     * Check whether a given pincode can receive shipments from our warehouse pincode.
     *
     * @param pickupPincode    our warehouse pincode
     * @param deliveryPincode  customer's destination pincode
     * @param totalWeightKg    total shipment weight in kg (sum of all items × quantity × unit weight)
     * @return ServiceabilityResult with provider-normalized outcome
     */
    ServiceabilityResult checkServiceability(String pickupPincode, String deliveryPincode, double totalWeightKg);

    /**
     * Create a logistics shipment for a confirmed order.
     * Implementations must be idempotent — safe to call multiple times for the same order.
     *
     * @param order the placed order
     * @return ShipmentCreationResult with provider references
     */
    ShipmentCreationResult createShipment(Order order);

    /**
     * Fetch the latest tracking information for a shipment by AWB code.
     *
     * @param awbCode  AWB / tracking number
     * @return TrackingResult with normalized status and activity
     */
    TrackingResult trackByAwb(String awbCode);

    /**
     * Fetch the latest tracking information by provider's shipment ID.
     */
    TrackingResult trackByShipmentId(String shipmentId);

    /**
     * Human-readable provider name (for logging/metadata).
     */
    String providerName();
}
