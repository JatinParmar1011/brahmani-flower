package com.brahmaniflower.dto.request;

import jakarta.validation.constraints.*;

public class CreateProductReviewRequest {

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Review text is required")
    @Size(min = 10, message = "Review text must be at least 10 characters")
    @Size(max = 2000, message = "Review text must not exceed 2000 characters")
    private String reviewText;

    /** Optional: the order item ID to link this review to a specific purchase. */
    private Long orderItemId;

    public CreateProductReviewRequest() {}

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }
}
