package com.quickfolds.backend.user.auth;

import com.quickfolds.backend.user.model.User;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * Utility class for handling JSON Web Token (JWT) generation and parsing.
 *
 * - Generates JWT tokens for authenticated users.
 * - Parses and validates JWT tokens to extract claims.
 *
 * Dependencies:
 * - Uses `io.jsonwebtoken` (JJWT) library for JWT operations.
 *
 * Security:
 * - Uses a secret key from application properties (`jwt.secret`) for signing.
 * - Tokens are signed using HMAC SHA-256 (`HS256`).
 * - Tokens have a default expiration time of 24 hours (86400000 ms).
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    /**
     * Generates a JWT token for a given user.
     *
     * - Sets the username as the subject.
     * - Includes the user ID as a custom claim.
     * - Sets the issued timestamp and expiration (24 hours).
     * - Signs the token using HMAC SHA-256 (`HS256`).
     *
     * @param user The user for whom the token is generated.
     * @return A JWT token as a string.
     */
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("id", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    /**
     * Parses a JWT token and extracts its claims.
     *
     * - Validates the token using the secret key.
     * - Returns the decoded claims if the token is valid.
     * - Throws `JwtException` if the token is invalid or expired.
     *
     * @param token The JWT token to parse.
     * @return The claims contained in the token.
     * @throws JwtException If the token is invalid, expired, or tampered with.
     */
    public Claims parseToken(String token) throws JwtException {
        return Jwts.parser()
                .setSigningKey(secretKey) // Validate with secret key
                .parseClaimsJws(token) // Parse the token
                .getBody(); // Extract claims
    }
}