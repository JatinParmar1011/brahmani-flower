package com.brahmaniflower.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cart_items",
       uniqueConstraints = @UniqueConstraint(columnNames = {"cart_id", "product_id"}))
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductDetail product;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(updatable = false)
    private java.time.LocalDateTime createdAt;

    private java.time.LocalDateTime updatedAt;

    @jakarta.persistence.PrePersist
    void onCreate() { this.createdAt = java.time.LocalDateTime.now(); }

    @jakarta.persistence.PreUpdate
    void onUpdate() { this.updatedAt = java.time.LocalDateTime.now(); }

    public CartItem() {}

    public Long getId() { return id; }
    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }
    public ProductDetail getProduct() { return product; }
    public void setProduct(ProductDetail product) { this.product = product; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
}
