package com.brahmaniflower.shiprocket.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * Response from Shiprocket Create Order API.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShiprocketCreateOrderResponse {

    @JsonProperty("order_id")
    private Long orderId; // Shiprocket's internal order ID

    @JsonProperty("shipment_id")
    private Long shipmentId; // Shiprocket's shipment ID

    @JsonProperty("status")
    private String status;

    @JsonProperty("status_code")
    private Integer statusCode;

    @JsonProperty("onboarding_completed_now")
    private Boolean onboardingCompletedNow;

    @JsonProperty("awb_code")
    private String awbCode;

    @JsonProperty("courier_company_id")
    private Integer courierCompanyId;

    @JsonProperty("courier_name")
    private String courierName;

    @JsonProperty("pickup_scheduled_date")
    private String pickupScheduledDate;

    @JsonProperty("pickup_token_number")
    private String pickupTokenNumber;

    @JsonProperty("pickup_generated_date")
    private String pickupGeneratedDate;

    @JsonProperty("promised_delivery_date")
    private String promisedDeliveryDate;

    @JsonProperty("assigned_date_time")
    private String assignedDateTime;

    public boolean isSuccess() {
        return orderId != null && orderId > 0;
    }
}
