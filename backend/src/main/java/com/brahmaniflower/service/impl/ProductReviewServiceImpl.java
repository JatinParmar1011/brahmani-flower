package com.brahmaniflower.service.impl;

import com.brahmaniflower.dto.request.CreateProductReviewRequest;
import com.brahmaniflower.dto.response.ProductReviewResponse;
import com.brahmaniflower.dto.response.ProductReviewSummaryResponse;
import com.brahmaniflower.entity.*;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.*;
import com.brahmaniflower.service.CloudinaryService;
import com.brahmaniflower.service.ProductReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductReviewServiceImpl implements ProductReviewService {

    private static final int MAX_IMAGES = 5;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024L; // 5 MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private final ProductReviewRepository    reviewRepository;
    private final ProductReviewImageRepository imageRepository;
    private final ProductDetailRepository    productRepository;
    private final UserRepository             userRepository;
    private final OrderItemRepository        orderItemRepository;
    private final CloudinaryService          cloudinaryService;

    @Override
    @Transactional
    public ProductReviewResponse createReview(Long productId, String userIdentifier,
                                              CreateProductReviewRequest request,
                                              List<MultipartFile> images) {
        // 1. Resolve customer from JWT principal
        User customer = resolveUser(userIdentifier);

        // 2. Verify product exists
        ProductDetail product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        // 3. Prevent duplicate review
        if (reviewRepository.existsByProductIdAndCustomerId(productId, customer.getId())) {
            throw new BadRequestException("You have already reviewed this product.");
        }

        // 4. Verify the customer actually purchased this product (verified purchase check)
        boolean hasPurchased = orderItemRepository.existsByProductIdAndCustomerId(productId, customer.getId());

        // 5. Validate order item reference — link to the most recent qualifying order item
        OrderItem orderItem = null;
        if (request.getOrderItemId() != null) {
            // Frontend supplied a specific order item — validate ownership + product match
            orderItem = orderItemRepository.findByIdAndCustomerId(request.getOrderItemId(), customer.getId())
                    .orElseThrow(() -> new BadRequestException("Order item not found or does not belong to you."));
            if (!orderItem.getProduct().getId().equals(productId)) {
                throw new BadRequestException("Order item product does not match the reviewed product.");
            }
        } else if (hasPurchased) {
            // Auto-link to the customer's most recent order item for this product
            // so that deliveryCity and verifiedPurchase are available in the review
            orderItem = orderItemRepository.findByProductIdAndCustomerId(productId, customer.getId())
                    .stream().findFirst().orElse(null);
        } else {
            throw new BadRequestException("You can only review products you have purchased.");
        }

        // 6. Validate uploaded images
        List<MultipartFile> validImages = filterImages(images);

        // 7. Build review entity — auto-approve, no manual moderation required
        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setCustomer(customer);
        review.setOrderItem(orderItem);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setReviewText(request.getReviewText());
        review.setStatus(ProductReview.ReviewStatus.APPROVED);   // immediately live
        review.setVerifiedPurchase(hasPurchased);

        // Snapshot delivery city from the linked order (avoids lazy-load at read time).
        // Try snap_city first (populated for orders placed with address snapshot),
        // fall back to the live address relation for older orders where snap_city is null.
        if (orderItem != null) {
            try {
                Order order = orderItem.getOrder();
                String city = order.getSnapCity();
                if (city == null || city.isBlank()) {
                    // snap_city missing — try the address FK
                    UserAddress addr = order.getAddress();
                    if (addr != null) {
                        city = addr.getCity();
                    }
                }
                if (city != null && !city.isBlank()) {
                    review.setDeliveryCity(city);
                }
            } catch (Exception e) {
                log.warn("Could not resolve delivery city for review: {}", e.getMessage());
            }
        }

        // 8. Save review first
        ProductReview saved;
        try {
            saved = reviewRepository.save(review);
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("You have already reviewed this product.");
        }

        // 9. Upload images to Cloudinary and save references
        if (!validImages.isEmpty()) {
            int order = 0;
            for (MultipartFile file : validImages) {
                try {
                    String url = cloudinaryService.uploadReviewImage(file);
                    ProductReviewImage img = new ProductReviewImage();
                    img.setReview(saved);
                    img.setMediaUrl(url);
                    img.setDisplayOrder(order++);
                    imageRepository.save(img);
                    saved.getImages().add(img);
                } catch (Exception e) {
                    // Log and continue — partial image upload failure should not block the review
                    log.warn("Failed to upload review image for review {}: {}", saved.getId(), e.getMessage());
                }
            }
        }

        // 10. Sync product_detail.rating and review_count from approved reviews
        syncProductRating(product);

        log.info("Review {} created by customer {} for product {}", saved.getId(), customer.getId(), productId);
        return ProductReviewResponse.from(saved);
    }

    @Override
    public Page<ProductReviewResponse> getApprovedReviews(Long productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", productId);
        }
        // Step 1: paginate on IDs only (no fetch join, so SQL LIMIT/OFFSET works correctly)
        Page<Long> idPage = reviewRepository.findApprovedIdsByProductId(productId, pageable);

        if (idPage.isEmpty()) {
            return idPage.map(id -> null); // returns empty Page<ProductReviewResponse>
        }

        // Step 2: fetch full objects with all associations in one query
        List<ProductReview> reviews = reviewRepository.findByIdsWithDetails(idPage.getContent());

        // Preserve the original order returned by step 1
        Map<Long, ProductReview> byId = new java.util.LinkedHashMap<>();
        reviews.forEach(r -> byId.put(r.getId(), r));
        List<ProductReviewResponse> dtos = idPage.getContent().stream()
                .map(byId::get)
                .filter(r -> r != null)
                .map(ProductReviewResponse::from)
                .toList();

        return new org.springframework.data.domain.PageImpl<>(dtos, pageable, idPage.getTotalElements());
    }

    @Override
    public ProductReviewSummaryResponse getReviewSummary(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", productId);
        }

        long total = reviewRepository.countByProductIdAndStatus(
                productId, ProductReview.ReviewStatus.APPROVED);

        Double avg = reviewRepository.findAverageApprovedRatingByProductId(productId);
        double roundedAvg = avg != null
                ? new BigDecimal(avg).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        List<Object[]> dist = reviewRepository.findRatingDistributionByProductId(productId);
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 5; star >= 1; star--) distribution.put(star, 0L);
        for (Object[] row : dist) {
            distribution.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }

        return new ProductReviewSummaryResponse(productId, roundedAvg, total, distribution);
    }

    @Override
    public ProductReviewResponse getMyReview(Long productId, String userIdentifier) {
        User customer = resolveUser(userIdentifier);
        return reviewRepository.findByProductIdAndCustomerId(productId, customer.getId())
                .map(ProductReviewResponse::from)
                .orElse(null);
    }

    @Override
    public boolean isEligibleToReview(Long productId, String userIdentifier) {
        User customer = resolveUser(userIdentifier);
        boolean hasPurchased = orderItemRepository.existsByProductIdAndCustomerId(productId, customer.getId());
        boolean alreadyReviewed = reviewRepository.existsByProductIdAndCustomerId(productId, customer.getId());
        return hasPurchased && !alreadyReviewed;
    }

    @Override
    @Transactional
    public ProductReviewResponse updateReview(Long productId, String userIdentifier,
                                              CreateProductReviewRequest request,
                                              List<MultipartFile> images) {
        // 1. Resolve customer
        User customer = resolveUser(userIdentifier);

        // 2. Find existing review — must belong to this customer
        ProductReview review = reviewRepository.findByProductIdAndCustomerId(productId, customer.getId())
                .orElseThrow(() -> new BadRequestException("No review found for this product. Submit a review first."));

        // 3. Validate new images
        List<MultipartFile> validImages = filterImages(images);

        // 4. Delete old images from Cloudinary and clear them from DB
        List<ProductReviewImage> oldImages = new ArrayList<>(review.getImages());
        review.getImages().clear();
        reviewRepository.save(review); // flush removal (orphanRemoval = true)

        for (ProductReviewImage old : oldImages) {
            try {
                cloudinaryService.deleteImage(old.getMediaUrl());
            } catch (Exception e) {
                log.warn("Failed to delete old review image {}: {}", old.getMediaUrl(), e.getMessage());
            }
        }

        // 5. Update fields
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setReviewText(request.getReviewText());
        review.setStatus(ProductReview.ReviewStatus.APPROVED);

        ProductReview saved = reviewRepository.save(review);

        // 6. Upload new images
        if (!validImages.isEmpty()) {
            int order = 0;
            for (MultipartFile file : validImages) {
                try {
                    String url = cloudinaryService.uploadReviewImage(file);
                    ProductReviewImage img = new ProductReviewImage();
                    img.setReview(saved);
                    img.setMediaUrl(url);
                    img.setDisplayOrder(order++);
                    imageRepository.save(img);
                    saved.getImages().add(img);
                } catch (Exception e) {
                    log.warn("Failed to upload review image for review {}: {}", saved.getId(), e.getMessage());
                }
            }
        }

        // 7. Re-sync product rating
        ProductDetail product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        syncProductRating(product);

        log.info("Review {} updated by customer {} for product {}", saved.getId(), customer.getId(), productId);
        return ProductReviewResponse.from(saved);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User resolveUser(String identifier) {
        return userRepository.findByMobileNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Recalculate and persist product_detail.rating and review_count from the
     * current set of APPROVED reviews.  Called inside the createReview transaction
     * so both the review row and the product summary are committed atomically.
     */
    private void syncProductRating(ProductDetail product) {
        long count = reviewRepository.countByProductIdAndStatus(
                product.getId(), ProductReview.ReviewStatus.APPROVED);
        Double avg = reviewRepository.findAverageApprovedRatingByProductId(product.getId());
        double rounded = avg != null
                ? new BigDecimal(avg).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;
        product.setRating(BigDecimal.valueOf(rounded));
        product.setReviewCount((int) count);
        productRepository.save(product);
        log.debug("Synced product {} rating={} reviewCount={}", product.getId(), rounded, count);
    }

    private List<MultipartFile> filterImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return List.of();
        List<MultipartFile> valid = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            if (valid.size() >= MAX_IMAGES) {
                throw new BadRequestException("Maximum " + MAX_IMAGES + " images allowed per review.");
            }
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new BadRequestException("Image file '" + file.getOriginalFilename()
                        + "' exceeds maximum allowed size of 5 MB.");
            }
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
                throw new BadRequestException("Unsupported image type '" + contentType
                        + "'. Allowed types: JPEG, PNG, WebP.");
            }
            valid.add(file);
        }
        return valid;
    }
}
