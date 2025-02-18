package com.quickfolds.backend.user.service;

import com.quickfolds.backend.user.mapper.UserMapper;
import com.quickfolds.backend.user.auth.JwtUtil;
import com.quickfolds.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private UserMapper userMapper;

    private final JwtUtil jwtUtil;

    public boolean registerUser(User user) {
        if (userMapper.findByUsername(user.getUsername()) != null) {
            return false; // Username already exists
        }
        // Using BCrypt（from spring-security-core）
        String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(hashedPassword);
        return userMapper.insertUser(user) > 0;
    }

    public String login(String username, String rawPassword) {
        User user = userMapper.findByUsername(username);
        if (user != null && BCrypt.checkpw(rawPassword, user.getPassword())) {
            // Generate JWT if the password matches
            return jwtUtil.generateToken(user);
        }
        return null;
    }
}
