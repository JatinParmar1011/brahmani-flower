package com.brahmaniflower.controller;

import com.brahmaniflower.dto.request.ModerationRequestDto;
import com.brahmaniflower.dto.request.UpdateFeaturedOrderRequestDto;
import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.FeaturedReviewResponseDto;
import com.brahmaniflower.entity.ProductReview;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.ProductDetailRepository;
import com.brahmaniflower.repository.ProductReviewRepository;
import com.brahmaniflower.repository.UserRepository;
import com.brahmaniflower.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ProductReviewRepository reviewRepository;
    private final ProductDetailRepository productRepository;
    private final UserRepository          userRepository;

    // ── GET reviews — filter by status (default: all) ─────────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeaturedReviewResponseDto>>> getReviews(
            @RequestParam(value = "status", required = false) String statusParam,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Long> idPage;
        if (statusParam == null || statusParam.isBlank() || statusParam.equalsIgnoreCase("ALL")) {
            idPage = reviewRepository.findAllIds(pageable);
        } else {
            ProductReview.ReviewStatus status;
            try {
                status = ProductReview.ReviewStatus.valueOf(statusParam.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + statusParam);
            }
            idPage = reviewRepository.findIdsByStatus(status, pageable);
        }

        if (idPage.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(Page.empty(pageable)));
        }

        List<ProductReview> reviews = reviewRepository.findByIdsWithDetailsAndProduct(idPage.getContent());
        Map<Long, ProductReview> byId = new java.util.LinkedHashMap<>();
        reviews.forEach(r -> byId.put(r.getId(), r));
        List<FeaturedReviewResponseDto> dtos = idPage.getContent().stream()
                .map(byId::get)
                .filter(r -> r != null)
                .map(FeaturedReviewResponseDto::from)
                .collect(java.util.stream.Collectors.toList());

        enrichWithAdminNames(dtos);
        return ResponseEntity.ok(ApiResponse.success(new PageImpl<>(dtos, pageable, idPage.getTotalElements())));
    }

    // ── GET featured reviews only ─────────────────────────────────────────────
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<FeaturedReviewResponseDto>>> getFeaturedReviews() {
        List<FeaturedReviewResponseDto> list = reviewRepository.findFeaturedReviews()
                .stream().map(FeaturedReviewResponseDto::from).toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ── PATCH /{id}/moderate — reject / hide / approve ────────────────────────
    @PatchMapping("/{id}/moderate")
    @Transactional
    public ResponseEntity<ApiResponse<FeaturedReviewResponseDto>> moderateReview(
            @PathVariable Long id,
            @Valid @RequestBody ModerationRequestDto request) {

        ProductReview review = reviewRepository.findByIdsWithDetailsAndProduct(List.of(id))
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        // Resolve admin user ID for audit
        String adminIdentifier = SecurityUtil.getCurrentUserEmail();
        Long adminId = userRepository.findByMobileNumber(adminIdentifier)
                .or(() -> userRepository.findByEmail(adminIdentifier))
                .map(u -> u.getId())
                .orElse(null);

        switch (request.getAction()) {

            case REJECT -> {
                review.setStatus(ProductReview.ReviewStatus.REJECTED);
                review.setModerationReason(request.getReason());
                review.setModeratedBy(adminId);
                review.setModeratedAt(LocalDateTime.now());
                removeFeatured(review);
                syncProductRating(review.getProduct().getId());
            }

            case HIDE -> {
                review.setStatus(ProductReview.ReviewStatus.HIDDEN);
                review.setModerationReason(request.getReason());
                review.setModeratedBy(adminId);
                review.setModeratedAt(LocalDateTime.now());
                removeFeatured(review);
                syncProductRating(review.getProduct().getId());
            }

            case APPROVE -> {
                // Only HIDDEN reviews can be restored — REJECTED is permanent
                if (review.getStatus() == ProductReview.ReviewStatus.REJECTED) {
                    throw new BadRequestException(
                            "Rejected reviews cannot be restored. Reject is a permanent moderation decision.");
                }
                review.setStatus(ProductReview.ReviewStatus.APPROVED);
                review.setModerationReason(null);
                review.setModeratedBy(adminId);
                review.setModeratedAt(LocalDateTime.now());
                syncProductRating(review.getProduct().getId());
            }

            default -> throw new BadRequestException("Unknown moderation action: " + request.getAction());
        }

        ProductReview saved = reviewRepository.save(review);
        String msg = switch (request.getAction()) {
            case REJECT  -> "Review rejected.";
            case HIDE    -> "Review hidden.";
            case APPROVE -> "Review restored to approved.";
        };
        FeaturedReviewResponseDto dto = FeaturedReviewResponseDto.from(saved);
        enrichWithAdminNames(java.util.List.of(dto));
        return ResponseEntity.ok(ApiResponse.success(msg, dto));
    }

    // ── PATCH /{id}/feature — toggle featured on/off ──────────────────────────
    @PatchMapping("/{id}/feature")
    @Transactional
    public ResponseEntity<ApiResponse<FeaturedReviewResponseDto>> toggleFeatured(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        ProductReview review = reviewRepository.findByIdsWithDetailsAndProduct(List.of(id))
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        if (review.getStatus() != ProductReview.ReviewStatus.APPROVED) {
            throw new BadRequestException(
                    "Only APPROVED reviews can be featured. This review is " + review.getStatus() + ".");
        }

        boolean feature = Boolean.TRUE.equals(body.get("featured"));
        if (feature) {
            List<ProductReview> existing = reviewRepository.findFeaturedReviews();
            review.setFeatured(true);
            review.setFeaturedOrder(existing.size() + 1);
        } else {
            removeFeatured(review);
        }

        ProductReview saved = reviewRepository.save(review);
        return ResponseEntity.ok(ApiResponse.success(
                feature ? "Review marked as featured." : "Review removed from featured.",
                FeaturedReviewResponseDto.from(saved)));
    }

    // ── PUT /featured/order — bulk reorder ────────────────────────────────────
    @PutMapping("/featured/order")
    @Transactional
    public ResponseEntity<ApiResponse<List<FeaturedReviewResponseDto>>> updateFeaturedOrder(
            @Valid @RequestBody UpdateFeaturedOrderRequestDto request) {

        for (UpdateFeaturedOrderRequestDto.ReviewOrderEntry entry : request.getOrders()) {
            ProductReview review = reviewRepository.findById(entry.getReviewId())
                    .orElseThrow(() -> new ResourceNotFoundException("Review", entry.getReviewId()));
            if (!Boolean.TRUE.equals(review.getFeatured())) {
                throw new BadRequestException("Review " + entry.getReviewId() + " is not featured.");
            }
            if (review.getStatus() != ProductReview.ReviewStatus.APPROVED) {
                throw new BadRequestException("Review " + entry.getReviewId() + " is not APPROVED.");
            }
            review.setFeaturedOrder(entry.getFeaturedOrder());
            reviewRepository.save(review);
        }

        List<FeaturedReviewResponseDto> updated = reviewRepository.findFeaturedReviews()
                .stream().map(FeaturedReviewResponseDto::from).toList();
        return ResponseEntity.ok(ApiResponse.success("Featured order updated.", updated));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Enrich a list of DTOs with moderatedByName resolved from UserRepository. */
    private List<FeaturedReviewResponseDto> enrichWithAdminNames(List<FeaturedReviewResponseDto> dtos) {
        // Collect distinct admin IDs that need resolution
        List<Long> adminIds = dtos.stream()
                .map(FeaturedReviewResponseDto::getModeratedBy)
                .filter(id -> id != null)
                .distinct()
                .toList();
        if (adminIds.isEmpty()) return dtos;

        Map<Long, String> nameById = userRepository.findAllById(adminIds).stream()
                .collect(java.util.stream.Collectors.toMap(u -> u.getId(), u -> u.getName()));

        dtos.forEach(dto -> {
            if (dto.getModeratedBy() != null) {
                dto.setModeratedByName(nameById.getOrDefault(dto.getModeratedBy(), "Admin"));
            }
        });
        return dtos;
    }

    /** Remove a review from featured and compact the order of remaining ones. */
    private void removeFeatured(ProductReview review) {
        if (!Boolean.TRUE.equals(review.getFeatured())) return;
        int oldOrder = review.getFeaturedOrder() != null ? review.getFeaturedOrder() : Integer.MAX_VALUE;
        review.setFeatured(false);
        review.setFeaturedOrder(null);
        // Compact remaining
        List<ProductReview> remaining = reviewRepository.findFeaturedReviews();
        int pos = 1;
        for (ProductReview r : remaining) {
            if (!r.getId().equals(review.getId())) {
                r.setFeaturedOrder(pos++);
                reviewRepository.save(r);
            }
        }
    }

    /** Re-sync product_detail rating and review_count (APPROVED reviews only). */
    private void syncProductRating(Long productId) {
        productRepository.findById(productId).ifPresent(product -> {
            long count = reviewRepository.countByProductIdAndStatus(
                    productId, ProductReview.ReviewStatus.APPROVED);
            Double avg = reviewRepository.findAverageApprovedRatingByProductId(productId);
            double rounded = avg != null
                    ? new BigDecimal(avg).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;
            product.setRating(BigDecimal.valueOf(rounded));
            product.setReviewCount((int) count);
            productRepository.save(product);
        });
    }
}
