package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.ShipmentResponse;
import com.brahmaniflower.dto.response.TrackingResult;
import com.brahmaniflower.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Shipment tracking and management endpoints.
 *
 * Customer endpoints: require authentication, scoped to the user's own orders.
 * Admin endpoints: require ADMIN role, can view any order's shipment.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    // ── Customer ─────────────────────────────────────────────────────────────

    /**
     * Get shipment details for one of the customer's orders.
     * GET /api/orders/{orderId}/shipment
     */
    @GetMapping("/orders/{orderId}/shipment")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getShipment(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                shipmentService.getShipmentForOrder(orderId, userDetails.getUsername())));
    }

    /**
     * Get live tracking information for an order.
     * GET /api/orders/{orderId}/tracking
     */
    @GetMapping("/orders/{orderId}/tracking")
    public ResponseEntity<ApiResponse<TrackingResult>> getTracking(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                shipmentService.getTrackingForOrder(orderId, userDetails.getUsername())));
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    /**
     * Admin: get shipment details for any order (includes full status history).
     * GET /api/admin/orders/{orderId}/shipment
     */
    @GetMapping("/admin/orders/{orderId}/shipment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getShipmentForAdmin(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(
                shipmentService.getShipmentForAdmin(orderId)));
    }

    /**
     * Admin: get live tracking for any order.
     * GET /api/admin/orders/{orderId}/tracking
     */
    @GetMapping("/admin/orders/{orderId}/tracking")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TrackingResult>> getTrackingForAdmin(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(
                shipmentService.getTrackingForOrder(orderId, null))); // null = no user auth filter
    }
}
