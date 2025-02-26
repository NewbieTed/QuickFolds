package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to edge types in an origami model.
 * <p>
 * This interface provides methods for retrieving edge type IDs based on their names.
 * It ensures that edges reference valid, predefined types stored in the database.
 * <p>
 * Dependencies:
 * - Edge types are predefined system values (e.g., "side", "fold").
 * - These types are stored in the database and referenced by edge records.
 */
@Mapper
public interface EdgeTypeMapper {

    /**
     * Retrieves the database ID of an edge type based on its name.
     * <p>
     * This method returns the unique identifier for a specified edge type,
     * ensuring that only valid, existing edge types are referenced.
     * <p>
     * If the specified edge type name does not exist, the method returns {@code null}.
     *
     * @param edgeTypeName The name of the edge type to retrieve.
     * @return The database ID of the specified edge type, or {@code null} if not found.
     */
    Long getEdgeTypeByName(@Param("edgeTypeName") String edgeTypeName);
}