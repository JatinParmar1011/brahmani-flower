package com.brahmaniflower.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Bulk-update the display order of featured reviews. */
public class UpdateFeaturedOrderRequestDto {

    @NotNull(message = "Order list is required")
    @Valid
    private List<ReviewOrderEntry> orders;

    public List<ReviewOrderEntry> getOrders() { return orders; }
    public void setOrders(List<ReviewOrderEntry> orders) { this.orders = orders; }

    public static class ReviewOrderEntry {

        @NotNull(message = "reviewId is required")
        private Long reviewId;

        @NotNull(message = "featuredOrder is required")
        @Min(value = 1, message = "featuredOrder must be >= 1")
        private Integer featuredOrder;

        public Long getReviewId() { return reviewId; }
        public void setReviewId(Long reviewId) { this.reviewId = reviewId; }

        public Integer getFeaturedOrder() { return featuredOrder; }
        public void setFeaturedOrder(Integer featuredOrder) { this.featuredOrder = featuredOrder; }
    }
}
