package com.brahmaniflower.dto.response;

import com.brahmaniflower.entity.ShipmentStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Customer/admin facing shipment response.
 * Does not expose internal technical fields like DB IDs unnecessarily.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ShipmentResponse {

    private Long           id;
    private Long           orderId;
    private String         orderNumber;
    private String         shiprocketOrderId;
    private String         awbCode;
    private String         courierName;
    private ShipmentStatus shipmentStatus;
    private String         shipmentStatusLabel;
    private LocalDate      pickupScheduledDate;
    private LocalDate      estimatedDeliveryDate;
    private BigDecimal     shippingCharge;
    private LocalDateTime  lastSyncedAt;
    private List<StatusHistoryEntry> statusHistory;

    @Data
    @Builder
    public static class StatusHistoryEntry {
        private String        oldStatus;
        private String        newStatus;
        private String        providerStatus;
        private String        source;
        private LocalDateTime eventTime;
        private LocalDateTime receivedAt;
        private String        remarks;
    }
}
