package com.brahmaniflower.repository;

import com.brahmaniflower.entity.HomepageMediaDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HomepageMediaDetailRepository extends JpaRepository<HomepageMediaDetail, Long> {
    List<HomepageMediaDetail> findAllByOrderBySectionAscDisplayOrderAscIdAsc();
    List<HomepageMediaDetail> findByStatusOrderBySectionAscDisplayOrderAscIdAsc(String status);
    List<HomepageMediaDetail> findBySectionOrderByDisplayOrderAscIdAsc(String section);
    long countBySection(String section);
}
