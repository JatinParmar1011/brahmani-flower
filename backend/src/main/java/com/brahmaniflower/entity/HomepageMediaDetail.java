package com.brahmaniflower.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * A single media item (image or video) belonging to a fixed homepage section.
 * section values: SLIDER (hero slider), CITY_DELIVERY (city delivery banner),
 * ADVERTISE (promo / advertise banner), SPOTLIGHT (spotlight videos).
 */
@Entity
@Table(name = "homepage_media_detail")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HomepageMediaDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String section;

    private String title;

    @Column(nullable = false)
    private String mediaUrl;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); this.updatedAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public String getSection() { return section; }
    public String getTitle() { return title; }
    public String getMediaUrl() { return mediaUrl; }
    public Integer getDisplayOrder() { return displayOrder; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setSection(String section) { this.section = section; }
    public void setTitle(String title) { this.title = title; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public void setStatus(String status) { this.status = status; }
}
