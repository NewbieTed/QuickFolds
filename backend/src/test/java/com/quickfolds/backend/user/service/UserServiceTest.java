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

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest
@ActiveProfiles("local")
@Transactional      // Rollback after each test
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    @Test
    void testRegisterUserSuccess() {
        // Create a new user
        User user = new User();
        user.setUsername("testRegisterSuccess");
        user.setPassword("password");

        // Register the user
        boolean result = userService.registerUser(user);
        assertTrue(result, "User should be registered successfully");

        // Retrieve the user from the database and verify
        User dbUser = userMapper.findByUsername("testRegisterSuccess");
        assertNotNull(dbUser, "User should exist in the database");
        assertNotEquals("password", dbUser.getPassword(), "Password should be hashed");
        assertTrue(BCrypt.checkpw("password", dbUser.getPassword()), "Password hash should match the raw password");
    }

    @Test
    void testRegisterUserDuplicate() {
        // Register a new user
        User user = new User();
        user.setUsername("duplicateUser");
        user.setPassword("password");
        boolean result = userService.registerUser(user);
        assertTrue(result, "First registration should succeed");

        // Attempt to register another user with the same username
        User duplicate = new User();
        duplicate.setUsername("duplicateUser");
        duplicate.setPassword("anotherPassword");
        boolean duplicateResult = userService.registerUser(duplicate);
        assertFalse(duplicateResult, "Duplicate registration should fail");
    }

    @Test
    void testLoginSuccess() {
        // Register a new user first
        User user = new User();
        user.setUsername("loginSuccessUser");
        user.setPassword("mypassword");
        assertTrue(userService.registerUser(user), "User registration should succeed");

        // Attempt to login with correct credentials
        String token = userService.login("loginSuccessUser", "mypassword");
        assertNotNull(token, "Login should return a token when credentials are correct");
    }

    @Test
    void testLoginWrongPassword() {
        // Register a user
        User user = new User();
        user.setUsername("loginWrongUser");
        user.setPassword("mypassword");
        assertTrue(userService.registerUser(user), "User registration should succeed");

        // Attempt to login with an incorrect password
        String token = userService.login("loginWrongUser", "wrongpassword");
        assertNull(token, "Login should fail with incorrect password");
    }

    @Test
    void testLoginNonExistentUser() {
        // Attempt to login with a user that doesn't exist
        String token = userService.login("nonExistentUser", "password");
        assertNull(token, "Login should fail for a non-existent user");
    }
}
