package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to point types in an origami model.
 *
 * - Provides a method to retrieve the database ID of a point type by its name.
 * - Uses MyBatis `@Mapper` annotation for SQL mapping.
 *
 * Dependencies:
 * - Point types are stored in the database and referenced by name.
 */
@Mapper
public interface PointTypeMapper {
    /**
     * Retrieves the database ID of a point type based on its name.
     *
     * - Point types are predefined in the system (e.g., "vertex", "annotated_point").
     * - Ensures that origami points reference valid types stored in the database.
     *
     * @param pointTypeName The name of the point type to retrieve.
     * @return The database ID of the specified point type, or `null` if not found.
     */
    Long getIdByName(@Param("pointTypeName") String pointTypeName);
}
