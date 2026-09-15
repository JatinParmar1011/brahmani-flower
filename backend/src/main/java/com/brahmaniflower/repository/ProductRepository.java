package com.brahmaniflower.repository;

import com.brahmaniflower.entity.ProductDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductDetail, Long> {
    Page<ProductDetail> findByAvailableTrue(Pageable pageable);
    Page<ProductDetail> findByNameContainingIgnoreCaseAndAvailableTrue(String name, Pageable pageable);
    List<ProductDetail> findAll();
}
