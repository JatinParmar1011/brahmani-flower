package com.brahmaniflower.service.impl;

import com.brahmaniflower.dto.request.ContactEnquiryReplyRequestDto;
import com.brahmaniflower.dto.request.ContactEnquiryRequestDto;
import com.brahmaniflower.dto.response.ContactEnquiryReplyResponseDto;
import com.brahmaniflower.dto.response.ContactEnquiryResponseDto;
import com.brahmaniflower.entity.ContactEnquiry;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryCategory;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryPriority;
import com.brahmaniflower.entity.ContactEnquiry.EnquiryStatus;
import com.brahmaniflower.entity.ContactEnquiryReply;
import com.brahmaniflower.entity.ContactEnquiryReply.EventType;
import com.brahmaniflower.entity.User;
import com.brahmaniflower.exception.BadRequestException;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.ContactEnquiryReplyRepository;
import com.brahmaniflower.repository.ContactEnquiryRepository;
import com.brahmaniflower.repository.UserRepository;
import com.brahmaniflower.service.ContactEnquiryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactEnquiryServiceImpl implements ContactEnquiryService {

    private final ContactEnquiryRepository      enquiryRepository;
    private final ContactEnquiryReplyRepository replyRepository;
    private final UserRepository                userRepository;
    private final JavaMailSender                mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ── Status transition rules ───────────────────────────────────────────────
    //
    // NEW          → IN_PROGRESS, WAITING_FOR_CUSTOMER, RESOLVED, CLOSED
    // IN_PROGRESS  → WAITING_FOR_CUSTOMER, RESOLVED, CLOSED
    // WAITING_FOR_CUSTOMER → IN_PROGRESS, RESOLVED, CLOSED
    // RESOLVED     → CLOSED, IN_PROGRESS   (can reopen if customer replies again)
    // CLOSED       → (nothing — terminal)
    //
    // Additionally: NEW cannot be set once left (no going back to NEW).

    private static final java.util.Map<EnquiryStatus, Set<EnquiryStatus>> VALID_TRANSITIONS =
            new java.util.EnumMap<>(EnquiryStatus.class);

    static {
        VALID_TRANSITIONS.put(EnquiryStatus.NEW,
                EnumSet.of(EnquiryStatus.IN_PROGRESS, EnquiryStatus.WAITING_FOR_CUSTOMER,
                           EnquiryStatus.RESOLVED, EnquiryStatus.CLOSED));
        VALID_TRANSITIONS.put(EnquiryStatus.IN_PROGRESS,
                EnumSet.of(EnquiryStatus.WAITING_FOR_CUSTOMER,
                           EnquiryStatus.RESOLVED, EnquiryStatus.CLOSED));
        VALID_TRANSITIONS.put(EnquiryStatus.WAITING_FOR_CUSTOMER,
                EnumSet.of(EnquiryStatus.IN_PROGRESS,
                           EnquiryStatus.RESOLVED, EnquiryStatus.CLOSED));
        VALID_TRANSITIONS.put(EnquiryStatus.RESOLVED,
                EnumSet.of(EnquiryStatus.IN_PROGRESS, EnquiryStatus.CLOSED));
        VALID_TRANSITIONS.put(EnquiryStatus.CLOSED,
                EnumSet.noneOf(EnquiryStatus.class));          // terminal — no transitions
    }

    private void validateTransition(EnquiryStatus current, EnquiryStatus next) {
        if (current == next) return;   // no-op is always fine
        Set<EnquiryStatus> allowed = VALID_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(EnquiryStatus.class));
        if (!allowed.contains(next)) {
            if (current == EnquiryStatus.CLOSED) {
                throw new BadRequestException(
                        "This enquiry is CLOSED and cannot be changed. It is a terminal state.");
            }
            if (next == EnquiryStatus.NEW) {
                throw new BadRequestException(
                        "Cannot move an enquiry back to NEW once it has been progressed.");
            }
            throw new BadRequestException(
                    "Invalid status transition: " + current.name() + " → " + next.name());
        }
    }

    // ── Submit Enquiry ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ContactEnquiryResponseDto submitEnquiry(ContactEnquiryRequestDto request, String principal) {

        User customer = null;
        if (principal != null && !principal.isBlank()) {
            customer = userRepository.findByMobileNumber(principal)
                    .or(() -> userRepository.findByEmail(principal))
                    .orElse(null);
            if (customer != null && customer.getEmail() != null
                    && !customer.getEmail().equalsIgnoreCase(request.getEmail())) {
                log.debug("[ContactEnquiry] Authenticated user {} using alternate email {}",
                        customer.getId(), request.getEmail());
            }
        }

        EnquiryCategory category;
        try {
            category = EnquiryCategory.valueOf(request.getCategory().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BadRequestException("Invalid enquiry category: " + request.getCategory());
        }

        ContactEnquiry enquiry = new ContactEnquiry();
        enquiry.setEnquiryNumber(generateEnquiryNumber());
        enquiry.setCustomer(customer);
        enquiry.setFullName(request.getFullName().trim());
        enquiry.setEmail(request.getEmail().trim().toLowerCase());
        enquiry.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        enquiry.setSubject(request.getSubject().trim());
        enquiry.setCategory(category);
        enquiry.setMessage(request.getMessage().trim());
        enquiry.setStatus(EnquiryStatus.NEW);
        enquiry.setPriority(EnquiryPriority.MEDIUM);

        ContactEnquiry saved = enquiryRepository.save(enquiry);
        log.info("[ContactEnquiry] New enquiry saved: {} (customerId={})",
                saved.getEnquiryNumber(), customer != null ? customer.getId() : "guest");

        return ContactEnquiryResponseDto.from(saved);
    }

    // ── Admin: list enquiries ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<ContactEnquiryResponseDto> getEnquiries(
            String search, EnquiryStatus status, EnquiryCategory category,
            EnquiryPriority priority, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return enquiryRepository
                .searchEnquiries(search, status, category, priority, from, to, pageable)
                .map(ContactEnquiryResponseDto::from);
    }

    // ── Admin: get by id ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ContactEnquiryResponseDto getEnquiryById(Long id) {
        ContactEnquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ContactEnquiry", id));
        return ContactEnquiryResponseDto.from(enquiry);
    }

    // ── Admin: update status (with transition enforcement + history) ──────────

    @Override
    @Transactional
    public ContactEnquiryResponseDto updateStatus(Long id, EnquiryStatus newStatus, String adminPrincipal) {
        ContactEnquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ContactEnquiry", id));

        EnquiryStatus current = enquiry.getStatus();
        validateTransition(current, newStatus);

        if (current == newStatus) {
            return ContactEnquiryResponseDto.from(enquiry);   // nothing to do
        }

        enquiry.setStatus(newStatus);
        ContactEnquiry saved = enquiryRepository.save(enquiry);

        // Record STATUS_CHANGE history event
        User admin = resolveAdmin(adminPrincipal);
        ContactEnquiryReply event = new ContactEnquiryReply();
        event.setEnquiry(saved);
        event.setEventType(EventType.STATUS_CHANGE);
        event.setAdmin(admin);
        event.setAdminName(admin != null ? admin.getName() : "Admin");
        event.setStatusBefore(current.name());
        event.setStatusAfter(newStatus.name());
        replyRepository.save(event);

        log.info("[ContactEnquiry] Status changed {} → {} for enquiry {} by {}",
                current, newStatus, saved.getEnquiryNumber(), adminPrincipal);

        return ContactEnquiryResponseDto.from(saved);
    }

    // ── Admin: update priority ────────────────────────────────────────────────

    @Override
    @Transactional
    public ContactEnquiryResponseDto updatePriority(Long id, EnquiryPriority newPriority) {
        ContactEnquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ContactEnquiry", id));
        if (enquiry.getStatus() == EnquiryStatus.CLOSED) {
            throw new BadRequestException("Cannot change priority of a CLOSED enquiry.");
        }
        enquiry.setPriority(newPriority);
        return ContactEnquiryResponseDto.from(enquiryRepository.save(enquiry));
    }

    // ── Admin: send reply email + persist history ─────────────────────────────

    @Override
    @Transactional
    public ContactEnquiryResponseDto sendReply(Long id, ContactEnquiryReplyRequestDto request,
                                               String adminPrincipal) {
        ContactEnquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ContactEnquiry", id));

        if (enquiry.getStatus() == EnquiryStatus.CLOSED) {
            throw new BadRequestException(
                    "This enquiry is CLOSED. Reopen it by changing the status before sending a reply.");
        }

        // Parse and validate the requested new status
        EnquiryStatus newStatus;
        try {
            newStatus = EnquiryStatus.valueOf(request.getNewStatus().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BadRequestException("Invalid newStatus: " + request.getNewStatus());
        }
        validateTransition(enquiry.getStatus(), newStatus);

        EnquiryStatus previousStatus = enquiry.getStatus();

        // Resolve admin
        User admin = resolveAdmin(adminPrincipal);
        String adminName = admin != null ? admin.getName() : "Admin";

        // Persist REPLY history event (always, before email — so it's saved even if mail fails)
        ContactEnquiryReply reply = new ContactEnquiryReply();
        reply.setEnquiry(enquiry);
        reply.setEventType(EventType.REPLY);
        reply.setAdmin(admin);
        reply.setAdminName(adminName);
        reply.setEmailSubject(request.getEmailSubject().trim());
        reply.setEmailBody(request.getEmailBody().trim());
        reply.setStatusBefore(previousStatus.name());
        reply.setStatusAfter(newStatus.name());
        replyRepository.save(reply);

        // Transition status
        enquiry.setStatus(newStatus);
        ContactEnquiry saved = enquiryRepository.save(enquiry);

        // Send email — failure logged but does NOT roll back the saved reply/status
        sendReplyEmail(enquiry, request.getEmailSubject().trim(), request.getEmailBody().trim(), adminName);

        log.info("[ContactEnquiry] Reply sent for {} by {}. Status: {} → {}",
                saved.getEnquiryNumber(), adminPrincipal, previousStatus, newStatus);

        return ContactEnquiryResponseDto.from(saved);
    }

    // ── Admin: get full history ───────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ContactEnquiryReplyResponseDto> getHistory(Long enquiryId) {
        if (!enquiryRepository.existsById(enquiryId)) {
            throw new ResourceNotFoundException("ContactEnquiry", enquiryId);
        }
        return replyRepository.findByEnquiryIdOrderByCreatedAtAsc(enquiryId)
                .stream()
                .map(ContactEnquiryReplyResponseDto::from)
                .toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User resolveAdmin(String principal) {
        if (principal == null || principal.isBlank()) return null;
        return userRepository.findByMobileNumber(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElse(null);
    }

    private String generateEnquiryNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        for (int attempt = 0; attempt < 5; attempt++) {
            String suffix = String.format("%06d", ThreadLocalRandom.current().nextInt(1_000_000));
            String number = "ENQ-" + date + "-" + suffix;
            if (!enquiryRepository.existsByEnquiryNumber(number)) return number;
        }
        return "ENQ-" + date + "-" + System.nanoTime() % 1_000_000;
    }

    private void sendReplyEmail(ContactEnquiry enquiry, String subject, String body, String adminName) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(enquiry.getEmail());
            msg.setSubject("[" + enquiry.getEnquiryNumber() + "] " + subject);
            msg.setText(
                    "Dear " + enquiry.getFullName() + ",\n\n"
                    + body + "\n\n"
                    + "---\n"
                    + "This reply is regarding your enquiry " + enquiry.getEnquiryNumber() + ".\n"
                    + "Subject: " + enquiry.getSubject() + "\n\n"
                    + "Warm regards,\n"
                    + adminName + "\n"
                    + "Brahmani Flower Support Team"
            );
            mailSender.send(msg);
            log.info("[ContactEnquiry] Reply email sent to {} for enquiry {}",
                    enquiry.getEmail(), enquiry.getEnquiryNumber());
        } catch (Exception ex) {
            log.warn("[ContactEnquiry] Failed to send reply email for {}: {}",
                    enquiry.getEnquiryNumber(), ex.getMessage());
        }
    }
}
