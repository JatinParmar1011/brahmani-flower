package com.brahmaniflower.dto.response;

/**
 * Flat view of a gallery photo combined with its category name.
 * Used by the public "all photos" endpoint.
 */
public class GalleryImageView {

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Integer displayOrder;

    private Long categoryId;
    private String category;

    public GalleryImageView() {}

    public GalleryImageView(Long id, String name, String description, String imageUrl, Integer displayOrder,
                            Long categoryId, String category) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
        this.categoryId = categoryId;
        this.category = category;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public Integer getDisplayOrder() { return displayOrder; }
    public Long getCategoryId() { return categoryId; }
    public String getCategory() { return category; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setCategory(String category) { this.category = category; }
}
