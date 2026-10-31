package com.brahmaniflower.controller;

import com.brahmaniflower.dto.request.ContactEnquiryReplyRequestDto;
import com.brahmaniflower.dto.request.ContactEnquiryRequestDto;
import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.ContactEnquiryReplyResponseDto;
import com.brahmaniflower.dto.response.ContactEnquiryResponseDto;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryCategory;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryPriority;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryStatus;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.service.ContactEnquiryService;
import com.brahmaniflower.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/**
 * REST controller for Contact Enquiry management.
 *
 * Customer (public + optionally authenticated):
 *   POST /api/contact-enquiries
 *
 * Admin only:
 *   GET    /api/admin/contact-enquiries
 *   GET    /api/admin/contact-enquiries/{id}
 *   PATCH  /api/admin/contact-enquiries/{id}/status
 *   PATCH  /api/admin/contact-enquiries/{id}/priority
 *   POST   /api/admin/contact-enquiries/{id}/reply
 *   GET    /api/admin/contact-enquiries/{id}/history
 */
@RestController
@RequiredArgsConstructor
public class ContactEnquiryController {

    private final ContactEnquiryService enquiryService;

    // ── CUSTOMER: submit enquiry (public — guest + authenticated) ─────────────

    @PostMapping("/api/contact-enquiries")
    public ResponseEntity<ApiResponse<ContactEnquiryResponseDto>> submitEnquiry(
            @Valid @RequestBody ContactEnquiryRequestDto request) {
        String principal = SecurityUtil.getCurrentUserEmail();
        ContactEnquiryResponseDto dto = enquiryService.submitEnquiry(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Your enquiry has been submitted. Reference: " + dto.getEnquiryNumber(), dto));
    }

    // ── ADMIN: list / filter / paginate enquiries ─────────────────────────────

    @GetMapping("/api/admin/contact-enquiries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ContactEnquiryResponseDto>>> getEnquiries(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        EnquiryStatus   statusEnum   = parseEnum(EnquiryStatus.class,   status,   "status");
        EnquiryCategory catEnum      = parseEnum(EnquiryCategory.class, category, "category");
        EnquiryPriority priorityEnum = parseEnum(EnquiryPriority.class, priority, "priority");
        LocalDateTime   fromDt       = from != null ? from.atStartOfDay()      : null;
        LocalDateTime   toDt         = to   != null ? to.atTime(LocalTime.MAX) : null;

        Page<ContactEnquiryResponseDto> page =
                enquiryService.getEnquiries(search, statusEnum, catEnum, priorityEnum, fromDt, toDt, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    // ── ADMIN: get single enquiry ─────────────────────────────────────────────

    @GetMapping("/api/admin/contact-enquiries/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ContactEnquiryResponseDto>> getEnquiry(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(enquiryService.getEnquiryById(id)));
    }

    // ── ADMIN: update status (transition-enforced) ────────────────────────────

    @PatchMapping("/api/admin/contact-enquiries/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ContactEnquiryResponseDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank())
            throw new BadRequestException("'status' field is required");

        EnquiryStatus newStatus = parseEnum(EnquiryStatus.class, statusStr, "status");
        if (newStatus == null) throw new BadRequestException("Invalid status: " + statusStr);

        String adminPrincipal = SecurityUtil.getCurrentUserEmail();
        ContactEnquiryResponseDto dto = enquiryService.updateStatus(id, newStatus, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + newStatus.name(), dto));
    }

    // ── ADMIN: update priority ────────────────────────────────────────────────

    @PatchMapping("/api/admin/contact-enquiries/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ContactEnquiryResponseDto>> updatePriority(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String priorityStr = body.get("priority");
        if (priorityStr == null || priorityStr.isBlank())
            throw new BadRequestException("'priority' field is required");

        EnquiryPriority newPriority = parseEnum(EnquiryPriority.class, priorityStr, "priority");
        if (newPriority == null) throw new BadRequestException("Invalid priority: " + priorityStr);

        ContactEnquiryResponseDto dto = enquiryService.updatePriority(id, newPriority);
        return ResponseEntity.ok(ApiResponse.success("Priority updated to " + newPriority.name(), dto));
    }

    // ── ADMIN: send reply email ───────────────────────────────────────────────

    @PostMapping("/api/admin/contact-enquiries/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ContactEnquiryResponseDto>> sendReply(
            @PathVariable Long id,
            @Valid @RequestBody ContactEnquiryReplyRequestDto request) {

        String adminPrincipal = SecurityUtil.getCurrentUserEmail();
        ContactEnquiryResponseDto dto = enquiryService.sendReply(id, request, adminPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Reply sent and enquiry updated.", dto));
    }

    // ── ADMIN: get history ────────────────────────────────────────────────────

    @GetMapping("/api/admin/contact-enquiries/{id}/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ContactEnquiryReplyResponseDto>>> getHistory(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(enquiryService.getHistory(id)));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, String fieldName) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid " + fieldName + ": " + value);
        }
    }
}
