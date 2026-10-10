package com.brahmaniflower.repository;

import com.brahmaniflower.entity.CategoryDetail;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<CategoryDetail, Long> {

    @EntityGraph(attributePaths = "categoryType")
    List<CategoryDetail> findByCategoryType_CategoryTypeNameIgnoreCaseAndStatusOrderByCategoryDisplayOrderAsc(String typeName, String status);

    @EntityGraph(attributePaths = "categoryType")
    List<CategoryDetail> findByCategoryType_IdAndStatusOrderByCategoryDisplayOrderAsc(Long typeId, String status);

    @EntityGraph(attributePaths = "categoryType")
    List<CategoryDetail> findByCategoryType_IdOrderByCategoryDisplayOrderAsc(Long typeId);

    @EntityGraph(attributePaths = "categoryType")
    List<CategoryDetail> findAll();
}
