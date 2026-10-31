package com.brahmaniflower.repository;

import com.brahmaniflower.entity.ContactEnquiry;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryCategory;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryPriority;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ContactEnquiryRepository extends JpaRepository<ContactEnquiry, Long> {

    /**
     * Search + filter query for admin panel.
     * All filter params are optional (nullable → ignored when null).
     */
    @Query("""
        SELECT e FROM ContactEnquiry e
        LEFT JOIN FETCH e.customer c
        WHERE
            (:search IS NULL OR :search = '' OR
                LOWER(e.enquiryNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(e.fullName)      LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(e.email)         LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(e.phone)         LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:status   IS NULL OR e.status   = :status)
        AND (:category IS NULL OR e.category = :category)
        AND (:priority IS NULL OR e.priority = :priority)
        AND (:from     IS NULL OR e.createdAt >= :from)
        AND (:to       IS NULL OR e.createdAt <= :to)
        """)
    Page<ContactEnquiry> searchEnquiries(
            @Param("search")   String search,
            @Param("status")   EnquiryStatus status,
            @Param("category") EnquiryCategory category,
            @Param("priority") EnquiryPriority priority,
            @Param("from")     LocalDateTime from,
            @Param("to")       LocalDateTime to,
            Pageable pageable);

    /** Count-only version for pagination metadata without fetching data. */
    @Query("""
        SELECT COUNT(e) FROM ContactEnquiry e
        WHERE
            (:search IS NULL OR :search = '' OR
                LOWER(e.enquiryNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(e.fullName)      LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(e.email)         LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(e.phone)         LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:status   IS NULL OR e.status   = :status)
        AND (:category IS NULL OR e.category = :category)
        AND (:priority IS NULL OR e.priority = :priority)
        AND (:from     IS NULL OR e.createdAt >= :from)
        AND (:to       IS NULL OR e.createdAt <= :to)
        """)
    long countEnquiries(
            @Param("search")   String search,
            @Param("status")   EnquiryStatus status,
            @Param("category") EnquiryCategory category,
            @Param("priority") EnquiryPriority priority,
            @Param("from")     LocalDateTime from,
            @Param("to")       LocalDateTime to);

    boolean existsByEnquiryNumber(String enquiryNumber);
}
