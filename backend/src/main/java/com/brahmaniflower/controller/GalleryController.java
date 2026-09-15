package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.entity.GalleryItem;
import com.brahmaniflower.repository.GalleryItemRepository;
import com.brahmaniflower.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryItemRepository galleryRepo;
    private final CloudinaryService cloudinaryService;

    // ── Public ──────────────────────────────────────────────────────────────

    @GetMapping("/api/gallery")
    public ResponseEntity<ApiResponse<List<GalleryItem>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(
                galleryRepo.findByStatusOrderByDisplayOrderAsc("ACTIVE")));
    }

    // ── Admin ───────────────────────────────────────────────────────────────

    @GetMapping("/api/admin/gallery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<GalleryItem>>> adminGetAll() {
        return ResponseEntity.ok(ApiResponse.success(
                galleryRepo.findAll()));
    }

    @PostMapping("/api/admin/gallery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GalleryItem>> create(
            @RequestParam String name,
            @RequestParam String category,
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(required = false) MultipartFile image) {

        GalleryItem item = new GalleryItem();
        item.setName(name);
        item.setCategory(category);
        item.setDescription(description);
        item.setDisplayOrder(displayOrder);

        if (image != null && !image.isEmpty()) {
            item.setImageUrl(cloudinaryService.uploadGalleryImage(image));
        }

        return ResponseEntity.ok(ApiResponse.success(galleryRepo.save(item)));
    }

    @PutMapping("/api/admin/gallery/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GalleryItem>> update(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String category,
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) MultipartFile image) {

        GalleryItem item = galleryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Gallery item not found"));

        item.setName(name);
        item.setCategory(category);
        item.setDescription(description);
        item.setDisplayOrder(displayOrder);
        if (status != null) item.setStatus(status);

        if (image != null && !image.isEmpty()) {
            if (item.getImageUrl() != null) cloudinaryService.deleteImage(item.getImageUrl());
            item.setImageUrl(cloudinaryService.uploadGalleryImage(image));
        }

        return ResponseEntity.ok(ApiResponse.success(galleryRepo.save(item)));
    }

    @DeleteMapping("/api/admin/gallery/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        GalleryItem item = galleryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Gallery item not found"));
        if (item.getImageUrl() != null) cloudinaryService.deleteImage(item.getImageUrl());
        galleryRepo.delete(item);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
