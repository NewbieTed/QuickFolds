package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.OrigamiPoint;
import com.quickfolds.backend.geometry.model.dto.response.VertexResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling database operations related to origami points.
 * <p>
 * This interface provides methods for retrieving, inserting, and deleting points within an origami model.
 * It ensures accurate mapping between Java objects and database records using MyBatis annotations.
 * <p>
 * Dependencies:
 * - {@link OrigamiPoint}: Represents a point entity in the origami model.
 */
@Mapper
public interface OrigamiPointMapper {

    /**
     * Retrieves the database ID of a point using its position within a face.
     * <p>
     * This method returns the unique database ID of an origami point based on its face ID
     * and its identifier within the face (`idInFace`).
     *
     * @param faceId The ID of the face containing the point.
     * @param idInFace The unique identifier of the point within the face.
     * @return The database ID of the corresponding origami point, or {@code null} if not found.
     */
    Long getIdByIdInFace(@Param("faceId") long faceId, @Param("idInFace") int idInFace);

    /**
     * Retrieves the database IDs of multiple points within a specific face.
     * <p>
     * This method returns the unique database IDs of origami points based on their identifiers
     * within a face, ensuring efficient mapping of multiple logical IDs to database records.
     *
     * @param faceId The ID of the face containing the points.
     * @param idsInFace A list of unique identifiers of points within the face.
     * @return A list of database IDs corresponding to the requested points, or an empty list if none are found.
     */
    List<Long> getIdsByIdsInFace(@Param("faceId") long faceId, @Param("idsInFace") List<Integer> idsInFace);

    /**
     * Retrieves the database IDs of points based on their type and unique identifiers.
     * <p>
     * This method filters the `OrigamiPoint` table using the specified point type and the provided list of IDs,
     * returning only the IDs that exist in the database for the given type.
     *
     * @param pointTypeId The ID of the point type to filter by.
     * @param ids The list of unique point IDs to search for.
     * @return A list of matching point IDs from the database, or an empty list if none are found.
     */
    List<Long> getIdsOfPointTypeByIds(@Param("pointTypeId") long pointTypeId, @Param("ids") List<Long> ids);

    /**
     * Inserts a new origami point into the database.
     * <p>
     * This method adds an {@link OrigamiPoint} entity to the database, representing
     * a point associated with a specific face and folding step.
     *
     * @param origamiPoint The {@link OrigamiPoint} entity representing the new point to be inserted.
     */
    void addByObj(@Param("origamiPoint") OrigamiPoint origamiPoint);


    int deleteByFaceIds(@Param("faceIds") List<Long> faceIds,
                        @Param("deletedStepId") long deletedStepId);

    /**
     * Deletes multiple origami points within a specific face.
     * <p>
     * This method removes origami points based on their `idInFace` values,
     * typically used when reverting steps or cleaning up deleted faces.
     *
     * @param faceId The ID of the face containing the points to delete.
     * @param idsInFace A list of unique identifiers for the points within the face.
     * @param deletedStepId The step ID associated with the deletion for tracking purposes.
     * @return The number of rows affected by the delete operation.
     */
    int deleteByIdsInFace(@Param("faceId") long faceId,
                          @Param("idsInFace") List<Integer> idsInFace,
                          @Param("deletedStepId") long deletedStepId);


    /**
     * Gets all vertices for a specific face
     *
     * @param faceId The ID of the face
     * @return List of vertex responses with coordinates
     */
    List<VertexResponse> getVerticesByFaceId(@Param("faceId") Long faceId);
}