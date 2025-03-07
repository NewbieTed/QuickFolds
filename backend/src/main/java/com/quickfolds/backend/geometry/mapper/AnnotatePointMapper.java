package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.AnnotatedPoint;
import com.quickfolds.backend.geometry.model.dto.request.AnnotatePointRequest;
import com.quickfolds.backend.geometry.model.dto.DeletedIdInFace;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling database operations related to annotated points in an origami model.
 * <p>
 * This interface provides methods for inserting and managing annotated points within
 * an origami face, ensuring proper mapping between Java objects and database records.
 * <p>
 * Dependencies:
 * - {@link AnnotatedPoint}: Represents the database entity for annotated points.
 */
@Mapper
public interface AnnotatePointMapper {

    /**
     * Inserts a new annotated point into the database.
     * <p>
     * This method adds an annotation at a specific location within an origami face.
     * It requires a valid {@link AnnotatedPoint} object with appropriate attributes.
     * The annotated point typically includes coordinates and other metadata
     * necessary for rendering or further processing.
     *
     * @param annotatedPoint The {@link AnnotatedPoint} entity representing the annotation.
     */
    void addByObj(@Param("annotatedPoint") AnnotatedPoint annotatedPoint);

    /**
     * Retreives a list of annotated points created in a specific step
     * <p>
     * This method returns the details of each annotated point created in the given step,
     * formated as an {@link AnnotatePointRequest} object.
     *
     * @param stepId The specific step to get the annotated points of.
     * @return A list of {@link AnnotatePointRequest} objects representing an annotated point,
     * or an empty list if no annotated points were created in the given step.
     */
    List<AnnotatePointRequest> getAnnotatedPointsByStepIdForward(@Param("stepId") long stepId);

    /**
     * Retreives a list of annotated points deleted in a specific step
     * <p>
     * This method returns the details of each annotated point deleted in the given step,
     * formated as an {@link AnnotatePointRequest} object.
     *
     * @param stepId The specific step to get the annotated points of.
     * @return A list of {@link AnnotatePointRequest} objects representing an annotated point,
     * or an empty list if no annotated points were deleted in the given step.
     */
    List<AnnotatePointRequest> getAnnotatedPointsByStepIdBackward(@Param("stepId") long stepId);

    /**
     * Retreives a list of IDs corresponding to annotated points deleted in a specific step.
     *
     * @param stepId the specific step to get the deleted points of.
     * @return a list of {@link DeletedIdInFace} objects representing a deleted ID,
     * or an empty list if no annotated points were deleted in the given step
     */
    List<DeletedIdInFace> getDeleteAnnotatedPointsByStepIdForward(@Param("stepId") long stepId);

    /**
     * Retreives a list of IDs corresponding to annotated points created in a specific step.
     *
     * @param stepId the specific step to get the created points of.
     * @return a list of {@link DeletedIdInFace} objects representing a created ID,
     * or an empty list if no annotated points were created in the given step
     */
    List<DeletedIdInFace> getDeleteAnnotatedPointsByStepIdBackward(@Param("stepId") long stepId);
}