package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.Face;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis Mapper interface for handling database operations related to faces in an origami model.
 * <p>
 * This interface provides methods for retrieving, inserting, and deleting face records
 * while ensuring efficient database operations using MyBatis annotations.
 * <p>
 * Dependencies:
 * - {@link Face}: The database entity representing a face in the origami model.
 */
@Mapper
public interface FaceMapper {

    /**
     * Retrieves the database ID of a face using its identifier within a specific origami model.
     * <p>
     * This method returns the unique database ID of a face based on its logical identifier (`faceIdInOrigami`)
     * within a specific origami model. It ensures that operations reference the correct database record.
     *
     * @param origamiId The ID of the origami model containing the face.
     * @param faceIdInOrigami The unique identifier of the face within the origami model.
     * @return The database ID of the corresponding face, or {@code null} if not found.
     */
    Long getIdByFaceIdInOrigami(@Param("origamiId") long origamiId,
                                @Param("faceIdInOrigami") int faceIdInOrigami);

    /**
     * Retrieves a list of database IDs for faces within a given origami model.
     * <p>
     * This method returns a list of unique database IDs corresponding to faces identified
     * by their logical IDs (`idsInOrigami`) within a specific origami model.
     *
     * @param origamiId The ID of the origami model containing the faces.
     * @param idsInOrigami A list of unique face identifiers within the origami model.
     * @return A list of database IDs corresponding to the requested faces, or an empty list if none are found.
     */
    List<Long> getIdsByIdsInFace(@Param("origamiId") long origamiId,
                                 @Param("idsInOrigami") List<Integer> idsInOrigami);

    /**
     * Inserts a new face into the database.
     * <p>
     * This method adds a {@link Face} entity representing a new face associated with a specific origami model.
     * The face record is linked to the model and can be further manipulated in subsequent folding steps.
     *
     * @param face The {@link Face} entity representing the new face to be inserted.
     */
    void addByObj(@Param("face") Face face);


    /**
     * Deletes multiple faces within an origami model, linked to a specific step ID.
     * <p>
     * This method performs a logical deletion by marking a face as deleted, associating them with a deletion step.
     * The historical context is retained for potential rollback or auditing purposes.
     *
     * @param id A database ID representing the face to be deleted.
     * @param deletedStepId The ID of the step associated with the deletion operation.
     * @return The number of rows affected by the delete operation.
     */
    int deleteById(@Param("ids") long id,
                    @Param("deletedStepId") long deletedStepId);

    /**
     * Deletes multiple faces within an origami model, linked to a specific step ID.
     * <p>
     * This method performs a logical deletion by marking faces as deleted, associating them with a deletion step.
     * The historical context is retained for potential rollback or auditing purposes.
     *
     * @param ids A list of database IDs representing the faces to be deleted.
     * @param deletedStepId The ID of the step associated with the deletion operation.
     * @return The number of rows affected by the delete operation.
     */
    int deleteByIds(@Param("ids") List<Long> ids,
                    @Param("deletedStepId") long deletedStepId);
}