package com.quickfolds.backend.user.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

/**
 * A security filter that intercepts incoming requests to authenticate users using JWT tokens.
 *
 * - Extracts the `Authorization` header to retrieve the token.
 * - Validates and parses the token using `JwtUtil`.
 * - If valid, extracts user details and sets authentication in `SecurityContextHolder`.
 * - If invalid or expired, returns an unauthorized response.
 *
 * This filter extends `OncePerRequestFilter`, ensuring that each request is processed only once.
 *
 * Dependencies:
 * - `JwtUtil`: Handles JWT token parsing and validation.
 *
 * Security:
 * - Ensures that only authenticated users can access protected resources.
 * - Logs authentication details for debugging purposes.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // Logger for debugging authentication-related actions.
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    // Utility class responsible for parsing and validating JWT tokens.
    private final JwtUtil jwtUtil;

    /**
     * Constructs the JWT authentication filter.
     *
     * @param jwtUtil The utility class responsible for handling JWT operations.
     */
    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }


    /**
     * Filters incoming requests to authenticate users based on JWT tokens.
     *
     * - Extracts the `Authorization` header.
     * - Verifies if the token is present and follows the "Bearer " format.
     * - Parses and validates the token using `JwtUtil`.
     * - If valid, extracts user details and sets authentication in `SecurityContextHolder`.
     * - If invalid, logs the error and sends an unauthorized response.
     *
     * @param request  The incoming HTTP request.
     * @param response The HTTP response.
     * @param filterChain The filter chain for processing subsequent filters.
     * @throws ServletException If an error occurs during filtering.
     * @throws IOException If an I/O error occurs.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Extract the Authorization header from the request.
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            // Extract the token from the header.
            String token = header.substring(7);
            try {
                // Parse and validate the JWT token.
                Claims claims = jwtUtil.parseToken(token);

                // Extract user information from the token claims.
                String username = claims.getSubject();
                Long userId = ((Number) claims.get("id")).longValue();

                // Log successful authentication.
                logger.debug("Authenticated user: {} with id: {}", username, userId);

                // Create an authentication token and set it in the security context.
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException e) {
                // TODO: Move to global exception handler
                // Log token validation errors.
                logger.error("JWT Token invalid or expired: {}", e.getMessage());

                // Send an unauthorized response if the token is invalid or expired.
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token invalid or expired");
                return;
            }
        } else {
            // Log cases where no JWT token is provided.
            logger.debug("No JWT token provided in the Authorization header");
        }

        // Continue with the filter chain to process the request.
        filterChain.doFilter(request, response);
    }
}