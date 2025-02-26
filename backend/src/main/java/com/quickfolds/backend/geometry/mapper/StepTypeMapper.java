package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to step types in an origami model.
 * <p>
 * This interface provides methods to retrieve step type IDs based on their names.
 * Step types represent different operations performed at each stage of the origami process,
 * such as "create," "fold," or "annotate."
 * <p>
 * Dependencies:
 * - Step types are predefined system values stored in the database.
 */
@Mapper
public interface StepTypeMapper {

    /**
     * Retrieves the database ID of a step type based on its name.
     * <p>
     * This method returns the unique identifier of a step type, ensuring that
     * origami steps reference valid types defined in the system.
     * <p>
     * If the specified step type name does not exist, the method returns {@code null}.
     *
     * @param stepTypeName The name of the step type to retrieve (e.g., "create", "fold").
     * @return The database ID of the specified step type, or {@code null} if not found.
     */
    Long getIdByName(@Param("stepTypeName") String stepTypeName);
}