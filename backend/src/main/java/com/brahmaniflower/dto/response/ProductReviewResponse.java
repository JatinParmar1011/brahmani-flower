package com.brahmaniflower.dto.response;

import com.brahmaniflower.entity.ProductReview;

import java.time.LocalDateTime;
import java.util.List;

public class ProductReviewResponse {

    private Long id;
    private Long productId;
    private Long customerId;
    private String customerName;
    private String deliveryCity;
    private Integer rating;
    private String title;
    private String reviewText;
    private String status;
    private Boolean verifiedPurchase;
    private Boolean featured;
    private Integer featuredOrder;
    private List<ProductReviewImageResponse> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductReviewResponse() {}

    public static ProductReviewResponse from(ProductReview r) {
        ProductReviewResponse dto = new ProductReviewResponse();
        dto.id               = r.getId();
        dto.productId        = r.getProduct().getId();
        dto.customerId       = r.getCustomer().getId();
        dto.customerName     = r.getCustomer().getName();
        dto.deliveryCity     = r.getDeliveryCity();   // stored column — no lazy-load chain
        dto.rating           = r.getRating();
        dto.title            = r.getTitle();
        dto.reviewText       = r.getReviewText();
        dto.status           = r.getStatus().name();
        dto.verifiedPurchase = r.getVerifiedPurchase();
        dto.featured         = r.getFeatured();
        dto.featuredOrder    = r.getFeaturedOrder();
        dto.images           = r.getImages().stream()
                .sorted(java.util.Comparator.comparingInt(img -> img.getDisplayOrder()))
                .map(ProductReviewImageResponse::from)
                .toList();
        dto.createdAt        = r.getCreatedAt();
        dto.updatedAt        = r.getUpdatedAt();
        return dto;
    }

    // resolveCity removed — city is now stored directly on the review entity

    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public Long getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName; }
    public String getDeliveryCity() { return deliveryCity; }
    public Integer getRating() { return rating; }
    public String getTitle() { return title; }
    public String getReviewText() { return reviewText; }
    public String getStatus() { return status; }
    public Boolean getVerifiedPurchase() { return verifiedPurchase; }
    public Boolean getFeatured() { return featured; }
    public Integer getFeaturedOrder() { return featuredOrder; }
    public List<ProductReviewImageResponse> getImages() { return images; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
