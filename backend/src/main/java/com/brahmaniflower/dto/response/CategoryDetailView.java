package com.brahmaniflower.dto.response;

/**
 * Flat view of a category detail combined with its category type name.
 * Used by admin category endpoints.
 */
public class CategoryDetailView {

    private Long id;
    private Long categoryTypeId;
    private String categoryTypeName;
    private String categoryName;
    private String categoryDescription;
    private String imageUrl;
    private Integer categoryDisplayOrder;
    private String status;

    public CategoryDetailView() {}

    public CategoryDetailView(Long id, Long categoryTypeId, String categoryTypeName,
                              String categoryName, String categoryDescription,
                              String imageUrl, Integer categoryDisplayOrder, String status) {
        this.id = id;
        this.categoryTypeId = categoryTypeId;
        this.categoryTypeName = categoryTypeName;
        this.categoryName = categoryName;
        this.categoryDescription = categoryDescription;
        this.imageUrl = imageUrl;
        this.categoryDisplayOrder = categoryDisplayOrder;
        this.status = status;
    }

    public Long getId() { return id; }
    public Long getCategoryTypeId() { return categoryTypeId; }
    public String getCategoryTypeName() { return categoryTypeName; }
    public String getCategoryName() { return categoryName; }
    public String getCategoryDescription() { return categoryDescription; }
    public String getImageUrl() { return imageUrl; }
    public Integer getCategoryDisplayOrder() { return categoryDisplayOrder; }
    public String getStatus() { return status; }

    public void setId(Long id) { this.id = id; }
    public void setCategoryTypeId(Long categoryTypeId) { this.categoryTypeId = categoryTypeId; }
    public void setCategoryTypeName(String categoryTypeName) { this.categoryTypeName = categoryTypeName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public void setCategoryDescription(String categoryDescription) { this.categoryDescription = categoryDescription; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setCategoryDisplayOrder(Integer categoryDisplayOrder) { this.categoryDisplayOrder = categoryDisplayOrder; }
    public void setStatus(String status) { this.status = status; }
}
