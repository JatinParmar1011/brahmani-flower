package com.brahmaniflower.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for an admin reply to a contact enquiry.
 * Admin must supply an email subject, body, and the status
 * the enquiry should move to after sending the reply.
 */
public class ContactEnquiryReplyRequestDto {

    @NotBlank(message = "Email subject is required")
    @Size(max = 500, message = "Subject must not exceed 500 characters")
    private String emailSubject;

    @NotBlank(message = "Email body is required")
    @Size(min = 10, max = 10000, message = "Email body must be between 10 and 10000 characters")
    private String emailBody;

    /**
     * The status the enquiry should transition to after this reply is sent.
     * Must be a valid EnquiryStatus value (e.g. IN_PROGRESS, WAITING_FOR_CUSTOMER, RESOLVED).
     */
    @NotNull(message = "New status is required")
    private String newStatus;

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public String getEmailSubject() { return emailSubject; }
    public void setEmailSubject(String emailSubject) { this.emailSubject = emailSubject; }

    public String getEmailBody() { return emailBody; }
    public void setEmailBody(String emailBody) { this.emailBody = emailBody; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
}
