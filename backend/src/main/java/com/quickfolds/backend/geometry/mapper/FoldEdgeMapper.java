package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.FoldEdge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

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


    Long getIdByFaceIdPair(@Param("face1Id") Long face1Id, @Param("face2Id") Long face2Id);

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


    int deleteByFaceIds(@Param("faceIds") List<Long> faceIds,
                        @Param("deletedStepId") long deletedStepId);

    /**
     * Retreives the ID in the specified face of a fold edge
     *
     * @param edgeId the specifc edge to get the id in face of.
     * @param faceId the face the edge is in.
     * @return the Integer value of the edge's id in face, or Null if could not be found.
     */
    Integer getEdgeIdInFace(@Param("edgeId") long edgeId, @Param("faceId") long faceId);
}