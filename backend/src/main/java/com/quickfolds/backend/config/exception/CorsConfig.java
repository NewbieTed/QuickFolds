package com.quickfolds.backend.config.exception;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


/**
 * Configuration class for Cross-Origin Resource Sharing (CORS) settings.
 *
 * - Allows frontend applications to communicate with the backend across different origins.
 * - Restricts allowed origins, HTTP methods, and credential handling.
 *
 * Applied globally to all API endpoints (`/**`).
 *
 * Security Considerations:
 * - Currently allows requests from `http://localhost:5173` (Vue.js or React frontend).
 * - Should be updated for production environments to allow only trusted domains.
 */
@Configuration
public class CorsConfig {

    /**
     * Defines CORS configurations for the application.
     *
     * - Allows requests from `http://localhost:5173`.
     * - Permits common HTTP methods: GET, POST, PUT, DELETE, OPTIONS.
     * - Enables credential sharing (cookies, authorization headers).
     *
     * @return A `WebMvcConfigurer` bean that applies CORS settings globally.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowCredentials(true);
            }
        };
    }
}
