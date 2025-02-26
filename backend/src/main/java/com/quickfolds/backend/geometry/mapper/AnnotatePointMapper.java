package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.AnnotatedPoint;
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
}