package com.brahmaniflower.service;

import com.brahmaniflower.dto.response.CartServiceabilityResponse;
import com.brahmaniflower.dto.response.ServiceabilityResult;

import java.util.List;

/**
 * Centralized service for all serviceability checks.
 * This is the single source of truth — controllers must NOT implement their own logic.
 */
public interface DeliveryServiceabilityService {

    /**
     * Check whether a single product can be delivered to a given destination.
     * Validates product delivery rules + optional Shiprocket serviceability check.
     *
     * @param productId        internal product ID
     * @param destinationPincode  6-digit destination pincode
     * @param destinationCity  destination city (required for CITY_BASED products)
     * @return ServiceabilityResult — never null
     */
    ServiceabilityResult checkProductServiceability(
            Long productId, String destinationPincode, String destinationCity);

    /**
     * Check serviceability for all cart items against a destination address.
     * Returns per-item results — does NOT short-circuit on first failure.
     *
     * @param userIdentifier   mobile number or email of the authenticated user
     * @param addressId        ID of the delivery address to check against
     * @return CartServiceabilityResponse with item-level details and aggregate summary
     */
    CartServiceabilityResponse checkCartServiceability(String userIdentifier, Long addressId);

    /**
     * Validate serviceability for checkout — re-runs all checks for reliability.
     * Must be called during order creation; results from product page are considered stale.
     *
     * @param userIdentifier   mobile number or email of the authenticated user
     * @param addressId        delivery address ID
     * @throws com.brahmaniflower.exception.BadRequestException if any item is not serviceable
     */
    void validateCheckoutServiceability(String userIdentifier, Long addressId);
}
