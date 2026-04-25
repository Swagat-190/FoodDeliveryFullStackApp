package com.fooddelivery.service;

import com.fooddelivery.dto.AuthResponse;
import com.fooddelivery.dto.LoginRequest;
import com.fooddelivery.dto.RegisterRequest;
import com.fooddelivery.entity.User;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthService - handles user registration and login business logic
 */
@Service
public class AuthService {

    private static final String MOBILE_REGEX = "^[0-9]{10,13}$";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * Register a new user
     * 1. Check email not already taken
     * 2. Hash password with BCrypt
     * 3. Save to DB
     * 4. Return JWT token
     */
    public AuthResponse register(RegisterRequest request) {
        // Check if email already in use
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        // Create new User entity
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        // Hash the password - NEVER store plain text
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        String requestedRole = request.getRole() == null ? "USER" : request.getRole().trim().toUpperCase();
        if (!requestedRole.equals("USER") && !requestedRole.equals("SELLER")) {
            throw new RuntimeException("Invalid role. Allowed roles are USER and SELLER");
        }

        String normalizedMobile = normalizeMobileNumber(request.getMobileNumber());
        if (!normalizedMobile.matches(MOBILE_REGEX)) {
            throw new RuntimeException("Invalid mobile number format");
        }
        if (userRepository.existsByRoleAndMobileNumber(requestedRole, normalizedMobile)) {
            throw new RuntimeException("Mobile number already registered for " + requestedRole.toLowerCase() + " account");
        }

        user.setRole(requestedRole);
        user.setMobileNumber(normalizedMobile);

        // Save to DB
        userRepository.save(user);

        // Generate JWT token for immediate login after registration
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getMobileNumber());

        return new AuthResponse(token, user.getEmail(), user.getName(), user.getId(), user.getRole());
    }

    /**
     * Login existing user
     * 1. Spring Security authenticates (checks BCrypt hash)
     * 2. If successful, generate and return JWT token
     */
    public AuthResponse login(LoginRequest request) {
        // Authenticate using Spring Security (handles BCrypt comparison)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword())
        );

        // Authentication passed - fetch user for response data
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getMobileNumber());

        return new AuthResponse(token, user.getEmail(), user.getName(), user.getId(), user.getRole());
    }

    /**
     * Get user profile by email
     */
    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String normalizeMobileNumber(String mobileNumber) {
        if (mobileNumber == null) {
            return "";
        }
        String normalized = mobileNumber.replaceAll("[^0-9]", "");
        if (normalized.length() == 11 && normalized.startsWith("0")) {
            normalized = normalized.substring(1);
        }
        if (normalized.length() == 10) {
            normalized = "91" + normalized;
        }
        return normalized;
    }
}
