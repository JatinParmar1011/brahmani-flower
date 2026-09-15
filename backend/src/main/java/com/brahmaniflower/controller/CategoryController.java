package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.entity.CategoryDetail;
import com.brahmaniflower.entity.CategoryTypeMst;
import com.brahmaniflower.repository.CategoryRepository;
import com.brahmaniflower.repository.CategoryTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final CategoryTypeRepository categoryTypeRepository;

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<CategoryTypeMst>>> getAllTypes() {
        return ResponseEntity.ok(ApiResponse.success(categoryTypeRepository.findByStatusOrderByIdAsc("ACTIVE")));
    }

    @GetMapping("/type/{typeId}")
    public ResponseEntity<ApiResponse<List<CategoryDetail>>> getByTypeId(@PathVariable Long typeId) {
        List<CategoryDetail> list = categoryRepository
                .findByCategoryType_IdAndStatusOrderByCategoryDisplayOrderAsc(typeId, "ACTIVE");
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{typeName}")
    public ResponseEntity<ApiResponse<List<CategoryDetail>>> getByTypeName(@PathVariable String typeName) {
        List<CategoryDetail> list = categoryRepository
                .findByCategoryType_CategoryTypeNameAndStatusOrderByCategoryDisplayOrderAsc(typeName, "ACTIVE");
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
