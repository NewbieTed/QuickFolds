package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.SideEdge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to side edges in an origami model.
 *
 * - Provides a method to insert side edges into the database.
 * - Uses MyBatis `@Mapper` annotation for SQL mapping.
 *
 * Dependencies:
 * - `SideEdge`: The database entity representing a side edge in the origami model.
 */
@Mapper
public interface SideEdgeMapper {
    /**
     * Inserts a new side edge into the database.
     *
     * - Associates an edge with a face in the origami model.
     * - Uses MyBatis parameter binding to pass the `SideEdge` entity.
     *
     * @param sideEdge The `SideEdge` entity representing the new side edge.
     */
    void addByObj(@Param("sideEdge") SideEdge sideEdge);
}
