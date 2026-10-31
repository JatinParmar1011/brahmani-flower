package com.brahmaniflower.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_review",
        uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "product_id"},
                name = "uk_review_customer_product"))
public class ProductReview {

    public enum ReviewStatus {
        PENDING, APPROVED, REJECTED, HIDDEN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductDetail product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    /** Reference to the specific order item that qualifies this review. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 255)
    private String title;

    @Column(name = "review_text", nullable = false, columnDefinition = "TEXT")
    private String reviewText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status = ReviewStatus.PENDING;

    @Column(name = "is_verified_purchase", nullable = false)
    private Boolean verifiedPurchase = false;

    /** Delivery city snapshot — copied from order.snapCity at review creation. */
    @Column(name = "delivery_city", length = 100)
    private String deliveryCity;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductReviewImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ProductReview() {}

    public Long getId() { return id; }

    public ProductDetail getProduct() { return product; }
    public void setProduct(ProductDetail product) { this.product = product; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public OrderItem getOrderItem() { return orderItem; }
    public void setOrderItem(OrderItem orderItem) { this.orderItem = orderItem; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }

    public ReviewStatus getStatus() { return status; }
    public void setStatus(ReviewStatus status) { this.status = status; }

    public Boolean getVerifiedPurchase() { return verifiedPurchase; }
    public void setVerifiedPurchase(Boolean verifiedPurchase) { this.verifiedPurchase = verifiedPurchase; }

    public String getDeliveryCity() { return deliveryCity; }
    public void setDeliveryCity(String deliveryCity) { this.deliveryCity = deliveryCity; }

    public List<ProductReviewImage> getImages() { return images; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
