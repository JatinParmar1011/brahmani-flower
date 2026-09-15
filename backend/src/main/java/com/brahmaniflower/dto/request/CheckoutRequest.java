package com.brahmaniflower.dto.request;

import jakarta.validation.constraints.NotNull;

public class CheckoutRequest {

    @NotNull(message = "Address ID is required")
    private Long addressId;

    // Idempotency key supplied by frontend to prevent duplicate orders on retry
    private String idempotencyKey;

    public Long getAddressId() { return addressId; }
    public void setAddressId(Long addressId) { this.addressId = addressId; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}
