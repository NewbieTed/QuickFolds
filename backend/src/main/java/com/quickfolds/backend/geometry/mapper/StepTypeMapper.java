package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to step types in an origami model.
 *
 * - Provides a method to retrieve the database ID of a step type based on its name.
 * - Uses MyBatis `@Mapper` annotation for SQL mapping.
 *
 * Dependencies:
 * - Step types are predefined in the system (e.g., "create", "fold", "annotate").
 */
@Mapper
public interface StepTypeMapper {
    /**
     * Retrieves the database ID of a step type based on its name.
     *
     * - Step types define the kind of operation performed at each step in the origami process.
     * - Ensures that origami steps reference valid types stored in the database.
     *
     * @param stepTypeName The name of the step type to retrieve.
     * @return The database ID of the specified step type, or `null` if not found.
     */
    Long getIdByName(@Param("stepTypeName") String stepTypeName);
}
