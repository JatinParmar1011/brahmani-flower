package com.brahmaniflower.shiprocket.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Response from Shiprocket tracking API.
 * GET /courier/track/awb/{awb_code}
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ShiprocketTrackingResponse {

    @JsonProperty("tracking_data")
    private TrackingData trackingData;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TrackingData {

        @JsonProperty("track_status")
        private Integer trackStatus;

        @JsonProperty("shipment_status")
        private Integer shipmentStatus;

        @JsonProperty("shipment_track")
        private List<ShipmentTrack> shipmentTrack;

        @JsonProperty("shipment_track_activities")
        private List<TrackActivity> shipmentTrackActivities;

        @JsonProperty("track_url")
        private String trackUrl;

        @JsonProperty("error")
        private String error;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ShipmentTrack {

        @JsonProperty("id")
        private Long id;

        @JsonProperty("awb_code")
        private String awbCode;

        @JsonProperty("courier_company_id")
        private Integer courierCompanyId;

        @JsonProperty("shipment_id")
        private Long shipmentId;

        @JsonProperty("order_id")
        private Long orderId;

        @JsonProperty("pickup_date")
        private String pickupDate;

        @JsonProperty("delivered_date")
        private String deliveredDate;

        @JsonProperty("weight")
        private String weight;

        @JsonProperty("packages")
        private Integer packages;

        @JsonProperty("current_status")
        private String currentStatus;

        @JsonProperty("delivered_to")
        private String deliveredTo;

        @JsonProperty("destination")
        private String destination;

        @JsonProperty("consignee_name")
        private String consigneeName;

        @JsonProperty("origin")
        private String origin;

        @JsonProperty("courier_agent_details")
        private String courierAgentDetails;

        @JsonProperty("edd")
        private String edd; // estimated delivery date
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TrackActivity {

        @JsonProperty("date")
        private String date;

        @JsonProperty("activity")
        private String activity;

        @JsonProperty("location")
        private String location;

        @JsonProperty("sr-status")
        private String srStatus;

        @JsonProperty("sr-status-label")
        private String srStatusLabel;
    }
}
