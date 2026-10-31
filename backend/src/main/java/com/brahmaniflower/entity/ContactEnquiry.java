package com.brahmaniflower.entity;

import jakarta.persistence.*;
import com.brahmaniflower.util.NewlineEscapingConverter;

import java.time.LocalDateTime;

/**
 * Represents a customer contact / support enquiry.
 * customer_id is nullable — NULL means a guest enquiry.
 */
@Entity
@Table(
    name = "contact_enquiry",
    indexes = {
        @Index(name = "idx_ce_customer",  columnList = "customer_id"),
        @Index(name = "idx_ce_status",    columnList = "status"),
        @Index(name = "idx_ce_priority",  columnList = "priority"),
        @Index(name = "idx_ce_category",  columnList = "category"),
        @Index(name = "idx_ce_email",     columnList = "email"),
        @Index(name = "idx_ce_created",   columnList = "created_at")
    }
)
public class ContactEnquiry {

    // ── Enums ─────────────────────────────────────────────────────────────────

    public enum EnquiryStatus {
        NEW, IN_PROGRESS, WAITING_FOR_CUSTOMER, RESOLVED, CLOSED
    }

    public enum EnquiryPriority {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum EnquiryCategory {
        GENERAL_ENQUIRY,
        ORDER_ISSUE,
        DELIVERY_PROBLEM,
        PRODUCT_QUALITY,
        PAYMENT_RELATED,
        RETURN_REFUND_REQUEST,
        COMPLAINT,
        OTHER
    }

    // ── Fields ────────────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enquiry_number", nullable = false, unique = true, length = 30)
    private String enquiryNumber;

    /** Nullable — NULL means guest enquiry */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false, length = 255)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EnquiryCategory category = EnquiryCategory.GENERAL_ENQUIRY;

    @Convert(converter = NewlineEscapingConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EnquiryStatus status = EnquiryStatus.NEW;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EnquiryPriority priority = EnquiryPriority.MEDIUM;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Constructors ──────────────────────────────────────────────────────────

    public ContactEnquiry() {}

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEnquiryNumber() { return enquiryNumber; }
    public void setEnquiryNumber(String enquiryNumber) { this.enquiryNumber = enquiryNumber; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public EnquiryCategory getCategory() { return category; }
    public void setCategory(EnquiryCategory category) { this.category = category; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public EnquiryStatus getStatus() { return status; }
    public void setStatus(EnquiryStatus status) { this.status = status; }

    public EnquiryPriority getPriority() { return priority; }
    public void setPriority(EnquiryPriority priority) { this.priority = priority; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
