package com.brahmaniflower.dto.response;

import com.brahmaniflower.entity.ContactEnquiryReply;

import java.time.LocalDateTime;

/**
 * Response DTO for a single history event (reply or status change).
 */
public class ContactEnquiryReplyResponseDto {

    private Long          id;
    private String        eventType;      // REPLY | STATUS_CHANGE
    private Long          adminId;
    private String        adminName;
    private String        emailSubject;
    private String        emailBody;
    private String        statusBefore;
    private String        statusAfter;
    private LocalDateTime createdAt;

    // ── Factory ───────────────────────────────────────────────────────────────

    public static ContactEnquiryReplyResponseDto from(ContactEnquiryReply r) {
        ContactEnquiryReplyResponseDto dto = new ContactEnquiryReplyResponseDto();
        dto.id           = r.getId();
        dto.eventType    = r.getEventType() != null ? r.getEventType().name() : null;
        dto.adminName    = r.getAdminName();
        dto.emailSubject = r.getEmailSubject();
        dto.emailBody    = r.getEmailBody();
        dto.statusBefore = r.getStatusBefore();
        dto.statusAfter  = r.getStatusAfter();
        dto.createdAt    = r.getCreatedAt();
        if (r.getAdmin() != null) {
            dto.adminId   = r.getAdmin().getId();
            // prefer live name over snapshot if admin still exists
            dto.adminName = r.getAdmin().getName();
        }
        return dto;
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }

    public String getEmailSubject() { return emailSubject; }
    public void setEmailSubject(String emailSubject) { this.emailSubject = emailSubject; }

    public String getEmailBody() { return emailBody; }
    public void setEmailBody(String emailBody) { this.emailBody = emailBody; }

    public String getStatusBefore() { return statusBefore; }
    public void setStatusBefore(String statusBefore) { this.statusBefore = statusBefore; }

    public String getStatusAfter() { return statusAfter; }
    public void setStatusAfter(String statusAfter) { this.statusAfter = statusAfter; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
