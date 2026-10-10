package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.CategoryDetailView;
import com.brahmaniflower.entity.CategoryDetail;
import com.brahmaniflower.entity.CategoryTypeMst;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.CategoryRepository;
import com.brahmaniflower.repository.CategoryTypeRepository;
import com.brahmaniflower.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final CategoryTypeRepository categoryTypeRepository;
    private final CloudinaryService cloudinaryService;

    // ── Public ──────────────────────────────────────────────────────────────

    @GetMapping("/api/categories/types")
    public ResponseEntity<ApiResponse<List<CategoryTypeMst>>> getAllTypes() {
        return ResponseEntity.ok(ApiResponse.success(
                categoryTypeRepository.findByStatusOrderByIdAsc("ACTIVE")));
    }

    @GetMapping("/api/categories/type/{typeId}")
    public ResponseEntity<ApiResponse<List<CategoryDetailView>>> getByTypeId(@PathVariable Long typeId) {
        List<CategoryDetailView> list = categoryRepository
                .findByCategoryType_IdAndStatusOrderByCategoryDisplayOrderAsc(typeId, "ACTIVE")
                .stream().map(this::toView).toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/api/categories/{typeName}")
    public ResponseEntity<ApiResponse<List<CategoryDetailView>>> getByTypeName(@PathVariable String typeName) {
        // Normalise: replace underscores with spaces so "shop_by_occasion" matches "Shop by Occasion"
        String normalised = typeName.replace('_', ' ');
        List<CategoryDetailView> list = categoryRepository
                .findByCategoryType_CategoryTypeNameIgnoreCaseAndStatusOrderByCategoryDisplayOrderAsc(normalised, "ACTIVE")
                .stream().map(this::toView).toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ── Admin : Category Types ────────────────────────────────────────────────

    /** GET all category types (including INACTIVE) */
    @GetMapping("/api/admin/categories/types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CategoryTypeMst>>> adminGetAllTypes() {
        return ResponseEntity.ok(ApiResponse.success(
                categoryTypeRepository.findAll()));
    }

    /** POST create a new category type */
    @PostMapping("/api/admin/categories/types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryTypeMst>> adminCreateType(
            @RequestParam String categoryTypeName,
            @RequestParam(required = false) String categoryTypeDescription,
            @RequestParam(required = false) String status) {

        if (categoryTypeName == null || categoryTypeName.isBlank()) {
            throw new BadRequestException("Category type name is required");
        }

        CategoryTypeMst type = new CategoryTypeMst();
        type.setCategoryTypeName(categoryTypeName.trim());
        type.setCategoryTypeDescription(categoryTypeDescription);
        if (status != null && !status.isBlank()) type.setStatus(status);

        return ResponseEntity.ok(ApiResponse.success(categoryTypeRepository.save(type)));
    }

    /** PUT update a category type */
    @PutMapping("/api/admin/categories/types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryTypeMst>> adminUpdateType(
            @PathVariable Long id,
            @RequestParam String categoryTypeName,
            @RequestParam(required = false) String categoryTypeDescription,
            @RequestParam(required = false) String status) {

        CategoryTypeMst type = categoryTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category type not found"));

        if (categoryTypeName == null || categoryTypeName.isBlank()) {
            throw new BadRequestException("Category type name is required");
        }

        type.setCategoryTypeName(categoryTypeName.trim());
        type.setCategoryTypeDescription(categoryTypeDescription);
        if (status != null && !status.isBlank()) type.setStatus(status);

        return ResponseEntity.ok(ApiResponse.success(categoryTypeRepository.save(type)));
    }

    // ── Admin : Categories ────────────────────────────────────────────────────

    /** GET all categories for a given type (admin, all statuses) */
    @GetMapping("/api/admin/categories/type/{typeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CategoryDetailView>>> adminGetByTypeId(@PathVariable Long typeId) {
        List<CategoryDetailView> list = categoryRepository
                .findByCategoryType_IdOrderByCategoryDisplayOrderAsc(typeId)
                .stream().map(this::toView).toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** GET all categories (admin, all statuses) */
    @GetMapping("/api/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CategoryDetailView>>> adminGetAll() {
        List<CategoryDetailView> list = categoryRepository.findAll()
                .stream().map(this::toView).toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** POST create a category under a given type with optional image */
    @PostMapping("/api/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDetailView>> adminCreateCategory(
            @RequestParam Long categoryTypeId,
            @RequestParam String categoryName,
            @RequestParam(required = false) String categoryDescription,
            @RequestParam(required = false, defaultValue = "0") Integer categoryDisplayOrder,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) MultipartFile image) {

        CategoryTypeMst type = categoryTypeRepository.findById(categoryTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Category type not found"));

        if (categoryName == null || categoryName.isBlank()) {
            throw new BadRequestException("Category name is required");
        }

        CategoryDetail cat = new CategoryDetail();
        cat.setCategoryType(type);
        cat.setCategoryName(categoryName.trim());
        cat.setCategoryDescription(categoryDescription);
        cat.setCategoryDisplayOrder(categoryDisplayOrder != null ? categoryDisplayOrder : 0);
        if (status != null && !status.isBlank()) cat.setStatus(status);

        if (image != null && !image.isEmpty()) {
            cat.setImageUrl(cloudinaryService.uploadCategoryImage(image));
        }

        return ResponseEntity.ok(ApiResponse.success(toView(categoryRepository.save(cat))));
    }

    /** PUT update a category (optionally replace image) */
    @PutMapping("/api/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDetailView>> adminUpdateCategory(
            @PathVariable Long id,
            @RequestParam Long categoryTypeId,
            @RequestParam String categoryName,
            @RequestParam(required = false) String categoryDescription,
            @RequestParam(required = false, defaultValue = "0") Integer categoryDisplayOrder,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) MultipartFile image) {

        CategoryDetail cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        CategoryTypeMst type = categoryTypeRepository.findById(categoryTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Category type not found"));

        if (categoryName == null || categoryName.isBlank()) {
            throw new BadRequestException("Category name is required");
        }

        cat.setCategoryType(type);
        cat.setCategoryName(categoryName.trim());
        cat.setCategoryDescription(categoryDescription);
        cat.setCategoryDisplayOrder(categoryDisplayOrder != null ? categoryDisplayOrder : 0);
        if (status != null && !status.isBlank()) cat.setStatus(status);

        if (image != null && !image.isEmpty()) {
            if (cat.getImageUrl() != null) cloudinaryService.deleteImage(cat.getImageUrl());
            cat.setImageUrl(cloudinaryService.uploadCategoryImage(image));
        }

        return ResponseEntity.ok(ApiResponse.success(toView(categoryRepository.save(cat))));
    }

    /** DELETE a category (only if no products are mapped to it) */
    @DeleteMapping("/api/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> adminDeleteCategory(@PathVariable Long id) {
        CategoryDetail cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (cat.getImageUrl() != null) cloudinaryService.deleteImage(cat.getImageUrl());
        categoryRepository.delete(cat);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private CategoryDetailView toView(CategoryDetail cat) {
        CategoryTypeMst type = cat.getCategoryType();
        return new CategoryDetailView(
                cat.getId(),
                type != null ? type.getId() : null,
                type != null ? type.getCategoryTypeName() : null,
                cat.getCategoryName(),
                cat.getCategoryDescription(),
                cat.getImageUrl(),
                cat.getCategoryDisplayOrder(),
                cat.getStatus()
        );
    }
}
