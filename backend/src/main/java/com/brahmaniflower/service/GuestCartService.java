package com.brahmaniflower.service;

import com.brahmaniflower.dto.response.CartResponse;

public interface GuestCartService {

    CartResponse getCart(String sessionToken);

    CartResponse addToCart(String sessionToken, Long productId, int quantity);

    CartResponse updateQuantity(String sessionToken, Long productId, int quantity);

    CartResponse removeFromCart(String sessionToken, Long productId);

    void clearCart(String sessionToken);

    /** Called at login — merges this guest cart into the user's server cart and deletes the guest cart. */
    CartResponse mergeIntoUserCart(String sessionToken, String userIdentifier);
}
