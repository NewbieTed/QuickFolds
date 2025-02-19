package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to edge types in an origami model.
 *
 * - Provides methods for retrieving edge type IDs based on their names.
 * - Uses MyBatis `@Mapper` annotation for SQL mapping.
 *
 * Dependencies:
 * - Edge types are stored in the database and referenced by name.
 */
@Mapper
public interface EdgeTypeMapper {
    /**
     * Retrieves the database ID of an edge type based on its name.
     *
     * - Edge types are predefined in the system (e.g., "side", "fold").
     * - Ensures that edges reference valid types stored in the database.
     *
     * @param edgeTypeName The name of the edge type to retrieve.
     * @return The database ID of the specified edge type, or `null` if not found.
     */
    Long getEdgeTypeByName(@Param("edgeTypeName") String edgeTypeName);
}
