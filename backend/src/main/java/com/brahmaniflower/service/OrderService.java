package com.brahmaniflower.service;

import com.brahmaniflower.dto.request.CheckoutRequest;
import com.brahmaniflower.dto.request.OrderRequest;
import com.brahmaniflower.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {

    /** Cart-based checkout — reads cart from server, validates, creates order atomically. */
    OrderResponse checkout(String userIdentifier, CheckoutRequest request);

    Page<OrderResponse> getUserOrders(String userIdentifier, Pageable pageable);

    OrderResponse getOrderById(Long id, String userIdentifier);

    OrderResponse getOrderByIdForAdmin(Long id);

    OrderResponse updateOrderStatus(Long id, String status, String reason, String changedBy);

    Page<OrderResponse> getAllOrders(Pageable pageable);

    List<OrderResponse.StatusHistoryResponse> getStatusHistory(Long orderId, String userIdentifier);

    // Legacy — kept for backward compatibility; delegates to checkout internally
    @Deprecated
    OrderResponse placeOrder(String userEmail, OrderRequest request);
}
