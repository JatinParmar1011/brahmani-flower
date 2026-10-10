package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.CartServiceabilityResponse;
import com.brahmaniflower.dto.response.ServiceabilityResult;
import com.brahmaniflower.service.DeliveryServiceabilityService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Delivery serviceability APIs.
 *
 * Product serviceability check is PUBLIC (no auth needed — used on the product detail page).
 * Cart serviceability check requires authentication.
 */
@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryServiceabilityService serviceabilityService;

    /**
     * Check whether a single product can be delivered to a destination.
     *
     * POST /api/delivery/serviceability/check
     *
     * Request body:
     * {
     *   "productId": 42,
     *   "pincode": "395010",
     *   "city": "Surat"   // optional — required for CITY_BASED products
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

    /**
     * Check serviceability for all items in the authenticated user's cart
     * against a specific delivery address.
     *
     * POST /api/delivery/cart/serviceability/check
     *
     * Request body:
     * { "addressId": 7 }
     */
    @PostMapping("/cart/serviceability/check")
    public ResponseEntity<ApiResponse<CartServiceabilityResponse>> checkCartServiceability(
            @Valid @RequestBody CartServiceabilityCheckRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        CartServiceabilityResponse result = serviceabilityService.checkCartServiceability(
                userDetails.getUsername(), request.getAddressId());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // ── Request DTOs (inner classes, no duplication) ──────────────────────────

    public static class ServiceabilityCheckRequest {
        @NotNull
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

    public static class CartServiceabilityCheckRequest {
        @NotNull
        private Long addressId;

        public Long getAddressId() { return addressId; }
        public void setAddressId(Long v) { this.addressId = v; }
    }
}
