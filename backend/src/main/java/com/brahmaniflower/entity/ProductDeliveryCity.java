package com.brahmaniflower.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Maps a product to the cities it can be delivered to (for CITY_BASED products).
 */
@Entity
@Table(
    name = "product_delivery_city",
    indexes = {
        @Index(name = "idx_pdcy_product", columnList = "product_id"),
        @Index(name = "idx_pdcy_city",    columnList = "city_id"),
        @Index(name = "idx_pdcy_status",  columnList = "status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_pdc_product_city", columnNames = {"product_id", "city_id"})
    }
)
@Getter @Setter @NoArgsConstructor
public class ProductDeliveryCity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductDetail product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

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
