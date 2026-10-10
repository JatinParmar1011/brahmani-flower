package com.brahmaniflower.shiprocket;

import com.brahmaniflower.config.ShiprocketProperties;
import com.brahmaniflower.shiprocket.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Low-level HTTP client for Shiprocket API.
 *
 * Uses Apache HttpClient 5 for improved TLS compatibility on networks where
 * Java's built-in HttpClient fails with SSL_ERROR_SYSCALL.
 *
 * Responsibilities:
 * - Build and send HTTP requests with the current auth token.
 * - Retry GET requests on transient 5xx errors (up to maxRetries).
 * - Retry once on 401 (token refresh via ShiprocketTokenManager).
 * - postOnce() is used for shipment creation (no retry — prevents duplicate orders).
 * - NEVER log credentials or tokens.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ShiprocketClient {

    private final ShiprocketProperties  props;
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
            try (CloseableHttpClient client = ShiprocketTokenManager.buildHttpClient()) {
                String token = tokenManager.getToken();
                HttpGet get = new HttpGet(url);
                get.setHeader("Authorization", "Bearer " + token);
                get.setHeader("Content-Type", "application/json");

                int[]    statusHolder = {0};
                String   body = client.execute(get, response -> {
                    statusHolder[0] = response.getCode();
                    return EntityUtils.toString(response.getEntity());
                });
                int status = statusHolder[0];

                if (status == 401 && attempt == 0) {
                    log.warn("[Shiprocket] 401 on {} attempt {}. Forcing token refresh.",
                            operation, attempt + 1);
                    tokenManager.forceRefresh();
                    continue;
                }
                if (status >= 200 && status < 300) return body;
                if (status >= 400 && status < 500) {
                    log.error("[Shiprocket] Client error {} on {}: {}", status, operation, body);
                    throw new ShiprocketException(
                            "Shiprocket " + operation + " failed: HTTP " + status);
                }
                log.warn("[Shiprocket] Server error {} on {} attempt {}", status, operation, attempt + 1);
                if (attempt == props.getMaxRetries()) {
                    throw new ShiprocketException(
                            "Shiprocket " + operation + " failed after retries: HTTP " + status);
                }

            } catch (ShiprocketException e) {
                throw e;
            } catch (Exception e) {
                if (attempt == props.getMaxRetries()) {
                    log.error("[Shiprocket] {} failed after {} attempts: {}",
                            operation, attempt + 1, e.getMessage());
                    throw new ShiprocketException(
                            "Shiprocket " + operation + " failed: " + e.getMessage(), e);
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
            try (CloseableHttpClient client = ShiprocketTokenManager.buildHttpClient()) {
                String token = tokenManager.getToken();
                HttpPost post = new HttpPost(url);
                post.setHeader("Authorization", "Bearer " + token);
                post.setEntity(new StringEntity(body, ContentType.APPLICATION_JSON));

                int[]  statusHolder = {0};
                String responseBody = client.execute(post, response -> {
                    statusHolder[0] = response.getCode();
                    return EntityUtils.toString(response.getEntity());
                });
                int status = statusHolder[0];

                if (status == 401 && tokenAttempt == 0) {
                    log.warn("[Shiprocket] 401 on {}. Forcing token refresh and retrying once.", operation);
                    tokenManager.forceRefresh();
                    continue;
                }
                if (status >= 200 && status < 300) return responseBody;
                log.error("[Shiprocket] {} failed with HTTP {}: {}", operation, status, responseBody);
                throw new ShiprocketException(
                        "Shiprocket " + operation + " failed: HTTP " + status);

            } catch (ShiprocketException e) {
                throw e;
            } catch (Exception e) {
                log.error("[Shiprocket] {} failed: {}", operation, e.getMessage());
                throw new ShiprocketException(
                        "Shiprocket " + operation + " failed: " + e.getMessage(), e);
            }
        }
        throw new ShiprocketException("Shiprocket " + operation + " failed after token refresh");
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
