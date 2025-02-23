package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to point types in an origami model.
 * <p>
 * This interface provides methods for retrieving point type IDs based on their names.
 * It ensures that all origami points reference valid, predefined types stored in the database.
 * <p>
 * Dependencies:
 * - Point types are predefined system values (e.g., "vertex", "annotated_point") stored in the database.
 */
@Mapper
public interface PointTypeMapper {

    /**
     * Retrieves the database ID of a point type based on its name.
     * <p>
     * This method returns the unique identifier of a point type, ensuring that origami points
     * only reference valid types defined in the system.
     * <p>
     * If the specified point type name does not exist, the method returns {@code null}.
     *
     * @param pointTypeName The name of the point type to retrieve.
     * @return The database ID of the specified point type, or {@code null} if not found.
     */
    Long getIdByName(@Param("pointTypeName") String pointTypeName);
}