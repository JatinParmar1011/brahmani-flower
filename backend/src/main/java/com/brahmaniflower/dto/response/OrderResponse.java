package com.brahmaniflower.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long id;
    private String orderNumber;
    private Long userId;
    private String userName;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private AddressInfo address;
    private List<StatusHistoryResponse> statusHistory;

    public OrderResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String v) { this.orderNumber = v; }

    public Long getUserId() { return userId; }
    public void setUserId(Long v) { this.userId = v; }

    public String getUserName() { return userName; }
    public void setUserName(String v) { this.userName = v; }

    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> v) { this.items = v; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal v) { this.totalAmount = v; }

    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }

    public AddressInfo getAddress() { return address; }
    public void setAddress(AddressInfo v) { this.address = v; }

    public List<StatusHistoryResponse> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<StatusHistoryResponse> v) { this.statusHistory = v; }

    // ── Builder ───────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final OrderResponse o = new OrderResponse();
        public Builder id(Long v)                              { o.id = v; return this; }
        public Builder orderNumber(String v)                   { o.orderNumber = v; return this; }
        public Builder userId(Long v)                          { o.userId = v; return this; }
        public Builder userName(String v)                      { o.userName = v; return this; }
        public Builder items(List<OrderItemResponse> v)        { o.items = v; return this; }
        public Builder totalAmount(BigDecimal v)               { o.totalAmount = v; return this; }
        public Builder status(String v)                        { o.status = v; return this; }
        public Builder createdAt(LocalDateTime v)              { o.createdAt = v; return this; }
        public Builder address(AddressInfo v)                  { o.address = v; return this; }
        public Builder statusHistory(List<StatusHistoryResponse> v) { o.statusHistory = v; return this; }
        public OrderResponse build() { return o; }
    }

    // ── Nested: AddressInfo ───────────────────────────────────────────────
    public static class AddressInfo {
        private Long id;
        private String fullName;
        private String mobileNumber;
        private String address1;
        private String address2;
        private String city;
        private String state;
        private String pincode;
        private String country;
        private String addressType;

        public AddressInfo() {}

        public Long getId() { return id; }
        public void setId(Long v) { this.id = v; }
        public String getFullName() { return fullName; }
        public void setFullName(String v) { this.fullName = v; }
        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String v) { this.mobileNumber = v; }
        public String getAddress1() { return address1; }
        public void setAddress1(String v) { this.address1 = v; }
        public String getAddress2() { return address2; }
        public void setAddress2(String v) { this.address2 = v; }
        public String getCity() { return city; }
        public void setCity(String v) { this.city = v; }
        public String getState() { return state; }
        public void setState(String v) { this.state = v; }
        public String getPincode() { return pincode; }
        public void setPincode(String v) { this.pincode = v; }
        public String getCountry() { return country; }
        public void setCountry(String v) { this.country = v; }
        public String getAddressType() { return addressType; }
        public void setAddressType(String v) { this.addressType = v; }
    }

    // ── Nested: OrderItemResponse ─────────────────────────────────────────
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal originalPrice;
        private BigDecimal subtotal;

        public OrderItemResponse() {}

        public Long getProductId() { return productId; }
        public void setProductId(Long v) { this.productId = v; }
        public String getProductName() { return productName; }
        public void setProductName(String v) { this.productName = v; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer v) { this.quantity = v; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal v) { this.unitPrice = v; }
        public BigDecimal getOriginalPrice() { return originalPrice; }
        public void setOriginalPrice(BigDecimal v) { this.originalPrice = v; }
        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal v) { this.subtotal = v; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final OrderItemResponse o = new OrderItemResponse();
            public Builder productId(Long v)           { o.productId = v; return this; }
            public Builder productName(String v)       { o.productName = v; return this; }
            public Builder quantity(Integer v)         { o.quantity = v; return this; }
            public Builder unitPrice(BigDecimal v)     { o.unitPrice = v; return this; }
            public Builder originalPrice(BigDecimal v) { o.originalPrice = v; return this; }
            public Builder subtotal(BigDecimal v)      { o.subtotal = v; return this; }
            public OrderItemResponse build() { return o; }
        }
    }

    // ── Nested: StatusHistoryResponse ─────────────────────────────────────
    public static class StatusHistoryResponse {
        private String fromStatus;
        private String toStatus;
        private String changedBy;
        private String reason;
        private LocalDateTime createdAt;

        public StatusHistoryResponse() {}

        public String getFromStatus() { return fromStatus; }
        public void setFromStatus(String v) { this.fromStatus = v; }
        public String getToStatus() { return toStatus; }
        public void setToStatus(String v) { this.toStatus = v; }
        public String getChangedBy() { return changedBy; }
        public void setChangedBy(String v) { this.changedBy = v; }
        public String getReason() { return reason; }
        public void setReason(String v) { this.reason = v; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    }
}
