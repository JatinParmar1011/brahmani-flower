package com.brahmaniflower.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for admin moderation actions: REJECT, HIDE, APPROVE/RESTORE.
 */
public class ModerationRequestDto {

    public enum ModerationAction {
        REJECT, HIDE, APPROVE
    }

    @NotNull(message = "action is required")
    private ModerationAction action;

    @Size(max = 500, message = "reason must not exceed 500 characters")
    private String reason;

    public ModerationAction getAction() { return action; }
    public void setAction(ModerationAction action) { this.action = action; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
