package com.brahmaniflower.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "category_detail")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CategoryDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_type_id", nullable = false)
    @JsonIgnore
    private CategoryTypeMst categoryType;

    @Column(nullable = false)
    private String categoryName;

    private String categoryDescription;

    private String imageUrl;

    @Column(nullable = false)
    private Integer categoryDisplayOrder = 0;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public CategoryTypeMst getCategoryType() { return categoryType; }
    public String getCategoryName() { return categoryName; }
    public String getCategoryDescription() { return categoryDescription; }
    public String getImageUrl() { return imageUrl; }
    public Integer getCategoryDisplayOrder() { return categoryDisplayOrder; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
