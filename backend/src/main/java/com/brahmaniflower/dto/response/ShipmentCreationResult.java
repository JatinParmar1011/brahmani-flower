package com.brahmaniflower.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Result returned after creating a shipment with the logistics provider.
 */
@Data
@Builder
public class ShipmentCreationResult {

    private boolean     success;
    private String      shiprocketOrderId;
    private String      shiprocketShipmentId;
    private String      awbCode;
    private String      courierName;
    private String      pickupScheduledDate;
    private String      estimatedDeliveryDate;
    private BigDecimal  shippingCharge;
    private String      errorMessage;
}
