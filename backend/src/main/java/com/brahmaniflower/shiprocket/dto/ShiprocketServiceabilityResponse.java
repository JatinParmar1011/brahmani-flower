package com.brahmaniflower.shiprocket.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Response from Shiprocket's courier serviceability check API.
 * Fields mapped from actual Shiprocket API v1 response structure.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShiprocketServiceabilityResponse {

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

        @JsonProperty("available_courier_companies")
        private List<CourierCompany> availableCourierCompanies;

        @JsonProperty("shiprocket_recommended_courier_id")
        private Integer shiprocketRecommendedCourierId;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CourierCompany {

        @JsonProperty("courier_company_id")
        private Integer courierCompanyId;

        @JsonProperty("courier_name")
        private String courierName;

        @JsonProperty("rate")
        private Double rate;

        @JsonProperty("estimated_delivery_days")
        private Object estimatedDeliveryDays; // can be int or string

        @JsonProperty("cod")
        private Integer cod;

        @JsonProperty("is_surface")
        private Integer isSurface;

        @JsonProperty("etd")
        private String etd; // estimated delivery date string

        @JsonProperty("charge_weight")
        private Double chargeWeight;
    }

    public boolean isServiceable() {
        return data != null
                && data.getAvailableCourierCompanies() != null
                && !data.getAvailableCourierCompanies().isEmpty();
    }
}
