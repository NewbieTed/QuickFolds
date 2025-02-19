package com.quickfolds.backend.user.service;

import com.quickfolds.backend.user.mapper.UserMapper;
import com.quickfolds.backend.user.model.User;
import com.quickfolds.backend.user.service.UserService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for `UserService`.
 *
 * - Uses `@SpringBootTest` to load the full application context.
 * - Mocks `UserMapper` for database operations.
 * - Tests user registration and login functionality, including edge cases.
 *
 * Features:
 * - Ensures password hashing is correctly applied.
 * - Verifies duplicate user registration is prevented.
 * - Tests login with correct and incorrect credentials.
 *
 * Annotations:
 * - `@Transactional`: Ensures tests rollback changes to maintain a clean database.
 * - `@ActiveProfiles`: Loads test-specific configurations.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest
@ActiveProfiles(value = "${SPRING_PROFILES_ACTIVE}")
@Transactional      // Rollback after each test
public class UserServiceTest {
    /**
     * The `UserService` instance under test.
     */
    @Autowired
    private UserService userService;

    /**
     * The `UserMapper` instance used to interact with the database.
     */
    @Autowired
    private UserMapper userMapper;

    /**
     * Tests successful user registration.
     *
     * - Creates a new user with a unique username.
     * - Verifies that registration succeeds.
     * - Ensures the user is stored in the database with a hashed password.
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
        assertNotNull(dbUser, "User should eIxist in the database");
        assertNotEquals("password", dbUser.getPassword(), "Password should be hashed");
        assertTrue(BCrypt.checkpw("password", dbUser.getPassword()), "Password hash should match the raw password");
    }

    /**
     * Tests that registering a user with an existing username fails.
     *
     * - Registers a user with a specific username.
     * - Attempts to register another user with the same username.
     * - Verifies that duplicate registration is not allowed.
     */
    @Test
    void testRegisterUserDuplicate() {
        // Register a new user
        User user = new User();
        user.setUsername("duplicateUser");
        user.setPassword("password");
        boolean result = userService.registerUser(user);
        assertTrue(result, "First registration should succeed");

        // Attempt duplicate registration
        User duplicate = new User();
        duplicate.setUsername("duplicateUser");
        duplicate.setPassword("anotherPassword");
        boolean duplicateResult = userService.registerUser(duplicate);
        assertFalse(duplicateResult, "Duplicate registration should fail");
    }

    /**
     * Tests successful user login.
     *
     * - Registers a user.
     * - Logs in with the correct credentials.
     * - Expects a non-null JWT token as a response.
     */
    @Test
    void testLoginSuccess() {
        // Register a new user first
        User user = new User();
        user.setUsername("loginSuccessUser");
        user.setPassword("mypassword");
        assertTrue(userService.registerUser(user), "User registration should succeed");

        // Verify login returns a token
        String token = userService.login("loginSuccessUser", "mypassword");
        assertNotNull(token, "Login should return a token when credentials are correct");
    }

    /**
     * Tests that login fails with an incorrect password.
     *
     * - Registers a user.
     * - Attempts to log in with an incorrect password.
     * - Expects login to return `null` (failure).
     */
    @Test
    void testLoginWrongPassword() {
        // Register a user
        User user = new User();
        user.setUsername("loginWrongUser");
        user.setPassword("mypassword");
        assertTrue(userService.registerUser(user), "User registration should succeed");

        // Attempt login with incorrect password
        String token = userService.login("loginWrongUser", "wrongpassword");
        assertNull(token, "Login should fail with incorrect password");
    }

    /**
     * Tests that login fails for a non-existent user.
     *
     * - Attempts to log in with a username that doesn't exist.
     * - Expects login to return `null` (failure).
     */
    @Test
    void testLoginNonExistentUser() {
        // Attempt to login with a non-existent user
        String token = userService.login("nonExistentUser", "password");
        assertNull(token, "Login should fail for a non-existent user");
    }
}
