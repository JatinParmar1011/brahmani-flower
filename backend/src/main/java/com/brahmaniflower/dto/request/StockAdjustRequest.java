package com.brahmaniflower.dto.request;

import jakarta.validation.constraints.NotNull;

public class StockAdjustRequest {

    @NotNull(message = "Transaction type is required")
    private String transactionType; // RESTOCK | ADJUSTMENT | DAMAGE | RETURN

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    private String notes;

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
