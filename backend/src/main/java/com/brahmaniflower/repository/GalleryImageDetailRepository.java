package com.brahmaniflower.repository;

import com.brahmaniflower.entity.GalleryImageDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GalleryImageDetailRepository extends JpaRepository<GalleryImageDetail, Long> {
    List<GalleryImageDetail> findAllByOrderByDisplayOrderAscIdAsc();
    List<GalleryImageDetail> findByStatusOrderByDisplayOrderAscIdAsc(String status);
    List<GalleryImageDetail> findByCategoryIdOrderByDisplayOrderAscIdAsc(Long categoryId);
}
