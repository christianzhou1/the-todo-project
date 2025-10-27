package com.todo.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
    private Long expiration;

    @PostConstruct
    public void validateJwtConfiguration() {
        log.info("JWT Configuration validation:");
        log.info("  - Secret configured: {}", secret != null ? "YES" : "NO");
        log.info("  - Secret length: {}", secret != null ? secret.length() : 0);
        log.info("  - Secret starts with: {}", secret != null ? secret.substring(0, Math.min(8, secret.length())) + "..." : "null");
        log.info("  - Expiration: {} ms ({} hours)", expiration, expiration / 3600000);
        
        // Validate JWT secret requirements
        if (secret == null || secret.trim().isEmpty()) {
            log.error("CRITICAL ERROR: JWT_SECRET environment variable is not set!");
            throw new IllegalStateException("JWT_SECRET environment variable must be set for security reasons");
        }
        
        if (secret.length() < 32) {
            log.error("CRITICAL ERROR: JWT_SECRET is too short ({} characters). Minimum 32 characters required for security.", secret.length());
            throw new IllegalStateException("JWT_SECRET must be at least 32 characters long for security");
        }
        
        // Check for common weak secrets
        if (secret.equals("your-64-character-jwt-secret-key-here") || 
            secret.equals("your-jwt-secret-key") ||
            secret.equals("secret") ||
            secret.equals("password") ||
            secret.length() < 32) {
            log.error("CRITICAL ERROR: JWT_SECRET appears to be a default/weak value!");
            throw new IllegalStateException("JWT_SECRET must be a strong, randomly generated secret - not a default value");
        }
        
        log.info("✅ JWT secret validation passed - using secure secret from environment variables");
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username, String userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        long currentTime = System.currentTimeMillis();
        
        String token = Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(currentTime))
                .expiration(new Date(currentTime + expiration))
                .signWith(getSigningKey())
                .compact();
                
        return token;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
