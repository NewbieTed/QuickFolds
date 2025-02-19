package com.quickfolds.backend.user.mapper;

import com.quickfolds.backend.user.model.User;

import org.apache.ibatis.annotations.*;

/**
 * MyBatis Mapper interface for handling database operations related to users.
 *
 * - Provides methods to retrieve, insert, and manage user records.
 * - Uses MyBatis `@Mapper` annotation for SQL mapping.
 *
 * Dependencies:
 * - `User`: The database entity representing a user in the system.
 */
@Mapper
public interface UserMapper {
    /**
     * Retrieves a user from the database by their user ID.
     *
     * - Fetches all user details for a given user ID.
     *
     * @param userId The ID of the user to retrieve.
     * @return The `User` object corresponding to the given ID, or `null` if not found.
     */
    @Select("SELECT * FROM users WHERE id = #{id}")
    User selectById(@Param("userId") long userId);

    /**
     * Retrieves a user from the database by their username.
     *
     * - Used for authentication and user lookup operations.
     *
     * @param username The username of the user to retrieve.
     * @return The `User` object corresponding to the given username, or `null` if not found.
     */
    @Select("SELECT * FROM users WHERE username = #{username}")
    User findByUsername(String username);

    /**
     * Inserts a new user into the database.
     *
     * - Stores the username and hashed password.
     * - Uses MyBatis `@Options(useGeneratedKeys = true, keyProperty = "id")`
     *   to retrieve the generated primary key.
     *
     * @param user The `User` object containing the username and password.
     * @return The number of rows affected (should be `1` if insertion is successful).
     */
    @Insert("INSERT INTO users(username, password) VALUES(#{username}, #{password})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertUser(User user);
}
