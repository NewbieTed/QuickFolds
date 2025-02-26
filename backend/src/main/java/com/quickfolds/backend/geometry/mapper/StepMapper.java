package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.Step;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to steps in an origami model.
 * <p>
 * This interface provides methods for inserting and retrieving steps within an origami structure.
 * Each step represents a folding action or a defined stage in the origami process.
 * <p>
 * Dependencies:
 * - {@link Step}: Represents a step entity in the database.
 */
@Mapper
public interface StepMapper {

    /**
     * Retrieves the database ID of a step using its identifier within a specific origami model.
     * <p>
     * This method returns the unique database ID of a step based on its logical identifier (`idInOrigami`)
     * and the associated origami model ID, ensuring accurate identification of individual steps.
     *
     * @param origamiId The ID of the origami model containing the step.
     * @param idInOrigami The unique identifier of the step within the origami model.
     * @return The database ID of the corresponding step, or {@code null} if not found.
     */
    Long getIdByIdInOrigami(@Param("origamiId") Long origamiId, @Param("idInOrigami") int idInOrigami);

    /**
     * Inserts a new step into the database.
     * <p>
     * This method adds a {@link Step} entity to the database, representing a specific folding
     * action or milestone in the origami process. The primary key of the newly inserted record
     * is returned after successful insertion.
     *
     * @param step The {@link Step} entity representing the new step to be inserted.
     * @return The generated database ID of the newly inserted step.
     */
    Long addByObj(@Param("step") Step step);

    /**
     * Inserts a new step into the database using individual field values.
     * <p>
     * This method allows step insertion by specifying individual fields rather than passing
     * an entire {@link Step} object. This approach is useful for simplified operations where
     * the complete entity is not required.
     *
     * @param origamiId The ID of the origami model associated with the step.
     * @param stepTypeId The type of step being inserted, referencing the step type entity.
     * @param idInOrigami The logical identifier of the step within the origami model.
     * @param createdBy The user who created the step record.
     * @param updatedBy The user who last updated the step record.
     * @return The generated database ID of the newly inserted step.
     */
    Long addByFields(@Param("origamiId") long origamiId,
                     @Param("stepTypeId") long stepTypeId,
                     @Param("idInOrigami") int idInOrigami,
                     @Param("createdBy") String createdBy,
                     @Param("updatedBy") String updatedBy);
}