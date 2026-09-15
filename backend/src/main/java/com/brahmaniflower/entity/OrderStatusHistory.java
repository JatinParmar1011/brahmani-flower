package com.brahmaniflower.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_status_history")
public class OrderStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 30)
    private Order.OrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 30)
    private Order.OrderStatus toStatus;

    @Column(name = "changed_by", length = 255)
    private String changedBy;

    @Column(length = 500)
    private String reason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    public OrderStatusHistory() {}

    public OrderStatusHistory(Order order, Order.OrderStatus from, Order.OrderStatus to, String changedBy, String reason) {
        this.order = order;
        this.fromStatus = from;
        this.toStatus = to;
        this.changedBy = changedBy;
        this.reason = reason;
    }

    public Long getId() { return id; }
    public Order getOrder() { return order; }
    public Order.OrderStatus getFromStatus() { return fromStatus; }
    public Order.OrderStatus getToStatus() { return toStatus; }
    public String getChangedBy() { return changedBy; }
    public String getReason() { return reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
