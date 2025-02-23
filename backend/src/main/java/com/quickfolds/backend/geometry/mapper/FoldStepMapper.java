package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.FoldStep;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to fold steps in an origami model.
 * <p>
 * This interface provides methods for inserting fold steps, ensuring that each folding action
 * is properly recorded in the database and associated with an origami structure.
 * <p>
 * Dependencies:
 * - {@link FoldStep}: Represents the database entity for a fold step within the origami process.
 */
@Mapper
public interface FoldStepMapper {

    /**
     * Inserts a new fold step into the database.
     * <p>
     * This method adds a fold step representing a specific folding operation within an origami model.
     * It returns the generated primary key after insertion, allowing further reference to the created step.
     * <p>
     * Each fold step corresponds to a transformation applied to an origami structure, ensuring
     * that the folding process can be accurately tracked and managed.
     *
     * @param foldStep The {@link FoldStep} entity representing the new fold step to be inserted.
     * @return The generated database ID of the newly inserted fold step.
     */
    Long addByObj(@Param("foldStep") FoldStep foldStep);
}