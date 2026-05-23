package com.brahmaniflower.service;

import com.brahmaniflower.dto.request.OrderRequest;
import com.brahmaniflower.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    OrderResponse placeOrder(String userEmail, OrderRequest request);

    Page<OrderResponse> getUserOrders(String userEmail, Pageable pageable);

    OrderResponse getOrderById(Long id, String userEmail);

    OrderResponse updateOrderStatus(Long id, String status);

    Page<OrderResponse> getAllOrders(Pageable pageable);
}
