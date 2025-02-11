package com.quickfolds.backend.user.service;

import com.quickfolds.backend.user.mapper.UserMapper;
import com.quickfolds.backend.user.model.JwtUtil;
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

    // 用户注册
    public boolean registerUser(User user) {
        if (userMapper.findByUsername(user.getUsername()) != null) {
            return false; // 用户名已存在
        }
        // 使用 BCrypt 加密密码（需引入 spring-security-core 或其他加密库）
        String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(hashedPassword);
        return userMapper.insertUser(user) > 0;
    }

    // 用户登录，验证密码后生成 JWT token
    public String login(String username, String rawPassword) {
        User user = userMapper.findByUsername(username);
        if (user != null && BCrypt.checkpw(rawPassword, user.getPassword())) {
            // 生成 JWT token（包含用户 id 和 username 等信息）
            return JwtUtil.generateToken(user);
        }
        return null;
    }

}
