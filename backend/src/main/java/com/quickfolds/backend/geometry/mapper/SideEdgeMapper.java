package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.SideEdge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * MyBatis Mapper interface for handling database operations related to side edges in an origami model.
 * <p>
 * This interface provides methods for managing side edges within the origami structure.
 * Side edges represent boundaries of origami faces that do not connect to other faces.
 * <p>
 * Dependencies:
 * - {@link SideEdge}: Represents the side edge entity in the database.
 */
@Mapper
public interface SideEdgeMapper {

    /**
     * Inserts a new side edge into the database.
     * <p>
     * This method adds a side edge associated with a specific face in the origami model.
     * It uses MyBatis parameter binding to pass the {@link SideEdge} entity.
     * <p>
     * Side edges are essential for defining the outer boundaries of an origami face,
     * ensuring proper structure and geometry.
     *
     * @param sideEdge The {@link SideEdge} entity representing the new side edge.
     */
    void addByObj(@Param("sideEdge") SideEdge sideEdge);
}