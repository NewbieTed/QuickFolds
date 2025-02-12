package com.quickfolds.backend.user.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@Profile("local")
public class TestSecurityConfig {
    @Bean
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for tests
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/geometry/**").permitAll() // Allow only specific controller paths
                        .anyRequest().denyAll()); // Deny everything else
        return http.build();
    }
}