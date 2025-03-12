package com.quickfolds.backend.user.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security configuration for the application using Spring Security.
 *
 * - Disables CSRF protection as JWT is used for authentication.
 * - Defines public (unauthenticated) endpoints.
 * - Requires authentication for all other requests.
 * - Uses a stateless session policy since JWT handles authentication.
 * - Integrates `JwtAuthenticationFilter` for JWT-based authentication.
 *
 * This configuration is active only in the `local` profile.
 */
@Configuration
public class SecurityConfig {
    // Custom JWT authentication filter for validating tokens in requests.
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Constructs the SecurityConfig and injects the JWT authentication filter.
     *
     * @param jwtAuthenticationFilter The custom filter for JWT token validation.
     */
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Configures HTTP security settings, including authentication and session management.
     *
     * - Disables CSRF protection (not needed for JWT-based authentication).
     * - Defines public endpoints that can be accessed without authentication.
     * - Requires authentication for all other requests.
     * - Sets session management to stateless (no session storage, JWT-based authentication).
     * - Adds `JwtAuthenticationFilter` before Spring Security’s default authentication filter.
     *
     * @param http The HttpSecurity object to configure security settings.
     * @return A SecurityFilterChain object with configured security settings.
     * @throws Exception If an error occurs while building the security filter chain.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF since JWT handles authentication.
                .csrf(AbstractHttpConfigurer::disable)

                // Define authorization rules for endpoints.
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/user/signup", "user/login", "/origami/**", "/geometry/**")
                        .permitAll()  // Allow public access to these endpoints
                        .anyRequest().authenticated() // Require authentication for all other requests
                )

                // Enforce stateless session management (JWT-based authentication).
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Add the JWT authentication filter before UsernamePasswordAuthenticationFilter.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // Build and return the security filter chain.
        return http.build();
    }
}