package com.quickfolds.backend.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickfolds.backend.user.auth.JwtUtil;
import com.quickfolds.backend.user.model.User;
import com.quickfolds.backend.user.service.UserService;
import lombok.Data;
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
 * Unit tests for {@link UserController}.
 * <p>
 * This test class verifies the behavior of the UserController endpoints using
 * MockMvc to simulate HTTP requests. It mocks the {@link UserService} to isolate
 * controller logic and ensure correct request handling.
 * <p>
 * Key functionalities tested:
 * <ul>
 *     <li>User retrieval using GET endpoint.</li>
 *     <li>User signup with valid and conflicting usernames.</li>
 *     <li>User login with valid and invalid credentials.</li>
 * </ul>
 *
 * Dependencies:
 * <ul>
 *     <li>{@link MockMvc}: Simulates HTTP requests and responses.</li>
 *     <li>{@link MockBean}: Mocks service layer behavior.</li>
 *     <li>{@link ObjectMapper}: Converts Java objects to JSON.</li>
 *     <li>{@link JwtUtil}: Mocks JWT utility for authentication.</li>
 * </ul>
 */
@Data
@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    /**
     * MockMvc instance for simulating HTTP requests and responses.
     * <p>
     * This bean is automatically configured by {@code @WebMvcTest} to test only the web layer.
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * ObjectMapper for JSON serialization and deserialization.
     */
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Mocked UserService to isolate controller behavior.
     */
    @MockBean
    private UserService userService;

    /**
     * Mocked JwtUtil to satisfy dependency in JwtAuthenticationFilter.
     */
    @MockBean
    private JwtUtil jwtUtil;

    /**
     * Tests that an authenticated user can retrieve their details successfully.
     * <p>
     * This test simulates an authenticated user using {@code @WithMockUser}.
     * It sends a GET request to {@code /user/getUser} and expects an HTTP 200 OK response,
     * verifying that the returned username matches "testUser".
     *
     * @throws Exception if the request cannot be processed.
     */
    @Test
    @WithMockUser(username = "testUser")
    void testGetUser() throws Exception {
        mockMvc.perform(get("/user/getUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("true"))
                .andExpect(jsonPath("$.data.username").value("testUser"));
    }

    /**
     * Tests that a user can successfully sign up with valid data.
     * <p>
     * This test mocks {@link UserService#registerUser(User)} to return {@code true}.
     * It sends a POST request to {@code /user/signup} with valid user data and expects
     * an HTTP 200 OK response with a success message.
     *
     * @throws Exception if the request cannot be processed.
     */
    @Test
    void testSignupSuccess() throws Exception {
        User user = new User();
        user.setUsername("newUser");
        user.setPassword("password");

        when(userService.registerUser(any(User.class))).thenReturn(true);

        mockMvc.perform(post("/user/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(content().string("Signup success"));
    }

    /**
     * Tests that signing up with an existing username results in a conflict error.
     * <p>
     * This test mocks {@link UserService#registerUser(User)} to return {@code false}.
     * It sends a POST request to {@code /user/signup} with an existing username and expects
     * an HTTP 409 Conflict response with an appropriate error message.
     *
     * @throws Exception if the request cannot be processed.
     */
    @Test
    void testSignupConflict() throws Exception {
        User user = new User();
        user.setUsername("existingUser");
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
     * Tests that a user can successfully log in with valid credentials.
     * <p>
     * This test mocks {@link UserService#login(String, String)} to return a dummy JWT token.
     * It sends a POST request to {@code /user/login} with valid credentials and expects
     * an HTTP 200 OK response with the token included in the response.
     *
     * @throws Exception if the request cannot be processed.
     */
    @Test
    void testLoginSuccess() throws Exception {
        String dummyToken = "dummy-token";
        when(userService.login("testUser", "password")).thenReturn(dummyToken);

        Map<String, String> credentials = new HashMap<>();
        credentials.put("username", "testUser");
        credentials.put("password", "password");

        mockMvc.perform(post("/user/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credentials)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(dummyToken));
    }

    /**
     * Tests that an invalid login attempt returns an unauthorized error.
     * <p>
     * This test mocks {@link UserService#login(String, String)} to return {@code null}.
     * It sends a POST request to {@code /user/login} with incorrect credentials and expects
     * an HTTP 401 Unauthorized response with an appropriate error message.
     *
     * @throws Exception if the request cannot be processed.
     */
    @Test
    void testLoginFailure() throws Exception {
        when(userService.login("testUser", "wrongPassword")).thenReturn(null);

        Map<String, String> credentials = new HashMap<>();
        credentials.put("username", "testUser");
        credentials.put("password", "wrongPassword");

        mockMvc.perform(post("/user/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credentials)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid username or password"));
    }
}