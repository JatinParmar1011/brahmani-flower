package com.brahmaniflower.dto.response;

import com.brahmaniflower.entity.ShipmentStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Normalized tracking information for customer/admin display.
 * Does not expose raw provider statuses or internal credentials.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TrackingResult {

    private String         orderId;
    private String         orderNumber;
    private String         awbCode;
    private String         courierName;
    private ShipmentStatus currentStatus;
    private String         currentStatusLabel;
    private String         estimatedDeliveryDate;
    private String         trackUrl;
    private List<TrackEvent> events;
    private boolean        found;
    private String         errorMessage;

    @Data
    @Builder
    public static class TrackEvent {
        private String date;
        private String activity;
        private String location;
        private String status;
    }
}
