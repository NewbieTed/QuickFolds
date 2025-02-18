package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EdgeTypeMapper {

    Long getEdgeTypeByName(@Param("edgeTypeName") String edgeTypeName);
}
