package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.Face;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling database operations related to faces in an origami model.
 * <p>
 * - Provides methods for retrieving and inserting face records.
 * - Uses MyBatis `@Mapper` annotation for SQL mapping.
 * <p>
 * Dependencies:
 * - `Face`: The database entity representing a face in the origami model.
 */
@Mapper
public interface FaceMapper {
    /**
     * Retrieves the database ID of a face using its identifier within a specific origami model.
     * <p>
     * - Each face in an origami structure has a unique `faceIdInOrigami`.
     * - This method ensures that operations reference the correct database record.
     *
     * @param origamiId The ID of the origami model containing the face.
     * @param faceIdInOrigami The unique identifier of the face within the origami model.
     * @return The database ID of the corresponding face, or `null` if not found.
     */
    Long getIdByFaceIdInOrigami(@Param("origamiId") long origamiId,
                                @Param("faceIdInOrigami") int faceIdInOrigami);


    /**
     * Retrieves a list of database IDs for faces within a given origami.
     *
     * @param origamiId The ID of the origami containing the annotated lines.
     * @param idsInOrigami A list of annotated line identifiers within the face.
     * @return A list of database IDs corresponding to the requested faces.
     */
    List<Long> getIdsByIdsInFace(@Param("origamiId") long origamiId, @Param("idsInOrigami") List<Integer> idsInOrigami);


    /**
     * Inserts a new face into the database.
     * <p>
     * - Adds a face record associated with a specific origami model.
     * - Uses MyBatis parameter binding to pass the `Face` entity.
     *
     * @param face The `Face` entity representing the new face to be inserted.
     */
    void addByObj(@Param("face") Face face);


    /**
     * Deletes multiple faces within an origami, linked to a specific step ID.
     *
     * @param ids A list of database IDs of the faces.
     * @param deletedStepId The step ID associated with the deleted faces.
     * @return The number of rows affected by the delete operation.
     */
    int deleteByIds(@Param("ids") List<Long> ids,
                    @Param("deletedStepId") long deletedStepId);
}
