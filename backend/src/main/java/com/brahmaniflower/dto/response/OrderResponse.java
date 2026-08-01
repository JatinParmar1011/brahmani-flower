package com.brahmaniflower.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long id;
    private Long userId;
    private String userName;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private String status;
    private String shippingAddress;
    private LocalDateTime createdAt;

    public OrderResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final OrderResponse obj = new OrderResponse();

        public Builder id(Long val) { obj.id = val; return this; }
        public Builder userId(Long val) { obj.userId = val; return this; }
        public Builder userName(String val) { obj.userName = val; return this; }
        public Builder items(List<OrderItemResponse> val) { obj.items = val; return this; }
        public Builder totalAmount(BigDecimal val) { obj.totalAmount = val; return this; }
        public Builder status(String val) { obj.status = val; return this; }
        public Builder shippingAddress(String val) { obj.shippingAddress = val; return this; }
        public Builder createdAt(LocalDateTime val) { obj.createdAt = val; return this; }
        public OrderResponse build() { return obj; }
    }

    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;

        public OrderItemResponse() {}

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private final OrderItemResponse obj = new OrderItemResponse();

            public Builder productId(Long val) { obj.productId = val; return this; }
            public Builder productName(String val) { obj.productName = val; return this; }
            public Builder quantity(Integer val) { obj.quantity = val; return this; }
            public Builder unitPrice(BigDecimal val) { obj.unitPrice = val; return this; }
            public Builder subtotal(BigDecimal val) { obj.subtotal = val; return this; }
            public OrderItemResponse build() { return obj; }
        }
    }
}
