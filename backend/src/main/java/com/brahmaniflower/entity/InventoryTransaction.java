package com.brahmaniflower.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {

    public enum TransactionType {
        RESTOCK, SALE, RETURN, DAMAGE, ADJUSTMENT, CANCELLATION
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductDetail product;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange;

    @Column(name = "stock_before", nullable = false)
    private Integer stockBefore;

    @Column(name = "stock_after", nullable = false)
    private Integer stockAfter;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 30)
    private String referenceType;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    public InventoryTransaction() {}

    public Long getId() { return id; }

    public ProductDetail getProduct() { return product; }
    public void setProduct(ProductDetail product) { this.product = product; }

    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }

    public Integer getQuantityChange() { return quantityChange; }
    public void setQuantityChange(Integer quantityChange) { this.quantityChange = quantityChange; }

    public Integer getStockBefore() { return stockBefore; }
    public void setStockBefore(Integer stockBefore) { this.stockBefore = stockBefore; }

    public Integer getStockAfter() { return stockAfter; }
    public void setStockAfter(Integer stockAfter) { this.stockAfter = stockAfter; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
