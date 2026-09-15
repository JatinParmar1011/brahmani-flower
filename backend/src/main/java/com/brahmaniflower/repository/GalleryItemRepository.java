package com.brahmaniflower.repository;

import com.brahmaniflower.entity.GalleryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GalleryItemRepository extends JpaRepository<GalleryItem, Long> {
    List<GalleryItem> findByStatusOrderByDisplayOrderAsc(String status);
    List<GalleryItem> findByCategoryAndStatusOrderByDisplayOrderAsc(String category, String status);
}
