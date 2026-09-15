package com.brahmaniflower.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CartResponse {

    private Long cartId;
    private int itemCount;          // distinct products — used for cart badge
    private BigDecimal totalAmount;
    private List<CartItemResponse> items;

    public CartResponse() {}

    public Long getCartId() { return cartId; }
    public void setCartId(Long cartId) { this.cartId = cartId; }

    public int getItemCount() { return itemCount; }
    public void setItemCount(int itemCount) { this.itemCount = itemCount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CartItemResponse {
        private Long cartItemId;
        private Long productId;
        private String productName;
        private String imageUrl;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private boolean stockWarning;   // true when quantity was capped to available stock
        private Integer availableStock; // current stock at time of getCart

        public CartItemResponse() {}

        public Long getCartItemId() { return cartItemId; }
        public void setCartItemId(Long cartItemId) { this.cartItemId = cartItemId; }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public BigDecimal getOriginalPrice() { return originalPrice; }
        public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

        public boolean isStockWarning() { return stockWarning; }
        public void setStockWarning(boolean stockWarning) { this.stockWarning = stockWarning; }

        public Integer getAvailableStock() { return availableStock; }
        public void setAvailableStock(Integer availableStock) { this.availableStock = availableStock; }
    }
}
