package com.brahmaniflower.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private String contains;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer stock;
    private BigDecimal rating;
    private Integer reviewCount;
    private String tag;
    private String imageUrl;
    private String imageUrl2;
    private String imageUrl3;
    private String imageUrl4;
    private String imageUrl5;
    private String delivery;
    private String highlight1;
    private String highlight2;
    private String highlight3;
    private String highlight4;
    private Boolean available;
    private LocalDateTime createdAt;
    private List<Long> categoryIds;

    public ProductResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContains() { return contains; }
    public void setContains(String contains) { this.contains = contains; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getImageUrl2() { return imageUrl2; }
    public void setImageUrl2(String imageUrl2) { this.imageUrl2 = imageUrl2; }
    public String getImageUrl3() { return imageUrl3; }
    public void setImageUrl3(String imageUrl3) { this.imageUrl3 = imageUrl3; }
    public String getImageUrl4() { return imageUrl4; }
    public void setImageUrl4(String imageUrl4) { this.imageUrl4 = imageUrl4; }
    public String getImageUrl5() { return imageUrl5; }
    public void setImageUrl5(String imageUrl5) { this.imageUrl5 = imageUrl5; }
    public String getDelivery() { return delivery; }
    public void setDelivery(String delivery) { this.delivery = delivery; }
    public String getHighlight1() { return highlight1; }
    public void setHighlight1(String highlight1) { this.highlight1 = highlight1; }
    public String getHighlight2() { return highlight2; }
    public void setHighlight2(String highlight2) { this.highlight2 = highlight2; }
    public String getHighlight3() { return highlight3; }
    public void setHighlight3(String highlight3) { this.highlight3 = highlight3; }
    public String getHighlight4() { return highlight4; }
    public void setHighlight4(String highlight4) { this.highlight4 = highlight4; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<Long> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<Long> categoryIds) { this.categoryIds = categoryIds; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ProductResponse o = new ProductResponse();
        public Builder id(Long v) { o.id = v; return this; }
        public Builder name(String v) { o.name = v; return this; }
        public Builder description(String v) { o.description = v; return this; }
        public Builder contains(String v) { o.contains = v; return this; }
        public Builder price(BigDecimal v) { o.price = v; return this; }
        public Builder originalPrice(BigDecimal v) { o.originalPrice = v; return this; }
        public Builder stock(Integer v) { o.stock = v; return this; }
        public Builder rating(BigDecimal v) { o.rating = v; return this; }
        public Builder reviewCount(Integer v) { o.reviewCount = v; return this; }
        public Builder tag(String v) { o.tag = v; return this; }
        public Builder imageUrl(String v) { o.imageUrl = v; return this; }
        public Builder imageUrl2(String v) { o.imageUrl2 = v; return this; }
        public Builder imageUrl3(String v) { o.imageUrl3 = v; return this; }
        public Builder imageUrl4(String v) { o.imageUrl4 = v; return this; }
        public Builder imageUrl5(String v) { o.imageUrl5 = v; return this; }
        public Builder delivery(String v) { o.delivery = v; return this; }
        public Builder highlight1(String v) { o.highlight1 = v; return this; }
        public Builder highlight2(String v) { o.highlight2 = v; return this; }
        public Builder highlight3(String v) { o.highlight3 = v; return this; }
        public Builder highlight4(String v) { o.highlight4 = v; return this; }
        public Builder available(Boolean v) { o.available = v; return this; }
        public Builder createdAt(java.time.LocalDateTime v) { o.createdAt = v; return this; }
        public Builder categoryIds(List<Long> v) { o.categoryIds = v; return this; }
        public ProductResponse build() { return o; }
    }
}
