package com.quickfolds.backend.user.service;

import com.quickfolds.backend.user.mapper.UserMapper;
import com.quickfolds.backend.user.auth.JwtUtil;
import com.quickfolds.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

/**
 * Service class responsible for managing user authentication and registration.
 * This class provides methods for user registration and login, handling password
 * encryption and JWT token generation.
 *
 * Dependencies:
 * - UserMapper: Interacts with the database to retrieve and store user information.
 * - JwtUtil: Handles JSON Web Token (JWT) generation for authentication.
 *
 * Security:
 * - Uses BCrypt for secure password hashing.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    // Mapper for handling database operations related to users.
    private final UserMapper userMapper;

    // Utility for generating and validating JWT tokens.
    private final JwtUtil jwtUtil;

    /**
     * Registers a new user in the system.
     *
     * - Checks if the username is already taken.
     * - Hashes the password using BCrypt before storing it in the database.
     *
     * @param user The user object containing username and password.
     * @return true if registration is successful, false if the username already exists.
     */
    public boolean registerUser(User user) {
        // Check if the username is already in use.
        if (userMapper.findByUsername(user.getUsername()) != null) {
            return false; // Username already exists
        }

        // Hash the password using BCrypt for security.
        String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(hashedPassword);

        // Insert user into the database and return success status.
        return userMapper.insertUser(user) > 0;
    }


    /**
     * Authenticates a user by verifying their password and generates a JWT token upon success.
     *
     * - Retrieves the user by username.
     * - Compares the raw password with the stored hashed password using BCrypt.
     * - If authentication is successful, generates and returns a JWT token.
     *
     * @param username The username of the user attempting to log in.
     * @param rawPassword The plaintext password provided by the user.
     * @return A JWT token if authentication is successful, null otherwise.
     */
    public String login(String username, String rawPassword) {
        // Retrieve the user record from the database.
        User user = userMapper.findByUsername(username);

        // Verify the provided password against the stored hash.
        if (user != null && BCrypt.checkpw(rawPassword, user.getPassword())) {
            // Generate and return a JWT token for authentication.
            return jwtUtil.generateToken(user);
        }

        // Return null if authentication fails.
        return null;
    }

}
