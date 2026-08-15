package com.brahmaniflower.service;

import com.brahmaniflower.dto.request.LoginRequest;
import com.brahmaniflower.dto.request.RegisterRequest;
import com.brahmaniflower.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
