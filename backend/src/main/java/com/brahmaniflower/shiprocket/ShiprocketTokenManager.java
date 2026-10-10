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
 * Strategy:
 *  - Tokens are cached in memory and expire after TOKEN_EXPIRY_SECONDS (default 24h).
 *  - A ReentrantLock prevents concurrent token refresh races.
 *  - Re-authentication is attempted on 401 responses from the Shiprocket client.
 *  - Credentials are NEVER logged.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ShiprocketTokenManager {

    private static final long TOKEN_EXPIRY_SECONDS = 23 * 60 * 60; // 23 hours (Shiprocket tokens last 24h)
    private static final int  MAX_AUTH_RETRIES     = 1;

    private final ShiprocketProperties props;
    private final ObjectMapper          objectMapper;

    private volatile String  cachedToken;
    private volatile Instant tokenExpiry;
    private final    ReentrantLock lock = new ReentrantLock();

    /**
     * Returns a valid token, refreshing it transparently when expired.
     * Thread-safe.
     */
    public String getToken() {
        if (isTokenValid()) {
            return cachedToken;
        }
        return refreshToken();
    }

    /**
     * Forces token refresh (called after a 401 from Shiprocket).
     */
    public String forceRefresh() {
        synchronized (this) {
            cachedToken  = null;
            tokenExpiry  = null;
        }
        return refreshToken();
    }

    /**
     * Returns true when the cached token exists and has not expired.
     */
    public boolean isTokenValid() {
        return cachedToken != null
                && tokenExpiry != null
                && Instant.now().isBefore(tokenExpiry);
    }

    // ── private ──────────────────────────────────────────────────────────────

    private String refreshToken() {
        lock.lock();
        try {
            // Double-checked locking — another thread may have refreshed while we waited
            if (isTokenValid()) {
                return cachedToken;
            }

            log.info("[Shiprocket] Authenticating with Shiprocket API...");

            String token = authenticate();
            cachedToken  = token;
            tokenExpiry  = Instant.now().plusSeconds(TOKEN_EXPIRY_SECONDS);

            log.info("[Shiprocket] Authentication successful. Token cached for {} hours.",
                    TOKEN_EXPIRY_SECONDS / 3600);
            return token;

        } finally {
            lock.unlock();
        }
    }

    private String authenticate() {
        if (props.getEmail() == null || props.getEmail().isBlank()
                || props.getPassword() == null || props.getPassword().isBlank()) {
            throw new ShiprocketException("Shiprocket credentials not configured. " +
                    "Set shiprocket.email and shiprocket.password in application properties.");
        }

        try {
            ShiprocketAuthRequest authReq = new ShiprocketAuthRequest(props.getEmail(), props.getPassword());
            String body = objectMapper.writeValueAsString(authReq);

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofMillis(props.getConnectTimeoutMs()))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(props.getBaseUrl() + "/auth/login"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofMillis(props.getReadTimeoutMs()))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                ShiprocketAuthResponse authResponse =
                        objectMapper.readValue(response.body(), ShiprocketAuthResponse.class);

                if (authResponse.getToken() == null || authResponse.getToken().isBlank()) {
                    throw new ShiprocketException("Shiprocket authentication response missing token");
                }
                return authResponse.getToken();
            }

            log.error("[Shiprocket] Authentication failed with HTTP {}", response.statusCode());
            throw new ShiprocketException("Shiprocket authentication failed with status " + response.statusCode());

        } catch (ShiprocketException e) {
            throw e;
        } catch (Exception e) {
            log.error("[Shiprocket] Authentication error: {}", e.getMessage());
            throw new ShiprocketException("Shiprocket authentication failed: " + e.getMessage(), e);
        }
    }
}
