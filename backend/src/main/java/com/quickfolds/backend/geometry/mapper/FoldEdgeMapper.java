package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.Edge;
import com.quickfolds.backend.geometry.model.database.FoldEdge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;


@Mapper
public interface FoldEdgeMapper {
    /**
     * Inserts a new fold edge into the database.
     * <p>
     * - Returns the generated primary key after insertion.
     *   to retrieve the generated key.
     *
     * @param foldEdge The `Fold Edge` entity to be inserted.
     * @return The generated database ID of the newly inserted edge.
     */
    Long addByObj(@Param("foldEdge") FoldEdge foldEdge);
}
