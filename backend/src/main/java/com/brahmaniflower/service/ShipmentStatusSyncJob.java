package com.brahmaniflower.service;

import com.brahmaniflower.entity.Shipment;
import com.brahmaniflower.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job that polls Shiprocket for status updates on active shipments.
 *
 * Runs every 30 minutes by default (configurable via shiprocket.sync-interval-minutes).
 * Only processes shipments that are:
 * 1. Not in terminal states (DELIVERED, CANCELLED, RTO_DELIVERED)
 * 2. Have a Shiprocket order ID (successfully created with provider)
 * 3. Have not been synced recently (older than sync interval)
 *
 * Also retries pending Shiprocket shipment creation for orders that failed on checkout.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ShipmentStatusSyncJob {

    private static final int MAX_CREATION_ATTEMPTS = 3;
    private static final int BATCH_SIZE = 50; // limit per run to prevent long-running jobs

    private final ShipmentRepository shipmentRepository;
    private final ShipmentService    shipmentService;

    /**
     * Poll active shipments for status updates.
     * Interval: configurable via shiprocket.sync-interval-minutes (default 30 min = 1_800_000 ms).
     *
     * FIX: The expression #{...} evaluates the property value as a number and
     * multiplies by 60000 to convert minutes → milliseconds.
     * The previous "${...}000" pattern produced "30000" (30 seconds), not 1800000 (30 minutes).
     */
    @Scheduled(fixedDelayString = "#{${shiprocket.sync-interval-minutes:30} * 60000L}", initialDelay = 60000)
    public void syncActiveShipments() {
        log.info("[SyncJob] Starting shipment status sync...");

        try {
            LocalDateTime syncBefore = LocalDateTime.now().minusMinutes(25); // sync if not done in last 25 min
            List<Shipment> shipments = shipmentRepository
                    .findShipmentsNeedingSync(syncBefore)
                    .stream()
                    .limit(BATCH_SIZE)
                    .toList();

            if (shipments.isEmpty()) {
                log.debug("[SyncJob] No shipments require sync at this time.");
                return;
            }

            log.info("[SyncJob] Syncing {} shipment(s)...", shipments.size());

            int synced  = 0;
            int failed  = 0;

            for (Shipment shipment : shipments) {
                try {
                    shipmentService.syncShipmentStatus(shipment);
                    synced++;
                } catch (Exception e) {
                    failed++;
                    log.error("[SyncJob] Sync failed for shipment {}: {}", shipment.getId(), e.getMessage());
                }
            }

            log.info("[SyncJob] Sync complete: {} synced, {} failed.", synced, failed);

        } catch (Exception e) {
            log.error("[SyncJob] Unexpected error during sync: {}", e.getMessage(), e);
        }
    }

    /**
     * Retry pending Shiprocket shipment creation for orders where creation failed on checkout.
     * Runs every 10 minutes.
     */
    @Scheduled(fixedDelayString = "600000", initialDelay = 120000)
    public void retryPendingShipmentCreation() {
        try {
            List<Shipment> pending = shipmentRepository
                    .findPendingCreationShipments(MAX_CREATION_ATTEMPTS);

            if (pending.isEmpty()) return;

            log.info("[SyncJob] Retrying Shiprocket creation for {} pending shipment(s).", pending.size());

            for (Shipment shipment : pending) {
                try {
                    // Load the full order before calling create (lazy-loaded)
                    shipmentService.createShipmentForOrder(shipment.getOrder());
                } catch (Exception e) {
                    log.error("[SyncJob] Retry creation failed for shipment {}: {}",
                            shipment.getId(), e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("[SyncJob] Error during pending creation retry: {}", e.getMessage(), e);
        }
    }
}
