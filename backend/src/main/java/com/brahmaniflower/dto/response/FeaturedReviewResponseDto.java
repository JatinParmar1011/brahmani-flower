package com.brahmaniflower.dto.response;

import com.brahmaniflower.entity.ProductReview;

import java.time.LocalDateTime;
import java.util.List;

/** DTO for featured reviews — used on both the homepage and the admin panel. */
public class FeaturedReviewResponseDto {

    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private String customerName;
    private String deliveryCity;
    private Integer rating;
    private String title;
    private String reviewText;
    private Boolean verifiedPurchase;
    private String status;
    private Boolean featured;
    private Integer featuredOrder;
    private Long moderatedBy;
    private String moderatedByName;
    private LocalDateTime moderatedAt;
    private String moderationReason;
    private List<ProductReviewImageResponse> images;
    private LocalDateTime createdAt;

    public FeaturedReviewResponseDto() {}

    public static FeaturedReviewResponseDto from(ProductReview r) {
        FeaturedReviewResponseDto dto = new FeaturedReviewResponseDto();
        dto.id               = r.getId();
        dto.productId        = r.getProduct().getId();
        dto.productName      = r.getProduct().getName();
        dto.productImageUrl  = r.getProduct().getImageUrl();
        dto.customerName     = r.getCustomer().getName();
        dto.deliveryCity     = r.getDeliveryCity();
        dto.rating           = r.getRating();
        dto.title            = r.getTitle();
        dto.reviewText       = r.getReviewText();
        dto.verifiedPurchase = r.getVerifiedPurchase();
        dto.status           = r.getStatus().name();
        dto.featured         = r.getFeatured();
        dto.featuredOrder    = r.getFeaturedOrder();
        dto.moderatedBy      = r.getModeratedBy();
        dto.moderatedByName  = null; // populated by caller when admin name is available
        dto.moderatedAt      = r.getModeratedAt();
        dto.moderationReason = r.getModerationReason();
        dto.images           = r.getImages().stream()
                .sorted(java.util.Comparator.comparingInt(img -> img.getDisplayOrder()))
                .map(ProductReviewImageResponse::from)
                .toList();
        dto.createdAt        = r.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getProductImageUrl() { return productImageUrl; }
    public String getCustomerName() { return customerName; }
    public String getDeliveryCity() { return deliveryCity; }
    public Integer getRating() { return rating; }
    public String getTitle() { return title; }
    public String getReviewText() { return reviewText; }
    public Boolean getVerifiedPurchase() { return verifiedPurchase; }
    public String getStatus() { return status; }
    public Boolean getFeatured() { return featured; }
    public Integer getFeaturedOrder() { return featuredOrder; }
    public Long getModeratedBy() { return moderatedBy; }
    public String getModeratedByName() { return moderatedByName; }
    public void setModeratedByName(String name) { this.moderatedByName = name; }
    public LocalDateTime getModeratedAt() { return moderatedAt; }
    public String getModerationReason() { return moderationReason; }
    public List<ProductReviewImageResponse> getImages() { return images; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
