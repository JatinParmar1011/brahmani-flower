package com.brahmaniflower.dto.response;

import com.brahmaniflower.entity.ProductReviewImage;

public class ProductReviewImageResponse {

    private Long id;
    private String mediaUrl;
    private Integer displayOrder;

    public ProductReviewImageResponse() {}

    public static ProductReviewImageResponse from(ProductReviewImage img) {
        ProductReviewImageResponse r = new ProductReviewImageResponse();
        r.id           = img.getId();
        r.mediaUrl     = img.getMediaUrl();
        r.displayOrder = img.getDisplayOrder();
        return r;
    }

    public Long getId() { return id; }
    public String getMediaUrl() { return mediaUrl; }
    public Integer getDisplayOrder() { return displayOrder; }
}
