package com.brahmaniflower.service.impl;

import com.brahmaniflower.dto.request.LoginRequest;
import com.brahmaniflower.dto.request.RegisterRequest;
import com.brahmaniflower.dto.response.AuthResponse;
import com.brahmaniflower.service.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Override
    public AuthResponse register(RegisterRequest request) {
        throw new UnsupportedOperationException("Use Firebase authentication via /api/auth/firebase-login");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        throw new UnsupportedOperationException("Use Firebase authentication via /api/auth/firebase-login");
    }
}
