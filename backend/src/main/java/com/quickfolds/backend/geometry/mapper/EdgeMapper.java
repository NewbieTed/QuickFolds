package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EdgeMapper {
    Long getIdByIdInFace(@Param("faceId") long faceId, @Param("edgeIdInFace") int edgeIdInFace);
}
