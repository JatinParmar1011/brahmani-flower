package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.AuthResponse;
import com.brahmaniflower.repository.UserRepository;
import com.brahmaniflower.service.EmailOtpService;
import com.brahmaniflower.service.FirebaseAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class FirebaseAuthController {

    private final FirebaseAuthService firebaseAuthService;
    private final UserRepository userRepository;
    private final EmailOtpService emailOtpService;

    @GetMapping("/check-mobile")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkMobile(@RequestParam String mobile) {
        boolean exists = userRepository.existsByMobileNumber(mobile);
        return ResponseEntity.ok(ApiResponse.success(Map.of("exists", exists)));
    }

    @PostMapping("/firebase-login")
    public ResponseEntity<ApiResponse<AuthResponse>> firebaseLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("firebaseIdToken");
        if (idToken == null || idToken.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("firebaseIdToken is required"));
        AuthResponse response = firebaseAuthService.loginWithFirebaseToken(idToken);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/complete-registration")
    public ResponseEntity<ApiResponse<AuthResponse>> completeRegistration(@RequestBody Map<String, String> body) {
        String idToken = body.get("firebaseIdToken");
        if (idToken == null || idToken.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("firebaseIdToken is required"));
        AuthResponse response = firebaseAuthService.completeRegistration(
                idToken,
                body.get("name"),
                body.get("title"),
                body.get("gender"),
                body.get("dateOfBirth"),
                body.get("email")
        );
        return ResponseEntity.ok(ApiResponse.success("Registration complete", response));
    }

    @PostMapping("/complete-google-registration")
    public ResponseEntity<ApiResponse<AuthResponse>> completeGoogleRegistration(@RequestBody Map<String, String> body) {
        String phoneIdToken = body.get("phoneIdToken");
        if (phoneIdToken == null || phoneIdToken.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("phoneIdToken is required"));
        AuthResponse response = firebaseAuthService.completeGoogleRegistration(
                phoneIdToken,
                body.get("googleEmail"),
                body.get("googleName"),
                body.get("title"),
                body.get("gender"),
                body.get("dateOfBirth")
        );
        return ResponseEntity.ok(ApiResponse.success("Registration complete", response));
    }

    @PostMapping("/send-email-otp")
    public ResponseEntity<ApiResponse<Void>> sendEmailOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("email is required"));
        emailOtpService.sendOtp(email.trim().toLowerCase());
        return ResponseEntity.ok(ApiResponse.success("OTP sent to " + email, null));
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> verifyEmailOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");
        if (email == null || otp == null)
            return ResponseEntity.badRequest().body(ApiResponse.error("email and otp are required"));
        boolean valid = emailOtpService.verifyOtp(email.trim().toLowerCase(), otp.trim());
        if (!valid)
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired OTP"));
        return ResponseEntity.ok(ApiResponse.success(Map.of("verified", true)));
    }
}
