package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.CartServiceabilityResponse;
import com.brahmaniflower.dto.response.ServiceabilityResult;
import com.brahmaniflower.service.DeliveryServiceabilityService;
import com.brahmaniflower.service.LogisticsProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.brahmaniflower.config.ShiprocketProperties;

/**
 * Delivery serviceability APIs.
 *
 * Based on official Shiprocket API: https://apidocs.shiprocket.in/
 * Shiprocket endpoint: GET /v1/external/courier/serviceability/
 *
 * Three check modes:
 *
 *   1. Product check (PUBLIC) — validates product delivery rules + Shiprocket
 *      POST /api/delivery/serviceability/check
 *
 *   2. Pincode-only check (PUBLIC) — direct Shiprocket query, no product rules
 *      POST /api/delivery/pincode/check
 *      Use this for the product detail page "Check Delivery" widget.
 *
 *   3. Cart check (AUTH) — validates all cart items + Shiprocket
 *      POST /api/delivery/cart/serviceability/check
 */
@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@Slf4j
public class DeliveryController {

    private final DeliveryServiceabilityService serviceabilityService;
    private final LogisticsProvider             logisticsProvider;
    private final ShiprocketProperties          shiprocketProps;

    // ── 1. Product serviceability check (PUBLIC) ──────────────────────────────

    /**
     * Check whether a single product can be delivered to a destination.
     * Validates both product-level delivery rules and Shiprocket coverage.
     *
     * POST /api/delivery/serviceability/check
     *
     * Request:
     * {
     *   "productId": 42,         // required
     *   "pincode": "395010",     // required for PINCODE_BASED products
     *   "city": "Surat"          // required for CITY_BASED products
     * }
     */
    @PostMapping("/serviceability/check")
    public ResponseEntity<ApiResponse<ServiceabilityResult>> checkProductServiceability(
            @Valid @RequestBody ServiceabilityCheckRequest request) {

        ServiceabilityResult result = serviceabilityService.checkProductServiceability(
                request.getProductId(),
                request.getPincode(),
                request.getCity());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // ── 2. Pincode-only check (PUBLIC) ────────────────────────────────────────

    /**
     * Direct pincode serviceability check via Shiprocket — no product rules applied.
     * Used on the product detail page "Check Delivery" widget for quick pincode lookup.
     *
     * Calls Shiprocket: GET /v1/external/courier/serviceability/
     * with default 0.5 kg weight (single product estimate).
     *
     * POST /api/delivery/pincode/check
     *
     * Request:
     * {
     *   "pincode": "395010"   // required — 6-digit Indian pincode
     * }
     *
     * Response includes: serviceable, deliveryCharge, estimatedDeliveryDate,
     * courierName, codAvailable, city, state resolved from pincode.
     */
    @PostMapping("/pincode/check")
    public ResponseEntity<ApiResponse<ServiceabilityResult>> checkPincode(
            @Valid @RequestBody PincodeCheckRequest request) {

        String pincode = request.getPincode().trim();
        String pickupPincode = shiprocketProps.getPickupPincode();

        if (pickupPincode == null || pickupPincode.isBlank()) {
            log.warn("[DeliveryController] Pickup pincode not configured");
            return ResponseEntity.ok(ApiResponse.success(
                    ServiceabilityResult.builder()
                            .destinationPincode(pincode)
                            .serviceable(false)
                            .status(com.brahmaniflower.entity.ServiceabilityStatus.TEMPORARILY_UNAVAILABLE)
                            .message("Delivery check is temporarily unavailable. Please try again.")
                            .build()));
        }

        // Use default 0.5 kg for a single product estimate
        ServiceabilityResult result = logisticsProvider.checkServiceability(
                pickupPincode, pincode, 0.5);

        log.info("[DeliveryController] Pincode check for {}: serviceable={} courier={}",
                pincode, result.isServiceable(), result.getCourierName());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // ── 3. Cart serviceability check (AUTH) ───────────────────────────────────

    /**
     * Check serviceability for all items in the authenticated user's cart
     * against a specific delivery address.
     * Makes a single Shiprocket call using the total cart weight.
     *
     * POST /api/delivery/cart/serviceability/check
     *
     * Request: { "addressId": 7 }
     */
    @PostMapping("/cart/serviceability/check")
    public ResponseEntity<ApiResponse<CartServiceabilityResponse>> checkCartServiceability(
            @Valid @RequestBody CartServiceabilityCheckRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        CartServiceabilityResponse result = serviceabilityService.checkCartServiceability(
                userDetails.getUsername(), request.getAddressId());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // ── Request DTOs ──────────────────────────────────────────────────────────

    public static class ServiceabilityCheckRequest {
        @NotNull(message = "productId is required")
        private Long productId;
        private String pincode;
        private String city;

        public Long getProductId() { return productId; }
        public void setProductId(Long v) { this.productId = v; }
        public String getPincode() { return pincode; }
        public void setPincode(String v) { this.pincode = v; }
        public String getCity() { return city; }
        public void setCity(String v) { this.city = v; }
    }

    public static class PincodeCheckRequest {
        @NotBlank(message = "pincode is required")
        @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Please enter a valid 6-digit pincode")
        private String pincode;

        public String getPincode() { return pincode; }
        public void setPincode(String v) { this.pincode = v; }
    }

    public static class CartServiceabilityCheckRequest {
        @NotNull(message = "addressId is required")
        private Long addressId;

        public Long getAddressId() { return addressId; }
        public void setAddressId(Long v) { this.addressId = v; }
    }
}
