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
        PENDING_PAYMENT, CONFIRMED, PROCESSING, READY_TO_SHIP, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    }

    public static boolean isValidTransition(OrderStatus from, OrderStatus to) {
        return switch (from) {
            case PENDING_PAYMENT -> to == OrderStatus.CONFIRMED  || to == OrderStatus.CANCELLED;
            case CONFIRMED       -> to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING      -> to == OrderStatus.READY_TO_SHIP || to == OrderStatus.SHIPPED || to == OrderStatus.CANCELLED;
            case READY_TO_SHIP   -> to == OrderStatus.SHIPPED    || to == OrderStatus.CANCELLED;
            case SHIPPED         -> to == OrderStatus.OUT_FOR_DELIVERY || to == OrderStatus.CANCELLED;
            case OUT_FOR_DELIVERY -> to == OrderStatus.DELIVERED || to == OrderStatus.CANCELLED;
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

    /** Shipping charge as calculated at order time. Historical orders preserve the original charge. */
    @Column(name = "shipping_charge", precision = 10, scale = 2)
    private BigDecimal shippingCharge = BigDecimal.ZERO;

    // ── Shipment dimensions — snapshotted from product configs at order creation ──
    // These are used when creating the Shiprocket shipment, so dimensions are
    // preserved even if the product config changes later.

    /** Total shipment weight in kg (sum of all items × quantity × unit weight). */
    @Column(name = "shipment_weight_kg", precision = 7, scale = 3)
    private BigDecimal shipmentWeightKg = new BigDecimal("0.500");

    /** Package longest side in cm. */
    @Column(name = "shipment_length_cm", precision = 6, scale = 1)
    private BigDecimal shipmentLengthCm = new BigDecimal("10.0");

    /** Package breadth in cm. */
    @Column(name = "shipment_breadth_cm", precision = 6, scale = 1)
    private BigDecimal shipmentBreadthCm = new BigDecimal("10.0");

    /** Package height in cm. */
    @Column(name = "shipment_height_cm", precision = 6, scale = 1)
    private BigDecimal shipmentHeightCm = new BigDecimal("10.0");

    // ── Address snapshot — preserved even if the address record is later modified/deleted ──
    @Column(name = "snap_full_name",     length = 150)
    private String snapFullName;

    @Column(name = "snap_mobile",        length = 15)
    private String snapMobile;

    @Column(name = "snap_address1",      length = 255)
    private String snapAddress1;

    @Column(name = "snap_address2",      length = 255)
    private String snapAddress2;

    @Column(name = "snap_city",          length = 100)
    private String snapCity;

    @Column(name = "snap_state",         length = 100)
    private String snapState;

    @Column(name = "snap_pincode",       length = 10)
    private String snapPincode;

    @Column(name = "snap_country",       length = 100)
    private String snapCountry;

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

    public BigDecimal getShippingCharge() { return shippingCharge; }
    public void setShippingCharge(BigDecimal shippingCharge) { this.shippingCharge = shippingCharge; }

    public BigDecimal getShipmentWeightKg()  { return shipmentWeightKg; }
    public void setShipmentWeightKg(BigDecimal v)  { this.shipmentWeightKg = v; }

    public BigDecimal getShipmentLengthCm()  { return shipmentLengthCm; }
    public void setShipmentLengthCm(BigDecimal v)  { this.shipmentLengthCm = v; }

    public BigDecimal getShipmentBreadthCm() { return shipmentBreadthCm; }
    public void setShipmentBreadthCm(BigDecimal v) { this.shipmentBreadthCm = v; }

    public BigDecimal getShipmentHeightCm()  { return shipmentHeightCm; }
    public void setShipmentHeightCm(BigDecimal v)  { this.shipmentHeightCm = v; }

    public String getSnapFullName() { return snapFullName; }
    public void setSnapFullName(String v) { this.snapFullName = v; }

    public String getSnapMobile() { return snapMobile; }
    public void setSnapMobile(String v) { this.snapMobile = v; }

    public String getSnapAddress1() { return snapAddress1; }
    public void setSnapAddress1(String v) { this.snapAddress1 = v; }

    public String getSnapAddress2() { return snapAddress2; }
    public void setSnapAddress2(String v) { this.snapAddress2 = v; }

    public String getSnapCity() { return snapCity; }
    public void setSnapCity(String v) { this.snapCity = v; }

    public String getSnapState() { return snapState; }
    public void setSnapState(String v) { this.snapState = v; }

    public String getSnapPincode() { return snapPincode; }
    public void setSnapPincode(String v) { this.snapPincode = v; }

    public String getSnapCountry() { return snapCountry; }
    public void setSnapCountry(String v) { this.snapCountry = v; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
