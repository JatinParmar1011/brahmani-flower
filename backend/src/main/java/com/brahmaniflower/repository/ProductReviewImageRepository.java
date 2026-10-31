package com.brahmaniflower.repository;

import com.brahmaniflower.entity.ProductReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewImageRepository extends JpaRepository<ProductReviewImage, Long> {
    List<ProductReviewImage> findByReviewIdOrderByDisplayOrderAsc(Long reviewId);
}
