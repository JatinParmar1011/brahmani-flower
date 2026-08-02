package com.brahmaniflower.service;

import com.brahmaniflower.dto.response.AuthResponse;
import com.brahmaniflower.entity.User;
import com.brahmaniflower.repository.UserRepository;
import com.brahmaniflower.security.JwtUtil;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseAuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.admin.mobile:8888888888}")
    private String adminMobile;

    @Transactional
    public AuthResponse loginWithFirebaseToken(String idToken) {
        FirebaseToken decoded;
        try {
            decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (Exception e) {
            log.error("Firebase token verification failed: {}", e.getMessage());
            throw new RuntimeException("Invalid or expired Firebase token");
        }

        String firebaseUid   = decoded.getUid();
        String phoneNumber   = (String) decoded.getClaims().get("phone_number");
        String email         = decoded.getEmail();
        String displayName   = decoded.getName();

        // Strip +91 prefix for phone users
        String mobile = (phoneNumber != null) ? phoneNumber.replaceAll("^\\+91", "") : null;

        boolean isNewUser = false;
        User user;

        if (mobile != null) {
            // ── Phone OTP login ──────────────────────────────────────────
            isNewUser = !userRepository.existsByMobileNumber(mobile);
            if (isNewUser) {
                // Don't save yet — return newUser=true so frontend shows profile step
                User.UserRole role = mobile.equals(adminMobile) ? User.UserRole.ADMIN : User.UserRole.CUSTOMER;
                User tempUser = new User();
                tempUser.setMobileNumber(mobile);
                tempUser.setFirebaseUid(firebaseUid);
                tempUser.setName(displayName != null ? displayName : "User");
                tempUser.setRole(role);
                String jwt = jwtUtil.generateToken(buildUserDetails(tempUser));
                return AuthResponse.builder()
                        .accessToken(jwt)
                        .tokenType("Bearer")
                        .name(tempUser.getName())
                        .mobileNumber(mobile)
                        .role(role.name())
                        .newUser(true)
                        .build();
            }
            user = userRepository.findByMobileNumber(mobile)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else if (email != null) {
            // ── Google sign-in ───────────────────────────────────────────
            isNewUser = !userRepository.existsByEmail(email);
            if (isNewUser) {
                // Don't save yet — return newUser=true so frontend collects mobile
                String nameVal = displayName != null ? displayName : email.split("@")[0];
                User tempUser = new User();
                tempUser.setEmail(email);
                tempUser.setFirebaseUid(firebaseUid);
                tempUser.setName(nameVal);
                tempUser.setRole(User.UserRole.CUSTOMER);
                String jwt = jwtUtil.generateToken(buildUserDetails(tempUser));
                return AuthResponse.builder()
                        .accessToken(jwt)
                        .tokenType("Bearer")
                        .name(nameVal)
                        .email(email)
                        .role(User.UserRole.CUSTOMER.name())
                        .newUser(true)
                        .build();
            }
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else {
            throw new RuntimeException("Firebase token contains neither phone number nor email");
        }

        // Sync firebaseUid if missing (existing user signs in via Google for first time)
        if (user.getFirebaseUid() == null) {
            user.setFirebaseUid(firebaseUid);
            userRepository.save(user);
        }

        String jwt = jwtUtil.generateToken(buildUserDetails(user));

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole().name())
                .newUser(isNewUser)
                .build();
    }

    @Transactional
    public AuthResponse completeRegistration(String idToken, String name, String title, String gender, String dateOfBirth, String email) {
        FirebaseToken decoded;
        try {
            decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired Firebase token");
        }

        String firebaseUid = decoded.getUid();
        String phoneNumber = (String) decoded.getClaims().get("phone_number");
        String mobile = (phoneNumber != null) ? phoneNumber.replaceAll("^\\+91", "") : null;

        if (mobile == null) throw new RuntimeException("Phone number not found in token");

        User user = userRepository.findByMobileNumber(mobile).orElseGet(() -> {
            User.UserRole role = mobile.equals(adminMobile) ? User.UserRole.ADMIN : User.UserRole.CUSTOMER;
            User newU = new User();
            newU.setMobileNumber(mobile);
            newU.setFirebaseUid(firebaseUid);
            newU.setRole(role);
            return newU;
        });

        user.setName(name != null && !name.isBlank() ? name.trim() : "User");
        if (title != null && !title.isBlank())       user.setTitle(title);
        if (gender != null && !gender.isBlank())      user.setGender(gender);
        if (dateOfBirth != null && !dateOfBirth.isBlank()) user.setDateOfBirth(dateOfBirth);
        if (email != null && !email.isBlank()) user.setEmail(email.toLowerCase());

        userRepository.save(user);

        String jwt = jwtUtil.generateToken(buildUserDetails(user));
        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole().name())
                .newUser(false)
                .build();
    }

    /**
     * Called after Google new user verifies mobile OTP.
     * phoneIdToken = Firebase token from phone OTP confirmation
     * googleEmail  = email from Google sign-in (passed from frontend)
     */
    @Transactional
    public AuthResponse completeGoogleRegistration(
            String phoneIdToken, String googleEmail, String googleName,
            String title, String gender, String dateOfBirth) {
        FirebaseToken decoded;
        try {
            decoded = FirebaseAuth.getInstance().verifyIdToken(phoneIdToken);
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired Firebase token");
        }

        String firebaseUid = decoded.getUid();
        String phoneNumber = (String) decoded.getClaims().get("phone_number");
        String mobile = (phoneNumber != null) ? phoneNumber.replaceAll("^\\+91", "") : null;
        if (mobile == null) throw new RuntimeException("Phone number not found in token");

        // Check if mobile already linked to another account
        User user = userRepository.findByMobileNumber(mobile).orElseGet(() -> {
            User newU = new User();
            newU.setMobileNumber(mobile);
            newU.setFirebaseUid(firebaseUid);
            newU.setRole(User.UserRole.CUSTOMER);
            return newU;
        });

        user.setName(googleName != null && !googleName.isBlank() ? googleName.trim() : "User");
        if (title != null && !title.isBlank())       user.setTitle(title);
        if (gender != null && !gender.isBlank())     user.setGender(gender);
        if (dateOfBirth != null && !dateOfBirth.isBlank()) user.setDateOfBirth(dateOfBirth);
        if (googleEmail != null && !googleEmail.isBlank()) {
            user.setEmail(googleEmail.toLowerCase());
            user.setEmailVerified(true);
        }
        userRepository.save(user);

        String jwt = jwtUtil.generateToken(buildUserDetails(user));
        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole().name())
                .newUser(false)
                .build();
    }

    private UserDetails buildUserDetails(User user) {
        // Use mobileNumber for phone users, email for Google users
        String principal = user.getMobileNumber() != null ? user.getMobileNumber() : user.getEmail();
        return new org.springframework.security.core.userdetails.User(
                principal, "",
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
