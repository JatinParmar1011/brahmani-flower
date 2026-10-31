package com.brahmaniflower.repository;

import com.brahmaniflower.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    /** Find a customer's review for a specific product (with images eager-loaded). */
    @Query("SELECT r FROM ProductReview r LEFT JOIN FETCH r.images " +
           "WHERE r.product.id = :productId AND r.customer.id = :customerId")
    Optional<ProductReview> findByProductIdAndCustomerId(
            @Param("productId") Long productId,
            @Param("customerId") Long customerId);

    /**
     * Approved review IDs for a product, paginated.
     * No hardcoded ORDER BY — sort comes from Pageable (supports createdAt, rating).
     * No fetch joins so Hibernate can apply LIMIT/OFFSET safely in SQL.
     */
    @Query(value = "SELECT r.id FROM ProductReview r " +
           "WHERE r.product.id = :productId AND r.status = 'APPROVED'",
           countQuery = "SELECT COUNT(r) FROM ProductReview r " +
           "WHERE r.product.id = :productId AND r.status = 'APPROVED'")
    Page<Long> findApprovedIdsByProductId(@Param("productId") Long productId, Pageable pageable);

    /**
     * Load full review objects by IDs with images.
     * No ORDER BY — caller preserves order from the ID list returned by findApprovedIdsByProductId.
     */
    @Query("SELECT r FROM ProductReview r " +
           "LEFT JOIN FETCH r.images " +
           "WHERE r.id IN :ids")
    List<ProductReview> findByIdsWithDetails(@Param("ids") List<Long> ids);

    /** Kept for backward compat / count checks. */
    Page<ProductReview> findByProductIdAndStatus(Long productId, ProductReview.ReviewStatus status, Pageable pageable);

    /** Count approved reviews for a product. */
    long countByProductIdAndStatus(Long productId, ProductReview.ReviewStatus status);

    /** Average rating of approved reviews for a product. */
    @Query("SELECT AVG(r.rating) FROM ProductReview r " +
           "WHERE r.product.id = :productId AND r.status = 'APPROVED'")
    Double findAverageApprovedRatingByProductId(@Param("productId") Long productId);

    /** Rating distribution (star → count) for approved reviews. */
    @Query("SELECT r.rating, COUNT(r) FROM ProductReview r " +
           "WHERE r.product.id = :productId AND r.status = 'APPROVED' " +
           "GROUP BY r.rating ORDER BY r.rating DESC")
    java.util.List<Object[]> findRatingDistributionByProductId(@Param("productId") Long productId);

    boolean existsByProductIdAndCustomerId(Long productId, Long customerId);
}
