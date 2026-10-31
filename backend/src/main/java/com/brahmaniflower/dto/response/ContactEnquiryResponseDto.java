package com.brahmaniflower.dto.response;

import com.brahmaniflower.entity.ContactEnquiry;

import java.time.LocalDateTime;

/**
 * Response DTO for a contact enquiry.
 * Returned for both customer confirmation and admin management views.
 */
public class ContactEnquiryResponseDto {

    private Long   id;
    private String enquiryNumber;
    private Long   customerId;
    private String customerName;   // resolved from customer entity if present
    private String fullName;
    private String email;
    private String phone;
    private String subject;
    private String category;
    private String categoryLabel;  // human-readable label
    private String message;
    private String status;
    private String priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Factory ───────────────────────────────────────────────────────────────

    public static ContactEnquiryResponseDto from(ContactEnquiry e) {
        ContactEnquiryResponseDto dto = new ContactEnquiryResponseDto();
        dto.id             = e.getId();
        dto.enquiryNumber  = e.getEnquiryNumber();
        dto.fullName       = e.getFullName();
        dto.email          = e.getEmail();
        dto.phone          = e.getPhone();
        dto.subject        = e.getSubject();
        dto.category       = e.getCategory() != null ? e.getCategory().name() : null;
        dto.categoryLabel  = categoryLabel(e.getCategory());
        dto.message        = e.getMessage();
        dto.status         = e.getStatus()   != null ? e.getStatus().name()   : null;
        dto.priority       = e.getPriority() != null ? e.getPriority().name() : null;
        dto.createdAt      = e.getCreatedAt();
        dto.updatedAt      = e.getUpdatedAt();

        if (e.getCustomer() != null) {
            dto.customerId   = e.getCustomer().getId();
            dto.customerName = e.getCustomer().getName();
        }
        return dto;
    }

    private static String categoryLabel(ContactEnquiry.EnquiryCategory cat) {
        if (cat == null) return null;
        return switch (cat) {
            case GENERAL_ENQUIRY       -> "General Enquiry";
            case ORDER_ISSUE           -> "Order Issue";
            case DELIVERY_PROBLEM      -> "Delivery Problem";
            case PRODUCT_QUALITY       -> "Product Quality";
            case PAYMENT_RELATED       -> "Payment Related";
            case RETURN_REFUND_REQUEST -> "Return / Refund Request";
            case COMPLAINT             -> "Complaint";
            case OTHER                 -> "Other";
        };
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEnquiryNumber() { return enquiryNumber; }
    public void setEnquiryNumber(String enquiryNumber) { this.enquiryNumber = enquiryNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCategoryLabel() { return categoryLabel; }
    public void setCategoryLabel(String categoryLabel) { this.categoryLabel = categoryLabel; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
