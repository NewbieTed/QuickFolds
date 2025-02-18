package com.quickfolds.backend.geometry.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PointTypeMapper {

    Long getIdByName(@Param("pointTypeName") String pointTypeName);
}
