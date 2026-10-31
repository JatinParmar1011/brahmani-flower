package com.brahmaniflower.service;

import com.brahmaniflower.dto.request.ContactEnquiryReplyRequestDto;
import com.brahmaniflower.dto.request.ContactEnquiryRequestDto;
import com.brahmaniflower.dto.response.ContactEnquiryReplyResponseDto;
import com.brahmaniflower.dto.response.ContactEnquiryResponseDto;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryCategory;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryPriority;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ContactEnquiryService {

    /**
     * Submit a new contact enquiry (customer / guest).
     */
    ContactEnquiryResponseDto submitEnquiry(ContactEnquiryRequestDto request, String principal);

    /**
     * Admin: paginated + filtered list of enquiries.
     */
    Page<ContactEnquiryResponseDto> getEnquiries(
            String search,
            EnquiryStatus status,
            EnquiryCategory category,
            EnquiryPriority priority,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable);

    /**
     * Admin: full enquiry detail by id.
     */
    ContactEnquiryResponseDto getEnquiryById(Long id);

    /**
     * Admin: update the status of an enquiry.
     * Enforces transition rules — throws BadRequestException for invalid moves.
     * Logs a STATUS_CHANGE history event.
     *
     * @param adminPrincipal JWT principal of the acting admin
     */
    ContactEnquiryResponseDto updateStatus(Long id, EnquiryStatus newStatus, String adminPrincipal);

    /**
     * Admin: update the priority of an enquiry.
     * Blocked when enquiry is CLOSED.
     */
    ContactEnquiryResponseDto updatePriority(Long id, EnquiryPriority newPriority);

    /**
     * Admin: send a reply email to the customer and persist the event.
     * Transitions the enquiry status according to request.newStatus.
     *
     * @param adminPrincipal JWT principal of the acting admin
     */
    ContactEnquiryResponseDto sendReply(Long id, ContactEnquiryReplyRequestDto request, String adminPrincipal);

    /**
     * Admin: full history (replies + status changes) for an enquiry, oldest-first.
     */
    List<ContactEnquiryReplyResponseDto> getHistory(Long enquiryId);
}
