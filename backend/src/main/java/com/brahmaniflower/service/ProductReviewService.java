package com.brahmaniflower.service;

import com.brahmaniflower.dto.request.CreateProductReviewRequest;
import com.brahmaniflower.dto.response.ProductReviewResponse;
import com.brahmaniflower.dto.response.ProductReviewSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductReviewService {

    /**
     * Create a review for a product by the authenticated customer.
     * Validates that the customer actually purchased the product.
     * Uploads any attached images to Cloudinary.
     * Throws if a review already exists for this customer+product.
     *
     * @param productId      product being reviewed
     * @param userIdentifier mobile number or email (JWT principal)
     * @param request        review content DTO
     * @param images         optional photo uploads (max 5)
     */
    ProductReviewResponse createReview(Long productId, String userIdentifier,
                                       CreateProductReviewRequest request,
                                       List<MultipartFile> images);

    /**
     * Fetch approved reviews for a product (paginated).
     * Public endpoint — no auth required.
     */
    Page<ProductReviewResponse> getApprovedReviews(Long productId, Pageable pageable);

    /**
     * Get review summary (average rating, count, distribution) for a product.
     * Uses only APPROVED reviews.
     */
    ProductReviewSummaryResponse getReviewSummary(Long productId);

    /**
     * Get the current authenticated customer's review for this product, if any.
     * Returns null if no review exists.
     */
    ProductReviewResponse getMyReview(Long productId, String userIdentifier);

    /**
     * Check if the customer is eligible to review (has purchased the product
     * and hasn't already reviewed it).
     */
    boolean isEligibleToReview(Long productId, String userIdentifier);

    /**
     * Update an existing review by the authenticated customer.
     * - Only the owner can edit their review.
     * - Existing images are deleted from Cloudinary and replaced with new ones.
     * - Product rating is re-synced after the edit.
     *
     * @param productId      product whose review is being edited
     * @param userIdentifier JWT principal (mobile/email)
     * @param request        updated review content
     * @param images         new photos — replaces all existing images (pass empty/null to keep none)
     */
    ProductReviewResponse updateReview(Long productId, String userIdentifier,
                                       CreateProductReviewRequest request,
                                       List<MultipartFile> images);
}
