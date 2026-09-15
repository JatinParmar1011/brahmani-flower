package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.CartResponse;
import com.brahmaniflower.service.CartService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Validated
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userDetails.getUsername())));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") @Min(1) @Max(100) int quantity,
            @AuthenticationPrincipal UserDetails userDetails) {
        CartResponse response = cartService.addToCart(userDetails.getUsername(), productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", response));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @RequestParam Long productId,
            @RequestParam @Min(0) @Max(100) int quantity,
            @AuthenticationPrincipal UserDetails userDetails) {
        CartResponse response = cartService.updateQuantity(userDetails.getUsername(), productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", response));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @RequestParam Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        CartResponse response = cartService.removeFromCart(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", response));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
