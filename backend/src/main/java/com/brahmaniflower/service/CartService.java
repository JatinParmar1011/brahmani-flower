package com.brahmaniflower.service;

import com.brahmaniflower.dto.response.CartResponse;

public interface CartService {

    CartResponse getCart(String identifier);

    CartResponse addToCart(String identifier, Long productId, int quantity);

    CartResponse updateQuantity(String identifier, Long productId, int quantity);

    CartResponse removeFromCart(String identifier, Long productId);

    void clearCart(String identifier);
}
