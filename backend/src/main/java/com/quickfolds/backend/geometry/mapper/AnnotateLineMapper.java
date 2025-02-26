package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.AnnotatedLine;
import com.quickfolds.backend.geometry.model.dto.response.LineAnnotationResponse;
import com.quickfolds.backend.geometry.model.dto.DeletedIdInFace;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling operations related to annotated lines in an origami model.
 * <p>
 * This interface provides methods for retrieving, inserting, and deleting annotated lines within a specific face.
 * It supports batch operations for efficient data handling and ensures accurate mapping between
 * Java objects and database records using MyBatis.
 * <p>
 * Dependencies:
 * - {@link AnnotatedLine}: Represents an annotated line entity in the database.
 */
@Mapper
public interface AnnotateLineMapper {

    /**
     * Retrieves a list of database IDs for annotated lines within a given face.
     * <p>
     * This method returns the unique database IDs of annotated lines based on their identifiers
     * within a specific face, ensuring accurate data retrieval for further processing.
     *
     * @param faceId The ID of the face containing the annotated lines.
     * @param idsInFace A list of unique identifiers for annotated lines within the face.
     * @return A list of database IDs corresponding to the requested annotated lines, or an empty list if none are found.
     */
    List<Long> getIdsByIdsInFace(@Param("faceId") long faceId, @Param("idsInFace") List<Integer> idsInFace);

    /**
     * Retrieves a list of annotated line IDs that are dependent on specific points.
     * <p>
     * This method identifies annotated lines within a face that rely on the provided point IDs,
     * typically for deletion or update operations.
     *
     * @param faceId The ID of the face containing the annotations.
     * @param pointIds A list of point IDs that annotated lines depend on.
     * @return A list of dependent annotated line IDs, or an empty list if none are found.
     */
    List<Long> getDependentIds(@Param("faceId") long faceId, @Param("pointIds") List<Long> pointIds);

    /**
     * Inserts a new annotated line into the database.
     * <p>
     * This method adds an {@link AnnotatedLine} entity to the database, representing
     * an annotation linked to a specific origami face and step.
     *
     * @param annotatedLine The {@link AnnotatedLine} object representing the new annotation.
     */
    void addByObj(@Param("annotatedLine") AnnotatedLine annotatedLine);

    /**
     * Deletes an annotated line by its database ID.
     * <p>
     * This method removes a specific annotated line from the database using its unique identifier.
     *
     * @param annotateLineId The database ID of the annotated line to be deleted.
     */
    void deleteById(@Param("annotateLineId") long annotateLineId);

    /**
     * Deletes multiple annotated lines by their database IDs.
     * <p>
     * This method performs a batch deletion of annotated lines using their unique database IDs,
     * ensuring efficient data cleanup.
     *
     * @param annotateLineIds A list of database IDs representing the annotated lines to be deleted.
     */
    void deleteByIds(@Param("annotateLineIds") List<Long> annotateLineIds);

    /**
     * Deletes an annotated line based on its position within a face.
     * <p>
     * This method removes an annotated line using its unique identifier within the context
     * of a specific face, rather than its database ID.
     *
     * @param faceId The ID of the face containing the annotated line.
     * @param idInFace The unique identifier of the annotated line within the face.
     */
    void deleteByIdInFace(@Param("faceId") long faceId, @Param("idInFace") int idInFace);

    /**
     * Deletes multiple annotated lines within a face, linked to a specific step ID.
     * <p>
     * This method deletes annotated lines identified by their in-face IDs while associating
     * the deletion with a specific step in the origami process.
     *
     * @param faceId The ID of the face containing the annotated lines.
     * @param idsInFace A list of unique identifiers for the annotated lines within the face.
     * @param deletedStepId The step ID associated with the deletion of annotations.
     * @return The number of rows affected by the delete operation.
     */
    int deleteByIdsInFace(@Param("faceId") long faceId,
                          @Param("idsInFace") List<Integer> idsInFace,
                          @Param("deletedStepId") long deletedStepId);


    int deleteByFaceIds(@Param("faceIds") List<Long> faceIds,
                        @Param("deletedStepId") long deletedStepId);

    /**
     * Retreives a list of annotated lines created in a specific step
     * <p>
     * This method returns the details of each annotated line created in the given step,
     * formated as an {@link LineAnnotationResponse} object.
     *
     * @param stepId The specific step to get the annotated points of.
     * @return A list of {@link LineAnnotationResponse} objects representing an annotated point,
     * or an empty list if no annotated points were created in the given step.
     */
    List<LineAnnotationResponse> getAnnotatedLinesByStepIdForward(@Param("stepId") long stepId);

    /**
     * Retreives a list of annotated lines deleted in a specific step
     * <p>
     * This method returns the details of each annotated line deleted in the given step,
     * formated as an {@link LineAnnotationResponse} object.
     *
     * @param stepId The specific step to get the annotated points of.
     * @return A list of {@link LineAnnotationResponse} objects representing an annotated point,
     * or an empty list if no annotated points were deleted in the given step.
     */
    List<LineAnnotationResponse> getAnnotatedLinesByStepIdBackward(@Param("stepId") long stepId);

    /**
     * Retreives a list of IDs corresponding to annotated lines deleted in a specific step.
     *
     * @param stepId the specific step to get the deleted lines of.
     * @return a list of {@link DeletedIdInFace} objects representing a deleted ID,
     * or an empty list if no annotated lines were deleted in the given step
     */
    List<DeletedIdInFace> getDeleteAnnotatedLinesByStepIdForward(@Param("stepId") long stepId);

    /**
     * Retreives a list of IDs corresponding to annotated lines created in a specific step.
     *
     * @param stepId the specific step to get the created lines of.
     * @return a list of {@link DeletedIdInFace} objects representing a created ID,
     * or an empty list if no annotated lines were created in the given step
     */
    List<DeletedIdInFace> getDeleteAnnotatedLinesByStepIdBackward(@Param("stepId") long stepId);
}