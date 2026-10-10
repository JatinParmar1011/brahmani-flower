package com.brahmaniflower.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Append-only history of every shipment status transition.
 * Records both our internal status and the raw provider status string for traceability.
 */
@Entity
@Table(
    name = "shipment_status_history",
    indexes = {
        @Index(name = "idx_ssh_shipment",   columnList = "shipment_id"),
        @Index(name = "idx_ssh_new_status", columnList = "new_status"),
        @Index(name = "idx_ssh_received",   columnList = "received_at")
    }
)
@Getter @Setter @NoArgsConstructor
public class ShipmentStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(name = "old_status", length = 50)
    private String oldStatus;

    @Column(name = "new_status", nullable = false, length = 50)
    private String newStatus;

    /** Raw status string received from Shiprocket (not normalized) */
    @Column(name = "provider_status", length = 200)
    private String providerStatus;

    /** Where this update came from: WEBHOOK, POLLING, MANUAL, SYSTEM */
    @Column(nullable = false, length = 50)
    private String source = "SYSTEM";

    /** Timestamp of the event as reported by the provider (if available) */
    @Column(name = "event_time")
    private LocalDateTime eventTime;

    /** When we received/processed this update */
    @Column(name = "received_at", updatable = false)
    private LocalDateTime receivedAt;

    @Column(length = 1000)
    private String remarks;

    @PrePersist
    void onCreate() { this.receivedAt = LocalDateTime.now(); }
}
