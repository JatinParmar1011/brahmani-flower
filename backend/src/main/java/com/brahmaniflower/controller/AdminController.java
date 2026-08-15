package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.entity.User;
import com.brahmaniflower.repository.OrderRepository;
import com.brahmaniflower.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository  userRepository;
    private final OrderRepository orderRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getCustomers() {
        // Build map: userId -> [orderCount, totalSpent]
        Map<Long, long[]> stats = orderRepository.findOrderStatsPerUser().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> new long[]{ ((Number) row[1]).longValue(),
                                           ((BigDecimal) row[2]).longValue() }
                ));

        List<CustomerDto> list = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.CUSTOMER)
                .map(u -> {
                    long[] s = stats.getOrDefault(u.getId(), new long[]{0, 0});
                    return new CustomerDto(
                            u.getId(),
                            u.getName(),
                            u.getMobileNumber(),
                            u.getEmail(),
                            u.getGender(),
                            u.getDateOfBirth(),
                            u.getStatus().name(),
                            u.getCreatedAt() != null ? u.getCreatedAt().format(FMT) : null,
                            s[0],
                            "₹" + s[1],
                            Boolean.TRUE.equals(u.getMobileVerified()) ? 1 : 0,
                            Boolean.TRUE.equals(u.getEmailVerified())  ? 1 : 0
                    );
                })
                .toList();

        return ResponseEntity.ok(ApiResponse.success(list));
    }

    public record CustomerDto(
            Long id, String name, String mobile, String email,
            String gender, String dateOfBirth, String status, String joined,
            long orders, String totalSpent,
            int mobileVerified, int emailVerified
    ) {}
}
