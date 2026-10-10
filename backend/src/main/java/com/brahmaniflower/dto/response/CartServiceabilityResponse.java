package com.brahmaniflower.dto.response;

import com.brahmaniflower.entity.ServiceabilityStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Serviceability result for an entire cart against a delivery address.
 * Returns per-item results so the UI can show exactly which items are blocked.
 * Also returns aggregate shipping info (charge, COD, ETD) computed from a
 * single Shiprocket call rather than per-item calls.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CartServiceabilityResponse {

    /** True only when ALL items in the cart are serviceable */
    private boolean allServiceable;

    /** Number of items that are serviceable */
    private int serviceableCount;

    /** Number of items that are NOT serviceable */
    private int notServiceableCount;

    /** Aggregate shipping charge for the entire cart (from Shiprocket, based on total weight) */
    private BigDecimal totalShippingCharge;

    /** Best courier name from Shiprocket for this pincode + weight combination */
    private String courierName;

    /** Estimated delivery date string from Shiprocket */
    private String estimatedDeliveryDate;

    /** Whether Cash-on-Delivery is available for this destination */
    private boolean codAvailable;

    /** Whether prepaid payment is available */
    private boolean prepaidAvailable;

    private List<CartItemServiceability> items;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CartItemServiceability {
        private Long              cartItemId;
        private Long              productId;
        private String            productName;
        private boolean           serviceable;
        private ServiceabilityStatus status;
        private String            message;
        private String            estimatedDeliveryDate;
    }
}
