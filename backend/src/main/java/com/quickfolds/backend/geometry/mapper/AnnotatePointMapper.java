package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.AnnotatedPoint;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling database operations related to annotated points in an origami model.
 *
 * - Provides methods for inserting annotated points.
 * - Uses MyBatis `@Mapper` for SQL mapping.
 *
 * Dependencies:
 * - `AnnotatedPoint`: The database entity representing an annotated point.
 */
@Mapper
public interface AnnotatePointMapper {
    /**
     * Inserts a new annotated point into the database.
     *
     * - Adds an annotation at a specific location within an origami face.
     * - Requires a valid `AnnotatedPoint` object with appropriate attributes.
     *
     * @param annotatedPoint The `AnnotatedPoint` entity representing the annotation.
     */
    void addByObj(@Param("annotatedPoint") AnnotatedPoint annotatedPoint);

    void deleteMultipleByIdInFace(@Param("faceId") long faceId,
                                  @Param("idInFace") List<Integer> idsInFace,
                                  @Param("deletedStepId") long deletedStepId);
}
