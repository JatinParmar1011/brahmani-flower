package com.brahmaniflower.repository;

import com.brahmaniflower.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByAvailableTrue(Pageable pageable);

    Page<Product> findByCategoryAndAvailableTrue(String category, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCaseAndAvailableTrue(String name, Pageable pageable);

    List<Product> findByCategory(String category);
}
