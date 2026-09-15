package com.brahmaniflower.controller;

import com.brahmaniflower.dto.response.ApiResponse;
import com.brahmaniflower.dto.response.AuthResponse;
import com.brahmaniflower.repository.UserRepository;
import com.brahmaniflower.service.EmailOtpService;
import com.brahmaniflower.service.FirebaseAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    private void setJwtCookie(HttpServletResponse response, String token) {
        String cookie = "jwt=" + token
                + "; Path=/; HttpOnly; SameSite=Strict"
                + "; Max-Age=" + (jwtExpirationMs / 1000)
                + (cookieSecure ? "; Secure" : "");
        response.addHeader("Set-Cookie", cookie);
    }

    @GetMapping("/check-mobile")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkMobile(@RequestParam String mobile) {
        boolean exists = userRepository.existsByMobileNumber(mobile);
        return ResponseEntity.ok(ApiResponse.success(Map.of("exists", exists)));
    }

    @PostMapping("/firebase-login")
    public ResponseEntity<ApiResponse<AuthResponse>> firebaseLogin(
            @RequestBody Map<String, String> body,
            HttpServletResponse response) {
        String idToken = body.get("firebaseIdToken");
        if (idToken == null || idToken.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("firebaseIdToken is required"));
        AuthResponse authResponse = firebaseAuthService.loginWithFirebaseToken(idToken);
        setJwtCookie(response, authResponse.getAccessToken());
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/complete-registration")
    public ResponseEntity<ApiResponse<AuthResponse>> completeRegistration(
            @RequestBody Map<String, String> body,
            HttpServletResponse response) {
        String idToken = body.get("firebaseIdToken");
        if (idToken == null || idToken.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("firebaseIdToken is required"));
        AuthResponse authResponse = firebaseAuthService.completeRegistration(
                idToken,
                body.get("name"),
                body.get("title"),
                body.get("gender"),
                body.get("dateOfBirth"),
                body.get("email")
        );
        setJwtCookie(response, authResponse.getAccessToken());
        return ResponseEntity.ok(ApiResponse.success("Registration complete", authResponse));
    }

    @PostMapping("/complete-google-registration")
    public ResponseEntity<ApiResponse<AuthResponse>> completeGoogleRegistration(
            @RequestBody Map<String, String> body,
            HttpServletResponse response) {
        String phoneIdToken = body.get("phoneIdToken");
        if (phoneIdToken == null || phoneIdToken.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("phoneIdToken is required"));
        AuthResponse authResponse = firebaseAuthService.completeGoogleRegistration(
                phoneIdToken,
                body.get("googleEmail"),
                body.get("googleName"),
                body.get("title"),
                body.get("gender"),
                body.get("dateOfBirth")
        );
        setJwtCookie(response, authResponse.getAccessToken());
        return ResponseEntity.ok(ApiResponse.success("Registration complete", authResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        // Clear the JWT cookie
        response.addHeader("Set-Cookie",
                "jwt=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0");
        return ResponseEntity.ok(ApiResponse.success("Logged out", null));
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
