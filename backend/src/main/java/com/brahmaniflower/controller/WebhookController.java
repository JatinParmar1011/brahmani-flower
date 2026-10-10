package com.brahmaniflower.controller;

import com.brahmaniflower.config.ShiprocketProperties;
import com.brahmaniflower.entity.Shipment;
import com.brahmaniflower.repository.ShipmentRepository;
import com.brahmaniflower.service.ShipmentService;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Webhook endpoint for Shiprocket shipment status callbacks.
 *
 * Security:
 * - The endpoint is publicly accessible but validates an optional webhook secret header.
 * - Configure SHIPROCKET_WEBHOOK_SECRET in Shiprocket dashboard to match this app's config.
 * - Duplicate events are handled idempotently by comparing existing vs incoming status.
 *
 * Processing:
 * - Returns HTTP 200 immediately to acknowledge receipt.
 * - Status update is processed synchronously (Shiprocket expects fast acknowledgment).
 *
 * IMPORTANT: Verify the exact payload structure against the Shiprocket webhook documentation
 * for your account setup. The fields below are based on documented Shiprocket webhook format.
 */
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private static final String WEBHOOK_SECRET_HEADER = "X-Shiprocket-Webhook-Secret";

    private final ShipmentRepository  shipmentRepository;
    private final ShipmentService     shipmentService;
    private final ShiprocketProperties props;

    /**
     * POST /api/webhooks/shiprocket
     *
     * Expected payload (Shiprocket webhook format):
     * {
     *   "awb": "AWB123456",
     *   "order_id": "SR123456",
     *   "shipment_id": "SH123456",
     *   "current_status": "DELIVERED",
     *   "current_status_id": 7,
     *   "shipment_status": "Delivered",
     *   ...
     * }
     */
    @PostMapping("/shiprocket")
    public ResponseEntity<String> handleShiprocketWebhook(
            @RequestBody ShiprocketWebhookPayload payload,
            @RequestHeader(value = WEBHOOK_SECRET_HEADER, required = false) String secretHeader) {

        // 1. Validate webhook secret if configured
        String configuredSecret = props.getWebhookSecret();
        if (configuredSecret != null && !configuredSecret.isBlank()) {
            // FIX (Issue 11): Use constant-time comparison to prevent timing-based side-channel attacks.
            // String.equals() short-circuits on the first mismatched byte, leaking information.
            boolean secretValid = secretHeader != null && java.security.MessageDigest.isEqual(
                    configuredSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    secretHeader.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            if (!secretValid) {
                log.warn("[Webhook] Invalid webhook secret. Rejecting request.");
                return ResponseEntity.status(401).body("Unauthorized");
            }
        }

        // 2. Validate payload
        if (payload == null) {
            log.warn("[Webhook] Received empty Shiprocket webhook payload");
            return ResponseEntity.badRequest().body("Empty payload");
        }

        String status   = payload.getCurrentStatus();
        String awb      = payload.getAwb();
        String srOrderId = payload.getShiprocketOrderId();

        log.info("[Webhook] Shiprocket webhook received: awb={} sr_order_id={} status='{}'",
                awb, srOrderId, status);

        // 3. Identify shipment — prefer AWB, fall back to Shiprocket order ID
        Optional<Shipment> shipmentOpt = Optional.empty();
        if (awb != null && !awb.isBlank()) {
            shipmentOpt = shipmentRepository.findByAwbCode(awb);
        }
        if (shipmentOpt.isEmpty() && srOrderId != null && !srOrderId.isBlank()) {
            shipmentOpt = shipmentRepository.findByShiprocketOrderId(srOrderId);
        }

        if (shipmentOpt.isEmpty()) {
            log.warn("[Webhook] Shipment not found for awb={} sr_order_id={}. Possibly not yet recorded.", awb, srOrderId);
            // Return 200 to prevent Shiprocket from retrying — we'll reconcile via polling
            return ResponseEntity.ok("OK");
        }

        // 4. Update shipment status (idempotent)
        Shipment shipment = shipmentOpt.get();
        if (status != null && !status.isBlank()) {
            shipmentService.updateShipmentStatus(shipment, status, "WEBHOOK");
        }

        return ResponseEntity.ok("OK");
    }

    // ── Webhook Payload DTO ───────────────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ShiprocketWebhookPayload {

        @JsonProperty("awb")
        private String awb;

        @JsonProperty("order_id")
        private String shiprocketOrderId;

        @JsonProperty("shipment_id")
        private String shipmentId;

        @JsonProperty("current_status")
        private String currentStatus;

        @JsonProperty("current_status_id")
        private Integer currentStatusId;

        @JsonProperty("shipment_status")
        private String shipmentStatus;

        @JsonProperty("etd")
        private String estimatedDeliveryDate;

        @JsonProperty("delivered_date")
        private String deliveredDate;

        @JsonProperty("courier_name")
        private String courierName;
    }
}
