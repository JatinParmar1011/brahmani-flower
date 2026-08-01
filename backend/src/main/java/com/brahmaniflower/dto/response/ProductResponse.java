package com.brahmaniflower.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private String category;
    private boolean available;
    private LocalDateTime createdAt;

    public ProductResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ProductResponse obj = new ProductResponse();

        public Builder id(Long val) { obj.id = val; return this; }
        public Builder name(String val) { obj.name = val; return this; }
        public Builder description(String val) { obj.description = val; return this; }
        public Builder price(BigDecimal val) { obj.price = val; return this; }
        public Builder stock(Integer val) { obj.stock = val; return this; }
        public Builder imageUrl(String val) { obj.imageUrl = val; return this; }
        public Builder category(String val) { obj.category = val; return this; }
        public Builder available(boolean val) { obj.available = val; return this; }
        public Builder createdAt(LocalDateTime val) { obj.createdAt = val; return this; }
        public ProductResponse build() { return obj; }
    }
}
