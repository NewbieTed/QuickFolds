package com.quickfolds.backend.origami.mapper;

import com.quickfolds.backend.origami.model.database.Origami;
import com.quickfolds.backend.origami.model.dto.response.OrigamiResponse;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling database operations related to origami models.
 *
 * - Provides methods for inserting and retrieving origami models.
 * - Uses MyBatis `@Mapper` annotation for SQL mapping.
 *
 * Dependencies:
 * - `Origami`: The database entity representing an origami model.
 * - `OrigamiResponse`: The DTO used for returning public origami details.
 */
@Mapper
public interface OrigamiMapper {
    /**
     * Retrieves the database ID of the most recently created origami model by a specific user.
     *
     * - Helps track the latest origami created by a user.
     *
     * @param userId The ID of the user who created the origami.
     * @return The database ID of the most recently created origami model, or `null` if none exist.
     */
    Long getMostRecentId(@Param("userId") Long userId);

    /**
     * Retrieves a list of IDs for all publicly available origami models.
     *
     * - Used to fetch publicly shared origami without exposing full details.
     *
     * @return A list of origami model IDs that are publicly accessible.
     */
    List<Long> getPublicOrigamiIds();

    /**
     * Retrieves a list of public origami models with detailed information.
     *
     * - Returns origami data formatted as `OrigamiResponse` objects.
     *
     * @return A list of public origami models with metadata.
     */
    List<OrigamiResponse> getPublicOrigamis();

    /**
     * Inserts a new origami model into the database.
     *
     * - Uses MyBatis parameter binding to pass the `Origami` entity.
     *
     * @param origami The `Origami` entity representing the new origami model.
     */
    void addByObj(@Param("origami") Origami origami);
}
