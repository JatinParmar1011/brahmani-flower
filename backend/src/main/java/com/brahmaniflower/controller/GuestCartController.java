package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.CartResponse;
import com.brahmaniflower.service.GuestCartService;
import com.brahmaniflower.service.impl.GuestCartServiceImpl;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/guest-cart")
@RequiredArgsConstructor
@Validated
public class GuestCartController {

    private static final String COOKIE_NAME = "bf_guest_session";
    private static final int    COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

    private final GuestCartService guestCartService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    // ── resolve or create session token ──────────────────────────────────────

    private String resolveToken(HttpServletRequest request, HttpServletResponse response) {
        if (request.getCookies() != null) {
            String existing = Arrays.stream(request.getCookies())
                    .filter(c -> COOKIE_NAME.equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
            if (existing != null && !existing.isBlank()) return existing;
        }
        String token = GuestCartServiceImpl.generateSessionToken();
        setSessionCookie(response, token);
        return token;
    }

    private void setSessionCookie(HttpServletResponse response, String token) {
        String flags = "SameSite=Strict";
        if (cookieSecure) flags += "; Secure";
        response.addHeader("Set-Cookie",
                COOKIE_NAME + "=" + token + "; Path=/; HttpOnly; Max-Age=" + COOKIE_MAX_AGE + "; " + flags);
    }

    private void clearSessionCookie(HttpServletResponse response) {
        response.addHeader("Set-Cookie",
                COOKIE_NAME + "=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict");
    }

    // ── endpoints ─────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            HttpServletRequest request, HttpServletResponse response) {
        String token = resolveToken(request, response);
        return ResponseEntity.ok(ApiResponse.success(guestCartService.getCart(token)));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") @Min(1) @Max(100) int quantity,
            HttpServletRequest request, HttpServletResponse response) {
        String token = resolveToken(request, response);
        CartResponse cart = guestCartService.addToCart(token, productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @RequestParam Long productId,
            @RequestParam @Min(0) @Max(100) int quantity,
            HttpServletRequest request, HttpServletResponse response) {
        String token = resolveToken(request, response);
        CartResponse cart = guestCartService.updateQuantity(token, productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @RequestParam Long productId,
            HttpServletRequest request, HttpServletResponse response) {
        String token = resolveToken(request, response);
        CartResponse cart = guestCartService.removeFromCart(token, productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed", cart));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            HttpServletRequest request, HttpServletResponse response) {
        String token = resolveToken(request, response);
        guestCartService.clearCart(token);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }

    /**
     * Called immediately after login.
     * Merges the guest cart (identified by cookie) into the authenticated user's cart.
     * Deletes the guest cart and clears the guest session cookie.
     */
    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<CartResponse>> mergeAfterLogin(
            HttpServletRequest request, HttpServletResponse response,
            @AuthenticationPrincipal UserDetails userDetails) {
        String token = Arrays.stream(request.getCookies() != null ? request.getCookies() : new Cookie[0])
                .filter(c -> COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);

        if (token == null || token.isBlank()) {
            // No guest cart — just return the user's existing cart
            CartResponse cart = guestCartService.mergeIntoUserCart("__no_guest__", userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("No guest cart to merge", cart));
        }

        CartResponse merged = guestCartService.mergeIntoUserCart(token, userDetails.getUsername());
        clearSessionCookie(response); // guest cart deleted on backend, clear cookie too
        return ResponseEntity.ok(ApiResponse.success("Cart merged", merged));
    }
}
