package com.brahmaniflower.repository;

import com.brahmaniflower.entity.ProductDetail;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductDetailRepository extends JpaRepository<ProductDetail, Long> {

    Page<ProductDetail> findByAvailableTrue(Pageable pageable);

    Page<ProductDetail> findByNameContainingIgnoreCaseAndAvailableTrue(String keyword, Pageable pageable);

    @Query("SELECT DISTINCT p FROM ProductDetail p WHERE p.available = true AND EXISTS "
         + "(SELECT m FROM ProductCategoryMapping m WHERE m.product = p AND m.category.categoryName = :categoryName)")
    Page<ProductDetail> findByCategoryNameAndAvailableTrue(@Param("categoryName") String categoryName, Pageable pageable);

    /** Pessimistic write lock — used during order creation to prevent overselling. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductDetail p WHERE p.id = :id")
    Optional<ProductDetail> findByIdForUpdate(@Param("id") Long id);
}
