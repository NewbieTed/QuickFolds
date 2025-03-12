package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.Edge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling database operations related to edges in an origami model.
 * <p>
 * This interface provides methods to insert, retrieve, and manage edges within an origami face,
 * ensuring efficient database operations using MyBatis annotations.
 * <p>
 * Dependencies:
 * - {@link Edge}: The database entity representing an edge in the origami model.
 */
@Mapper
public interface EdgeMapper {

    /**
     * Retrieves the most recently added edge ID for a given step.
     * <p>
     * This method returns the database ID of the last inserted edge associated with a specific folding step.
     * It is useful for tracking newly created edges and ensuring accurate step-by-step folding operations.
     *
     * @param stepId The ID of the step for which to retrieve the most recent edge.
     * @return The database ID of the most recently inserted edge, or {@code null} if none exists.
     */
    Long getMostRecentId(@Param("stepId") long stepId);


    List<Long> getIdsByFaceIds(@Param("faceIds") List<Long> faceIds);

    /**
     * Retrieves the database ID of an edge using its position within a face.
     * <p>
     * This method returns the unique database ID of an edge based on its `idInFace` within a specific origami face.
     * It facilitates edge identification for origami model operations, such as folding and face manipulation.
     *
     * @param faceId   The ID of the face containing the edge.
     * @param idInFace The unique identifier of the edge within the face.
     * @return The database ID of the corresponding edge, or {@code null} if not found.
     */
    Long getIdByIdInFace(@Param("faceId") long faceId, @Param("idInFace") int idInFace);

    /**
     * Inserts a new edge into the database.
     * <p>
     * This method adds an {@link Edge} entity representing a side or fold edge within an origami face.
     * After insertion, it returns the generated primary key for further reference.
     *
     * @param edge The {@link Edge} entity to be inserted into the database.
     * @return The generated database ID of the newly inserted edge.
     */
    Long addByObj(@Param("edge") Edge edge);

    int deleteById(@Param("id") Long id,
                   @Param("deletedStepId") long deletedStepId);

    int deleteByIds(@Param("ids") List<Long> ids,
                    @Param("deletedStepId") long deletedStepId);

}