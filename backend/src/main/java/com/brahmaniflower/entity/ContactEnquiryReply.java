package com.brahmaniflower.entity;

import jakarta.persistence.*;
import com.brahmaniflower.util.NewlineEscapingConverter;

import java.time.LocalDateTime;

/**
 * Audit / history record for a ContactEnquiry.
 *
 * event_type = REPLY         → admin sent an email reply to the customer
 * event_type = STATUS_CHANGE → admin changed the enquiry status
 */
@Entity
@Table(
    name = "contact_enquiry_reply",
    indexes = {
        @Index(name = "idx_cer_enquiry", columnList = "enquiry_id"),
        @Index(name = "idx_cer_type",    columnList = "event_type"),
        @Index(name = "idx_cer_created", columnList = "created_at")
    }
)
public class ContactEnquiryReply {

    public enum EventType { REPLY, STATUS_CHANGE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enquiry_id", nullable = false)
    private ContactEnquiry enquiry;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 20)
    private EventType eventType = EventType.REPLY;

    /** Nullable — FK to users, set to NULL if admin account is deleted */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    /** Snapshot of admin name at the time of the event */
    @Column(name = "admin_name", length = 255)
    private String adminName;

    // ── REPLY fields ──────────────────────────────────────────────────────────

    @Column(name = "email_subject", length = 500)
    private String emailSubject;

    @Convert(converter = NewlineEscapingConverter.class)
    @Column(name = "email_body", columnDefinition = "TEXT")
    private String emailBody;

    // ── STATUS_CHANGE fields ──────────────────────────────────────────────────

    @Column(name = "status_before", length = 30)
    private String statusBefore;

    @Column(name = "status_after", length = 30)
    private String statusAfter;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    // ── Constructors ──────────────────────────────────────────────────────────

    public ContactEnquiryReply() {}

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ContactEnquiry getEnquiry() { return enquiry; }
    public void setEnquiry(ContactEnquiry enquiry) { this.enquiry = enquiry; }

    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }

    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }

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
