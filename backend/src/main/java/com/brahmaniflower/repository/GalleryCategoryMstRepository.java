package com.brahmaniflower.repository;

import com.brahmaniflower.entity.GalleryCategoryMst;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GalleryCategoryMstRepository extends JpaRepository<GalleryCategoryMst, Long> {
    List<GalleryCategoryMst> findAllByOrderByDisplayOrderAscIdAsc();
    List<GalleryCategoryMst> findByStatusOrderByDisplayOrderAscIdAsc(String status);
    boolean existsByNameIgnoreCase(String name);
}
