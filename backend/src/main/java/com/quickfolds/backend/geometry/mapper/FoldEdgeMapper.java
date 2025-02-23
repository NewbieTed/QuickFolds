package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.FoldEdge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to fold edges in an origami model.
 * <p>
 * This interface provides methods for inserting fold edges, ensuring that the connection
 * between folded faces is properly recorded in the database.
 * <p>
 * Dependencies:
 * - {@link FoldEdge}: Represents the database entity for a fold edge between two origami faces.
 */
@Mapper
public interface FoldEdgeMapper {

    /**
     * Inserts a new fold edge into the database.
     * <p>
     * This method adds a fold edge that represents the connection between two origami faces
     * along a fold line. It returns the generated primary key after insertion.
     * <p>
     * The fold edge captures the relationship between two faces created as a result of a folding operation,
     * ensuring the geometric integrity of the origami structure.
     *
     * @param foldEdge The {@link FoldEdge} entity representing the fold connection between two faces.
     * @return The generated database ID of the newly inserted fold edge.
     */
    Long addByObj(@Param("foldEdge") FoldEdge foldEdge);
}