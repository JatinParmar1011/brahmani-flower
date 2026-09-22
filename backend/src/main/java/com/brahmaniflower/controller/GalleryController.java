package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.GalleryImageView;
import com.brahmaniflower.entity.GalleryCategoryMst;
import com.brahmaniflower.entity.GalleryImageDetail;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.GalleryCategoryMstRepository;
import com.brahmaniflower.repository.GalleryImageDetailRepository;
import com.brahmaniflower.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryCategoryMstRepository categoryRepo;
    private final GalleryImageDetailRepository imageRepo;
    private final CloudinaryService cloudinaryService;

    // ── Public ──────────────────────────────────────────────────────────────

    /** All ACTIVE photos, grouped by category display order, then photo display order. */
    @GetMapping("/api/gallery")
    public ResponseEntity<ApiResponse<List<GalleryImageView>>> getAllPhotos() {
        List<GalleryImageView> views = imageRepo.findByStatusOrderByDisplayOrderAscIdAsc("ACTIVE").stream()
                .filter(img -> {
                    GalleryCategoryMst cat = img.getCategory();
                    return cat != null && "ACTIVE".equals(cat.getStatus());
                })
                // Sort so all photos of one category appear together, ordered by the
                // category's display order first, then each photo's own display order.
                .sorted(Comparator
                        .comparingInt((GalleryImageDetail img) ->
                                img.getCategory().getDisplayOrder() != null ? img.getCategory().getDisplayOrder() : 0)
                        .thenComparing(img -> img.getCategory().getId())
                        .thenComparingInt(img -> img.getDisplayOrder() != null ? img.getDisplayOrder() : 0)
                        .thenComparing(GalleryImageDetail::getId))
                .map(this::toView)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(views));
    }

    /** All ACTIVE categories. */
    @GetMapping("/api/gallery/categories")
    public ResponseEntity<ApiResponse<List<GalleryCategoryMst>>> getActiveCategories() {
        return ResponseEntity.ok(ApiResponse.success(
                categoryRepo.findByStatusOrderByDisplayOrderAscIdAsc("ACTIVE")));
    }

    // ── Admin : Category CRUD ─────────────────────────────────────────────────

    @GetMapping("/api/admin/gallery/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<GalleryCategoryMst>>> adminGetCategories() {
        return ResponseEntity.ok(ApiResponse.success(
                categoryRepo.findAllByOrderByDisplayOrderAscIdAsc()));
    }

    @PostMapping("/api/admin/gallery/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GalleryCategoryMst>> createCategory(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(required = false) String status) {

        if (categoryRepo.existsByNameIgnoreCase(name.trim())) {
            throw new BadRequestException("A category with this name already exists");
        }

        GalleryCategoryMst cat = new GalleryCategoryMst();
        cat.setName(name.trim());
        cat.setDescription(description);
        cat.setDisplayOrder(displayOrder);
        if (status != null && !status.isBlank()) cat.setStatus(status);

        return ResponseEntity.ok(ApiResponse.success(categoryRepo.save(cat)));
    }

    @PutMapping("/api/admin/gallery/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GalleryCategoryMst>> updateCategory(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(required = false) String status) {

        GalleryCategoryMst cat = categoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery category not found"));

        String trimmed = name.trim();
        if (!trimmed.equalsIgnoreCase(cat.getName()) && categoryRepo.existsByNameIgnoreCase(trimmed)) {
            throw new BadRequestException("A category with this name already exists");
        }

        cat.setName(trimmed);
        cat.setDescription(description);
        cat.setDisplayOrder(displayOrder);
        if (status != null && !status.isBlank()) cat.setStatus(status);

        return ResponseEntity.ok(ApiResponse.success(categoryRepo.save(cat)));
    }

    @DeleteMapping("/api/admin/gallery/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        GalleryCategoryMst cat = categoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery category not found"));

        // Remove Cloudinary images of all photos in this category before deleting.
        for (GalleryImageDetail img : imageRepo.findByCategoryIdOrderByDisplayOrderAscIdAsc(id)) {
            if (img.getImageUrl() != null) cloudinaryService.deleteImage(img.getImageUrl());
        }
        categoryRepo.delete(cat); // gallery_image_detail rows removed via ON DELETE CASCADE
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ── Admin : Photos ────────────────────────────────────────────────────────

    @GetMapping("/api/admin/gallery/photos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<GalleryImageView>>> adminGetPhotos() {
        List<GalleryImageView> views = imageRepo.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(this::toView)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(views));
    }

    /** Upload a photo: name, description, image file, and target category. */
    @PostMapping("/api/admin/gallery/photos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GalleryImageView>> createPhoto(
            @RequestParam Long categoryId,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam MultipartFile image) {

        GalleryCategoryMst cat = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery category not found"));

        if (image == null || image.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }

        GalleryImageDetail img = new GalleryImageDetail();
        img.setCategory(cat);
        img.setName(name);
        img.setDescription(description);
        img.setDisplayOrder(displayOrder);
        img.setImageUrl(cloudinaryService.uploadGalleryImage(image));

        return ResponseEntity.ok(ApiResponse.success(toView(imageRepo.save(img))));
    }

    /** Update a photo: name, description, category, and optionally a new image. */
    @PutMapping("/api/admin/gallery/photos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GalleryImageView>> updatePhoto(
            @PathVariable Long id,
            @RequestParam Long categoryId,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(required = false) MultipartFile image) {

        GalleryImageDetail img = imageRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery photo not found"));

        GalleryCategoryMst cat = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery category not found"));

        img.setCategory(cat);
        img.setName(name);
        img.setDescription(description);
        img.setDisplayOrder(displayOrder);

        // Replace image only if a new one is provided.
        if (image != null && !image.isEmpty()) {
            if (img.getImageUrl() != null) cloudinaryService.deleteImage(img.getImageUrl());
            img.setImageUrl(cloudinaryService.uploadGalleryImage(image));
        }

        return ResponseEntity.ok(ApiResponse.success(toView(imageRepo.save(img))));
    }

    @DeleteMapping("/api/admin/gallery/photos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(@PathVariable Long id) {
        GalleryImageDetail img = imageRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery photo not found"));
        if (img.getImageUrl() != null) cloudinaryService.deleteImage(img.getImageUrl());
        imageRepo.delete(img);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private GalleryImageView toView(GalleryImageDetail img) {
        GalleryCategoryMst cat = img.getCategory();
        return new GalleryImageView(
                img.getId(),
                img.getName(),
                img.getDescription(),
                img.getImageUrl(),
                img.getDisplayOrder(),
                cat != null ? cat.getId() : null,
                cat != null ? cat.getName() : null
        );
    }
}
