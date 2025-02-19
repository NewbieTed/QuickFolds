package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.Step;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to steps in an origami model.
 *
 * - Provides methods for inserting and retrieving steps.
 * - Uses MyBatis `@Mapper` annotation for SQL mapping.
 *
 * Dependencies:
 * - `Step`: The database entity representing a step in the origami model.
 */
@Mapper
public interface StepMapper {
    /**
     * Retrieves the database ID of a step using its identifier within a specific origami model.
     *
     * - Each step in an origami structure has a unique `idInOrigami`.
     * - Ensures that operations reference the correct step in the database.
     *
     * @param origamiId The ID of the origami model containing the step.
     * @param idInOrigami The unique identifier of the step within the origami model.
     * @return The database ID of the corresponding step, or `null` if not found.
     */
    Long getIdByIdInOrigami(@Param("origamiId") Long origamiId, @Param("idInOrigami") int idInOrigami);

    /**
     * Inserts a new step into the database.
     *
     * - Uses MyBatis parameter binding to pass the `Step` entity.
     * - Returns the generated primary key after insertion.
     *
     * @param step The `Step` entity representing the new step to be inserted.
     * @return The generated database ID of the newly inserted step.
     */
    Long addByObj(@Param("step")Step step);

    /**
     * Inserts a new step into the database using individual field values.
     *
     * - Allows direct field-based insertion without requiring a `Step` object.
     * - Returns the generated primary key after insertion.
     *
     * @param origamiId The ID of the origami model associated with the step.
     * @param stepTypeId The type of step being inserted.
     * @param idInOrigami The identifier of the step within the origami model.
     * @param createdBy The user who created the step.
     * @param updatedBy The user who last updated the step.
     * @return The generated database ID of the newly inserted step.
     */
    Long addByFields(@Param("origamiId") long origamiId,
                     @Param("stepType") long stepTypeId,
                     @Param("idInOrigami") int idInOrigami,
                     @Param("createdBy") String createdBy,
                     @Param("updatedBy") String updatedBy);

}
