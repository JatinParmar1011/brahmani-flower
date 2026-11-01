package com.brahmaniflower.shiprocket.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Response from Shiprocket's courier serviceability check API.
 *
 * Official endpoint (per https://apidocs.shiprocket.in/):
 *   GET /v1/external/courier/serviceability/
 *   ?pickup_postcode={pickup}&delivery_postcode={delivery}&weight={kg}&cod={0|1}
 *
 * Authorization: Bearer <token>
 *
 * Serviceability is confirmed when:
 *   data.available_courier_companies is non-empty
 *
 * Error cases:
 *   status=422 / status_code=422 → invalid pincode
 *   status=404 / status_code=404 → no service to that pincode
 *   data.available_courier_companies is empty → not serviceable
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShiprocketServiceabilityResponse {

    /** HTTP-level status (mirrors HTTP status code in Shiprocket's envelope). */
    @JsonProperty("status")
    private Integer status;

    @JsonProperty("status_code")
    private Integer statusCode;

    @JsonProperty("message")
    private String message;

    @JsonProperty("data")
    private ServiceabilityData data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ServiceabilityData {

        /** List of couriers that can service this pickup→delivery route. */
        @JsonProperty("available_courier_companies")
        private List<CourierCompany> availableCourierCompanies;

        /**
         * Shiprocket's recommended courier ID.
         * Prefer this courier when multiple options exist.
         */
        @JsonProperty("shiprocket_recommended_courier_id")
        private Integer shiprocketRecommendedCourierId;

        /** Delivery city name resolved from the delivery pincode. */
        @JsonProperty("delivery_city_name")
        private String deliveryCityName;

        /** Delivery state name resolved from the delivery pincode. */
        @JsonProperty("delivery_state_name")
        private String deliveryStateName;

        /** Pickup city name resolved from the pickup pincode. */
        @JsonProperty("pickup_city_name")
        private String pickupCityName;

        /** Pickup state name resolved from the pickup pincode. */
        @JsonProperty("pickup_state_name")
        private String pickupStateName;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CourierCompany {

        @JsonProperty("courier_company_id")
        private Integer courierCompanyId;

        @JsonProperty("courier_name")
        private String courierName;

        /** Shipping rate in INR (₹). */
        @JsonProperty("rate")
        private Double rate;

        /**
         * Estimated delivery days (can be int or string in Shiprocket's response).
         * Use `etd` (estimated delivery date) instead for display purposes.
         */
        @JsonProperty("estimated_delivery_days")
        private Object estimatedDeliveryDays;

        /**
         * COD availability: 1 = COD available, 0 = not available.
         * Check this before allowing COD payment at checkout.
         */
        @JsonProperty("cod")
        private Integer cod;

        /** 1 = surface/road courier, 0 = air courier. */
        @JsonProperty("is_surface")
        private Integer isSurface;

        /**
         * Estimated delivery date string (e.g. "02 Nov, 2026").
         * This is the preferred field for displaying expected delivery to customers.
         */
        @JsonProperty("etd")
        private String etd;

        /**
         * Charged weight in kg.
         * May differ from actual weight due to volumetric weight calculations.
         */
        @JsonProperty("charge_weight")
        private Double chargeWeight;

        /** Courier logo/icon URL if provided. */
        @JsonProperty("courier_logo")
        private String courierLogo;

        /** Tracking performance rating (0-5). */
        @JsonProperty("tracking_performance")
        private Double trackingPerformance;

        /** Pickup performance rating (0-5). */
        @JsonProperty("pickup_performance")
        private Double pickupPerformance;

        /** Delivery performance rating (0-5). */
        @JsonProperty("delivery_performance")
        private Double deliveryPerformance;

        /** RTO (return to origin) charges if applicable. */
        @JsonProperty("rto_charges")
        private Double rtoCharges;
    }

    /**
     * Returns true when at least one courier can service the route.
     * This is the primary check — empty list = not serviceable.
     */
    public boolean isServiceable() {
        return data != null
                && data.getAvailableCourierCompanies() != null
                && !data.getAvailableCourierCompanies().isEmpty();
    }

    /**
     * Returns true when the response indicates an invalid pincode.
     * Shiprocket returns status 422 for invalid/malformed pincodes.
     */
    public boolean isInvalidPincode() {
        return Integer.valueOf(422).equals(status)
                || Integer.valueOf(422).equals(statusCode);
    }

    /**
     * Returns true when Shiprocket says no service to this pincode (404).
     */
    public boolean isNotFound() {
        return Integer.valueOf(404).equals(status)
                || Integer.valueOf(404).equals(statusCode);
    }
}
