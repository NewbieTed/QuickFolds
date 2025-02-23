package com.quickfolds.backend.user.mapper;

import com.quickfolds.backend.user.model.User;
import org.apache.ibatis.annotations.*;

/**
 * MyBatis Mapper interface for handling database operations related to users.
 * <p>
 * This interface provides methods for retrieving, inserting, and managing user records
 * within the system. It utilizes MyBatis annotations for efficient SQL mapping.
 * <p>
 * Key functionalities:
 * <ul>
 *     <li>Retrieve user by ID or username</li>
 *     <li>Insert new user records</li>
 * </ul>
 * <p>
 * Dependencies:
 * - {@link User}: Represents the user entity in the database.
 */
@Mapper
public interface UserMapper {

    /**
     * Retrieves a user from the database by their user ID.
     * <p>
     * This method fetches all user details for a given user ID.
     * It returns the corresponding {@link User} entity or {@code null} if the user is not found.
     *
     * @param userId The ID of the user to retrieve.
     * @return The {@link User} object corresponding to the given ID, or {@code null} if not found.
     */
    @Select("SELECT * FROM users WHERE id = #{userId}")
    User selectById(@Param("userId") long userId);

    /**
     * Retrieves a user from the database by their username.
     * <p>
     * This method is commonly used for authentication and user lookup operations.
     * It returns the {@link User} entity associated with the provided username or {@code null} if not found.
     *
     * @param username The username of the user to retrieve.
     * @return The {@link User} object corresponding to the given username, or {@code null} if not found.
     */
    @Select("SELECT * FROM users WHERE username = #{username}")
    User findByUsername(@Param("username") String username);

    /**
     * Inserts a new user into the database.
     * <p>
     * This method stores a new user record with a username and a hashed password.
     * It uses the MyBatis `@Options` annotation to automatically retrieve the generated primary key.
     *
     * @param user The {@link User} object containing the username and password.
     * @return The number of rows affected by the insertion (should be {@code 1} if successful).
     */
    @Insert("INSERT INTO users(username, password) VALUES(#{username}, #{password})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertUser(User user);
}