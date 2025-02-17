package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Param;

public interface EdgeTypeMapper {

    Long getEdgeTypeByName(@Param("edgeTypeName") String edgeTypeName);
}
