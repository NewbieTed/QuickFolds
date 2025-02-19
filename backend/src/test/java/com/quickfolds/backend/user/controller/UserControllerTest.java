package com.quickfolds.backend.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickfolds.backend.user.auth.JwtUtil;
import com.quickfolds.backend.user.controller.UserController;
import com.quickfolds.backend.user.model.User;
import com.quickfolds.backend.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for `UserController`.
 *
 * - Uses `@WebMvcTest` to test only the controller layer.
 * - Mocks `UserService` to isolate controller logic.
 * - Simulates HTTP requests for user authentication and registration endpoints.
 *
 * Dependencies:
 * - `MockMvc` for simulating HTTP requests.
 * - `Mockito` for service mocking.
 * - `ObjectMapper` for JSON serialization.
 */
@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {
    /**
     * `MockMvc` instance for simulating HTTP requests to the controller.
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * `ObjectMapper` for converting Java objects to JSON format.
     */
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Mocked `UserService` to isolate controller behavior from service logic.
     */
    @MockBean
    private UserService userService;

    /**
     * Mocked `JwtUtil` to satisfy the dependency in `JwtAuthenticationFilter`.
     */
    @MockBean
    private JwtUtil jwtUtil;

    /**
     * Tests that a user can retrieve their details successfully.
     *
     * - Uses `@WithMockUser` to simulate an authenticated user.
     * - Sends a `GET` request to `/user/getUser`.
     * - Expects `HTTP 200 OK` response.
     * - Verifies that the returned username matches "testuser".
     */
    @Test
    @WithMockUser(username = "testuser")
    void testGetUser() throws Exception {
        mockMvc.perform(get("/user/getUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("true"))
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    /**
     * Tests that a user can successfully sign up.
     *
     * - Mocks `userService.registerUser()` to return `true`.
     * - Sends a `POST` request to `/user/signup` with valid user data.
     * - Expects `HTTP 200 OK` response with a success message.
     */
    @Test
    void testSignupSuccess() throws Exception {
        User user = new User();
        user.setUsername("newuser");
        user.setPassword("password");

        when(userService.registerUser(any(User.class))).thenReturn(true);

        mockMvc.perform(post("/user/signup")
                        .with(csrf()) // Add CSRF token to bypass CSRF protection
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(content().string("Signup success"));
    }

    /**
     * Tests that signing up with an existing username results in a conflict error.
     *
     * - Mocks `userService.registerUser()` to return `false`.
     * - Sends a `POST` request to `/user/signup` with an existing username.
     * - Expects `HTTP 409 Conflict` response with an error message.
     */
    @Test
    void testSignupConflict() throws Exception {
        User user = new User();
        user.setUsername("existinguser");
        user.setPassword("password");

        when(userService.registerUser(any(User.class))).thenReturn(false);

        mockMvc.perform(post("/user/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isConflict())
                .andExpect(content().string("Username already exists"));
    }

    /**
     * Tests that a user can successfully log in.
     *
     * - Mocks `userService.login()` to return a dummy JWT token.
     * - Sends a `POST` request to `/user/login` with valid credentials.
     * - Expects `HTTP 200 OK` response with a valid token.
     */
    @Test
    void testLoginSuccess() throws Exception {
        String dummyToken = "dummy-token";
        when(userService.login("testuser", "password")).thenReturn(dummyToken);

        Map<String, String> credentials = new HashMap<>();
        credentials.put("username", "testuser");
        credentials.put("password", "password");

        mockMvc.perform(post("/user/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credentials)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(dummyToken));
    }

    /**
     * Tests that a failed login attempt returns an unauthorized error.
     *
     * - Mocks `userService.login()` to return `null` for incorrect credentials.
     * - Sends a `POST` request to `/user/login` with incorrect credentials.
     * - Expects `HTTP 401 Unauthorized` response with an error message.
     */
    @Test
    void testLoginFailure() throws Exception {
        when(userService.login("testuser", "wrongpassword")).thenReturn(null);

        Map<String, String> credentials = new HashMap<>();
        credentials.put("username", "testuser");
        credentials.put("password", "wrongpassword");

        mockMvc.perform(post("/user/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credentials)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid username or password"));
    }
}
