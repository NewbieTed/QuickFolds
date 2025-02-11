package com.quickfolds.backend.user.mapper;

import com.quickfolds.backend.user.model.User;

import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {
//    User selectById(@Param("problemId") long userId);
    @Select("SELECT * FROM users WHERE username = #{username}")
    User findByUsername(String username);

    @Insert("INSERT INTO users(username, password) VALUES(#{username}, #{password})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertUser(User user);
}
