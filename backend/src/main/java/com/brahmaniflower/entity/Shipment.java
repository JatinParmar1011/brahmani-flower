package com.brahmaniflower.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Tracks the Shiprocket shipment lifecycle for an Order.
 * One shipment per order. Shiprocket IDs are stored separately from our internal IDs.
 */
@Entity
@Table(
    name = "shipment",
    indexes = {
        @Index(name = "idx_shipment_status",        columnList = "shipment_status"),
        @Index(name = "idx_shipment_awb",           columnList = "awb_code"),
        @Index(name = "idx_shipment_shiprocket_id", columnList = "shiprocket_shipment_id"),
        @Index(name = "idx_shipment_last_synced",   columnList = "last_synced_at")
    }
)
@Getter @Setter @NoArgsConstructor
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Our internal order — 1:1 */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    /** Shiprocket's order ID — stored separately from our order ID */
    @Column(name = "shiprocket_order_id", length = 100, unique = true)
    private String shiprocketOrderId;

    /** Shiprocket's shipment ID */
    @Column(name = "shiprocket_shipment_id", length = 100)
    private String shiprocketShipmentId;

    /** Air Waybill code assigned by the courier */
    @Column(name = "awb_code", length = 100)
    private String awbCode;

    /** Courier company name */
    @Column(name = "courier_name", length = 200)
    private String courierName;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipment_status", nullable = false, length = 50)
    private ShipmentStatus shipmentStatus = ShipmentStatus.CREATED;

    @Column(name = "pickup_scheduled_date")
    private LocalDate pickupScheduledDate;

    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    /** Final shipping charge (₹) calculated/obtained at order time */
    @Column(name = "shipping_charge", precision = 10, scale = 2)
    private BigDecimal shippingCharge;

    /** When we last polled Shiprocket for status */
    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    /** How many times we have polled Shiprocket */
    @Column(name = "sync_attempts", nullable = false)
    private Integer syncAttempts = 0;

    /** How many times we attempted to create the Shiprocket order */
    @Column(name = "creation_attempts", nullable = false)
    private Integer creationAttempts = 0;

    /** Last provider error message (for idempotency debugging) */
    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShipmentStatusHistory> statusHistory = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
