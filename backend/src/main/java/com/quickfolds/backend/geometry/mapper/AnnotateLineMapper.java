package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.AnnotatedLine;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling operations related to annotated lines in an origami model.
 *
 * - Provides methods for retrieving, inserting, and deleting annotated lines.
 * - Uses MyBatis `@Mapper` for SQL mapping.
 * - Supports batch operations for efficient data handling.
 *
 * Dependencies:
 * - `AnnotatedLine`: The database entity representing an annotated line.
 */
@Mapper
public interface AnnotateLineMapper {
    /**
     * Retrieves a list of database IDs for annotated lines within a given face.
     *
     * @param faceId The ID of the face containing the annotated lines.
     * @param idsInFace A list of annotated line identifiers within the face.
     * @return A list of database IDs corresponding to the requested annotated lines.
     */
    List<Long> getsIdsByIdInFace(@Param("faceId") long faceId, @Param("idsInFace") List<Integer> idsInFace);

    /**
     * Retrieves a list of annotated line IDs that are dependent on specific points.
     *
     * @param faceId The ID of the face containing the annotations.
     * @param pointIds A list of point IDs that annotated lines depend on.
     * @return A list of dependent annotated line IDs.
     */
    List<Long> getDependentIds(@Param("faceId") long faceId, @Param("pointIds") List<Long> pointIds);

    /**
     * Inserts a new annotated line into the database.
     *
     * @param annotatedLine The `AnnotatedLine` object representing the new annotation.
     */
    void addByObj(@Param("annotatedLine") AnnotatedLine annotatedLine);

    /**
     * Deletes an annotated line by its database ID.
     *
     * @param annotateLineId The database ID of the annotated line to be deleted.
     */
    void deleteById(@Param("annotateLineId") long annotateLineId);

    /**
     * Deletes multiple annotated lines by their database IDs.
     *
     * @param annotateLineIds A list of database IDs representing the annotated lines to be deleted.
     */
    void deleteMultipleById(@Param("annotateLineIds") List<Long> annotateLineIds);

    /**
     * Deletes an annotated line based on its position within a face.
     *
     * @param faceId The ID of the face containing the annotated line.
     * @param idInFace The identifier of the annotated line within the face.
     */
    void deleteByIdInFace(@Param("faceId") long faceId, @Param("idInFace") int idInFace);

    /**
     * Deletes multiple annotated lines within a face, linked to a specific step ID.
     *
     * @param faceId The ID of the face containing the annotated lines.
     * @param idsInFace A list of identifiers of the annotated lines within the face.
     * @param deletedStepId The step ID associated with the deleted annotations.
     * @return The number of rows affected by the delete operation.
     */
    int deleteMultipleByIdInFace(@Param("faceId") long faceId,
                                  @Param("idsInFace") List<Integer> idsInFace,
                                  @Param("deletedStepId") long deletedStepId);

}
