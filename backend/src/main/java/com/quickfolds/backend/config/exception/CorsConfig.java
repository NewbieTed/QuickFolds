package com.quickfolds.backend.config.exception;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class for Cross-Origin Resource Sharing (CORS) settings.
 * <p>
 * CORS allows web applications from different origins to access resources from the backend,
 * enabling seamless communication between frontend and backend services while maintaining security controls.
 * <p>
 * This configuration applies globally to all API endpoints (`/**`).
 * It allows requests from specific trusted origins, permits common HTTP methods,
 * and enables credential sharing (such as cookies and authorization headers).
 * <p>
 * <strong>Security Considerations:</strong>
 * - Currently allows requests from `<a href="http://localhost:5173">...</a>`, typically used for local development with a Vue.js or React frontend.
 * - For production environments, this should be updated to restrict access to trusted domains only.
 */
@Configuration
public class CorsConfig {

    /**
     * Defines CORS configurations for the application.
     * <p>
     * This method creates a `WebMvcConfigurer` bean to apply CORS settings globally across all endpoints (`/**`).
     * It configures allowed origins, HTTP methods, and credential handling.
     *
     * @return A `WebMvcConfigurer` bean that applies CORS settings globally.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            /**
             * Configures CORS settings for the application.
             * <p>
             * - **Allowed Origins:** `<a href="http://localhost:5173">...</a>` (Frontend application during development).
             * - **Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS.
             * - **Credentials:** Enabled to allow cookies and authorization headers.
             * <p>
             * In production, update `allowedOrigins` to trusted domains to prevent unauthorized access.
             *
             * @param registry The CORS registry used to define cross-origin rules.
             */
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173",
                                        "https://www.quickfolds.org")  // Allow deployed frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowCredentials(true);
            }
        };
    }
}