package com.brahmaniflower.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_category_mapping")
public class ProductCategoryMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductDetail product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryDetail category;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public ProductCategoryMapping() {}

    public ProductCategoryMapping(ProductDetail product, CategoryDetail category) {
        this.product = product;
        this.category = category;
    }

    public Long getId() { return id; }
    public ProductDetail getProduct() { return product; }
    public CategoryDetail getCategory() { return category; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
