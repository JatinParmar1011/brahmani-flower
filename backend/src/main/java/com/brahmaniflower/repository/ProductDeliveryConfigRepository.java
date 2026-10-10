package com.brahmaniflower.repository;

import com.brahmaniflower.entity.ProductDeliveryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductDeliveryConfigRepository extends JpaRepository<ProductDeliveryConfig, Long> {

    Optional<ProductDeliveryConfig> findByProductId(Long productId);

    boolean existsByProductId(Long productId);
}
