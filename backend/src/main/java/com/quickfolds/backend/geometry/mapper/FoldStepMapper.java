package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.FoldStep;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FoldStepMapper {

    /**
     * Inserts a new step into the database.
     * <p>
     * - Uses MyBatis parameter binding to pass the `Step` entity.
     * - Returns the generated primary key after insertion.
     *
     * @param foldStep The `Step` entity representing the new step to be inserted.
     * @return The generated database ID of the newly inserted step.
     */
    Long addByObj(@Param("foldStep") FoldStep foldStep);
}
