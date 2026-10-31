package com.brahmaniflower.repository;

import com.brahmaniflower.entity.ContactEnquiryReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactEnquiryReplyRepository extends JpaRepository<ContactEnquiryReply, Long> {

    /**
     * All history events for a given enquiry, oldest-first.
     * LEFT JOIN FETCH admin to avoid N+1 when rendering adminName.
     */
    @Query("""
        SELECT r FROM ContactEnquiryReply r
        LEFT JOIN FETCH r.admin
        WHERE r.enquiry.id = :enquiryId
        ORDER BY r.createdAt ASC
        """)
    List<ContactEnquiryReply> findByEnquiryIdOrderByCreatedAtAsc(@Param("enquiryId") Long enquiryId);
}
