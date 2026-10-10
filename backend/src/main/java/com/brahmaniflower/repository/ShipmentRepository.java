package com.brahmaniflower.repository;

import com.brahmaniflower.entity.Shipment;
import com.brahmaniflower.entity.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByOrderId(Long orderId);

    Optional<Shipment> findByShiprocketOrderId(String shiprocketOrderId);

    Optional<Shipment> findByAwbCode(String awbCode);

    /**
     * Finds active shipments that need status polling.
     * Excludes terminal states: DELIVERED, CANCELLED, RTO_DELIVERED.
     * Uses JOIN FETCH so that shipment.order is available without a transaction.
     */
    @Query("""
        SELECT s FROM Shipment s
        JOIN FETCH s.order
        WHERE s.shipmentStatus NOT IN (
            com.brahmaniflower.entity.ShipmentStatus.DELIVERED,
            com.brahmaniflower.entity.ShipmentStatus.CANCELLED,
            com.brahmaniflower.entity.ShipmentStatus.RTO_DELIVERED
        )
        AND s.shiprocketOrderId IS NOT NULL
        AND (s.lastSyncedAt IS NULL OR s.lastSyncedAt < :before)
        ORDER BY s.lastSyncedAt ASC NULLS FIRST
    """)
    List<Shipment> findShipmentsNeedingSync(@Param("before") LocalDateTime before);

    /**
     * Finds shipments that failed Shiprocket creation and should be retried.
     * Uses JOIN FETCH to eagerly load the Order so that order fields are accessible
     * outside of a transaction in ShipmentStatusSyncJob.retryPendingShipmentCreation().
     */
    @Query("""
        SELECT s FROM Shipment s
        JOIN FETCH s.order o
        JOIN FETCH o.user
        JOIN FETCH o.address
        WHERE s.shipmentStatus = com.brahmaniflower.entity.ShipmentStatus.CREATED
          AND s.shiprocketOrderId IS NULL
          AND s.creationAttempts < :maxAttempts
    """)
    List<Shipment> findPendingCreationShipments(@Param("maxAttempts") int maxAttempts);

    List<Shipment> findByShipmentStatusIn(List<ShipmentStatus> statuses);
}
