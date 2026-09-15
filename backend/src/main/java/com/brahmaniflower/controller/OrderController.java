package com.brahmaniflower.controller;

import com.brahmaniflower.dto.request.CheckoutRequest;
import com.brahmaniflower.dto.request.OrderRequest;
import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.OrderResponse;
import com.brahmaniflower.service.OrderService;
import com.brahmaniflower.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ── Customer: checkout from cart ──────────────────────────────────────
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrderResponse response = orderService.checkout(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", response));
    }

    // ── Customer: my orders ───────────────────────────────────────────────
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getUserOrders(userDetails.getUsername(), pageable)));
    }

    // ── Customer: single order ────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrderById(id, userDetails.getUsername())));
    }

    // ── Customer: status history ──────────────────────────────────────────
    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<OrderResponse.StatusHistoryResponse>>> getHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getStatusHistory(id, userDetails.getUsername())));
    }

    // ── Admin: all orders ─────────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(pageable)));
    }

    // ── Admin: single order detail ────────────────────────────────────────
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderForAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderByIdForAdmin(id)));
    }

    // ── Admin: update status ──────────────────────────────────────────────
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status    = body.getOrDefault("status", "");
        String reason    = body.getOrDefault("reason", "");
        String changedBy = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                orderService.updateOrderStatus(id, status, reason, changedBy)));
    }

    // ── Legacy endpoint (backward compat) ─────────────────────────────────
    @PostMapping
    @Deprecated
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrderResponse response = orderService.placeOrder(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", response));
    }
}
