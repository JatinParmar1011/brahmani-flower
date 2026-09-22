package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.HomepageMediaView;
import com.brahmaniflower.entity.HomepageMediaDetail;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.HomepageMediaDetailRepository;
import com.brahmaniflower.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequiredArgsConstructor
public class HomepageMediaController {

    /** Fixed set of homepage sections the admin can manage. */
    private static final Set<String> SECTIONS = Set.of("SLIDER", "CITY_DELIVERY", "ADVERTISE", "SPOTLIGHT");

    /** Section whose media is a video (stored in the same media_url column). */
    private static final String VIDEO_SECTION = "SPOTLIGHT";

    /**
     * Maximum number of media items each section can hold. Sections not listed
     * here default to a single item (banner-style sections).
     */
    private static final Map<String, Integer> SECTION_LIMITS = Map.of(
            "SLIDER", 5,
            "SPOTLIGHT", 8
    );
    private static final int DEFAULT_SECTION_LIMIT = 1;

    private static int limitFor(String section) {
        return SECTION_LIMITS.getOrDefault(section, DEFAULT_SECTION_LIMIT);
    }

    private final HomepageMediaDetailRepository mediaRepo;
    private final CloudinaryService cloudinaryService;

    // ── Public ──────────────────────────────────────────────────────────────

    /** All ACTIVE homepage media, grouped by section then display order. */
    @GetMapping("/api/homepage-media")
    public ResponseEntity<ApiResponse<List<HomepageMediaView>>> getActiveMedia() {
        List<HomepageMediaView> views = mediaRepo
                .findByStatusOrderBySectionAscDisplayOrderAscIdAsc("ACTIVE").stream()
                .map(this::toView)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(views));
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    @GetMapping("/api/admin/homepage-media")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<HomepageMediaView>>> adminGetMedia() {
        List<HomepageMediaView> views = mediaRepo
                .findAllByOrderBySectionAscDisplayOrderAscIdAsc().stream()
                .map(this::toView)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(views));
    }

    @PostMapping("/api/admin/homepage-media")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HomepageMediaView>> createMedia(
            @RequestParam String section,
            @RequestParam(required = false) String title,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(required = false) String status,
            @RequestParam MultipartFile file) {

        String normalizedSection = normalizeSection(section);

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Media file is required");
        }

        HomepageMediaDetail media = new HomepageMediaDetail();
        media.setSection(normalizedSection);
        media.setTitle(title);
        media.setDisplayOrder(displayOrder);
        if (status != null && !status.isBlank()) media.setStatus(status);
        media.setMediaUrl(uploadMedia(normalizedSection, file));

        // Enforce the per-section slot limit so a section can never exceed its
        // fixed number of media items (e.g. the SLIDER can hold at most 5).
        if (mediaRepo.countBySection(normalizedSection) >= limitFor(normalizedSection)) {
            throw new BadRequestException(
                    "Section " + normalizedSection + " already has the maximum of "
                            + limitFor(normalizedSection) + " item(s).");
        }

        HomepageMediaView view = toView(mediaRepo.save(media));
        reorderSection(normalizedSection);
        return ResponseEntity.ok(ApiResponse.success(view));
    }

    @PutMapping("/api/admin/homepage-media/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HomepageMediaView>> updateMedia(
            @PathVariable Long id,
            @RequestParam String section,
            @RequestParam(required = false) String title,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) MultipartFile file) {

        HomepageMediaDetail media = mediaRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homepage media not found"));

        String normalizedSection = normalizeSection(section);
        media.setSection(normalizedSection);
        media.setTitle(title);
        media.setDisplayOrder(displayOrder);
        if (status != null && !status.isBlank()) media.setStatus(status);

        // Replace media only if a new file is provided.
        if (file != null && !file.isEmpty()) {
            if (media.getMediaUrl() != null) deleteMedia(normalizedSection, media.getMediaUrl());
            media.setMediaUrl(uploadMedia(normalizedSection, file));
        }

        HomepageMediaView view = toView(mediaRepo.save(media));
        reorderSection(normalizedSection);
        return ResponseEntity.ok(ApiResponse.success(view));
    }

    @DeleteMapping("/api/admin/homepage-media/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable Long id) {
        HomepageMediaDetail media = mediaRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homepage media not found"));
        if (media.getMediaUrl() != null) deleteMedia(media.getSection(), media.getMediaUrl());
        String section = media.getSection();
        mediaRepo.delete(media);
        // Close the gap left by the removed item so display order stays 1..N.
        reorderSection(section);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Normalize the display order of a section to a contiguous 1..N sequence,
     * preserving the existing relative order (by displayOrder, then id). This
     * removes gaps and duplicate order values left behind by create/update/delete
     * so both the admin slots and the public slider render in a stable, correct order.
     */
    private void reorderSection(String section) {
        List<HomepageMediaDetail> items = mediaRepo.findBySectionOrderByDisplayOrderAscIdAsc(section);
        int order = 1;
        boolean changed = false;
        for (HomepageMediaDetail item : items) {
            if (item.getDisplayOrder() == null || item.getDisplayOrder() != order) {
                item.setDisplayOrder(order);
                changed = true;
            }
            order++;
        }
        if (changed) mediaRepo.saveAll(items);
    }

    /** Upload the file as a video for the SPOTLIGHT section, otherwise as an image. */
    private String uploadMedia(String section, MultipartFile file) {
        return VIDEO_SECTION.equals(section)
                ? cloudinaryService.uploadHomepageVideo(file)
                : cloudinaryService.uploadHomepageImage(file);
    }

    /** Delete the stored media as a video for the SPOTLIGHT section, otherwise as an image. */
    private void deleteMedia(String section, String url) {
        if (VIDEO_SECTION.equals(section)) {
            cloudinaryService.deleteVideo(url);
        } else {
            cloudinaryService.deleteImage(url);
        }
    }

    private String normalizeSection(String section) {
        if (section == null) throw new BadRequestException("Section is required");
        String normalized = section.trim().toUpperCase();
        if (!SECTIONS.contains(normalized)) {
            throw new BadRequestException("Invalid section. Allowed: " + SECTIONS);
        }
        return normalized;
    }

    private HomepageMediaView toView(HomepageMediaDetail media) {
        return new HomepageMediaView(
                media.getId(),
                media.getSection(),
                media.getTitle(),
                media.getMediaUrl(),
                media.getDisplayOrder(),
                media.getStatus()
        );
    }
}
