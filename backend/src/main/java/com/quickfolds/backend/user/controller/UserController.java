package com.quickfolds.backend.user.controller;


import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.user.model.User;
import com.quickfolds.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

/**
 * REST controller for user-related operations, including authentication and retrieval.
 *
 * Endpoints:
 * - `/user/getUser`: Retrieves the currently authenticated user.
 * - `/user/signup`: Registers a new user.
 * - `/user/login`: Authenticates a user and returns a JWT token.
 *
 * Dependencies:
 * - UserService: Handles business logic for authentication and user management.
 *
 * Security:
 * - Uses Spring Security's `SecurityContextHolder` for user authentication.
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    // Service layer handling user authentication and registration logic.
    private final UserService userService;

    /**
     * Retrieves the currently authenticated user.
     *
     * @return ResponseEntity containing a BaseResponse with the principal (user details).
     */
    @GetMapping("/getUser")
    public ResponseEntity<BaseResponse<Object>> getUser() {
        // Retrieve the authenticated user from the security context.
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Return the user details in a standard API response.
        return BaseResponse.success(principal);
    }

    /**
     * Handles user registration.
     *
     * - Validates the request body to ensure username and password are not null.
     * - Calls the service layer to create a new user.
     * - Returns a success message if registration is successful.
     * - Returns an error if the username is already taken.
     *
     * @param user The user object containing username and password.
     * @return ResponseEntity with a success message or an error message.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        // Validate request: username and password must not be empty.
        if (user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password cannot be empty");
        }

        // Attempt to register the user.
        boolean success = userService.registerUser(user);

        // If successful, return confirmation.
        if (success) {
            return ResponseEntity.ok("Signup success");
        } else {
            // Return conflict status if the username is already taken.
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }
    }

    /**
     * Handles user authentication (login).
     *
     * - Extracts username and password from the request body.
     * - Calls the service layer to verify credentials.
     * - If authentication is successful, returns a JWT token.
     * - Otherwise, returns an unauthorized error.
     *
     * @param credentials A map containing the username and password.
     * @return ResponseEntity with a JWT token if authentication is successful, or an error message.
     */
    @PostMapping("/login")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> credentials) {
        // Extract username and password from the request payload.
        String username = credentials.get("username");
        String password = credentials.get("password");

        // Attempt to authenticate and generate a JWT token.
        String token = userService.login(username, password);

        // If authentication is successful, return the token.
        if (token != null) {
            return ResponseEntity.ok(Collections.singletonMap("token", token));
        }

        // Return unauthorized response if authentication fails.
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
    }
}
