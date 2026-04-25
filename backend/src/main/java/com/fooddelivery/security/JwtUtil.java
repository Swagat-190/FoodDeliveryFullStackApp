package com.fooddelivery.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JwtUtil - handles all JWT operations:
 * 1. Generate token after login
 * 2. Extract email from token
 * 3. Validate token (signature + expiry)
 */
@Component
public class JwtUtil {

    // Read secret key from application.properties
    @Value("${jwt.secret}")
    private String secret;

    // Token validity in milliseconds (default: 24 hours)
    @Value("${jwt.expiration}")
    private long expiration;

    /**
     * Build a signing key from the secret string
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Generate JWT token for a given email (subject)
     * Token includes: subject (email), issued-at, expiry
     */
    public String generateToken(String email) {
        return generateToken(email, null, null);
    }

    /**
     * Generate JWT token with optional additional claims
     */
    public String generateToken(String email, String role, String mobileNumber) {
        Map<String, Object> claims = new HashMap<>();
        if (role != null) {
            claims.put("role", role);
        }
        if (mobileNumber != null) {
            claims.put("mobile", mobileNumber);
        }

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract email (subject) from a JWT token
     */
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Validate JWT token: parse it and check it hasn't expired
     * Returns false if token is tampered or expired
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token is invalid, expired, or malformed
            return false;
        }
    }
}
