package com.brahmaniflower.dto.response;

import java.util.Map;

public class ProductReviewSummaryResponse {

    private Long productId;
    private Double averageRating;
    private Long totalReviews;
    /** Map of star (1-5) → count of approved reviews. */
    private Map<Integer, Long> ratingDistribution;

    public ProductReviewSummaryResponse() {}

    public ProductReviewSummaryResponse(Long productId, Double averageRating, Long totalReviews,
                                         Map<Integer, Long> ratingDistribution) {
        this.productId          = productId;
        this.averageRating      = averageRating;
        this.totalReviews       = totalReviews;
        this.ratingDistribution = ratingDistribution;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Long totalReviews) { this.totalReviews = totalReviews; }

    public Map<Integer, Long> getRatingDistribution() { return ratingDistribution; }
    public void setRatingDistribution(Map<Integer, Long> ratingDistribution) { this.ratingDistribution = ratingDistribution; }
}
