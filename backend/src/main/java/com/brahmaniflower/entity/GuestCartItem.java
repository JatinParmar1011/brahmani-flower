package com.brahmaniflower.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "guest_cart_items",
       uniqueConstraints = @UniqueConstraint(columnNames = {"guest_cart_id", "product_id"}))
public class GuestCartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_cart_id", nullable = false)
    private GuestCart guestCart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductDetail product;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public GuestCartItem() {}

    public Long getId() { return id; }
    public GuestCart getGuestCart() { return guestCart; }
    public void setGuestCart(GuestCart guestCart) { this.guestCart = guestCart; }
    public ProductDetail getProduct() { return product; }
    public void setProduct(ProductDetail product) { this.product = product; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
