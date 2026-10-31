package com.brahmaniflower.controller;

import com.brahmaniflower.dto.request.CreateProductReviewRequest;
import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.ProductReviewResponse;
import com.brahmaniflower.dto.response.ProductReviewSummaryResponse;
import com.brahmaniflower.service.ProductReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ProductReviewController {

    private final ProductReviewService reviewService;

    // ── POST /api/products/{productId}/reviews (multipart) ───────────────────
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductReviewResponse>> createReview(
            @PathVariable Long productId,
            @RequestPart("review") @Valid CreateProductReviewRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserDetails userDetails) {

        ProductReviewResponse response = reviewService.createReview(
                productId, userDetails.getUsername(), request, images);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully.", response));
    }

    // ── PUT /api/products/{productId}/reviews/my (update own review) ─────────
    @PutMapping(value = "/my", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductReviewResponse>> updateReview(
            @PathVariable Long productId,
            @RequestPart("review") @Valid CreateProductReviewRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserDetails userDetails) {

        ProductReviewResponse response = reviewService.updateReview(
                productId, userDetails.getUsername(), request, images);
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully.", response));
    }

    // ── GET /api/products/{productId}/reviews (public) ───────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductReviewResponse>>> getReviews(
            @PathVariable Long productId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.success(reviewService.getApprovedReviews(productId, pageable)));
    }

    // ── GET /api/products/{productId}/reviews/summary (public) ───────────────
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ProductReviewSummaryResponse>> getSummary(
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                ApiResponse.success(reviewService.getReviewSummary(productId)));
    }

    // ── GET /api/products/{productId}/reviews/my (authenticated) ─────────────
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<ProductReviewResponse>> getMyReview(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ProductReviewResponse review = reviewService.getMyReview(productId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(review));
    }

    // ── GET /api/products/{productId}/reviews/eligible (authenticated) ────────
    @GetMapping("/eligible")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkEligibility(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean eligible = reviewService.isEligibleToReview(productId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(Map.of("eligible", eligible)));
    }
}
