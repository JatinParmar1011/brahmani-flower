package com.brahmaniflower.repository;

import com.brahmaniflower.entity.ProductCategoryMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductCategoryMappingRepository extends JpaRepository<ProductCategoryMapping, Long> {
    List<ProductCategoryMapping> findByProduct_Id(Long productId);
    void deleteByProduct_Id(Long productId);
}
