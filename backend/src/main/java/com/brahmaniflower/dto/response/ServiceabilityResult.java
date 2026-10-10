package com.brahmaniflower.dto.response;

import com.brahmaniflower.entity.DeliveryType;
import com.brahmaniflower.entity.ServiceabilityStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Normalized serviceability result returned to controllers and the frontend.
 * Never exposes raw Shiprocket responses or internal credentials.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServiceabilityResult {

    private Long               productId;
    private String             destinationPincode;
    private String             city;
    private String             state;
    private DeliveryType       deliveryType;
    private boolean            serviceable;
    private ServiceabilityStatus status;
    private String             message;
    private String             estimatedDeliveryDate;
    private BigDecimal         deliveryCharge;
    private String             courierName;

    /** True if Cash-on-Delivery is available via at least one courier to this pincode. */
    @Builder.Default
    private boolean codAvailable = false;

    /** True if prepaid payment is supported (true whenever any courier is available). */
    @Builder.Default
    private boolean prepaidAvailable = false;
}
