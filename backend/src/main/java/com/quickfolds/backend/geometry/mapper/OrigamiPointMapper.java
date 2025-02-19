package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.OrigamiPoint;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling database operations related to origami points.
 *
 * - Provides methods for retrieving, inserting, and deleting points within an origami face.
 * - Uses MyBatis `@Mapper` annotation for SQL mapping.
 *
 * Dependencies:
 * - `OrigamiPoint`: The database entity representing a point in the origami model.
 */
@Mapper
public interface OrigamiPointMapper {

    /**
     * Retrieves the database ID of a point using its position within a face.
     *
     * - Each point within a face has a unique `idInFace` identifier.
     * - Used to map logical point identifiers to actual database records.
     *
     * @param faceId The ID of the face containing the point.
     * @param idInFace The identifier of the point within the face.
     * @return The database ID of the corresponding origami point, or `null` if not found.
     */
    Long getIdByIdInFace(@Param("faceId") long faceId, @Param("idInFace") int idInFace);

    /**
     * Retrieves the database IDs of multiple points within a specific face.
     *
     * - Used to efficiently map multiple logical point identifiers to database records.
     *
     * @param faceId The ID of the face containing the points.
     * @param idsInFace A list of point identifiers within the face.
     * @return A list of database IDs corresponding to the requested points.
     */
    List<Long> getIdsByIdInFace(@Param("faceId") long faceId, @Param("idsInFace") List<Integer> idsInFace);

    /**
     * Inserts a new origami point into the database.
     *
     * - Uses MyBatis parameter binding to pass the `OrigamiPoint` entity.
     * - Returns the generated primary key after insertion.
     *
     * @param origamiPoint The `OrigamiPoint` entity to be inserted.
     * @return The generated database ID of the newly inserted origami point.
     */
    void addByObj(@Param("origamiPoint") OrigamiPoint origamiPoint);

    /**
     * Deletes multiple origami points within a face.
     *
     * - Removes points based on their `idInFace` values.
     * - Used when reverting steps or cleaning up deleted faces.
     *
     * @param faceId The ID of the face containing the points to delete.
     * @param idsInFace A list of identifiers of the points within the face.
     * @param deletedStepId The step ID associated with the deletion (for tracking history).
     * @return The number of rows affected by the delete operation.
     */
    int deleteMultipleByIdInFace(@Param("faceId") long faceId,
                                 @Param("idsInFace") List<Integer> idsInFace,
                                 @Param("deletedStepId") long deletedStepId);

}
