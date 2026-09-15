package com.brahmaniflower.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_detail")
public class ProductDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String contains;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer reviewCount = 0;

    private String tag;

    private String imageUrl;
    private String imageUrl2;
    private String imageUrl3;
    private String imageUrl4;
    private String imageUrl5;

    private String delivery = "Tomorrow";

    private String highlight1;
    private String highlight2;
    private String highlight3;
    private String highlight4;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public ProductDetail() {}

    public Long getId() { return id; }
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
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
