package com.quickfolds.backend.geometry.mapper;

import com.quickfolds.backend.geometry.model.database.Edge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EdgeMapper {

    Long getMostRecentId(@Param("stepId") long stepId);

    Long getIdByIdInFace(@Param("faceId") long faceId, @Param("idInFace") int idInFace);

    Long addByObj(@Param("edge") Edge edge);
}
