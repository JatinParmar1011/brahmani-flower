package com.brahmaniflower.repository;

import com.brahmaniflower.entity.CategoryTypeMst;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryTypeRepository extends JpaRepository<CategoryTypeMst, Long> {
    List<CategoryTypeMst> findByStatusOrderByIdAsc(String status);
}
