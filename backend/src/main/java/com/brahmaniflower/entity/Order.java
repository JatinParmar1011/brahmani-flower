package com.brahmaniflower.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    public enum OrderStatus {
        PENDING_PAYMENT, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    }

    public static boolean isValidTransition(OrderStatus from, OrderStatus to) {
        return switch (from) {
            case PENDING_PAYMENT -> to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED;
            case CONFIRMED       -> to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING      -> to == OrderStatus.SHIPPED    || to == OrderStatus.CANCELLED;
            case SHIPPED         -> to == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 20)
    private String orderNumber;

    @Column(name = "idempotency_key", unique = true, length = 64)
    private String idempotencyKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private UserAddress address;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status = OrderStatus.CONFIRMED;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Order() {}

    public Long getId() { return id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String v) { this.orderNumber = v; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String v) { this.idempotencyKey = v; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public UserAddress getAddress() { return address; }
    public void setAddress(UserAddress address) { this.address = address; }

    public List<OrderItem> getItems() { return items; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
