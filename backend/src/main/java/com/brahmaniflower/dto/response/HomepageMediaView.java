package com.brahmaniflower.dto.response;

/**
 * Flat view of a homepage media item (image or video) used by the public
 * homepage endpoint and the admin management screen.
 */
public class HomepageMediaView {

    private Long id;
    private String section;
    private String title;
    private String mediaUrl;
    private Integer displayOrder;
    private String status;

    public HomepageMediaView() {}

    public HomepageMediaView(Long id, String section, String title,
                             String mediaUrl, Integer displayOrder, String status) {
        this.id = id;
        this.section = section;
        this.title = title;
        this.mediaUrl = mediaUrl;
        this.displayOrder = displayOrder;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getSection() { return section; }
    public String getTitle() { return title; }
    public String getMediaUrl() { return mediaUrl; }
    public Integer getDisplayOrder() { return displayOrder; }
    public String getStatus() { return status; }

    public void setId(Long id) { this.id = id; }
    public void setSection(String section) { this.section = section; }
    public void setTitle(String title) { this.title = title; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public void setStatus(String status) { this.status = status; }
}
