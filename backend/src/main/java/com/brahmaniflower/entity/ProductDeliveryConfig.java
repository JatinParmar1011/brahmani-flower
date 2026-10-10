package com.brahmaniflower.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Per-product delivery configuration.
 * Controls whether a product uses CITY_BASED or PINCODE_BASED delivery,
 * and stores per-product weight/dimensions used for Shiprocket serviceability
 * checks and shipment creation.
 */
@Entity
@Table(
    name = "product_delivery_config",
    indexes = {
        @Index(name = "idx_pdc_delivery_type", columnList = "delivery_type"),
        @Index(name = "idx_pdc_enabled",       columnList = "enabled")
    }
)
@Getter @Setter @NoArgsConstructor
public class ProductDeliveryConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private ProductDetail product;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false, length = 30)
    private DeliveryType deliveryType = DeliveryType.PINCODE_BASED;

    @Column(nullable = false)
    private Boolean enabled = true;

    /**
     * Per-unit weight of the product in kilograms.
     * Used when calling Shiprocket serviceability and shipment creation APIs.
     * Default: 0.5 kg. Admin should set this to the actual product weight.
     */
    @Column(name = "weight_kg", nullable = false, precision = 7, scale = 3)
    private java.math.BigDecimal weightKg = new java.math.BigDecimal("0.500");

    /**
     * Package length in centimetres (longest side).
     */
    @Column(name = "length_cm", nullable = false, precision = 6, scale = 1)
    private java.math.BigDecimal lengthCm = new java.math.BigDecimal("10.0");

    /**
     * Package breadth in centimetres.
     */
    @Column(name = "breadth_cm", nullable = false, precision = 6, scale = 1)
    private java.math.BigDecimal breadthCm = new java.math.BigDecimal("10.0");

    /**
     * Package height in centimetres.
     */
    @Column(name = "height_cm", nullable = false, precision = 6, scale = 1)
    private java.math.BigDecimal heightCm = new java.math.BigDecimal("10.0");

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", length = 255)
    private String updatedBy;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
