package com.brahmaniflower.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "category_type_mst")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CategoryTypeMst {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String categoryTypeName;

    private String categoryTypeDescription;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "categoryType", fetch = FetchType.LAZY)
    @OrderBy("categoryDisplayOrder ASC")
    @JsonIgnore
    private List<CategoryDetail> categories;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public String getCategoryTypeName() { return categoryTypeName; }
    public String getCategoryTypeDescription() { return categoryTypeDescription; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<CategoryDetail> getCategories() { return categories; }
}
