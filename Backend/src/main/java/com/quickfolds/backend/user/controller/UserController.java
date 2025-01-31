package com.quickfolds.backend.user.controller;


import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.user.mapper.UserMapper;
import com.quickfolds.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/problem")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;


    @GetMapping("/getUser")
    public BaseResponse<Boolean> verifyAnswer(@RequestBody String request) {

        return BaseResponse.success();
    }
}
