package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.AnnotatedPoint;
import com.quickfolds.backend.geometry.model.dto.AnnotatePoint;
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
     * formated as an {@link AnnotatePoint} object.
     *
     * @param stepId The specific step to get the annotated points of.
     * @return A list of {@link AnnotatePoint} objects representing an annotated point,
     * or an empty list if no annotated points were created in the given step.
     */
    List<AnnotatePoint> getAnnotatedPointsByStepIdForward(@Param("stepId") long stepId);

    /**
     * Retreives a list of annotated points deleted in a specific step
     * <p>
     * This method returns the details of each annotated point deleted in the given step,
     * formated as an {@link AnnotatePoint} object.
     *
     * @param stepId The specific step to get the annotated points of.
     * @return A list of {@link AnnotatePoint} objects representing an annotated point,
     * or an empty list if no annotated points were deleted in the given step.
     */
    List<AnnotatePoint> getAnnotatedPointsByStepIdBackward(@Param("stepId") long stepId);

    /**
     * Retreives the onEdgeIdInFace of an annotated point on a side edge
     *
     * @param edgeId the specifc edge to get the id in face of.
     * @return the Integer value of the edge's id in face, or Null if could not be found.
     */
    Integer getOnSideEdgeIdInFace(@Param("edgeId") long edgeId);

    /**
     * Retreives the onEdgeIdInFace of an annotated point on a fold edge
     *
     * @param edgeId the specifc edge to get the id in face of.
     * @param faceId the face the edge is in.
     * @return the Integer value of the edge's id in face, or Null if could not be found.
     */
    Integer getOnFoldEdgeIdInFace(@Param("edgeId") long edgeId, @Param("faceId") long faceId);
}