package com.brahmaniflower.repository;

import com.brahmaniflower.entity.CategoryDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<CategoryDetail, Long> {
    List<CategoryDetail> findByCategoryType_CategoryTypeNameAndStatusOrderByCategoryDisplayOrderAsc(String typeName, String status);
    List<CategoryDetail> findByCategoryType_IdAndStatusOrderByCategoryDisplayOrderAsc(Long typeId, String status);
}
