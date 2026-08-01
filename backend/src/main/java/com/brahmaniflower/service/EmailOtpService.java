package com.brahmaniflower.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class EmailOtpService {

    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;

    @Value("${app.email.otp.expiry-seconds:300}")
    private long otpExpirySeconds;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final String KEY_PREFIX = "email_otp:";

    public void sendOtp(String email) {
        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        redisTemplate.opsForValue().set(KEY_PREFIX + email.toLowerCase(), otp, Duration.ofSeconds(otpExpirySeconds));

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(email);
        msg.setSubject("Brahmani Flowers – Email Verification Code");
        msg.setText("Your verification code is: " + otp + "\n\nThis code expires in 5 minutes.");
        mailSender.send(msg);
    }

    public boolean verifyOtp(String email, String otp) {
        String key = KEY_PREFIX + email.toLowerCase();
        String stored = redisTemplate.opsForValue().get(key);
        if (stored != null && stored.equals(otp)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }
}
