package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.entity.User;
import com.brahmaniflower.exception.ResourceNotFoundException;
import com.brahmaniflower.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // GET profile — returns full user data for dashboard
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = findUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(toResponse(user)));
    }

    // PATCH profile — saves name, title, dob, email from step3
    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @RequestBody UpdateProfileRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = findUser(userDetails.getUsername());

        if (req.getName()  != null && !req.getName().isBlank())  user.setName(req.getName().trim());
        if (req.getTitle() != null && !req.getTitle().isBlank()) user.setTitle(req.getTitle());
        if (req.getGender() != null && !req.getGender().isBlank()) user.setGender(req.getGender());
        if (req.getDateOfBirth() != null && !req.getDateOfBirth().isBlank()) user.setDateOfBirth(req.getDateOfBirth());
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            String newEmail = req.getEmail().toLowerCase();
            // Only update if not taken by another user
            boolean takenByOther = userRepository.findByEmail(newEmail)
                    .map(existing -> !existing.getId().equals(user.getId()))
                    .orElse(false);
            if (!takenByOther) {
                // Reset emailVerified if email changed
                if (!newEmail.equals(user.getEmail())) {
                    user.setEmail(newEmail);
                    user.setEmailVerified(false);
                }
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", toResponse(user)));
    }

    private User findUser(String identifier) {
        return userRepository.findByMobileNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProfileResponse toResponse(User u) {
        return new ProfileResponse(
                u.getId(), u.getName(), u.getTitle(), u.getGender(), u.getEmail(),
                u.getMobileNumber(), u.getDateOfBirth(), u.getEmailVerified(),
                u.getMobileVerified(), u.getRole().name(), u.getStatus().name(), u.getActive()
        );
    }

    public static class UpdateProfileRequest {
        private String name;
        private String title;
        private String gender;
        private String dateOfBirth;
        private String email;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }

        public String getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public record ProfileResponse(
            Long userId, String name, String title, String gender, String email,
            String mobileNumber, String dateOfBirth, Boolean emailVerified,
            Boolean mobileVerified, String role, String status, Boolean active
    ) {}
}
