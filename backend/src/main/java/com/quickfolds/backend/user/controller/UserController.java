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


@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    @Autowired
    private final UserService userService;

    @GetMapping("/getUser")
    public ResponseEntity<BaseResponse<Object>> getUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return BaseResponse.success(principal);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password cannot be empty");
        }
        boolean success = userService.registerUser(user);
        if (success) {
            return ResponseEntity.ok("Signup success");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        String token = userService.login(username, password);
        if (token != null) {
            // Return the generated token
            return ResponseEntity.ok(Collections.singletonMap("token", token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
    }
}
