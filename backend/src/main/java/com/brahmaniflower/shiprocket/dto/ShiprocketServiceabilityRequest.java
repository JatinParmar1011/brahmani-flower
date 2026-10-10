package com.brahmaniflower.shiprocket.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

/**
 * Request body for Shiprocket's courier serviceability / rate check API.
 * Endpoint: GET /courier/serviceability
 * Note: Shiprocket uses query parameters for this endpoint.
 */
@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShiprocketServiceabilityRequest {

    /** Pickup pincode (warehouse) */
    @JsonProperty("pickup_postcode")
    private String pickupPostcode;

    /** Customer delivery pincode */
    @JsonProperty("delivery_postcode")
    private String deliveryPostcode;

    /** Dimensional weight in kg */
    @JsonProperty("weight")
    private double weight;

    /** Declared order value for insurance calculation */
    @JsonProperty("cod")
    private int cod; // 1 for COD, 0 for prepaid
}
