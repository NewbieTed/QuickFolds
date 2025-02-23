package com.quickfolds.backend.user.service;

import com.quickfolds.backend.user.mapper.UserMapper;
import com.quickfolds.backend.user.model.User;
import lombok.Data;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for {@link UserService}.
 * <p>
 * This class tests the core functionalities of the UserService, ensuring that user registration
 * and login operations work as expected. It focuses on both success and failure scenarios,
 * including edge cases like duplicate usernames and invalid login attempts.
 * <p>
 * Key features tested:
 * <ul>
 *     <li>Successful user registration with password hashing.</li>
 *     <li>Prevention of duplicate user registration.</li>
 *     <li>Successful login with valid credentials.</li>
 *     <li>Failed login with incorrect passwords and non-existent users.</li>
 * </ul>
 * <p>
 * Annotations:
 * <ul>
 *     <li>{@link SpringBootTest}: Loads the full application context for integration testing.</li>
 *     <li>{@link Transactional}: Ensures each test rolls back its changes to keep the database clean.</li>
 *     <li>{@link ActiveProfiles}: Loads test-specific configurations.</li>
 * </ul>
 */
@Data
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest
@ActiveProfiles(value = "${SPRING_PROFILES_ACTIVE}")
@Transactional
public class UserServiceTest {

    /**
     * Service under test for user-related operations.
     */
    @Autowired
    private UserService userService;

    /**
     * UserMapper for database operations.
     */
    @Autowired
    private UserMapper userMapper;

    /**
     * Tests successful user registration.
     * <p>
     * This test verifies that a user can be registered successfully, ensuring:
     * - The user is stored in the database.
     * - The password is securely hashed.
     * - The registration process returns {@code true}.
     */
    @Test
    void testRegisterUserSuccess() {
        // Create a new user
        User user = new User();
        user.setUsername("testRegisterSuccess");
        user.setPassword("password");

        // Register user and verify success
        boolean result = userService.registerUser(user);
        assertTrue(result, "User should be registered successfully");

        // Retrieve user from database and validate password hashing
        User dbUser = userMapper.findByUsername("testRegisterSuccess");
        assertNotNull(dbUser, "User should exist in the database");
        assertNotEquals("password", dbUser.getPassword(), "Password should be hashed");
        assertTrue(BCrypt.checkpw("password", dbUser.getPassword()), "Password hash should match the raw password");
    }

    /**
     * Tests that registering a user with an existing username fails.
     * <p>
     * This test ensures that duplicate usernames are not allowed:
     * - The first registration succeeds.
     * - A second attempt with the same username fails.
     */
    @Test
    void testRegisterUserDuplicate() {
        // Register a new user
        User user = new User();
        user.setUsername("duplicateUser");
        user.setPassword("password");
        assertTrue(userService.registerUser(user), "First registration should succeed");

        // Attempt duplicate registration
        User duplicate = new User();
        duplicate.setUsername("duplicateUser");
        duplicate.setPassword("anotherPassword");
        assertFalse(userService.registerUser(duplicate), "Duplicate registration should fail");
    }

    /**
     * Tests successful user login with correct credentials.
     * <p>
     * This test ensures that:
     * - A user can log in with the correct password.
     * - A valid JWT token is returned upon successful login.
     */
    @Test
    void testLoginSuccess() {
        // Register a new user
        User user = new User();
        user.setUsername("loginSuccessUser");
        user.setPassword("myPassword");
        assertTrue(userService.registerUser(user), "User registration should succeed");

        // Verify login returns a token
        String token = userService.login("loginSuccessUser", "myPassword");
        assertNotNull(token, "Login should return a token when credentials are correct");
    }

    /**
     * Tests failed login due to an incorrect password.
     * <p>
     * This test ensures that:
     * - A user cannot log in with an incorrect password.
     * - The login attempt returns {@code null}.
     */
    @Test
    void testLoginWrongPassword() {
        // Register a user
        User user = new User();
        user.setUsername("loginWrongUser");
        user.setPassword("myPassword");
        assertTrue(userService.registerUser(user), "User registration should succeed");

        // Attempt login with incorrect password
        String token = userService.login("loginWrongUser", "wrongPassword");
        assertNull(token, "Login should fail with incorrect password");
    }

    /**
     * Tests login failure for a non-existent user.
     * <p>
     * This test ensures that:
     * - Attempting to log in with an unknown username returns {@code null}.
     */
    @Test
    void testLoginNonExistentUser() {
        // Attempt to log in with a non-existent user
        String token = userService.login("nonExistentUser", "password");
        assertNull(token, "Login should fail for a non-existent user");
    }
}