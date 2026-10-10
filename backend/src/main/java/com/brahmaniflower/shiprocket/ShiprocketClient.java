package com.brahmaniflower.shiprocket;

import com.brahmaniflower.config.ShiprocketProperties;
import com.brahmaniflower.shiprocket.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Low-level HTTP client for Shiprocket API.
 *
 * Responsibilities:
 * - Build and send HTTP requests with the current token.
 * - Retry GET requests on transient 5xx errors (up to maxRetries).
 * - Retry once on 401 (re-authenticates via ShiprocketTokenManager).
 * - postOnce() is used for shipment creation (no retry — prevents duplicate orders).
 * - NEVER log credentials or tokens.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ShiprocketClient {

    private final ShiprocketProperties   props;
    private final ShiprocketTokenManager tokenManager;
    private final ObjectMapper           objectMapper;

    // ── Serviceability ───────────────────────────────────────────────────────

    public ShiprocketServiceabilityResponse checkServiceability(
            String pickupPincode, String deliveryPincode, double weight, int cod) {

        String url = props.getBaseUrl() + "/courier/serviceability/?pickup_postcode="
                + encode(pickupPincode) + "&delivery_postcode=" + encode(deliveryPincode)
                + "&weight=" + weight + "&cod=" + cod;

        log.debug("[Shiprocket] Checking serviceability: pickup={} delivery={}",
                pickupPincode, deliveryPincode);

        String responseBody = getWithRetry(url, "serviceability check");
        try {
            return objectMapper.readValue(responseBody, ShiprocketServiceabilityResponse.class);
        } catch (Exception e) {
            log.error("[Shiprocket] Failed to parse serviceability response: {}", e.getMessage());
            throw new ShiprocketException("Failed to parse Shiprocket serviceability response", e);
        }
    }

    // ── Order / Shipment creation ────────────────────────────────────────────

    /**
     * Create a Shiprocket order/shipment.
     * Uses postOnce (no retry) to prevent duplicate shipment orders on timeout.
     * Application-level retry is handled by ShipmentStatusSyncJob.
     */
    public ShiprocketCreateOrderResponse createOrder(ShiprocketCreateOrderRequest request) {
        try {
            String url  = props.getBaseUrl() + "/orders/create/adhoc";
            String body = objectMapper.writeValueAsString(request);

            log.info("[Shiprocket] Creating shipment for internal order id={}", request.getOrderId());

            String responseBody = postOnce(url, body, "order creation");
            ShiprocketCreateOrderResponse response =
                    objectMapper.readValue(responseBody, ShiprocketCreateOrderResponse.class);

            if (response.isSuccess()) {
                log.info("[Shiprocket] Shipment created: shiprocket_order_id={} shipment_id={}",
                        response.getOrderId(), response.getShipmentId());
            } else {
                log.warn("[Shiprocket] Order creation returned status={}", response.getStatus());
            }
            return response;

        } catch (ShiprocketException e) {
            throw e;
        } catch (Exception e) {
            log.error("[Shiprocket] Order creation failed: {}", e.getMessage());
            throw new ShiprocketException("Shiprocket order creation failed: " + e.getMessage(), e);
        }
    }

    // ── Tracking ─────────────────────────────────────────────────────────────

    public ShiprocketTrackingResponse trackByAwb(String awbCode) {
        String url = props.getBaseUrl() + "/courier/track/awb/" + encode(awbCode);
        log.debug("[Shiprocket] Tracking AWB: {}", awbCode);
        String responseBody = getWithRetry(url, "AWB tracking");
        try {
            return objectMapper.readValue(responseBody, ShiprocketTrackingResponse.class);
        } catch (Exception e) {
            log.error("[Shiprocket] Failed to parse tracking response for AWB {}: {}", awbCode, e.getMessage());
            throw new ShiprocketException("Failed to parse Shiprocket tracking response", e);
        }
    }

    public ShiprocketTrackingResponse trackByShipmentId(String shipmentId) {
        String url = props.getBaseUrl() + "/courier/track/shipment/" + encode(shipmentId);
        log.debug("[Shiprocket] Tracking shipment_id: {}", shipmentId);
        String responseBody = getWithRetry(url, "shipment ID tracking");
        try {
            return objectMapper.readValue(responseBody, ShiprocketTrackingResponse.class);
        } catch (Exception e) {
            log.error("[Shiprocket] Failed to parse tracking response for shipment {}: {}",
                    shipmentId, e.getMessage());
            throw new ShiprocketException("Failed to parse Shiprocket tracking response", e);
        }
    }

    // ── HTTP helpers ─────────────────────────────────────────────────────────

    private String getWithRetry(String url, String operation) {
        for (int attempt = 0; attempt <= props.getMaxRetries(); attempt++) {
            try {
                String token = tokenManager.getToken();
                HttpRequest request = buildGet(url, token);
                HttpResponse<String> response = newClient().send(request,
                        HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 401 && attempt == 0) {
                    log.warn("[Shiprocket] 401 on {} attempt {}. Forcing token refresh.", operation, attempt + 1);
                    tokenManager.forceRefresh();
                    continue;
                }
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    return response.body();
                }
                if (response.statusCode() >= 400 && response.statusCode() < 500) {
                    log.error("[Shiprocket] Client error {} on {}: {}", response.statusCode(), operation, response.body());
                    throw new ShiprocketException("Shiprocket " + operation + " failed: HTTP " + response.statusCode());
                }
                log.warn("[Shiprocket] Server error {} on {} attempt {}", response.statusCode(), operation, attempt + 1);
                if (attempt == props.getMaxRetries()) {
                    throw new ShiprocketException("Shiprocket " + operation + " failed after retries: HTTP " + response.statusCode());
                }

            } catch (ShiprocketException e) {
                throw e;
            } catch (Exception e) {
                if (attempt == props.getMaxRetries()) {
                    log.error("[Shiprocket] {} failed after {} attempts: {}", operation, attempt + 1, e.getMessage());
                    throw new ShiprocketException("Shiprocket " + operation + " failed: " + e.getMessage(), e);
                }
                log.warn("[Shiprocket] {} attempt {} failed: {}", operation, attempt + 1, e.getMessage());
            }

            sleepBriefly(attempt);
        }
        throw new ShiprocketException("Shiprocket " + operation + " failed after all retries");
    }

    /**
     * Single-attempt POST — no retry on any failure.
     * Used for shipment creation to prevent duplicate Shiprocket orders.
     * Still retries once on 401 (token refresh only).
     */
    private String postOnce(String url, String body, String operation) {
        for (int tokenAttempt = 0; tokenAttempt <= 1; tokenAttempt++) {
            try {
                String token = tokenManager.getToken();
                HttpRequest request = buildPost(url, body, token);
                HttpResponse<String> response = newClient().send(request,
                        HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 401 && tokenAttempt == 0) {
                    log.warn("[Shiprocket] 401 on {}. Forcing token refresh and retrying once.", operation);
                    tokenManager.forceRefresh();
                    continue;
                }
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    return response.body();
                }
                log.error("[Shiprocket] {} failed with HTTP {}: {}", operation, response.statusCode(), response.body());
                throw new ShiprocketException("Shiprocket " + operation + " failed: HTTP " + response.statusCode());

            } catch (ShiprocketException e) {
                throw e;
            } catch (Exception e) {
                log.error("[Shiprocket] {} failed: {}", operation, e.getMessage());
                throw new ShiprocketException("Shiprocket " + operation + " failed: " + e.getMessage(), e);
            }
        }
        throw new ShiprocketException("Shiprocket " + operation + " failed after token refresh");
    }

    private HttpClient newClient() {
        return HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(props.getConnectTimeoutMs()))
                .build();
    }

    private HttpRequest buildGet(String url, String token) {
        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofMillis(props.getReadTimeoutMs()))
                .GET()
                .build();
    }

    private HttpRequest buildPost(String url, String body, String token) {
        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofMillis(props.getReadTimeoutMs()))
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private void sleepBriefly(int attempt) {
        try {
            Thread.sleep(500L * (attempt + 1));
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
