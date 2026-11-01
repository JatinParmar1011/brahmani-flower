package com.brahmaniflower.controller;

import com.brahmaniflower.config.ShiprocketProperties;
import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.shiprocket.ShiprocketTokenManager;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only endpoint to verify Shiprocket connectivity and authentication.
 *
 * GET /api/admin/shiprocket/test
 *
 * Returns whether a valid token can be obtained from Shiprocket.
 * Does NOT expose the token value in the response.
 *
 * Use this to diagnose configuration issues:
 *   - Wrong credentials
 *   - Wrong base URL
 *   - MD5 hashed password instead of plain text
 *   - Network / TLS issues
 */
@RestController
@RequestMapping("/api/admin/shiprocket")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class ShiprocketTestController {

    private final ShiprocketTokenManager tokenManager;
    private final ShiprocketProperties   props;

    /**
     * Test Shiprocket authentication.
     *
     * Returns:
     *  - connected: true/false
     *  - mode: "STATIC_TOKEN" or "EMAIL_PASSWORD"
     *  - tokenPresent: true if a token was obtained (value never exposed)
     *  - tokenCached: true if the dynamic token is still in cache
     *  - configuredEmail: the email from config (for diagnosis)
     *  - baseUrl: the base URL being used
     *  - error: error message if connection failed
     */
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<ShiprocketAuthStatus>> testAuth() {
        boolean usingStaticToken = props.getToken() != null && !props.getToken().isBlank();
        String mode = usingStaticToken ? "STATIC_TOKEN" : "EMAIL_PASSWORD";

        try {
            String token = tokenManager.getToken();
            boolean tokenPresent = token != null && !token.isBlank();

            ShiprocketAuthStatus status = ShiprocketAuthStatus.builder()
                    .connected(tokenPresent)
                    .mode(mode)
                    .tokenPresent(tokenPresent)
                    .tokenCached(tokenManager.isTokenValid())
                    .configuredEmail(props.getEmail())
                    .baseUrl(props.getBaseUrl())
                    .pickupLocation(props.getPickupLocation())
                    .pickupPincode(props.getPickupPincode())
                    .build();

            String message = tokenPresent
                    ? "Shiprocket authentication successful"
                    : "Token obtained but appears empty";

            log.info("[Shiprocket] Auth test: connected={} mode={}", tokenPresent, mode);
            return ResponseEntity.ok(ApiResponse.success(message, status));

        } catch (Exception e) {
            log.error("[Shiprocket] Auth test failed: {}", e.getMessage());

            ShiprocketAuthStatus status = ShiprocketAuthStatus.builder()
                    .connected(false)
                    .mode(mode)
                    .tokenPresent(false)
                    .tokenCached(false)
                    .configuredEmail(props.getEmail())
                    .baseUrl(props.getBaseUrl())
                    .pickupLocation(props.getPickupLocation())
                    .pickupPincode(props.getPickupPincode())
                    .error(e.getMessage())
                    .build();

            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ShiprocketAuthStatus {
        private boolean connected;
        private String  mode;           // STATIC_TOKEN or EMAIL_PASSWORD
        private boolean tokenPresent;
        private boolean tokenCached;
        private String  configuredEmail;
        private String  baseUrl;
        private String  pickupLocation;
        private String  pickupPincode;
        private String  error;           // only present on failure
    }
}
