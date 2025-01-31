package com.quickfolds.backend.user.service;

import com.quickfolds.backend.user.mapper.UserMapper;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

}
