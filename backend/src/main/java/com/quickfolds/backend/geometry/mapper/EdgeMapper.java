package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.Edge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to edges in an origami model.
 * <p>
 * - Provides methods to insert, retrieve, and manage edges within an origami face.
 * - Uses MyBatis `@Mapper` annotation for SQL mapping.
 * <p>
 * Dependencies:
 * - `Edge`: The database entity representing an edge in the origami model.
 */
@Mapper
public interface EdgeMapper {
    /**
     * Retrieves the most recently added edge ID for a given step.
     * <p>
     * - Useful for tracking the last inserted edge in a particular step.
     *
     * @param stepId The ID of the step for which to retrieve the most recent edge.
     * @return The database ID of the most recently inserted edge.
     */
    Long getMostRecentId(@Param("stepId") long stepId);

    /**
     * Retrieves the database ID of an edge using its position within a face.
     * <p>
     * - Each edge within a face has a unique `idInFace` identifier.
     *
     * @param faceId The ID of the face containing the edge.
     * @param idInFace The identifier of the edge within the face.
     * @return The database ID of the corresponding edge.
     */
    Long getIdByIdInFace(@Param("faceId") long faceId, @Param("idInFace") int idInFace);

    /**
     * Inserts a new edge into the database.
     * <p>
     * - Returns the generated primary key after insertion.
     *   to retrieve the generated key.
     *
     * @param edge The `Edge` entity to be inserted.
     * @return The generated database ID of the newly inserted edge.
     */
    Long addByObj(@Param("edge") Edge edge);
}
