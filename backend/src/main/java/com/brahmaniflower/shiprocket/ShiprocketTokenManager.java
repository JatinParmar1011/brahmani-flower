package com.brahmaniflower.shiprocket;

import com.brahmaniflower.config.ShiprocketProperties;
import com.brahmaniflower.shiprocket.dto.ShiprocketAuthRequest;
import com.brahmaniflower.shiprocket.dto.ShiprocketAuthResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Manages Shiprocket authentication tokens.
 *
 * Based on official Shiprocket API: https://apidocs.shiprocket.in/
 *
 * Auth endpoint  : POST /v1/external/auth/login
 * Request body   : { "email": "...", "password": "..." }
 * Response field : token  (JWT, valid 10 days / 240 hours)
 * Usage          : Authorization: Bearer <token>
 *
 * Two modes (checked in order):
 *
 *   1. Static token  — if shiprocket.token is set in properties, it is returned
 *      directly. No login API call is made. Simplest option when you have a
 *      long-lived token from the Shiprocket dashboard.
 *
 *   2. Dynamic login — uses shiprocket.email + shiprocket.password to call
 *      POST /auth/login. Token is cached in memory for TOKEN_TTL_HOURS (9 days),
 *      safely inside the 10-day expiry window. Thread-safe via ReentrantLock with
 *      double-checked locking.
 *
 * Credentials are NEVER logged. Only the HTTP status code and non-sensitive
 * error messages appear in logs.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ShiprocketTokenManager {

    /**
     * Token cache duration: 9 days (= 216 hours).
     * Shiprocket tokens are valid for 10 days (240 hours) per official docs.
     * We refresh 1 day early to avoid using a stale token.
     */
    private static final long TOKEN_TTL_SECONDS = 9L * 24 * 60 * 60; // 9 days

    private final ShiprocketProperties props;
    private final ObjectMapper          objectMapper;

    private volatile String  cachedToken;
    private volatile Instant tokenExpiry;
    private final    ReentrantLock lock = new ReentrantLock();

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Returns a valid Shiprocket JWT token.
     *
     * Priority:
     *   1. Static token from config (shiprocket.token) — returned as-is, no expiry check.
     *   2. Cached dynamic token — returned if not yet expired.
     *   3. Fresh token from POST /auth/login — fetched, cached, and returned.
     *
     * Thread-safe.
     */
    public String getToken() {
        // Mode 1: static pre-configured token
        if (props.getToken() != null && !props.getToken().isBlank()) {
            return props.getToken();
        }

        // Mode 2: cached dynamic token
        if (isTokenValid()) return cachedToken;

        // Mode 3: fetch fresh token
        return refreshToken();
    }

    /**
     * Forces a fresh token fetch regardless of cache state.
     * Called by ShiprocketClient when a 401 is received from Shiprocket.
     * Not applicable when using a static token (caller should update the config instead).
     */
    public String forceRefresh() {
        if (props.getToken() != null && !props.getToken().isBlank()) {
            log.warn("[Shiprocket] Static token is configured but returned 401. " +
                     "Update shiprocket.token with a fresh token from the dashboard.");
            return props.getToken();
        }

        lock.lock();
        try {
            cachedToken = null;
            tokenExpiry = null;
        } finally {
            lock.unlock();
        }
        return refreshToken();
    }

    /** Returns true when the cached dynamic token exists and has not expired. */
    public boolean isTokenValid() {
        return cachedToken != null
                && tokenExpiry != null
                && Instant.now().isBefore(tokenExpiry);
    }

    // ── private ──────────────────────────────────────────────────────────────

    private String refreshToken() {
        lock.lock();
        try {
            // Double-checked locking: another thread may have refreshed while we waited
            if (isTokenValid()) return cachedToken;

            log.info("[Shiprocket] Fetching new token via POST /auth/login ...");
            String token = callAuthLoginApi();
            cachedToken = token;
            tokenExpiry = Instant.now().plusSeconds(TOKEN_TTL_SECONDS);
            log.info("[Shiprocket] Authentication successful. Token cached for {} days.",
                    TOKEN_TTL_SECONDS / 86400);
            return token;

        } finally {
            lock.unlock();
        }
    }

    /**
     * Calls POST /v1/external/auth/login per official Shiprocket API docs.
     *
     * Request:
     *   POST https://apiv2.shiprocket.in/v1/external/auth/login
     *   Content-Type: application/json
     *   { "email": "user@example.com", "password": "plainTextPassword" }
     *
     * Success response (HTTP 200):
     *   { "id": 123, "first_name": "...", "last_name": "...",
     *     "email": "...", "company_id": 456, "token": "eyJ...", "created_at": "..." }
     *
     * Error responses:
     *   401 — wrong email or password
     *   498 — invalid/expired token or hashed password used instead of plain text
     */
    private String callAuthLoginApi() {
        validateCredentials();

        String loginUrl = props.getBaseUrl() + "/auth/login";
        log.debug("[Shiprocket] POST {}", loginUrl);

        try {
            ShiprocketAuthRequest authReq = new ShiprocketAuthRequest(
                    props.getEmail(), props.getPassword());
            String requestBody = objectMapper.writeValueAsString(authReq);

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofMillis(props.getConnectTimeoutMs()))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(loginUrl))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofMillis(props.getReadTimeoutMs()))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(
                    request, HttpResponse.BodyHandlers.ofString());

            int status = response.statusCode();
            String body = response.body();

            if (status == 200) {
                ShiprocketAuthResponse authResponse =
                        objectMapper.readValue(body, ShiprocketAuthResponse.class);

                if (authResponse.getToken() == null || authResponse.getToken().isBlank()) {
                    throw new ShiprocketException(
                            "Shiprocket auth/login returned HTTP 200 but token field is missing. " +
                            "Check the API response format.");
                }

                log.info("[Shiprocket] Login successful. User: {} (id={})",
                        authResponse.getEmail(), authResponse.getId());
                return authResponse.getToken();
            }

            // Log status + response body for diagnostics — body does not contain credentials
            log.error("[Shiprocket] auth/login failed. HTTP {}: {}", status, body);

            String hint = switch (status) {
                case 401 -> "Wrong email or password. Use the plain-text password, not an MD5 hash.";
                case 498 -> "Invalid token or hashed password. " +
                            "Ensure shiprocket.password is plain text, NOT an MD5 hash. " +
                            "Reset your password at app.shiprocket.in if needed.";
                case 422 -> "Validation error. Check that email and password fields are not empty.";
                default  -> "Unexpected HTTP " + status + ".";
            };

            throw new ShiprocketException(
                    "Shiprocket authentication failed (HTTP " + status + "): " + hint);

        } catch (ShiprocketException e) {
            throw e;
        } catch (Exception e) {
            log.error("[Shiprocket] auth/login request error: {}", e.getMessage());
            throw new ShiprocketException(
                    "Shiprocket authentication failed: " + e.getMessage(), e);
        }
    }

    private void validateCredentials() {
        boolean emailMissing    = props.getEmail()    == null || props.getEmail().isBlank();
        boolean passwordMissing = props.getPassword() == null || props.getPassword().isBlank();

        if (emailMissing || passwordMissing) {
            throw new ShiprocketException(
                    "Shiprocket credentials not configured. " +
                    "Set shiprocket.email and shiprocket.password in application.properties. " +
                    "Alternatively, set shiprocket.token with a pre-generated static token.");
        }

        // Guard against accidental MD5 hash: MD5 is exactly 32 hex chars
        if (props.getPassword().matches("^[a-f0-9]{32}$")) {
            log.warn("[Shiprocket] shiprocket.password looks like an MD5 hash (32 hex chars). " +
                     "Shiprocket requires plain-text passwords. " +
                     "Reset your password at https://app.shiprocket.in and update the config.");
        }
    }
}
